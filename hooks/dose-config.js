#!/usr/bin/env node
// Dose config: default mode resolution and config file read/write.
// Supports built-in pills + custom pills from pills.json.

const fs = require("fs");
const path = require("path");

const BUILTIN_MODES = ["titan", "sage", "warden", "phantom", "void", "off"];
let _cachedCustomModes = null;

const DEFAULT_MODE = "phantom";
const CONFIG_FILENAME = "config.json";
const PILLS_FILENAME = "pills.json";
const CONFIG_DIR = process.platform === "win32"
  ? path.join(process.env.APPDATA || path.join(require("os").homedir(), "AppData", "Roaming"), "dose")
  : path.join(require("os").homedir(), ".config", "dose");

function getProjectRoot() {
  // Walk up from __dirname to find package.json with name "dose"
  let dir = path.dirname(__dirname); // hooks/ -> root
  return dir;
}

function getCustomModes() {
  if (_cachedCustomModes) return _cachedCustomModes;

  const pillsPath = path.join(getProjectRoot(), PILLS_FILENAME);
  const modes = [];

  try {
    if (fs.existsSync(pillsPath)) {
      const registry = JSON.parse(fs.readFileSync(pillsPath, "utf8"));
      if (registry.custom) {
        for (const [name, info] of Object.entries(registry.custom)) {
          if (info.disabled) continue; // skip disabled pills
          modes.push(name);
        }
      }
    }
  } catch {}

  _cachedCustomModes = modes;
  return modes;
}

function getAllValidModes() {
  return new Set([...BUILTIN_MODES, ...getCustomModes()]);
}

function normalizeMode(mode) {
  if (!mode || typeof mode !== "string") return null;
  const m = mode.trim().toLowerCase();
  return getAllValidModes().has(m) ? m : null;
}

function normalizePersistedMode(mode) {
  return normalizeMode(mode);
}

function normalizeConfigMode(mode) {
  return normalizeMode(mode);
}

function getDefaultMode() {
  const env = normalizeMode(process.env.PRISM_DEFAULT_MODE);
  if (env) return env;

  try {
    const configPath = path.join(CONFIG_DIR, CONFIG_FILENAME);
    if (fs.existsSync(configPath)) {
      const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const fileMode = normalizeMode(raw.defaultMode);
      if (fileMode) return fileMode;
    }
  } catch {}

  return DEFAULT_MODE;
}

function writeDefaultMode(mode) {
  const m = normalizeConfigMode(mode);
  if (!m) return null;

  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const configPath = path.join(CONFIG_DIR, CONFIG_FILENAME);
    let config = {};
    try { config = JSON.parse(fs.readFileSync(configPath, "utf8")); } catch {}
    config.defaultMode = m;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    return m;
  } catch {
    return null;
  }
}

function invalidateCustomModesCache() {
  _cachedCustomModes = null;
}

module.exports = {
  DEFAULT_MODE,
  BUILTIN_MODES,
  CONFIG_DIR,
  normalizeMode,
  normalizePersistedMode,
  normalizeConfigMode,
  getDefaultMode,
  writeDefaultMode,
  getCustomModes,
  getAllValidModes,
  invalidateCustomModesCache,
};
