import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { v4 as uuid } from "uuid";
import type { PendingTool, Session } from "./types.js";

const sessions = new Map<string, Session>();
let persistDir: string | null = null;

/** Test helper — clears in-memory sessions (disk untouched unless re-inited). */
export function _resetSessionsForTests() {
  sessions.clear();
  persistDir = null;
}

function sessionPath(id: string): string {
  if (!persistDir) {
    throw new Error("Session store not initialized");
  }
  return path.join(persistDir, `${id}.json`);
}

async function persist(session: Session): Promise<void> {
  if (!persistDir) return;
  try {
    await mkdir(persistDir, { recursive: true });
    await writeFile(sessionPath(session.id), JSON.stringify(session), "utf8");
  } catch {
    /* best-effort disk mirror; in-memory session remains authoritative */
  }
}

const persistQueue = new Map<string, Promise<void>>();

function schedulePersist(session: Session) {
  if (!persistDir) return;
  const prev = persistQueue.get(session.id) ?? Promise.resolve();
  const next = prev.then(() => persist(session));
  persistQueue.set(session.id, next);
  void next.finally(() => {
    if (persistQueue.get(session.id) === next) persistQueue.delete(session.id);
  });
}

/** Flush pending disk writes (tests). */
export async function flushSessions(): Promise<void> {
  await Promise.all([...persistQueue.values()]);
}

/** Load sessions from workspace/.omni/sessions (call once at boot). */
export async function initSessionStore(workspaceRoot: string): Promise<void> {
  persistDir = path.join(path.resolve(workspaceRoot), ".omni", "sessions");
  await mkdir(persistDir, { recursive: true });
  const files = (await readdir(persistDir)).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    try {
      const raw = await readFile(path.join(persistDir, file), "utf8");
      const session = JSON.parse(raw) as Session;
      if (session?.id) sessions.set(session.id, session);
    } catch {
      /* ignore corrupt session files */
    }
  }
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
  schedulePersist(session);
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
  schedulePersist(session);
}

export function deleteSession(id: string): boolean {
  const ok = sessions.delete(id);
  if (ok && persistDir) {
    void unlink(sessionPath(id)).catch(() => undefined);
  }
  return ok;
}

export function setApprovalQueue(
  session: Session,
  head: PendingTool,
  rest: PendingTool[]
) {
  session.pendingApproval = head;
  session.pendingToolQueue = rest.length ? rest : undefined;
  touch(session);
}

export function clearApprovals(session: Session) {
  session.pendingApproval = undefined;
  session.pendingToolQueue = undefined;
  touch(session);
}

/** Promote next queued tool to pendingApproval, or clear if empty. */
export function promoteApprovalQueue(session: Session): PendingTool | undefined {
  const next = session.pendingToolQueue?.shift();
  if (!next) {
    clearApprovals(session);
    return undefined;
  }
  if (!session.pendingToolQueue?.length) {
    session.pendingToolQueue = undefined;
  }
  session.pendingApproval = next;
  touch(session);
  return next;
}
