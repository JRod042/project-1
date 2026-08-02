export type ProviderName = "xai" | "openai" | "gemini";

export type StreamEvent =
  | { type: "session"; sessionId: string }
  | { type: "text"; text: string }
  | { type: "text_delta"; text: string }
  | { type: "tool_start"; id: string; name: string; arguments: Record<string, unknown> }
  | { type: "tool_result"; id: string; name: string; ok: boolean; output: string }
  | {
      type: "approval_required";
      id: string;
      name: string;
      arguments: Record<string, unknown>;
      reason: string;
      queueRemaining?: number;
    }
  | { type: "status"; status: string }
  | { type: "error"; message: string; code?: string }
  | { type: "auth_required"; message: string }
  | { type: "done"; sessionId: string };

export type TimelineItem =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant"; text: string }
  | { id: string; kind: "status"; text: string }
  | {
      id: string;
      kind: "tool";
      name: string;
      args?: Record<string, unknown>;
      output?: string;
      ok?: boolean;
      running?: boolean;
    }
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

/** openclaw = Control UI / gateway; legacy = Omni SSE server */
export type RuntimeMode = "openclaw" | "legacy";

export type AppSettings = {
  runtimeMode: RuntimeMode;
  serverUrl: string;
  /** OpenClaw Control UI / gateway base URL (default port 18789) */
  openclawUrl: string;
  /** Shared secret matching OPENCLAW_GATEWAY_TOKEN */
  openclawToken: string;
  provider: ProviderName;
  model: string;
  apiKey: string;
  /** Shared secret matching server OMNI_SERVER_TOKEN (legacy) */
  serverToken: string;
  autoApprove: boolean;
};

export type SessionSummary = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pendingApproval: unknown;
  pendingQueueLength?: number;
  messageCount: number;
};
