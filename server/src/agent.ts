import { callLlm, defaultModel, resolveApiKey, type LlmSettings } from "./llm.js";
import {
  executeTool,
  toolRequiresApproval,
  toolsForPrompt,
} from "./tools.js";
import { createSession, getSession, touch } from "./sessions.js";
import type { ChatMessage, ProviderName, StreamEvent, ToolCall } from "./types.js";

const SYSTEM_PROMPT = `You are Omni — the user's personal AI, Jarvis-class and better:
always available, proactive when useful, precise under pressure, and actually able to act.

You are not a chatbot. You are an operator.
You act. You plan. You use tools. You finish the job.

Personality:
- Calm, competent, slightly dry wit — never sycophantic
- Prefer action over speculation
- Narrate briefly what you're doing while tools run
- When a task is multi-step, call mission_plan first, then execute

Capabilities via tools:
${toolsForPrompt()}

Rules:
1. Use tools whenever they help. Don't invent file contents or command output.
2. For destructive/risky actions (shell, write/overwrite), the runtime may pause for user approval — keep going after results return.
3. Keep replies tight on mobile: short status, then results.
4. If blocked (missing info/key/permission), say exactly what's needed.
5. You can code, research the web, remember facts, run commands, and manage workspace files.
6. Never claim you accessed the user's personal phone data unless a tool result proves it.
7. Prefer one risky tool call at a time when approval is likely.`;

export type RunOptions = {
  sessionId?: string;
  message: string;
  provider?: ProviderName;
  model?: string;
  apiKey?: string;
  workspaceRoot: string;
  autoApprove?: boolean;
  approvalDecision?: {
    id: string;
    approve: boolean;
  };
};

async function* emit(event: StreamEvent): AsyncGenerator<StreamEvent> {
  yield event;
}

async function* runOneTool(
  session: ReturnType<typeof createSession>,
  call: ToolCall,
  workspaceRoot: string,
  history: ChatMessage[]
): AsyncGenerator<StreamEvent, void, unknown> {
  yield* emit({
    type: "tool_start",
    id: call.id,
    name: call.name,
    arguments: call.arguments,
  });

  try {
    const output = await executeTool(call.name, call.arguments, workspaceRoot);
    const toolMsg: ChatMessage = {
      role: "tool",
      tool_call_id: call.id,
      name: call.name,
      content: output,
    };
    session.messages.push(toolMsg);
    history.push(toolMsg);
    yield* emit({
      type: "tool_result",
      id: call.id,
      name: call.name,
      ok: true,
      output,
    });
  } catch (err) {
    const output = err instanceof Error ? err.message : String(err);
    const toolMsg: ChatMessage = {
      role: "tool",
      tool_call_id: call.id,
      name: call.name,
      content: `Error: ${output}`,
    };
    session.messages.push(toolMsg);
    history.push(toolMsg);
    yield* emit({
      type: "tool_result",
      id: call.id,
      name: call.name,
      ok: false,
      output,
    });
  }
  touch(session);
}

/**
 * Execute a list of tool calls, pausing on first approval-gated tool.
 * Remaining tools stay in session.pendingToolQueue.
 */
async function* executeToolList(
  session: ReturnType<typeof createSession>,
  tools: ToolCall[],
  workspaceRoot: string,
  history: ChatMessage[],
  autoApprove: boolean
): AsyncGenerator<StreamEvent, "paused" | "done", unknown> {
  for (let i = 0; i < tools.length; i++) {
    const call = tools[i];
    const needsApproval = toolRequiresApproval(call.name) && !autoApprove;

    if (needsApproval) {
      session.pendingApproval = {
        id: call.id,
        name: call.name,
        arguments: call.arguments,
        reason: `${call.name} can change your system/workspace`,
      };
      session.pendingToolQueue = tools.slice(i + 1);
      touch(session);
      yield* emit({
        type: "approval_required",
        id: call.id,
        name: call.name,
        arguments: call.arguments,
        reason: session.pendingApproval.reason,
      });
      return "paused";
    }

    yield* runOneTool(session, call, workspaceRoot, history);
  }
  session.pendingToolQueue = undefined;
  touch(session);
  return "done";
}

