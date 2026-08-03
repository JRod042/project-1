/** Build OpenClaw Control UI URL, optionally injecting gateway auth via fragment. */
export function normalizeOpenclawBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * OpenClaw Control UI reads gateway token from the URL fragment key `token`:
 *   https://HOST:18789/#token=THE_TOKEN
 *
 * Prefer `#token=` (not sent to the server). Legacy `?token=` is a one-time
 * fallback in current OpenClaw UI, but fragment is the supported form.
 */
export function controlUiUrl(baseUrl: string, token?: string): string {
  const base = normalizeOpenclawBaseUrl(baseUrl);
  if (!base) return "";
  const trimmed = token?.trim();
  if (!trimmed) return base;
  // No slash before '#' — some iOS URL serializers are picky about "/#".
  return `${base}#token=${encodeURIComponent(trimmed)}`;
}

export function maskTokenHint(token: string): string {
  const t = token.trim();
  if (!t) return "not set";
  if (t.length <= 8) return `saved · ${t.length} chars`;
  return `saved · ${t.length} chars · ${t.slice(0, 2)}…${t.slice(-2)}`;
}
