import type { StreamEvent } from "../types";

/**
 * Robust SSE frame parser for React Native XHR streaming.
 * Handles: event: lines, multi-line data:, comments, CRLF, partial frames.
 */
export class SseParser {
  private buffer = "";
  private eventName = "";
  private dataLines: string[] = [];

  push(chunk: string, onEvent: (event: StreamEvent) => void) {
    this.buffer += chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    while (true) {
      const idx = this.buffer.indexOf("\n\n");
      if (idx === -1) break;
      const frame = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + 2);
      this.dispatchFrame(frame, onEvent);
    }
  }

  flush(onEvent: (event: StreamEvent) => void) {
    if (this.buffer.trim()) {
      this.dispatchFrame(this.buffer, onEvent);
      this.buffer = "";
    }
  }

  private dispatchFrame(frame: string, onEvent: (event: StreamEvent) => void) {
    this.eventName = "";
    this.dataLines = [];

    for (const rawLine of frame.split("\n")) {
      const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
      if (!line || line.startsWith(":")) continue;

      if (line.startsWith("event:")) {
        this.eventName = line.slice(6).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        // Spec: optional single space after colon
        let value = line.slice(5);
        if (value.startsWith(" ")) value = value.slice(1);
        this.dataLines.push(value);
        continue;
      }
      // Ignore id:/retry: and unknown fields
    }

    if (!this.dataLines.length) return;
    const data = this.dataLines.join("\n");
    try {
      const parsed = JSON.parse(data) as StreamEvent;
      // Prefer payload.type; fall back to SSE event name if missing
      if (!parsed?.type && this.eventName) {
        (parsed as { type: string }).type = this.eventName;
      }
      if (parsed?.type) onEvent(parsed);
    } catch {
      // ignore malformed JSON frames
    }
  }
}
