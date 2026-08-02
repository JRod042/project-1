import type { AppSettings, StreamEvent } from "../types";

function base(url: string) {
  return url.replace(/\/+$/, "");
}

export async function healthCheck(serverUrl: string, serverToken?: string) {
  const headers: Record<string, string> = {};
  if (serverToken) headers["x-omni-token"] = serverToken;
  const res = await fetch(`${base(serverUrl)}/health`, { headers });
  if (!res.ok) throw new Error(`Health ${res.status}`);
  return res.json() as Promise<{
    ok: boolean;
    workspace?: string;
    workspaceRoot?: string;
    authRequired?: boolean;
    providers: Record<string, boolean>;
  }>;
}

function parseSseChunk(chunk: string, onEvent: (event: StreamEvent) => void) {
  const lines = chunk.split("\n");
  let data = "";
  for (const line of lines) {
    if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }
  if (!data) return;
  try {
    onEvent(JSON.parse(data) as StreamEvent);
  } catch {
    // ignore malformed
  }
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
    let buffer = "";

    const onAbort = () => {
      xhr.abort();
      reject(new Error("Aborted"));
    };
    signal?.addEventListener("abort", onAbort);

    xhr.open("POST", url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

    xhr.onprogress = () => {
      const text = xhr.responseText || "";
      const chunk = text.slice(seen);
      seen = text.length;
      buffer += chunk;
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const part of parts) parseSseChunk(part, onEvent);
    };

    xhr.onload = () => {
      signal?.removeEventListener("abort", onAbort);
      if (buffer.trim()) parseSseChunk(buffer, onEvent);
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(xhr.responseText || `Chat failed (${xhr.status})`));
    };

    xhr.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Network error talking to Omni server"));
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
  };
  if (settings.apiKey) headers["x-api-key"] = settings.apiKey;
  if (settings.serverToken) headers["x-omni-token"] = settings.serverToken;
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
