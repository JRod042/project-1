import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type AuditEntry = {
  ts: string;
  sessionId?: string;
  tool: string;
  ok: boolean;
  argsSummary: string;
  outputSummary: string;
  durationMs: number;
};

function summarize(value: unknown, max = 240): string {
  let text: string;
  try {
    text = typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    text = String(value);
  }
  text = text.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export async function writeAudit(
  workspaceRoot: string,
  entry: Omit<AuditEntry, "ts" | "argsSummary" | "outputSummary"> & {
    args: unknown;
    output: unknown;
  }
): Promise<void> {
  const dir = path.join(workspaceRoot, ".omni");
  await mkdir(dir, { recursive: true });
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    sessionId: entry.sessionId,
    tool: entry.tool,
    ok: entry.ok,
    argsSummary: summarize(entry.args),
    outputSummary: summarize(entry.output),
    durationMs: entry.durationMs,
  } satisfies AuditEntry);
  await appendFile(path.join(dir, "audit.log"), `${line}\n`, "utf8");
}
