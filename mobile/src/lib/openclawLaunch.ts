import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";
import { controlUiUrl, normalizeOpenclawBaseUrl } from "./openclaw";
import { isLoopbackServerUrl } from "./storage";

export type OpenControlUiResult =
  | { ok: true; url: string; usedToken: boolean }
  | { ok: false; reason: "missing_url" | "loopback" | "open_failed"; detail: string };

/**
 * Open Control UI. Prefer expo-web-browser (SFSafariViewController) so iOS
 * does not escape `#` → `%23` the way RN Linking historically did — that would
 * break OpenClaw's required `#token=` fragment auth.
 */
export async function openControlUi(
  baseUrl: string,
  token?: string
): Promise<OpenControlUiResult> {
  const base = normalizeOpenclawBaseUrl(baseUrl);
  if (!base) {
    return {
      ok: false,
      reason: "missing_url",
      detail:
        "Set OpenClaw Control UI URL in SYS (LAN/Tailscale IP:18789 — not localhost).",
    };
  }
  if (isLoopbackServerUrl(base)) {
    return {
      ok: false,
      reason: "loopback",
      detail:
        "localhost / 127.0.0.1 is this iPad. Use your host LAN IP or Tailscale URL (port 18789).",
    };
  }

  const url = controlUiUrl(base, token);
  const usedToken = Boolean(token?.trim());

  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      enableBarCollapsing: true,
      showTitle: true,
    });
    return { ok: true, url: base, usedToken };
  } catch {
    // Fallback — may escape '#' on some iOS RN builds; still better than nothing.
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        return {
          ok: false,
          reason: "open_failed",
          detail: `Cannot open ${base}`,
        };
      }
      await Linking.openURL(url);
      return { ok: true, url: base, usedToken };
    } catch (err) {
      return {
        ok: false,
        reason: "open_failed",
        detail:
          err instanceof Error
            ? err.message
            : `Could not open ${base}. Check SYS URL.`,
      };
    }
  }
}
