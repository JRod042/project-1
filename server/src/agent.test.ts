import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it, beforeEach } from "node:test";
import { runAgent, type LlmFn } from "./agent.js";
import {
  _resetSessionsForTests,
  flushSessions,
  getSession,
  initSessionStore,
} from "./sessions.js";
import type { ChatMessage, StreamEvent, ToolCall } from "./types.js";

async function collect(
  gen: AsyncGenerator<StreamEvent>
): Promise<StreamEvent[]> {
  const out: StreamEvent[] = [];
  for await (const ev of gen) out.push(ev);
  return out;
}

function mockLlm(script: Array<{ text?: string; toolCalls?: ToolCall[] }>): LlmFn {
  let i = 0;
  return async (_settings, _messages: ChatMessage[]) => {
    const step = script[Math.min(i, script.length - 1)]!;
    i += 1;
    return {
      text: step.text ?? "",
      toolCalls: step.toolCalls ?? [],
    };
  };
}

describe("approval queue", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    await flushSessions();
    _resetSessionsForTests();
    workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "omni-agent-"));
    await initSessionStore(workspaceRoot);
  });

  it("queues multiple approval tools and resumes one-by-one", async () => {
    const callLlm = mockLlm([
      {
        text: "I'll write two files.",
        toolCalls: [
          {
            id: "t1",
            name: "write_file",
            arguments: { path: "a.txt", content: "A" },
          },
          {
            id: "t2",
            name: "write_file",
            arguments: { path: "b.txt", content: "B" },
          },
        ],
      },
      { text: "Done.", toolCalls: [] },
    ]);

    const first = await collect(
      runAgent({
        message: "write files",
        workspaceRoot,
        apiKey: "test-key",
        callLlm,
      })
    );

    const approval = first.find((e) => e.type === "approval_required");
    assert.ok(approval && approval.type === "approval_required");
    assert.equal(approval.id, "t1");
    assert.equal(approval.queueRemaining, 1);

    const sessionEv = first.find((e) => e.type === "session");
    assert.ok(sessionEv && sessionEv.type === "session");
    const sessionId = sessionEv.sessionId;
    const session = getSession(sessionId)!;
    assert.equal(session.pendingApproval?.id, "t1");
    assert.equal(session.pendingToolQueue?.length, 1);

    const afterFirst = await collect(
      runAgent({
        sessionId,
        message: "",
        workspaceRoot,
        apiKey: "test-key",
        callLlm,
        approvalDecision: { id: "t1", approve: true },
      })
    );
    const secondApproval = afterFirst.find((e) => e.type === "approval_required");
    assert.ok(secondApproval && secondApproval.type === "approval_required");
    assert.equal(secondApproval.id, "t2");
    assert.equal(secondApproval.queueRemaining, 0);

    const afterSecond = await collect(
      runAgent({
        sessionId,
        message: "",
        workspaceRoot,
        apiKey: "test-key",
        callLlm,
        approvalDecision: { id: "t2", approve: true },
      })
    );
    assert.ok(afterSecond.some((e) => e.type === "tool_result" && e.id === "t2" && e.ok));
    assert.ok(
      afterSecond.some(
        (e) =>
          (e.type === "text" || e.type === "text_delta") &&
          e.text.includes("Done")
      )
    );
    assert.ok(afterSecond.some((e) => e.type === "done"));
    assert.equal(getSession(sessionId)?.pendingApproval, undefined);
    await flushSessions();
  });

  it("denies a tool and continues the queue", async () => {
    const callLlm = mockLlm([
      {
        toolCalls: [
          {
            id: "s1",
            name: "run_shell",
            arguments: { command: "echo hi" },
          },
          {
            id: "w1",
            name: "write_file",
            arguments: { path: "ok.txt", content: "yes" },
          },
        ],
      },
      { text: "Finished after deny.", toolCalls: [] },
    ]);

    const first = await collect(
      runAgent({
        message: "do stuff",
        workspaceRoot,
        apiKey: "test-key",
        callLlm,
      })
    );
    const sessionId = (
      first.find((e) => e.type === "session") as { sessionId: string }
    ).sessionId;

    const denied = await collect(
      runAgent({
        sessionId,
        message: "",
        workspaceRoot,
        apiKey: "test-key",
        callLlm,
        approvalDecision: { id: "s1", approve: false },
      })
    );
    assert.ok(
      denied.some(
        (e) => e.type === "tool_result" && e.id === "s1" && e.ok === false
      )
    );
    const next = denied.find((e) => e.type === "approval_required");
    assert.ok(next && next.type === "approval_required");
    assert.equal(next.id, "w1");
    await flushSessions();
  });
});
