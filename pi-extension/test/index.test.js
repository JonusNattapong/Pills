import { describe, it } from "node:test";
import assert from "node:assert";
import { parsePrismCommand, resolveSessionMode } from "../index.js";

describe("parsePrismCommand", () => {
  it('parses "titan" as set-mode titan', () => {
    assert.deepStrictEqual(parsePrismCommand("titan"), { type: "set-mode", mode: "titan" });
  });

  it('parses "sage" as set-mode sage', () => {
    assert.deepStrictEqual(parsePrismCommand("sage"), { type: "set-mode", mode: "sage" });
  });

  it('parses "warden" as set-mode warden', () => {
    assert.deepStrictEqual(parsePrismCommand("warden"), { type: "set-mode", mode: "warden" });
  });

  it('parses "phantom" as set-mode phantom', () => {
    assert.deepStrictEqual(parsePrismCommand("phantom"), { type: "set-mode", mode: "phantom" });
  });

  it('parses "void" as set-mode void', () => {
    assert.deepStrictEqual(parsePrismCommand("void"), { type: "set-mode", mode: "void" });
  });

  it('parses "off" as set-mode off', () => {
    assert.deepStrictEqual(parsePrismCommand("off"), { type: "set-mode", mode: "off" });
  });

  it('parses empty string as "status"', () => {
    assert.deepStrictEqual(parsePrismCommand(""), { type: "status" });
  });

  it('parses "status" as status', () => {
    assert.deepStrictEqual(parsePrismCommand("status"), { type: "status" });
  });

  it("rejects invalid pill", () => {
    const result = parsePrismCommand("invalid");
    assert.strictEqual(result.type, "invalid");
  });

  it('parses "default titan" as set-default', () => {
    assert.deepStrictEqual(parsePrismCommand("default titan"), { type: "set-default", mode: "titan" });
  });
});

describe("resolveSessionMode", () => {
  it("returns fallback with empty entries", () => {
    assert.strictEqual(resolveSessionMode([], "phantom"), "phantom");
  });

  it("ignores non-prism entries", () => {
    const entries = [{ type: "custom", customType: "other", data: { mode: "titan" } }];
    assert.strictEqual(resolveSessionMode(entries, "phantom"), "phantom");
  });

  it("picks last prism-mode entry", () => {
    const entries = [
      { type: "custom", customType: "prism-mode", data: { mode: "sage" } },
      { type: "custom", customType: "prism-mode", data: { mode: "void" } },
    ];
    assert.strictEqual(resolveSessionMode(entries, "phantom"), "void");
  });
});
