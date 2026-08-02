import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { summarizeHistory } from "./summarize.js";
import type { ChatMessage } from "./types.js";

describe("summarizeHistory", () => {
  it("returns messages unchanged when under the limit", () => {
    const msgs: ChatMessage[] = [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ];
    assert.equal(summarizeHistory(msgs).length, 2);
  });

  it("compresses older turns and keeps recent ones", () => {
    const msgs: ChatMessage[] = [];
    for (let i = 0; i < 50; i++) {
      msgs.push({ role: "user", content: `u${i}` });
      msgs.push({ role: "assistant", content: `a${i}` });
    }
    const out = summarizeHistory(msgs, { maxMessages: 20, keepRecent: 6 });
    assert.ok(out.length < msgs.length);
    assert.ok(out[0]?.content?.includes("Conversation summary"));
    assert.equal(out[out.length - 1]?.content, "a49");
  });
});
