import type { AppSettings, SessionSummary, StreamEvent } from "../types";
import { SseParser } from "./sse";

function base(url: string) {
  return url.replace(/\/+$/, "");
}

function authHeaders(settings: AppSettings): Record<string, string> {
  const headers: Record<string, string> = {};
  if (settings.serverToken) {
    headers.Authorization = `Bearer ${settings.serverToken}`;
    headers["x-omni-token"] = settings.serverToken;
  }
  return headers;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function healthCheck(serverUrl: string) {
  const res = await fetch(`${base(serverUrl)}/health`);
  if (!res.ok) throw new Error(`Health ${res.status}`);
  return res.json() as Promise<{
    ok: boolean;
    workspaceRoot: string;
    authRequired?: boolean;
    shellMode?: string;
    providers: Record<string, boolean>;
  }>;
}

async function parseJsonError(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`;
  let code: string | undefined;
  try {
    const body = (await res.json()) as {
      error?: string;
      message?: string;
      code?: string;
    };
    code = body.code;
    message = body.message || body.error || message;
  } catch {
    /* ignore */
  }
  if (res.status === 401) {
    return new ApiError(
      message || "Server requires OMNI_SERVER_TOKEN. Set it in Systems.",
      401,
      code || "auth_required"
    );
  }
  return new ApiError(message, res.status, code);
}

export async function listSessions(
  settings: AppSettings
): Promise<SessionSummary[]> {
  const res = await fetch(`${base(settings.serverUrl)}/sessions`, {
    headers: { ...authHeaders(settings) },
  });
  if (!res.ok) throw await parseJsonError(res);
  const data = (await res.json()) as { sessions: SessionSummary[] };
  return data.sessions || [];
}

export async function getSession(
  settings: AppSettings,
  id: string
): Promise<{
  id: string;
  title: string;
  messages: Array<{
    role: string;
    content: string;
    name?: string;
    tool_call_id?: string;
  }>;
  pendingApproval?: {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    reason: string;
  } | null;
}> {
  const res = await fetch(`${base(settings.serverUrl)}/sessions/${id}`, {
    headers: { ...authHeaders(settings) },
  });
  if (!res.ok) throw await parseJsonError(res);
  return res.json();
}

export async function deleteSession(
  settings: AppSettings,
  id: string
): Promise<void> {
  const res = await fetch(`${base(settings.serverUrl)}/sessions/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(settings) },
  });
  if (!res.ok) throw await parseJsonError(res);
}

/** XHR streaming works more reliably than fetch body readers in React Native. */
function streamViaXhr(
  url: string,
  headers: Record<string, string>,
  body: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let seen = 0;
    const parser = new SseParser();
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", onAbort);
      fn();
    };

    const onAbort = () => {
      xhr.abort();
      finish(() => reject(new ApiError("Cancelled", 0, "aborted")));
    };
    signal?.addEventListener("abort", onAbort);
    if (signal?.aborted) {
      onAbort();
      return;
    }

    xhr.open("POST", url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.responseType = "text";

    xhr.onprogress = () => {
      if (settled) return;
      const text = xhr.responseText || "";
      const chunk = text.slice(seen);
      seen = text.length;
      if (chunk) parser.push(chunk, onEvent);
    };

    xhr.onload = () => {
      const text = xhr.responseText || "";
      if (text.length > seen) parser.push(text.slice(seen), onEvent);
      parser.flush(onEvent);

      if (xhr.status === 401) {
        finish(() =>
          reject(
            new ApiError(
              "Unauthorized — set Server token in Systems (OMNI_SERVER_TOKEN).",
              401,
              "auth_required"
            )
          )
        );
        return;
      }
      if (xhr.status === 429) {
        finish(() =>
          reject(new ApiError("Rate limited — retry shortly.", 429, "rate_limited"))
        );
        return;
      }
      if (xhr.status === 413) {
        finish(() =>
          reject(new ApiError("Message too large for server.", 413, "body_too_large"))
        );
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        finish(() => resolve());
      } else {
        finish(() =>
          reject(
            new ApiError(
              xhr.responseText || `Chat failed (${xhr.status})`,
              xhr.status
            )
          )
        );
      }
    };

    xhr.onerror = () => {
      finish(() => reject(new Error("Network error talking to Omni server")));
    };

    xhr.onabort = () => {
      finish(() => reject(new ApiError("Cancelled", 0, "aborted")));
    };

    xhr.send(body);
  });
}

export async function streamChat(
  settings: AppSettings,
  body: {
    message?: string;
    sessionId?: string;
    approvalDecision?: { id: string; approve: boolean };
  },
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    "x-provider": settings.provider,
    "x-model": settings.model,
    ...authHeaders(settings),
  };
  if (settings.apiKey) headers["x-api-key"] = settings.apiKey;
  if (settings.autoApprove) headers["x-auto-approve"] = "1";

  const payload = JSON.stringify({
    message: body.message ?? "",
    sessionId: body.sessionId,
    approvalDecision: body.approvalDecision,
    autoApprove: settings.autoApprove,
    provider: settings.provider,
    model: settings.model,
  });

  await streamViaXhr(
    `${base(settings.serverUrl)}/chat`,
    headers,
    payload,
    onEvent,
    signal
  );
}
