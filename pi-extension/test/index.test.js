import { describe, it } from "node:test";
import assert from "node:assert";
import { parseDoseCommand, resolveSessionMode } from "../index.js";

describe("parseDoseCommand", () => {
  it('parses "titan" as set-mode titan', () => {
    assert.deepStrictEqual(parseDoseCommand("titan"), { type: "set-mode", mode: "titan" });
  });

  it('parses "sage" as set-mode sage', () => {
    assert.deepStrictEqual(parseDoseCommand("sage"), { type: "set-mode", mode: "sage" });
  });

  it('parses "warden" as set-mode warden', () => {
    assert.deepStrictEqual(parseDoseCommand("warden"), { type: "set-mode", mode: "warden" });
  });

  it('parses "phantom" as set-mode phantom', () => {
    assert.deepStrictEqual(parseDoseCommand("phantom"), { type: "set-mode", mode: "phantom" });
  });

  it('parses "void" as set-mode void', () => {
    assert.deepStrictEqual(parseDoseCommand("void"), { type: "set-mode", mode: "void" });
  });

  it('parses "off" as set-mode off', () => {
    assert.deepStrictEqual(parseDoseCommand("off"), { type: "set-mode", mode: "off" });
  });

  it('parses empty string as "status"', () => {
    assert.deepStrictEqual(parseDoseCommand(""), { type: "status" });
  });

  it('parses "status" as status', () => {
    assert.deepStrictEqual(parseDoseCommand("status"), { type: "status" });
  });

  it("rejects invalid pill", () => {
    const result = parseDoseCommand("invalid");
    assert.strictEqual(result.type, "invalid");
  });

  it('parses "default titan" as set-default', () => {
    assert.deepStrictEqual(parseDoseCommand("default titan"), { type: "set-default", mode: "titan" });
  });
});

describe("resolveSessionMode", () => {
  it("returns fallback with empty entries", () => {
    assert.strictEqual(resolveSessionMode([], "phantom"), "phantom");
  });

  it("ignores non-dose entries", () => {
    const entries = [{ type: "custom", customType: "other", data: { mode: "titan" } }];
    assert.strictEqual(resolveSessionMode(entries, "phantom"), "phantom");
  });

  it("picks last dose-mode entry", () => {
    const entries = [
      { type: "custom", customType: "dose-mode", data: { mode: "sage" } },
      { type: "custom", customType: "dose-mode", data: { mode: "void" } },
    ];
    assert.strictEqual(resolveSessionMode(entries, "phantom"), "void");
  });
});
