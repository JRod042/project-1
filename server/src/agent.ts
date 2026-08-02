import {
  callLlm as defaultCallLlm,
  defaultModel,
  resolveApiKey,
  type LlmSettings,
} from "./llm.js";
import {
  executeTool,
  toolRequiresApproval,
  toolsForPrompt,
} from "./tools.js";
import {
  clearApprovals,
  createSession,
  getSession,
  promoteApprovalQueue,
  setApprovalQueue,
  touch,
} from "./sessions.js";
import type {
  ChatMessage,
  PendingTool,
  ProviderName,
  StreamEvent,
  ToolCall,
} from "./types.js";
import { getShellMode } from "./shellPolicy.js";

export type LlmFn = (
  settings: LlmSettings,
  messages: ChatMessage[]
) => Promise<{ text: string; toolCalls: ToolCall[] }>;

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
7. Shell mode is ${getShellMode(process.env.OMNI_SHELL_MODE)} — blocked commands will fail; adapt.`;

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
  /** Test seam — defaults to production LLM client. */
  callLlm?: LlmFn;
};

async function* emit(event: StreamEvent): AsyncGenerator<StreamEvent> {
  yield event;
}

function toPending(call: ToolCall): PendingTool {
  return {
    id: call.id,
    name: call.name,
    arguments: call.arguments,
    reason: `${call.name} can change your system/workspace`,
  };
}

async function* runOneTool(
  sessionId: string,
  workspaceRoot: string,
  call: { id: string; name: string; arguments: Record<string, unknown> },
  sessionMessages: ChatMessage[],
  history: ChatMessage[]
): AsyncGenerator<StreamEvent, void, unknown> {
  yield* emit({
    type: "tool_start",
    id: call.id,
    name: call.name,
    arguments: call.arguments,
  });
  try {
    const output = await executeTool(
      call.name,
      call.arguments,
      workspaceRoot,
      { sessionId }
    );
    const toolMsg: ChatMessage = {
      role: "tool",
      tool_call_id: call.id,
      name: call.name,
      content: output,
    };
    sessionMessages.push(toolMsg);
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
    sessionMessages.push(toolMsg);
    history.push(toolMsg);
    yield* emit({
      type: "tool_result",
      id: call.id,
      name: call.name,
      ok: false,
      output,
    });
  }
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
  const callLlm = options.callLlm ?? defaultCallLlm;

  let session = options.sessionId ? getSession(options.sessionId) : undefined;
  if (!session) {
    const title =
      options.message.trim().slice(0, 48) || "New mission";
    session = createSession(title);
  }

  yield* emit({ type: "session", sessionId: session.id });
  yield* emit({
    type: "status",
    status: `provider=${settings.provider} model=${settings.model}`,
  });

  // Resume from pending approval (supports multi-tool queue)
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
      yield* emit({
        type: "tool_result",
        id: pending.id,
        name: pending.name,
        ok: false,
        output: "Denied by user",
      });

      const next = promoteApprovalQueue(session);
      if (next) {
        yield* emit({
          type: "approval_required",
          id: next.id,
          name: next.name,
          arguments: next.arguments,
          reason: next.reason,
          queueRemaining: session.pendingToolQueue?.length ?? 0,
        });
        yield* emit({ type: "done", sessionId: session.id });
        return;
      }
      clearApprovals(session);
    } else {
      yield* runOneTool(
        session.id,
        options.workspaceRoot,
        pending,
        session.messages,
        session.messages
      );

      // Drain queue: auto-run safe tools; pause again on next approval tool
      while (session.pendingToolQueue?.length) {
        const next = session.pendingToolQueue[0]!;
        if (toolRequiresApproval(next.name) && !options.autoApprove) {
          promoteApprovalQueue(session);
          const current = session.pendingApproval!;
          yield* emit({
            type: "approval_required",
            id: current.id,
            name: current.name,
            arguments: current.arguments,
            reason: current.reason,
            queueRemaining: session.pendingToolQueue?.length ?? 0,
          });
          yield* emit({ type: "done", sessionId: session.id });
          return;
        }
        session.pendingToolQueue.shift();
        if (!session.pendingToolQueue.length) {
          session.pendingToolQueue = undefined;
        }
        yield* runOneTool(
          session.id,
          options.workspaceRoot,
          next,
          session.messages,
          session.messages
        );
      }
      clearApprovals(session);
      touch(session);
    }
  } else if (options.message.trim()) {
    session.messages.push({ role: "user", content: options.message.trim() });
    touch(session);
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

    for (let i = 0; i < response.toolCalls.length; i++) {
      const call = response.toolCalls[i]!;
      const needsApproval =
        toolRequiresApproval(call.name) && !options.autoApprove;

      if (needsApproval) {
        const head = toPending(call);
        const rest = response.toolCalls.slice(i + 1).map(toPending);
        setApprovalQueue(session, head, rest);
        yield* emit({
          type: "approval_required",
          id: head.id,
          name: head.name,
          arguments: head.arguments,
          reason: head.reason,
          queueRemaining: rest.length,
        });
        yield* emit({ type: "done", sessionId: session.id });
        return;
      }

      yield* runOneTool(
        session.id,
        options.workspaceRoot,
        call,
        session.messages,
        history
      );
      touch(session);
    }
  }

  yield* emit({
    type: "text",
    text: "Stopped after max tool rounds. Send another message to continue.",
  });
  yield* emit({ type: "done", sessionId: session.id });
}
