#!/usr/bin/env node
// Shared Dose instruction builder for Claude hooks and Pi extension.

const fs = require("fs");
const path = require("path");
const { DEFAULT_MODE, normalizeMode, normalizePersistedMode } = require("./dose-config");

const INDEPENDENT_MODES = new Set(["review"]);
const SKILL_PATH = path.join(__dirname, "..", "skills", "dose", "SKILL.md");

function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || "").replace(/^---[\s\S]*?---\s*/, "");

  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      return true;
    })
    .join("\n");
}

function getFallbackInstructions(mode) {
  const modeName = mode || DEFAULT_MODE;
  return "DOSE ACTIVE — pill: " + modeName + "\n\n" +
    "You have popped the **" + modeName + "** pill. Follow its ladder and rules.\n\n" +
    "## Persistence\n\n" +
    "ACTIVE EVERY RESPONSE. No drift back. Off only: \"normal mode\".\n" +
    "Switch: `/dose titan|sage|warden|phantom|void`.\n\n" +
    "## The ladder\n\n" +
    "Stop at the first rung that holds:\n" +
    "1. Does this need to exist? (YAGNI)\n" +
    "2. Does the standard library do this? Use it.\n" +
    "3. Does a native platform feature cover it? Use it.\n" +
    "4. Pill-specific rung (see " + modeName + " rules).\n" +
    "5. Only then: the minimum code that works for this pill.\n\n" +
    "## Rules\n\n" +
    "No unrequested abstractions. No avoidable dependencies. No boilerplate. " +
    "Deletion over addition. Boring over clever. " +
    "Mark intentional shortcuts with `dose:` comment — name the ceiling and upgrade path.\n\n" +
    "## When NOT to follow the pill\n\n" +
    "Never skip: input validation at trust boundaries, error handling that prevents data loss, " +
    "security measures, accessibility, anything the user explicitly asked to keep. " +
    "Non-trivial logic leaves ONE runnable check behind.\n\n" +
    "\"normal mode\": revert.";
}

function getDoseInstructions(mode) {
  const configuredMode = normalizePersistedMode(mode) || DEFAULT_MODE;

  if (INDEPENDENT_MODES.has(configuredMode)) {
    return "DOSE ACTIVE — pill: " + configuredMode + ". Behavior defined by /dose-" + configuredMode + " skill.";
  }

  const effectiveMode = normalizeMode(configuredMode) || DEFAULT_MODE;

  try {
    return "DOSE ACTIVE — pill: " + effectiveMode + "\n\n" +
      filterSkillBodyForMode(fs.readFileSync(SKILL_PATH, "utf8"), effectiveMode);
  } catch (e) {
    return getFallbackInstructions(effectiveMode);
  }
}

module.exports = {
  filterSkillBodyForMode,
  getFallbackInstructions,
  getDoseInstructions,
};
