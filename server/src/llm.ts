import type { ChatMessage, ProviderName, ToolCall } from "./types.js";
import { TOOLS } from "./tools.js";

export type LlmSettings = {
  provider: ProviderName;
  model: string;
  apiKey: string;
};

export type ProviderResponse = {
  text: string;
  toolCalls: ToolCall[];
};

export type LlmStreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "done"; response: ProviderResponse };

function openAiCompatibleTools() {
  return TOOLS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

function mapMessages(messages: ChatMessage[]) {
  return messages.map((m) => {
    if (m.role === "tool") {
      return {
        role: "tool" as const,
        tool_call_id: m.tool_call_id,
        content: m.content,
        name: m.name,
      };
    }
    if (m.role === "assistant" && m.tool_calls?.length) {
      return {
        role: "assistant" as const,
        content: m.content || null,
        tool_calls: m.tool_calls.map((c) => ({
          id: c.id,
          type: "function" as const,
          function: {
            name: c.name,
            arguments: JSON.stringify(c.arguments ?? {}),
          },
        })),
      };
    }
    return { role: m.role, content: m.content };
  });
}

function parseToolCalls(raw: unknown): ToolCall[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const call = item as {
        id?: string;
        function?: { name?: string; arguments?: string };
      };
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function?.arguments || "{}") as Record<
          string,
          unknown
        >;
      } catch {
        args = { raw: call.function?.arguments };
      }
      return {
        id: call.id || `tool_${Math.random().toString(36).slice(2, 10)}`,
        name: call.function?.name || "unknown",
        arguments: args,
      };
    })
    .filter((c) => c.name !== "unknown");
}

async function callOpenAiCompatible(
  baseUrl: string,
  settings: LlmSettings,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: mapMessages(messages),
      tools: openAiCompatibleTools(),
      tool_choice: "auto",
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `${settings.provider} API ${res.status}: ${body.slice(0, 500)}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
        tool_calls?: unknown;
      };
    }>;
  };

  const message = data.choices?.[0]?.message;
  return {
    text: message?.content?.trim() || "",
    toolCalls: parseToolCalls(message?.tool_calls),
  };
}

type ToolCallAcc = {
  id: string;
  name: string;
  arguments: string;
};

async function* streamOpenAiCompatible(
  baseUrl: string,
  settings: LlmSettings,
  messages: ChatMessage[]
): AsyncGenerator<LlmStreamEvent> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: mapMessages(messages),
      tools: openAiCompatibleTools(),
      tool_choice: "auto",
      temperature: 0.4,
      stream: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `${settings.provider} API ${res.status}: ${body.slice(0, 500)}`
    );
  }
  if (!res.body) {
    // Fallback — some environments lack streaming body
    const response = await callOpenAiCompatible(baseUrl, settings, messages);
    if (response.text) yield { type: "text_delta", text: response.text };
    yield { type: "done", response };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  const toolAcc = new Map<number, ToolCallAcc>();

  const flushLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return null as ProviderResponse | null;
    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") return null;

    try {
      const json = JSON.parse(payload) as {
        choices?: Array<{
          delta?: {
            content?: string | null;
            tool_calls?: Array<{
              index?: number;
              id?: string;
              function?: { name?: string; arguments?: string };
            }>;
          };
        }>;
      };
      const delta = json.choices?.[0]?.delta;
      if (!delta) return null;

      if (delta.content) {
        text += delta.content;
        return { kind: "delta" as const, text: delta.content };
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          const cur = toolAcc.get(idx) || {
            id: tc.id || `tool_${idx}`,
            name: "",
            arguments: "",
          };
          if (tc.id) cur.id = tc.id;
          if (tc.function?.name) cur.name += tc.function.name;
          if (tc.function?.arguments) cur.arguments += tc.function.arguments;
          toolAcc.set(idx, cur);
        }
      }
    } catch {
      /* ignore partial JSON */
    }
    return null;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const result = flushLine(line);
      if (result && "kind" in result && result.kind === "delta") {
        yield { type: "text_delta", text: result.text };
      }
    }
  }
  if (buffer.trim()) {
    const result = flushLine(buffer);
    if (result && "kind" in result && result.kind === "delta") {
      yield { type: "text_delta", text: result.text };
    }
  }

  const toolCalls: ToolCall[] = [...toolAcc.values()]
    .filter((t) => t.name)
    .map((t) => {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(t.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = { raw: t.arguments };
      }
      return { id: t.id, name: t.name, arguments: args };
    });

  yield {
    type: "done",
    response: { text: text.trim(), toolCalls },
  };
}

async function callGemini(
  settings: LlmSettings,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => {
      if (m.role === "tool") {
        return {
          role: "user" as const,
          parts: [
            {
              text: `Tool result (${m.name}):\n${m.content}`,
            },
          ],
        };
      }
      return {
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      };
    });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      tools: [
        {
          functionDeclarations: TOOLS.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ],
      generationConfig: { temperature: 0.4 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`gemini API ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
          functionCall?: { name?: string; args?: Record<string, unknown> };
        }>;
      };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p) => p.text || "")
    .join("")
    .trim();
  const toolCalls: ToolCall[] = parts
    .filter((p) => p.functionCall?.name)
    .map((p, i) => ({
      id: `gemini_tool_${i}_${Math.random().toString(36).slice(2, 8)}`,
      name: p.functionCall!.name!,
      arguments: p.functionCall!.args ?? {},
    }));

  return { text, toolCalls };
}

export async function callLlm(
  settings: LlmSettings,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  if (!settings.apiKey) {
    throw new Error(
      `Missing API key for provider "${settings.provider}". Set it in server/.env or pass x-api-key.`
    );
  }

  if (settings.provider === "xai") {
    return callOpenAiCompatible("https://api.x.ai/v1", settings, messages);
  }
  if (settings.provider === "openai") {
    return callOpenAiCompatible("https://api.openai.com/v1", settings, messages);
  }
  if (settings.provider === "gemini") {
    return callGemini(settings, messages);
  }
  throw new Error(`Unsupported provider: ${settings.provider}`);
}

/** Stream tokens when the provider supports OpenAI-compatible SSE (xAI, OpenAI). */
export async function* streamLlm(
  settings: LlmSettings,
  messages: ChatMessage[]
): AsyncGenerator<LlmStreamEvent> {
  if (!settings.apiKey) {
    throw new Error(
      `Missing API key for provider "${settings.provider}". Set it in server/.env or pass x-api-key.`
    );
  }

  if (settings.provider === "xai") {
    yield* streamOpenAiCompatible("https://api.x.ai/v1", settings, messages);
    return;
  }
  if (settings.provider === "openai") {
    yield* streamOpenAiCompatible(
      "https://api.openai.com/v1",
      settings,
      messages
    );
    return;
  }

  // Gemini: non-streaming fallback, emit as one delta
  const response = await callGemini(settings, messages);
  if (response.text) yield { type: "text_delta", text: response.text };
  yield { type: "done", response };
}

export function defaultModel(provider: ProviderName): string {
  switch (provider) {
    case "xai":
      return process.env.OMNI_MODEL || "grok-4.5";
    case "openai":
      return process.env.OMNI_MODEL || "gpt-4.1";
    case "gemini":
      return process.env.OMNI_MODEL || "gemini-2.5-flash";
  }
}

export function resolveApiKey(
  provider: ProviderName,
  override?: string
): string {
  if (override) return override;
  if (provider === "xai") return process.env.XAI_API_KEY || "";
  if (provider === "openai") return process.env.OPENAI_API_KEY || "";
  if (provider === "gemini") return process.env.GEMINI_API_KEY || "";
  return "";
}
