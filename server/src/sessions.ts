import { v4 as uuid } from "uuid";
import { mkdir, readFile, readdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { Session } from "./types.js";

const sessions = new Map<string, Session>();
let persistDir: string | null = null;

export async function initSessionStore(workspaceRoot: string) {
  persistDir = path.join(workspaceRoot, ".omni", "sessions");
  await mkdir(persistDir, { recursive: true });
  try {
    const files = await readdir(persistDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await readFile(path.join(persistDir, file), "utf8");
        const session = JSON.parse(raw) as Session;
        if (session?.id) sessions.set(session.id, session);
      } catch {
        /* skip corrupt */
      }
    }
  } catch {
    /* first boot */
  }
}

async function persist(session: Session) {
  if (!persistDir) return;
  const file = path.join(persistDir, `${session.id}.json`);
  await writeFile(file, JSON.stringify(session), "utf8");
}

export function createSession(title = "New mission"): Session {
  const now = Date.now();
  const session: Session = {
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    title,
    messages: [],
  };
  sessions.set(session.id, session);
  void persist(session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function listSessions(): Session[] {
  return [...sessions.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function touch(session: Session) {
  session.updatedAt = Date.now();
  void persist(session);
}

export function deleteSession(id: string): boolean {
  const ok = sessions.delete(id);
  if (ok && persistDir) {
    void unlink(path.join(persistDir, `${id}.json`)).catch(() => undefined);
  }
  return ok;
}
