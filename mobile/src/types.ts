export type ProviderName = "xai" | "openai" | "gemini";

export type StreamEvent =
  | { type: "session"; sessionId: string }
  | { type: "text"; text: string }
  | { type: "tool_start"; id: string; name: string; arguments: Record<string, unknown> }
  | { type: "tool_result"; id: string; name: string; ok: boolean; output: string }
  | { type: "approval_required"; id: string; name: string; arguments: Record<string, unknown>; reason: string }
  | { type: "status"; status: string }
  | { type: "error"; message: string }
  | { type: "done"; sessionId: string };

export type TimelineItem =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant"; text: string }
  | { id: string; kind: "status"; text: string }
  | { id: string; kind: "tool"; name: string; args?: Record<string, unknown>; output?: string; ok?: boolean; running?: boolean }
  | { id: string; kind: "error"; text: string }
  | {
      id: string;
      kind: "approval";
      toolId: string;
      name: string;
      args: Record<string, unknown>;
      reason: string;
      resolved?: "approved" | "denied";
    };

export type AppSettings = {
  serverUrl: string;
  provider: ProviderName;
  model: string;
  apiKey: string;
  autoApprove: boolean;
};
