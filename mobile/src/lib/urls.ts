/** Pure URL helpers — safe for node:test without React Native. */
export function isLoopbackServerUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1"
    );
  } catch {
    return /localhost|127\.0\.0\.1/.test(url);
  }
}
