#!/usr/bin/env node
// Dose mode tracker: persists modes between prompts.
// Stores all active modes (comma-separated) in a temp file for statusline reading.
const fs = require("fs");
const path = require("path");
const os = require("os");

const TRACKER_FILE = path.join(os.tmpdir(), "dose-mode.txt");

function readModes() {
  try {
    if (fs.existsSync(TRACKER_FILE)) {
      const raw = fs.readFileSync(TRACKER_FILE, "utf8").trim();
      if (!raw) return [];
      return raw.split(",").map(s => s.trim()).filter(Boolean);
    }
  } catch {}
  return [];
}

function writeModes(modes) {
  try {
    if (!Array.isArray(modes) || modes.length === 0) {
      fs.writeFileSync(TRACKER_FILE, "", "utf8");
      return;
    }
    fs.writeFileSync(TRACKER_FILE, modes.join(","), "utf8");
  } catch {}
}

// Backward compat: single mode read/write
function readMode() {
  const modes = readModes();
  return modes.length > 0 ? modes[0] : null;
}

function writeMode(mode) {
  const modes = mode ? [mode] : [];
  writeModes(modes);
}

// If invoked with argument(s), write them
const args = process.argv.slice(2);
if (args.length > 0) {
  const modes = args.filter(Boolean).map(s => s.trim().toLowerCase());
  writeModes(modes);
}

module.exports = { readMode, readModes, writeMode, writeModes };
