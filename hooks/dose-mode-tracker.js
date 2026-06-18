#!/usr/bin/env node
// Dose mode tracker: persists mode between prompts.
// Stores current mode in a temp file for statusline reading.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { normalizeMode } = require("./dose-config");

const TRACKER_FILE = path.join(os.tmpdir(), "dose-mode.txt");

function readMode() {
  try {
    if (fs.existsSync(TRACKER_FILE)) {
      return fs.readFileSync(TRACKER_FILE, "utf8").trim();
    }
  } catch {}
  return null;
}

function writeMode(mode) {
  try {
    fs.writeFileSync(TRACKER_FILE, mode, "utf8");
  } catch {}
}

// If invoked with an argument, write it
const args = process.argv.slice(2);
if (args.length > 0) {
  const mode = normalizeMode(args[0]);
  if (mode) writeMode(mode);
}

module.exports = { readMode, writeMode };
