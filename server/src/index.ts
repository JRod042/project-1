import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { z } from "zod";
import { runAgent } from "./agent.js";
import {
  deleteSession,
  getSession,
  initSessionStore,
  listSessions,
} from "./sessions.js";
import { TOOLS } from "./tools.js";
import type { ProviderName, StreamEvent } from "./types.js";

const app = new Hono();
const port = Number(process.env.PORT || 8787);
const workspaceRoot = path.resolve(
  process.env.WORKSPACE_ROOT || path.join(process.cwd(), "workspace")
);
/** Optional shared secret. When set, clients must send it as x-omni-token or Authorization: Bearer. */
const serverToken = (process.env.OMNI_SERVER_TOKEN || "").trim();

await mkdir(workspaceRoot, { recursive: true });
await initSessionStore(workspaceRoot);

function extractToken(c: {
  req: { header: (name: string) => string | undefined };
}): string {
  const header = c.req.header("x-omni-token") || "";
  if (header) return header.trim();
  const auth = c.req.header("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || "";
}

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key",
      "x-provider",
      "x-model",
      "x-auto-approve",
      "x-omni-token",
    ],
  })
);

app.use("*", async (c, next) => {
  // Health stays public so the app can discover reachability before auth is configured.
  if (c.req.path === "/health") return next();
  if (!serverToken) return next();
  if (extractToken(c) !== serverToken) {
    return c.json(
      {
        error:
          "Unauthorized. Set OMNI_SERVER_TOKEN on the server and the same token in the app (SYS → Server token).",
      },
      401
    );
  }
  return next();
});

app.get("/health", (c) =>
  c.json({
    ok: true,
    name: "omni-server",
    authRequired: Boolean(serverToken),
    // Do not leak absolute host paths in health — only basename-ish hint
    workspace: path.basename(workspaceRoot),
    providers: {
      xai: Boolean(process.env.XAI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
    },
  })
);

app.get("/tools", (c) => c.json({ tools: TOOLS }));

app.get("/sessions", (c) =>
  c.json({
    sessions: listSessions().map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      pendingApproval: s.pendingApproval ?? null,
      messageCount: s.messages.length,
    })),
  })
);

app.get("/sessions/:id", (c) => {
  const session = getSession(c.req.param("id"));
  if (!session) return c.json({ error: "Not found" }, 404);
  return c.json(session);
});

app.delete("/sessions/:id", (c) => {
  const ok = deleteSession(c.req.param("id"));
  return c.json({ ok });
});

const chatSchema = z.object({
  message: z.string().default(""),
  sessionId: z.string().optional(),
  provider: z.enum(["xai", "openai", "gemini"]).optional(),
  model: z.string().optional(),
  autoApprove: z.boolean().optional(),
  approvalDecision: z
    .object({
      id: z.string(),
      approve: z.boolean(),
    })
    .optional(),
});

app.post("/chat", async (c) => {
  let body: z.infer<typeof chatSchema>;
  try {
    body = chatSchema.parse(await c.req.json());
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Invalid body" },
      400
    );
  }

  const apiKey = c.req.header("x-api-key") || undefined;
  const provider =
    (c.req.header("x-provider") as ProviderName | undefined) || body.provider;
  const model = c.req.header("x-model") || body.model;
  const autoApprove =
    c.req.header("x-auto-approve") === "1" || body.autoApprove === true;

  return streamSSE(c, async (stream) => {
    const send = async (event: StreamEvent) => {
      await stream.writeSSE({
        event: event.type,
        data: JSON.stringify(event),
      });
    };

    try {
      for await (const event of runAgent({
        sessionId: body.sessionId,
        message: body.message,
        provider,
        model,
        apiKey,
        workspaceRoot,
        autoApprove,
        approvalDecision: body.approvalDecision,
      })) {
        await send(event);
      }
    } catch (err) {
      await send({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });
});

console.log(`Omni agent server on http://0.0.0.0:${port}`);
console.log(`Workspace: ${workspaceRoot}`);
console.log(
  serverToken
    ? "Auth: OMNI_SERVER_TOKEN is set (requests require x-omni-token)"
    : "Auth: OPEN — set OMNI_SERVER_TOKEN before exposing beyond localhost/LAN"
);

serve({
  fetch: app.fetch,
  hostname: "0.0.0.0",
  port,
});
