#!/usr/bin/env node
// Dose startup activation: logs current mode to stderr.
const { getDefaultMode, normalizeMode } = require("./dose-config");

const mode = normalizeMode(getDefaultMode()) || "phantom";
console.error("Dose active — " + mode + " pill popped. /dose-help for commands.");
