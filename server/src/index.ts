import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { z } from "zod";
import { runAgent } from "./agent.js";
import { deleteSession, getSession, listSessions } from "./sessions.js";
import { TOOLS } from "./tools.js";
import type { ProviderName, StreamEvent } from "./types.js";

const app = new Hono();
const port = Number(process.env.PORT || 8787);
const workspaceRoot = path.resolve(
  process.env.WORKSPACE_ROOT || path.join(process.cwd(), "workspace")
);

await mkdir(workspaceRoot, { recursive: true });

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: [
      "Content-Type",
      "x-api-key",
      "x-provider",
      "x-model",
      "x-auto-approve",
    ],
  })
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    name: "omni-server",
    workspaceRoot,
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
  const body = chatSchema.parse(await c.req.json());
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

serve({
  fetch: app.fetch,
  hostname: "0.0.0.0",
  port,
});
