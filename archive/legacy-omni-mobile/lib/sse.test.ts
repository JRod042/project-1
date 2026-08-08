import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SseParser } from "./sse";
import type { StreamEvent } from "../types";

describe("SseParser", () => {
  it("parses event + data frames across chunks", () => {
    const parser = new SseParser();
    const events: StreamEvent[] = [];
    const onEvent = (e: StreamEvent) => events.push(e);

    parser.push('event: text\ndata: {"type":"text","text":"Hel', onEvent);
    parser.push('lo"}\n\n', onEvent);
    parser.push(
      'event: done\ndata: {"type":"done","sessionId":"abc"}\n\n',
      onEvent
    );

    assert.equal(events.length, 2);
    assert.equal(events[0]?.type, "text");
    if (events[0]?.type === "text") assert.equal(events[0].text, "Hello");
    assert.equal(events[1]?.type, "done");
  });

  it("handles multi-line data and CRLF", () => {
    const parser = new SseParser();
    const events: StreamEvent[] = [];
    parser.push(
      'data: {"type":"status","status":"ok"}\r\n\r\n',
      (e) => events.push(e)
    );
    assert.equal(events[0]?.type, "status");
  });
});
