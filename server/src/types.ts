export type Role = "system" | "user" | "assistant" | "tool";

export type ToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type ChatMessage = {
  role: Role;
  content: string;
  name?: string;
  tool_call_id?: string;
  /** OpenAI-compatible assistant tool call payloads. */
  tool_calls?: ToolCall[];
};

export type StreamEvent =
  | { type: "session"; sessionId: string }
  | { type: "text"; text: string }
  | { type: "tool_start"; id: string; name: string; arguments: Record<string, unknown> }
  | { type: "tool_result"; id: string; name: string; ok: boolean; output: string }
  | { type: "approval_required"; id: string; name: string; arguments: Record<string, unknown>; reason: string }
  | { type: "status"; status: string }
  | { type: "error"; message: string }
  | { type: "done"; sessionId: string };

export type ProviderName = "xai" | "openai" | "gemini";

export type Session = {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  messages: ChatMessage[];
  pendingApproval?: {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    reason: string;
  };
};
