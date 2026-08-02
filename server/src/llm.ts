import type { ChatMessage, ProviderName, ToolCall } from "./types.js";
import { TOOLS } from "./tools.js";

export type LlmSettings = {
  provider: ProviderName;
  model: string;
  apiKey: string;
};

type ProviderResponse = {
  text: string;
  toolCalls: ToolCall[];
};

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
      messages: messages.map((m) => {
        if (m.role === "tool") {
          return {
            role: "tool",
            tool_call_id: m.tool_call_id,
            content: m.content,
            name: m.name,
          };
        }
        if (m.role === "assistant" && m.tool_calls?.length) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.tool_calls.map((c) => ({
              id: c.id,
              type: "function",
              function: {
                name: c.name,
                arguments: JSON.stringify(c.arguments ?? {}),
              },
            })),
          };
        }
        return { role: m.role, content: m.content };
      }),
      tools: openAiCompatibleTools(),
      tool_choice: "auto",
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${settings.provider} API ${res.status}: ${body.slice(0, 500)}`);
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

async function callGemini(
  settings: LlmSettings,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents: Array<{
    role: "user" | "model";
    parts: Array<Record<string, unknown>>;
  }> = [];

  for (const m of messages) {
    if (m.role === "system") continue;
    if (m.role === "tool") {
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: m.name || "tool",
              response: { content: m.content },
            },
          },
        ],
      });
      continue;
    }
    if (m.role === "assistant" && m.tool_calls?.length) {
      const parts: Array<Record<string, unknown>> = [];
      if (m.content?.trim()) parts.push({ text: m.content });
      for (const call of m.tool_calls) {
        parts.push({
          functionCall: {
            name: call.name,
            args: call.arguments ?? {},
          },
        });
      }
      contents.push({ role: "model", parts });
      continue;
    }
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    });
  }

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
