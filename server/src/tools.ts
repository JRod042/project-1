import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
  appendFile,
} from "node:fs/promises";
import path from "node:path";
import { writeAudit } from "./audit.js";
import {
  assertShellAllowed,
  getShellMode,
  getShellTimeoutMs,
  sanitizedShellEnv,
  type ShellMode,
} from "./shellPolicy.js";

const execFileAsync = promisify(execFile);

export type ToolDef = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  /** If true, the mobile client must approve before execution. */
  requiresApproval?: boolean;
};

export const TOOLS: ToolDef[] = [
  {
    name: "list_dir",
    description: "List files and folders in a workspace-relative path.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative path. Default '.'" },
      },
    },
  },
  {
    name: "read_file",
    description: "Read a text file from the workspace.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string" },
        maxBytes: { type: "number" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Create or overwrite a text file in the workspace.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string" },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
    requiresApproval: true,
  },
  {
    name: "append_file",
    description: "Append text to a file in the workspace.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string" },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
    requiresApproval: true,
  },
  {
    name: "run_shell",
    description:
      "Run a shell command in the workspace. Blocked patterns depend on OMNI_SHELL_MODE (strict|full).",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string" },
        timeoutMs: { type: "number" },
      },
      required: ["command"],
    },
    requiresApproval: true,
  },
  {
    name: "web_fetch",
    description: "Fetch a public URL and return text content (truncated).",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string" },
        maxChars: { type: "number" },
      },
      required: ["url"],
    },
  },
  {
    name: "web_search",
    description:
      "Search the public web via DuckDuckGo HTML and return top result snippets.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number" },
      },
      required: ["query"],
    },
  },
  {
    name: "remember",
    description: "Persist a short memory note for future sessions.",
    parameters: {
      type: "object",
      properties: {
        key: { type: "string" },
        value: { type: "string" },
      },
      required: ["key", "value"],
    },
  },
  {
    name: "recall",
    description: "Recall a previously saved memory note by key, or list keys.",
    parameters: {
      type: "object",
      properties: {
        key: { type: "string" },
      },
    },
  },
  {
    name: "mission_plan",
    description:
      "Create a structured multi-step plan for a complex goal. Does not execute steps.",
    parameters: {
      type: "object",
      properties: {
        goal: { type: "string" },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              detail: { type: "string" },
            },
            required: ["title"],
          },
        },
      },
      required: ["goal", "steps"],
    },
  },
];

/** Resolve a workspace-relative path; throws if it escapes WORKSPACE_ROOT. */
export function resolveSafe(root: string, rel: string): string {
  const raw = String(rel ?? ".").trim() || ".";
  if (path.isAbsolute(raw) || raw.startsWith("~")) {
    throw new Error("Path escapes workspace");
  }
  const cleaned = raw.replace(/^\/+/, "") || ".";
  const rootResolved = path.resolve(root);
  const full = path.resolve(rootResolved, cleaned);
  const relToRoot = path.relative(rootResolved, full);
  if (
    relToRoot === ".." ||
    relToRoot.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relToRoot)
  ) {
    throw new Error("Path escapes workspace");
  }
  return full;
}

