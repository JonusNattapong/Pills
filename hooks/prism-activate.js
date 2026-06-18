#!/usr/bin/env node
// Prism startup activation: logs current mode to stderr.
const { getDefaultMode, normalizeMode } = require("./prism-config");

const mode = normalizeMode(getDefaultMode()) || "phantom";
console.error("Prism active — " + mode + " pill popped. /prism-help for commands.");
