import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyLatency, initialUplink } from "./uplink";
import type { AppSettings } from "../types";

const baseSettings = (): AppSettings => ({
  runtimeMode: "openclaw",
  serverUrl: "http://192.168.1.10:8787",
  openclawUrl: "http://192.168.1.10:18789",
  openclawToken: "",
  provider: "xai",
  model: "grok-4.5",
  apiKey: "",
  serverToken: "",
  autoApprove: false,
});

describe("uplink classifyLatency", () => {
  it("marks failed probes offline", () => {
    assert.equal(classifyLatency(120, false), "offline");
  });

  it("marks fast probes online", () => {
    assert.equal(classifyLatency(80, true), "online");
  });

  it("marks slow probes when over threshold", () => {
    assert.equal(classifyLatency(1200, true), "slow");
  });
});

describe("uplink initialUplink", () => {
  it("flags missing openclaw URL", () => {
    const s = baseSettings();
    s.openclawUrl = "";
    const snap = initialUplink(s);
    assert.equal(snap.level, "unset");
  });

  it("flags loopback targets before probing", () => {
    const s = baseSettings();
    s.openclawUrl = "http://127.0.0.1:18789";
    const snap = initialUplink(s);
    assert.equal(snap.level, "loopback");
    assert.match(snap.detail, /LAN/i);
  });

  it("starts probing for LAN targets", () => {
    const snap = initialUplink(baseSettings());
    assert.equal(snap.level, "probing");
  });
});
