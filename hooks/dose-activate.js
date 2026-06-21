#!/usr/bin/env node
// Dose startup activation: logs current mode(s) to stderr.
const { getDefaultMode, normalizeMode } = require("./dose-config");
const { readModes } = require("./dose-mode-tracker");

let modes = readModes();

if (modes.length > 0) {
  console.error("Dose active — " + modes.join(", ") + " pill(s) popped. /dose-help for commands.");
} else {
  const mode = normalizeMode(getDefaultMode()) || "phantom";
  console.error("Dose ready — default: " + mode + ". Pop a pill with /dose <name>. /dose-help for commands.");
}
