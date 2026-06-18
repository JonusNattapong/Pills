const { describe, it } = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Mock CONFIG_DIR for testing
const CONFIG_DIR = path.join(os.tmpdir(), "dose-test-" + Date.now());

const {
  DEFAULT_MODE,
  normalizeMode,
  normalizePersistedMode,
  normalizeConfigMode,
} = require("../hooks/dose-config");

describe("normalizeMode", () => {
  it('returns "titan" for "titan"', () => {
    assert.strictEqual(normalizeMode("titan"), "titan");
  });

  it("returns null for invalid mode", () => {
    assert.strictEqual(normalizeMode("invalid"), null);
  });

  it("is case insensitive", () => {
    assert.strictEqual(normalizeMode("TITAN"), "titan");
    assert.strictEqual(normalizeMode("Sage"), "sage");
  });

  it("returns null for undefined", () => {
    assert.strictEqual(normalizeMode(undefined), null);
  });
});

describe("VALID_MODES", () => {
  it("includes all 5 pills plus off", () => {
    for (const mode of ["titan", "sage", "warden", "phantom", "void", "off"]) {
      assert.strictEqual(normalizeMode(mode), mode);
    }
  });
});
