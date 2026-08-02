import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  controlUiUrl,
  maskTokenHint,
  normalizeOpenclawBaseUrl,
} from "./openclaw";

describe("openclaw control UI helpers", () => {
  it("normalizes trailing slashes", () => {
    assert.equal(
      normalizeOpenclawBaseUrl(" http://192.168.1.20:18789/ "),
      "http://192.168.1.20:18789"
    );
  });

  it("appends encoded #token= when token present (no slash before hash)", () => {
    assert.equal(
      controlUiUrl("http://192.168.1.20:18789", "abc/def=+"),
      "http://192.168.1.20:18789#token=abc%2Fdef%3D%2B"
    );
  });

  it("opens bare base when token empty", () => {
    assert.equal(
      controlUiUrl("http://192.168.1.20:18789/", "  "),
      "http://192.168.1.20:18789"
    );
  });

  it("masks token without revealing full secret", () => {
    const hint = maskTokenHint("supersecrettokenvalue");
    assert.match(hint, /chars/);
    assert.equal(hint.includes("supersecrettokenvalue"), false);
  });
});
