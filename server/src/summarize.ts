import type { ChatMessage } from "./types.js";

const DEFAULT_KEEP_RECENT = 16;
const DEFAULT_MAX_MESSAGES = 40;

function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function flattenForSummary(messages: ChatMessage[]): string {
  return messages
    .map((m) => {
      const tools = m.tool_calls?.length
        ? ` tools=${m.tool_calls.map((t) => t.name).join(",")}`
        : "";
      const name = m.name ? `:${m.name}` : "";
      const body = (m.content || "").replace(/\s+/g, " ").trim().slice(0, 400);
      return `[${m.role}${name}${tools}] ${body}`;
    })
    .join("\n");
}

/**
 * Collapse older turns into a single summary message so long sessions stay in budget.
 * Keeps the latest `keepRecent` messages verbatim.
 */
export function summarizeHistory(
  messages: ChatMessage[],
  opts?: { maxMessages?: number; keepRecent?: number }
): ChatMessage[] {
  const maxMessages = opts?.maxMessages ?? DEFAULT_MAX_MESSAGES;
  const keepRecent = opts?.keepRecent ?? DEFAULT_KEEP_RECENT;

  if (messages.length <= maxMessages) return messages;

  const recent = messages.slice(-keepRecent);
  const older = messages.slice(0, -keepRecent);

  // Avoid cutting in the middle of an assistant→tool chain: drop leading tool msgs from recent
  while (recent.length && recent[0]?.role === "tool") {
    older.push(recent.shift()!);
  }

  const summaryText = [
    "Conversation summary (earlier turns compressed):",
    flattenForSummary(older).slice(0, 6_000),
    `(~${approxTokens(flattenForSummary(older))} tokens of history folded)`,
  ].join("\n");

  return [
    {
      role: "user",
      content: summaryText,
    },
    {
      role: "assistant",
      content: "Understood — continuing from the summary above.",
    },
    ...recent,
  ];
}
