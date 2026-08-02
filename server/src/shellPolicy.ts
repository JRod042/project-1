export type ShellMode = "strict" | "full";

/** Patterns blocked in every mode. */
export const ALWAYS_BLOCKED: RegExp[] = [
  /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|--recursive)/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\b:\(\)\s*\{\s*:\|:&\s*\}\s*;?/i, // fork bomb
  /\bcurl\b.+\|\s*(ba)?sh\b/i,
  /\bwget\b.+\|\s*(ba)?sh\b/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bhalt\b/i,
  /\bpoweroff\b/i,
  /\buser(add|del|mod)\b/i,
  /\bpasswd\b/i,
  /\bchmod\s+(-R\s+)?777\b/i,
  /\bchown\s+-R\s+root\b/i,
  />\s*\/dev\/sd[a-z]/i,
  /\bnc\s+-[lp]/i,
  /\bnmap\b/i,
];

/** Extra blocks when OMNI_SHELL_MODE=strict. */
export const STRICT_BLOCKED: RegExp[] = [
  /\bsudo\b/i,
  /\bsu\b/i,
  /\bapt(-get)?\b/i,
  /\byum\b/i,
  /\bdnf\b/i,
  /\bpacman\b/i,
  /\bbrew\b/i,
  /\bnpm\s+(-g|--global)\b/i,
  /\bpip3?\s+install\b/i,
  /\bdocker\b/i,
  /\bkubectl\b/i,
  /\bsystemctl\b/i,
  /\bservice\b/i,
  /\blaunchctl\b/i,
  /\bkill(all)?\b/i,
  /\bpkill\b/i,
  /\bcrontab\b/i,
  /\bscp\b/i,
  /\brsync\b.+\s\//i,
];

export function getShellMode(raw?: string): ShellMode {
  return raw === "full" ? "full" : "strict";
}

export function assertShellAllowed(
  command: string,
  mode: ShellMode = getShellMode(process.env.OMNI_SHELL_MODE)
): void {
  const cmd = command.trim();
  if (!cmd) throw new Error("Empty command");
  if (cmd.length > 4_000) throw new Error("Command too long");

  for (const re of ALWAYS_BLOCKED) {
    if (re.test(cmd)) {
      throw new Error(`Shell blocked (always): matches ${re}`);
    }
  }
  if (mode === "strict") {
    for (const re of STRICT_BLOCKED) {
      if (re.test(cmd)) {
        throw new Error(
          `Shell blocked (strict mode): matches ${re}. Set OMNI_SHELL_MODE=full to allow.`
        );
      }
    }
  }
}

/** Minimal env for child processes — strip secrets and credentials. */
export function sanitizedShellEnv(
  base: NodeJS.ProcessEnv = process.env
): NodeJS.ProcessEnv {
  const allow = new Set([
    "PATH",
    "HOME",
    "USER",
    "LOGNAME",
    "SHELL",
    "TMPDIR",
    "TMP",
    "TEMP",
    "LANG",
    "LC_ALL",
    "LC_CTYPE",
    "TERM",
    "COLORTERM",
    "NODE_ENV",
    "PWD",
    "OLDPWD",
  ]);
  const out: NodeJS.ProcessEnv = {
    FORCE_COLOR: "0",
    NO_COLOR: "1",
  };
  for (const key of allow) {
    if (base[key]) out[key] = base[key];
  }
  return out;
}

export const MAX_SHELL_TIMEOUT_MS = 60_000;
export const DEFAULT_SHELL_TIMEOUT_MS = 30_000;

export function getShellTimeoutMs(requested?: number): number {
  const n = Number(requested);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_SHELL_TIMEOUT_MS;
  return Math.min(Math.floor(n), MAX_SHELL_TIMEOUT_MS);
}
