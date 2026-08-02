import { v4 as uuid } from "uuid";
import type { Session } from "./types.js";

const sessions = new Map<string, Session>();

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
}

export function deleteSession(id: string): boolean {
  return sessions.delete(id);
}