export async function* runAgent(
  options: RunOptions
): AsyncGenerator<StreamEvent> {
  const provider =
    options.provider ||
    (process.env.OMNI_PROVIDER as ProviderName) ||
    "xai";
  const settings: LlmSettings = {
    provider,
    model: options.model || defaultModel(provider),
    apiKey: resolveApiKey(provider, options.apiKey),
  };

  let session = options.sessionId ? getSession(options.sessionId) : undefined;
  if (!session) {
    const title = options.message.trim().slice(0, 48) || "New mission";
    session = createSession(title);
  }

  yield* emit({ type: "session", sessionId: session.id });
  yield* emit({
    type: "status",
    status: `provider=${settings.provider} model=${settings.model}`,
  });

  // Resume from pending approval
  if (options.approvalDecision && session.pendingApproval) {
    const pending = session.pendingApproval;
    if (options.approvalDecision.id !== pending.id) {
      yield* emit({ type: "error", message: "Approval id mismatch" });
      return;
    }
    if (!options.approvalDecision.approve) {
      session.messages.push({
        role: "tool",
        tool_call_id: pending.id,
        name: pending.name,
        content: "User denied this action.",
      });
      session.pendingApproval = undefined;
      // Deny remaining queued tools as well so tool_call results stay consistent
      const rest = session.pendingToolQueue ?? [];
      for (const call of rest) {
        session.messages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.name,
          content: "Skipped because a prior action was denied by the user.",
        });
        yield* emit({
          type: "tool_result",
          id: call.id,
          name: call.name,
          ok: false,
          output: "Skipped (prior denial)",
        });
      }
      session.pendingToolQueue = undefined;
      touch(session);
      yield* emit({
        type: "tool_result",
        id: pending.id,
        name: pending.name,
        ok: false,
        output: "Denied by user",
      });
    } else {
      const historySeed: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...session.messages,
      ];
      yield* runOneTool(
        session,
        {
          id: pending.id,
          name: pending.name,
          arguments: pending.arguments,
        },
        options.workspaceRoot,
        historySeed
      );
      session.pendingApproval = undefined;
      const queued = session.pendingToolQueue ?? [];
      session.pendingToolQueue = undefined;
      touch(session);
      if (queued.length) {
        const result = yield* executeToolList(
          session,
          queued,
          options.workspaceRoot,
          historySeed,
          Boolean(options.autoApprove)
        );
        if (result === "paused") {
          yield* emit({ type: "done", sessionId: session.id });
          return;
        }
      }
    }
  } else if (options.message.trim()) {
    if (session.pendingApproval) {
      yield* emit({
        type: "error",
        message:
          "A tool is waiting for approval. Approve or deny it before sending a new message.",
      });
      yield* emit({ type: "done", sessionId: session.id });
      return;
    }
    session.messages.push({ role: "user", content: options.message.trim() });
    touch(session);
  } else if (!options.approvalDecision) {
    yield* emit({
      type: "error",
      message: "Empty message. Send a command or an approval decision.",
    });
    yield* emit({ type: "done", sessionId: session.id });
    return;
  }

  const history: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...session.messages,
  ];

  const maxRounds = 12;
  for (let round = 0; round < maxRounds; round++) {
    yield* emit({ type: "status", status: `thinking (round ${round + 1})` });

    let response;
    try {
      response = await callLlm(settings, history);
    } catch (err) {
      yield* emit({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
      return;
    }

    if (response.text) {
      yield* emit({ type: "text", text: response.text });
    }

    if (!response.toolCalls.length) {
      if (response.text) {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: response.text,
        };
        session.messages.push(assistantMsg);
        history.push(assistantMsg);
        touch(session);
      }
      yield* emit({ type: "done", sessionId: session.id });
      return;
    }

    const assistantToolMsg: ChatMessage = {
      role: "assistant",
      content: response.text || "",
      tool_calls: response.toolCalls,
    };
    session.messages.push(assistantToolMsg);
    history.push(assistantToolMsg);
    touch(session);

    const result = yield* executeToolList(
      session,
      response.toolCalls,
      options.workspaceRoot,
      history,
      Boolean(options.autoApprove)
    );
    if (result === "paused") {
      yield* emit({ type: "done", sessionId: session.id });
      return;
    }
  }

  yield* emit({
    type: "text",
    text: "Stopped after max tool rounds. Send another message to continue.",
  });
  yield* emit({ type: "done", sessionId: session.id });
}
