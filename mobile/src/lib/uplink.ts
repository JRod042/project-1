import { healthCheck } from "./api";
import { normalizeOpenclawBaseUrl } from "./openclaw";
import { isLoopbackServerUrl } from "./urls";
import type { AppSettings } from "../types";

export type UplinkLevel = "online" | "slow" | "offline" | "loopback" | "unset" | "probing";

export type UplinkSnapshot = {
  level: UplinkLevel;
  latencyMs: number | null;
  label: string;
  detail: string;
  checkedAt: number;
};

const SLOW_MS = 900;
const TIMEOUT_MS = 4500;

function hostHint(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.port ? `:${u.port}` : ""}`;
  } catch {
    return url.slice(0, 28) || "—";
  }
}

export function classifyLatency(ms: number | null, ok: boolean): UplinkLevel {
  if (!ok) return "offline";
  if (ms == null) return "online";
  if (ms >= SLOW_MS) return "slow";
  return "online";
}

export function initialUplink(settings: AppSettings | null): UplinkSnapshot {
  if (!settings) {
    return {
      level: "probing",
      latencyMs: null,
      label: "BOOT",
      detail: "loading settings",
      checkedAt: Date.now(),
    };
  }
  const target =
    settings.runtimeMode === "openclaw"
      ? normalizeOpenclawBaseUrl(settings.openclawUrl)
      : settings.serverUrl.trim();
  if (!target) {
    return {
      level: "unset",
      latencyMs: null,
      label: "NO TARGET",
      detail: "set URL in SYS",
      checkedAt: Date.now(),
    };
  }
  if (isLoopbackServerUrl(target)) {
    return {
      level: "loopback",
      latencyMs: null,
      label: "LOOPBACK",
      detail: `${hostHint(target)} · use LAN IP`,
      checkedAt: Date.now(),
    };
  }
  return {
    level: "probing",
    latencyMs: null,
    label: "PROBE",
    detail: hostHint(target),
    checkedAt: Date.now(),
  };
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Latency probe for OpenClaw Control UI / legacy Omni health — netly-style, no native deps. */
export async function probeUplink(settings: AppSettings): Promise<UplinkSnapshot> {
  const checkedAt = Date.now();
  const mode = settings.runtimeMode;

  if (mode === "openclaw") {
    const base = normalizeOpenclawBaseUrl(settings.openclawUrl);
    if (!base) {
      return {
        level: "unset",
        latencyMs: null,
        label: "NO TARGET",
        detail: "set Control UI URL in SYS",
        checkedAt,
      };
    }
    if (isLoopbackServerUrl(base)) {
      return {
        level: "loopback",
        latencyMs: null,
        label: "LOOPBACK",
        detail: `${hostHint(base)} · LAN/Tailscale required`,
        checkedAt,
      };
    }
    const t0 = Date.now();
    try {
      const res = await fetchWithTimeout(base, { method: "GET" });
      const latencyMs = Date.now() - t0;
      const ok = res.ok || res.status === 401 || res.status === 403;
      const level = classifyLatency(latencyMs, ok);
      return {
        level,
        latencyMs,
        label:
          level === "online"
            ? "LINK UP"
            : level === "slow"
              ? "LINK SLOW"
              : "LINK DOWN",
        detail: `${hostHint(base)} · HTTP ${res.status} · ${latencyMs}ms`,
        checkedAt,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unreachable";
      return {
        level: "offline",
        latencyMs: null,
        label: "LINK DOWN",
        detail: `${hostHint(base)} · ${msg}`,
        checkedAt,
      };
    }
  }

  const url = settings.serverUrl.trim();
  if (!url) {
    return {
      level: "unset",
      latencyMs: null,
      label: "NO TARGET",
      detail: "set agent URL in SYS",
      checkedAt,
    };
  }
  if (isLoopbackServerUrl(url)) {
    return {
      level: "loopback",
      latencyMs: null,
      label: "LOOPBACK",
      detail: `${hostHint(url)} · LAN/tunnel required`,
      checkedAt,
    };
  }
  const t0 = Date.now();
  try {
    const h = await healthCheck(url);
    const latencyMs = Date.now() - t0;
    const level = classifyLatency(latencyMs, Boolean(h.ok));
    const auth =
      h.authRequired && !settings.serverToken.trim()
        ? "auth needed"
        : h.authRequired
          ? "auth ok"
          : "open";
    return {
      level,
      latencyMs,
      label:
        level === "online"
          ? "LINK UP"
          : level === "slow"
            ? "LINK SLOW"
            : "LINK DOWN",
      detail: `${hostHint(url)} · ${auth} · ${latencyMs}ms`,
      checkedAt,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unreachable";
    return {
      level: "offline",
      latencyMs: Date.now() - t0,
      label: "LINK DOWN",
      detail: `${hostHint(url)} · ${msg}`,
      checkedAt,
    };
  }
}