async function ensureWorkspace(root: string) {
  await mkdir(root, { recursive: true });
  await mkdir(path.join(root, ".omni"), { recursive: true });
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function decodeDuckUrl(href: string): string {
  try {
    if (href.includes("uddg=")) {
      const u = new URL(href, "https://duckduckgo.com");
      const target = u.searchParams.get("uddg");
      if (target) return decodeURIComponent(target);
    }
    // //duckduckgo.com/l/?uddg=...
    const m = href.match(/[?&]uddg=([^&]+)/);
    if (m) return decodeURIComponent(m[1]);
  } catch {
    /* keep original */
  }
  return href.startsWith("//") ? `https:${href}` : href;
}

type SearchHit = { title: string; url: string; snippet: string };

async function webSearch(query: string, limitRaw: number): Promise<string> {
  const limit = Math.min(Math.max(limitRaw || 5, 1), 10);
  const q = query.trim();
  if (!q) throw new Error("query required");

  const hits: SearchHit[] = [];
  const seen = new Set<string>();

  const push = (title: string, url: string, snippet = "") => {
    const cleanTitle = stripTags(title);
    const cleanUrl = decodeDuckUrl(url);
    if (!cleanTitle || !cleanUrl) return;
    if (seen.has(cleanUrl)) return;
    seen.add(cleanUrl);
    hits.push({
      title: cleanTitle,
      url: cleanUrl,
      snippet: stripTags(snippet).slice(0, 280),
    });
  };

  // 1) DuckDuckGo Instant Answer API (structured, when available)
  try {
    const iaUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    const iaRes = await fetch(iaUrl, {
      headers: { "User-Agent": "OmniAgent/0.1" },
      signal: AbortSignal.timeout(8_000),
    });
    if (iaRes.ok) {
      const ia = (await iaRes.json()) as {
        AbstractText?: string;
        AbstractURL?: string;
        Heading?: string;
        RelatedTopics?: Array<{
          Text?: string;
          FirstURL?: string;
          Topics?: Array<{ Text?: string; FirstURL?: string }>;
        }>;
        Results?: Array<{ Text?: string; FirstURL?: string }>;
      };
      if (ia.AbstractText && ia.AbstractURL) {
        push(ia.Heading || q, ia.AbstractURL, ia.AbstractText);
      }
      for (const r of ia.Results || []) {
        if (hits.length >= limit) break;
        if (r.Text && r.FirstURL) push(r.Text, r.FirstURL);
      }
      const flatten = (
        topics: NonNullable<typeof ia.RelatedTopics>
      ): Array<{ Text?: string; FirstURL?: string }> => {
        const out: Array<{ Text?: string; FirstURL?: string }> = [];
        for (const t of topics) {
          if (t.FirstURL && t.Text) out.push(t);
          if (t.Topics) out.push(...flatten(t.Topics as typeof topics));
        }
        return out;
      };
      for (const t of flatten(ia.RelatedTopics || [])) {
        if (hits.length >= limit) break;
        if (t.Text && t.FirstURL) push(t.Text, t.FirstURL);
      }
    }
  } catch {
    /* fall through to HTML */
  }

  // 2) HTML scrape fallback / supplement
  if (hits.length < limit) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; OmniAgent/0.1; +https://github.com/JRod042/project-1)",
      },
      signal: AbortSignal.timeout(15_000),
    });
    const html = await res.text();

    const blockRe =
      /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>([\s\S]*?)(?=class="result__a"|$)/gi;
    let m: RegExpExecArray | null;
    while ((m = blockRe.exec(html)) && hits.length < limit) {
      const href = m[1];
      const title = m[2];
      const rest = m[3] || "";
      const snip =
        rest.match(/class="result__snippet"[^>]*>([\s\S]*?)<\//i)?.[1] || "";
      push(title, href, snip);
    }

    if (hits.length < limit) {
      const loose = /uddg=([^&"]+)[^>]*>\s*([\s\S]*?)<\/a>/gi;
      let lm: RegExpExecArray | null;
      while ((lm = loose.exec(html)) && hits.length < limit) {
        push(lm[2], `https://duckduckgo.com/l/?uddg=${lm[1]}`);
      }
    }
  }

  if (!hits.length) return "No results found.";
  return hits
    .slice(0, limit)
    .map(
      (h, i) =>
        `${i + 1}. ${h.title}\n   ${h.url}${h.snippet ? `\n   ${h.snippet}` : ""}`
    )
    .join("\n\n");
}

async function executeToolInner(
  name: string,
  args: Record<string, unknown>,
  workspaceRoot: string,
  shellMode: ShellMode
): Promise<string> {
  await ensureWorkspace(workspaceRoot);

  switch (name) {
    case "list_dir": {
      const rel = String(args.path ?? ".");
      const dir = resolveSafe(workspaceRoot, rel);
      const entries = await readdir(dir, { withFileTypes: true });
      const lines = await Promise.all(
        entries.map(async (e) => {
          const kind = e.isDirectory() ? "dir" : "file";
          let size = "";
          if (e.isFile()) {
            try {
              const s = await stat(path.join(dir, e.name));
              size = ` ${s.size}b`;
            } catch {
              /* ignore */
            }
          }
          return `${kind.padEnd(4)} ${e.name}${size}`;
        })
      );
      return lines.sort().join("\n") || "(empty)";
    }
    case "read_file": {
      const file = resolveSafe(workspaceRoot, String(args.path));
      const maxBytes = Number(args.maxBytes ?? 120_000);
      const buf = await readFile(file);
      const slice = buf.subarray(0, maxBytes);
      const text = slice.toString("utf8");
      const truncated =
        buf.length > maxBytes
          ? `\n\n[truncated ${buf.length - maxBytes} bytes]`
          : "";
      return text + truncated;
    }
    case "write_file": {
      const file = resolveSafe(workspaceRoot, String(args.path));
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, String(args.content ?? ""), "utf8");
      return `Wrote ${file}`;
    }
    case "append_file": {
      const file = resolveSafe(workspaceRoot, String(args.path));
      await mkdir(path.dirname(file), { recursive: true });
      await appendFile(file, String(args.content ?? ""), "utf8");
      return `Appended to ${file}`;
    }
    case "run_shell": {
      const command = String(args.command ?? "").trim();
      if (!command) throw new Error("Empty command");
      assertShellAllowed(command, shellMode);
      const timeoutMs = getShellTimeoutMs(Number(args.timeoutMs ?? undefined));
      try {
        const { stdout, stderr } = await execFileAsync(
          "/bin/bash",
          ["-lc", command],
          {
            cwd: workspaceRoot,
            timeout: timeoutMs,
            maxBuffer: 512_000,
            env: sanitizedShellEnv(),
          }
        );
        const out = [stdout, stderr].filter(Boolean).join("\n").trim();
        return (out || "(no output)").slice(0, 20_000);
      } catch (err) {
        const e = err as {
          stdout?: string;
          stderr?: string;
          message?: string;
          killed?: boolean;
          code?: string;
        };
        if (e.killed || e.code === "ETIMEDOUT") {
          throw new Error(`Shell timed out after ${timeoutMs}ms`);
        }
        return [e.stdout, e.stderr, e.message ?? String(err)]
          .filter(Boolean)
          .join("\n")
          .slice(0, 20_000);
      }
    }
    case "web_fetch": {
      const url = String(args.url ?? "");
      const maxChars = Math.min(Number(args.maxChars ?? 20_000), 80_000);
      const res = await fetch(url, {
        headers: { "User-Agent": "OmniAgent/0.1" },
        signal: AbortSignal.timeout(20_000),
      });
      const text = await res.text();
      const stripped = text
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return `HTTP ${res.status}\n${stripped.slice(0, maxChars)}`;
    }
    case "web_search": {
      return await webSearch(String(args.query ?? ""), Number(args.limit ?? 5));
    }
    case "remember": {
      const key = String(args.key ?? "").replace(/[^\w.-]+/g, "_");
      const value = String(args.value ?? "");
      const memDir = path.join(workspaceRoot, ".omni", "memory");
      await mkdir(memDir, { recursive: true });
      await writeFile(path.join(memDir, `${key}.txt`), value, "utf8");
      return `Remembered "${key}"`;
    }
    case "recall": {
      const memDir = path.join(workspaceRoot, ".omni", "memory");
      await mkdir(memDir, { recursive: true });
      if (args.key) {
        const key = String(args.key).replace(/[^\w.-]+/g, "_");
        try {
          return await readFile(path.join(memDir, `${key}.txt`), "utf8");
        } catch {
          return `No memory for "${key}"`;
        }
      }
      const keys = (await readdir(memDir))
        .filter((f) => f.endsWith(".txt"))
        .map((f) => f.replace(/\.txt$/, ""));
      return keys.length ? keys.join("\n") : "(no memories)";
    }
    case "mission_plan": {
      const goal = String(args.goal ?? "");
      const steps = Array.isArray(args.steps) ? args.steps : [];
      const plan = {
        goal,
        steps,
        createdAt: new Date().toISOString(),
      };
      const plansDir = path.join(workspaceRoot, ".omni", "plans");
      await mkdir(plansDir, { recursive: true });
      const file = path.join(plansDir, `plan-${Date.now()}.json`);
      await writeFile(file, JSON.stringify(plan, null, 2), "utf8");
      const listed = steps
        .map((s, i) => {
          const step = s as { title?: string; detail?: string };
          return `${i + 1}. ${step.title ?? "step"}${
            step.detail ? ` — ${step.detail}` : ""
          }`;
        })
        .join("\n");
      return `Plan saved.\nGoal: ${goal}\n${listed}`;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export type ExecuteToolOptions = {
  sessionId?: string;
  shellMode?: ShellMode;
};

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  workspaceRoot: string,
  options: ExecuteToolOptions = {}
): Promise<string> {
  const started = Date.now();
  const shellMode =
    options.shellMode ?? getShellMode(process.env.OMNI_SHELL_MODE);
  try {
    const output = await executeToolInner(
      name,
      args,
      workspaceRoot,
      shellMode
    );
    await writeAudit(workspaceRoot, {
      sessionId: options.sessionId,
      tool: name,
      ok: true,
      args,
      output,
      durationMs: Date.now() - started,
    });
    return output;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await writeAudit(workspaceRoot, {
      sessionId: options.sessionId,
      tool: name,
      ok: false,
      args,
      output: message,
      durationMs: Date.now() - started,
    });
    throw err;
  }
}

export function toolRequiresApproval(name: string): boolean {
  return Boolean(TOOLS.find((t) => t.name === name)?.requiresApproval);
}

export function toolsForPrompt(): string {
  return TOOLS.map(
    (t) =>
      `- ${t.name}${t.requiresApproval ? " [approval]" : ""}: ${t.description}\n  params: ${JSON.stringify(t.parameters)}`
  ).join("\n");
}
