import { callLlm, defaultModel, resolveApiKey, type LlmSettings } from "./llm.js";
import {
  executeTool,
  toolRequiresApproval,
  toolsForPrompt,
} from "./tools.js";
import { createSession, getSession, touch } from "./sessions.js";
import type { ChatMessage, ProviderName, StreamEvent } from "./types.js";

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
6. Never claim you accessed the user's personal phone data unless a tool result proves it.`;

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
    const title =
      options.message.trim().slice(0, 48) || "New mission";
    session = createSession(title);
  }

  yield* emit({ type: "session", sessionId: session.id });
  yield* emit({ type: "status", status: `provider=${settings.provider} model=${settings.model}` });

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
      touch(session);
      yield* emit({
        type: "tool_result",
        id: pending.id,
        name: pending.name,
        ok: false,
        output: "Denied by user",
      });
    } else {
      yield* emit({
        type: "tool_start",
        id: pending.id,
        name: pending.name,
        arguments: pending.arguments,
      });
      try {
        const output = await executeTool(
          pending.name,
          pending.arguments,
          options.workspaceRoot
        );
        session.messages.push({
          role: "tool",
          tool_call_id: pending.id,
          name: pending.name,
          content: output,
        });
        yield* emit({
          type: "tool_result",
          id: pending.id,
          name: pending.name,
          ok: true,
          output,
        });
      } catch (err) {
        const output = err instanceof Error ? err.message : String(err);
        session.messages.push({
          role: "tool",
          tool_call_id: pending.id,
          name: pending.name,
          content: `Error: ${output}`,
        });
        yield* emit({
          type: "tool_result",
          id: pending.id,
          name: pending.name,
          ok: false,
          output,
        });
      }
      session.pendingApproval = undefined;
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
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: response.text,
      };
      session.messages.push(assistantMsg);
      history.push(assistantMsg);
      touch(session);
    }

    if (!response.toolCalls.length) {
      yield* emit({ type: "done", sessionId: session.id });
      return;
    }

    // Persist assistant tool-call turn for OpenAI-compatible providers
    if (!response.text) {
      const stub: ChatMessage = {
        role: "assistant",
        content: response.toolCalls
          .map((c) => `Calling ${c.name}...`)
          .join(" "),
      };
      session.messages.push(stub);
      history.push(stub);
    }

    for (const call of response.toolCalls) {
      const needsApproval =
        toolRequiresApproval(call.name) && !options.autoApprove;

      if (needsApproval) {
        session.pendingApproval = {
          id: call.id,
          name: call.name,
          arguments: call.arguments,
          reason: `${call.name} can change your system/workspace`,
        };
        touch(session);
        yield* emit({
          type: "approval_required",
          id: call.id,
          name: call.name,
          arguments: call.arguments,
          reason: session.pendingApproval.reason,
        });
        yield* emit({ type: "done", sessionId: session.id });
        return;
      }

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
          options.workspaceRoot
        );
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
  }

  yield* emit({
    type: "text",
    text: "Stopped after max tool rounds. Send another message to continue.",
  });
  yield* emit({ type: "done", sessionId: session.id });
}
