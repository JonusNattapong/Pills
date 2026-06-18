#!/usr/bin/env node
// Dose runtime detection: checks whether node is available.
const { getDefaultMode } = require("./dose-config");

function isNodeAvailable() {
  try {
    return !!process.versions.node;
  } catch {
    return false;
  }
}

function getRuntimeInfo() {
  return {
    node: isNodeAvailable(),
    version: process.versions?.node || "unknown",
    platform: process.platform,
    defaultMode: getDefaultMode(),
  };
}

if (require.main === module) {
  const info = getRuntimeInfo();
  console.error(JSON.stringify(info));
}

module.exports = { isNodeAvailable, getRuntimeInfo };
