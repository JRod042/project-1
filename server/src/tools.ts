import { exec } from "node:child_process";
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


const execAsync = promisify(exec);

/** Block obvious host-escape / destructive patterns. Not a full sandbox. */
const SHELL_BLOCKLIST: RegExp[] = [
  /\brm\s+-rf\s+[/'"]?\s*(\/|~|\$HOME)\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /:\(\)\s*\{\s*:\|:\s*&\s*\}\s*;\s*:/,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bcurl\b[^|]*\|\s*(ba)?sh\b/i,
  /\bwget\b[^|]*\|\s*(ba)?sh\b/i,
  /\b(chmod|chown)\s+-R\s+.*\s+\/(bin|etc|usr|System)/i,
];

function assertShellSafe(command: string) {
  const trimmed = command.trim();
  if (!trimmed) throw new Error("Empty command");
  if (trimmed.length > 4000) throw new Error("Command too long");
  for (const re of SHELL_BLOCKLIST) {
    if (re.test(trimmed)) {
      throw new Error("Command blocked by safety policy");
    }
  }
}


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
      "Run a shell command in the workspace. Use for builds, git, scripts, installs.",
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

function resolveSafe(root: string, rel: string): string {
  const cleaned = rel.replace(/^\/+/, "") || ".";
  const full = path.resolve(root, cleaned);
  const rootResolved = path.resolve(root);
  if (full !== rootResolved && !full.startsWith(rootResolved + path.sep)) {
    throw new Error("Path escapes workspace");
  }
  return full;
}

async function ensureWorkspace(root: string) {
  await mkdir(root, { recursive: true });
  await mkdir(path.join(root, ".omni"), { recursive: true });
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  workspaceRoot: string
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
      const truncated = buf.length > maxBytes ? `\n\n[truncated ${buf.length - maxBytes} bytes]` : "";
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
      const command = String(args.command ?? "");
      assertShellSafe(command);
      const timeoutMs = Math.min(Number(args.timeoutMs ?? 60_000), 180_000);
      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: workspaceRoot,
          timeout: timeoutMs,
          maxBuffer: 2_000_000,
          env: {
            ...process.env,
            FORCE_COLOR: "0",
            // Soft containment hint — tools should stay in workspace.
            OMNI_WORKSPACE: workspaceRoot,
          },
          // Prevent runaway process groups where possible
          killSignal: "SIGKILL",
        });
        const out = [stdout, stderr].filter(Boolean).join("\n").trim();
        return out || "(no output)";
      } catch (err) {
        const e = err as { stdout?: string; stderr?: string; message?: string };
        return [
          e.stdout,
          e.stderr,
          e.message ?? String(err),
        ]
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
      const query = String(args.query ?? "");
      const limit = Math.min(Number(args.limit ?? 5), 10);
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "OmniAgent/0.1" },
        signal: AbortSignal.timeout(15_000),
      });
      const html = await res.text();
      const results: string[] = [];
      const re =
        /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) && results.length < limit) {
        const href = m[1];
        const title = m[2].replace(/<[^>]+>/g, "").trim();
        const snippet = m[3].replace(/<[^>]+>/g, "").trim();
        results.push(`${results.length + 1}. ${title}\n   ${href}\n   ${snippet}`);
      }
      if (!results.length) {
        // Fallback looser parse
        const loose =
          /uddg=([^&"]+)[^>]*>\s*([\s\S]*?)<\/a>/gi;
        let lm: RegExpExecArray | null;
        while ((lm = loose.exec(html)) && results.length < limit) {
          const href = decodeURIComponent(lm[1]);
          const title = lm[2].replace(/<[^>]+>/g, "").trim();
          if (title) results.push(`${results.length + 1}. ${title}\n   ${href}`);
        }
      }
      return results.join("\n\n") || "No results found.";
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
          return `${i + 1}. ${step.title ?? "step"}${step.detail ? ` — ${step.detail}` : ""}`;
        })
        .join("\n");
      return `Plan saved.\nGoal: ${goal}\n${listed}`;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
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
