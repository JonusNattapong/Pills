import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const {
  DEFAULT_MODE,
  getDefaultMode,
  normalizeMode,
  normalizeConfigMode,
  normalizePersistedMode,
  writeDefaultMode,
  getCustomModes,
  invalidateCustomModesCache,
} = require("../hooks/dose-config.js");
const { getDoseInstructions, filterSkillBodyForMode } = require("../hooks/dose-instructions.js");

export { filterSkillBodyForMode };
export const readDefaultMode = getDefaultMode;

// Dynamic pill loading
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function getAllPills() {
  return [...getCustomModes(), "titan", "sage", "warden", "phantom", "void"];
}

function getPillSymbols() {
  const symbols = { titan: "🔴", sage: "🔵", warden: "🟢", phantom: "🟡", void: "🟣" };
  const pillsPath = join(ROOT, "pills.json");
  try {
    if (existsSync(pillsPath)) {
      const registry = JSON.parse(readFileSync(pillsPath, "utf8"));
      if (registry.custom) {
        for (const [name, info] of Object.entries(registry.custom)) {
          symbols[name] = info.emoji || "🔵";
        }
      }
    }
  } catch {}
  return symbols;
}

const COLOR_MAP = {
  red: "titan", blue: "sage", green: "warden", yellow: "phantom", purple: "void",
};

// ── Multi-pill session resolution ───────────────────────────────────────────

export function resolveSessionModes(entries, ...fallbackModes) {
  const modes = new Set();
  for (const mode of fallbackModes) {
    const m = normalizePersistedMode(mode);
    if (m && m !== "off") modes.add(m);
  }
  if (!Array.isArray(entries)) return modes;

  for (const entry of entries) {
    if (entry?.type !== "custom" || entry?.customType !== "dose-mode") continue;
    const mode = normalizePersistedMode(entry?.data?.mode);
    const action = entry?.data?.action;
    if (!mode || mode === "off") continue;
    if (action === "remove") {
      modes.delete(mode);
    } else {
      modes.add(mode);
    }
  }

  return modes;
}

// Legacy: resolve single mode from entries (backward compat)
export function resolveSessionMode(entries, fallbackMode = DEFAULT_MODE) {
  const modes = resolveSessionModes(entries, fallbackMode);
  // Return the last-added mode, or fallback
  if (modes.size === 0) return normalizePersistedMode(fallbackMode) || DEFAULT_MODE;
  // Find the last one from entries
  if (Array.isArray(entries)) {
    for (let i = entries.length - 1; i >= 0; i -= 1) {
      const entry = entries[i];
      if (entry?.type !== "custom" || entry?.customType !== "dose-mode") continue;
      const mode = normalizePersistedMode(entry?.data?.mode);
      if (mode && modes.has(mode)) return mode;
    }
  }
  return [...modes][modes.size - 1];
}

/**
 * Parse a dose command string.
 *
 * Returns:
 *   { type: "status" }
 *   { type: "add-mode", mode }      — pop/activate a pill
 *   { type: "remove-mode", mode }   — pop off/deactivate a specific pill
 *   { type: "clear-all" }           — deactivate all pills
 *   { type: "set-default", mode }   — change default mode
 *   { type: "invalid", reason, pill? }
 */
export function parseDoseCommand(text, defaultMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(defaultMode) || DEFAULT_MODE;
  const normalizedText = String(text || "").trim().toLowerCase();

  if (!normalizedText || normalizedText === "status") {
    return { type: "status" };
  }

  if (normalizedText === "off") {
    return { type: "clear-all" };
  }

  if (normalizedText === "default") {
    return { type: "set-default", mode: fallback };
  }

  // "off <pill>" → remove specific pill
  const offMatch = normalizedText.match(/^off\s+(.+)/);
  if (offMatch) {
    const allPills = getAllPills();
    const raw = offMatch[1].trim();
    if (allPills.includes(raw)) {
      return { type: "remove-mode", mode: raw };
    }
    if (COLOR_MAP[raw]) {
      return { type: "remove-mode", mode: COLOR_MAP[raw] };
    }
    const mode = normalizeMode(raw);
    if (mode) return { type: "remove-mode", mode };
    return { type: "invalid", reason: "invalid-pill", pill: raw };
  }

  // "default <pill>" → set default
  if (normalizedText.startsWith("default ")) {
    const mode = normalizeConfigMode(normalizedText.slice(8).trim());
    return mode ? { type: "set-default", mode } : { type: "invalid", reason: "invalid-default-mode" };
  }

  // Check built-in + custom pills → add-mode
  const allPills = getAllPills();
  if (allPills.includes(normalizedText)) {
    return { type: "add-mode", mode: normalizedText };
  }

  // Check color aliases
  if (COLOR_MAP[normalizedText]) {
    return { type: "add-mode", mode: COLOR_MAP[normalizedText] };
  }

  const mode = normalizeMode(normalizedText);
  return mode ? { type: "add-mode", mode } : { type: "invalid", reason: "invalid-pill", pill: normalizedText };
}

export { writeDefaultMode };

export default function doseExtension(pi) {
  let activeModes = new Set();
  let configuredDefaultMode = getDefaultMode();
  let pillSymbols = getPillSymbols();

  const refreshSymbols = () => { pillSymbols = getPillSymbols(); };

  const activateMode = (mode, ctx) => {
    const normalized = normalizePersistedMode(mode);
    if (!normalized) return;
    if (activeModes.has(normalized)) {
      ctx?.ui?.notify?.(`${pillSymbols[normalized] || ""} ${normalized} already active.`, "info");
      return;
    }
    activeModes.add(normalized);
    pi.appendEntry("dose-mode", { mode: normalized, action: "add" });
    const symbol = pillSymbols[normalized] || "";
    ctx?.ui?.notify?.(`${symbol} Dose: ${normalized} pill popped.`, "info");
  };

  const deactivateMode = (mode, ctx) => {
    const normalized = normalizePersistedMode(mode);
    if (!normalized || !activeModes.has(normalized)) {
      ctx?.ui?.notify?.(`Dose: ${mode} is not active.`, "info");
      return;
    }
    activeModes.delete(normalized);
    pi.appendEntry("dose-mode", { mode: normalized, action: "remove" });
    ctx?.ui?.notify?.(`Dose: ${normalized} pill removed.`, "info");
  };

  const deactivateAll = (ctx) => {
    if (activeModes.size === 0) {
      ctx?.ui?.notify?.("No Dose pills active.", "info");
      return;
    }
    activeModes.clear();
    ctx?.ui?.notify?.("Dose: all pills deactivated. Normal mode.", "info");
  };

  const sendAlias = (skillName, args, ctx) => {
    const normalized = String(args || "").trim();
    const message = normalized ? `${skillName} ${normalized}` : skillName;

    if (ctx?.isIdle?.() === false) {
      pi.sendUserMessage(message, { deliverAs: "followUp" });
      ctx?.ui?.notify?.(`${skillName} queued as follow-up.`, "info");
      return;
    }

    pi.sendUserMessage(message);
  };

  pi.registerCommand("dose", {
    description: "Pop Dose pills. /dose <pill> to add, /dose off <pill> to remove, /dose for status.",
    handler: async (args, ctx) => {
      const parsed = parseDoseCommand(args, configuredDefaultMode);

      if (parsed.type === "status") {
        if (activeModes.size === 0) {
          ctx?.ui?.notify?.("No Dose pills active. Pop one: /dose <pill>", "info");
          return;
        }
        const modeList = Array.from(activeModes)
          .map(m => `${pillSymbols[m] || ""} ${m}`)
          .join(", ");
        ctx?.ui?.notify?.("Active: " + modeList, "info");
        return;
      }

      if (parsed.type === "set-default") {
        const written = writeDefaultMode(parsed.mode);
        if (written) {
          configuredDefaultMode = getDefaultMode();
          const message = configuredDefaultMode === written
            ? `Default Dose pill set to ${written}.`
            : `Saved default ${written}, but env override keeps default at ${configuredDefaultMode}.`;
          ctx?.ui?.notify?.(message, "info");
        }
        return;
      }

      if (parsed.type === "add-mode") {
        activateMode(parsed.mode, ctx);
        return;
      }

      if (parsed.type === "remove-mode") {
        deactivateMode(parsed.mode, ctx);
        return;
      }

      if (parsed.type === "clear-all") {
        deactivateAll(ctx);
        return;
      }

      ctx?.ui?.notify?.("Unknown pill. Try: titan, sage, warden, phantom, void, or a custom pill name.", "warning");
    },
  });

  pi.registerCommand("dose-review", {
    description: "Run /skill:dose-review",
    handler: (_args, ctx) => sendAlias("/skill:dose-review", "", ctx),
  });

  pi.registerCommand("dose-audit", {
    description: "Run /skill:dose-audit",
    handler: (_args, ctx) => sendAlias("/skill:dose-audit", "", ctx),
  });

  pi.registerCommand("dose-debt", {
    description: "Run /skill:dose-debt",
    handler: (_args, ctx) => sendAlias("/skill:dose-debt", "", ctx),
  });

  pi.registerCommand("dose-help", {
    description: "Run /skill:dose-help",
    handler: (_args, ctx) => sendAlias("/skill:dose-help", "", ctx),
  });

  pi.registerCommand("dose-create", {
    description: "Create a custom Dose pill",
    handler: (_args, ctx) => sendAlias("/skill:dose-create", _args, ctx),
  });

  pi.registerCommand("dose-manage", {
    description: "Manage custom pills — edit, delete, disable, enable, list",
    handler: (_args, ctx) => sendAlias("/skill:dose-manage", _args, ctx),
  });

  pi.on("input", async (event) => {
    if (event?.source === "extension") return;
    refreshSymbols();

    const text = String(event?.text || "");

    // "normal mode" / "stop dose" → deactivate all
    if (activeModes.size > 0 && /\b(normal mode|stop dose)\b/i.test(text)) {
      deactivateAll(event);
    }

    // "/dose off <pill>" → remove specific pill
    const doseOffMatch = text.match(/^\/dose\s+off\s+(\S+)/i);
    if (doseOffMatch) {
      const pill = doseOffMatch[1].toLowerCase();
      const normalized = normalizeMode(pill);
      if (normalized) { deactivateMode(normalized, event); return; }
      const colorMapped = COLOR_MAP[pill];
      if (colorMapped) { deactivateMode(colorMapped, event); return; }
    }

    // "/dose <name>" → add pill
    const doseCmd = text.match(/^\/dose\s+(\S+)/i);
    if (doseCmd) {
      const pill = doseCmd[1].toLowerCase();
      if (pill === "off") { deactivateAll(event); return; }
      const normalized = normalizeMode(pill);
      if (normalized) { activateMode(normalized, event); return; }
      const colorMapped = COLOR_MAP[pill];
      if (colorMapped) { activateMode(colorMapped, event); return; }
    }

    // "pop off <name>" / "pop off the <name> pill" → remove
    const popOffMatch = text.match(/\bpop\s+off\s+(?:the\s+)?([a-z-]+)\b/i);
    if (popOffMatch) {
      const pill = popOffMatch[1].toLowerCase();
      const normalized = normalizeMode(pill);
      if (normalized) { deactivateMode(normalized, event); return; }
      const colorMapped = COLOR_MAP[pill];
      if (colorMapped) { deactivateMode(colorMapped, event); return; }
    }

    // "pop <name>" / "pop the <name> pill" → add
    const popMatch = text.match(/\bpop\s+(?:the\s+)?([a-z-]+)\b/i);
    if (popMatch) {
      const pill = popMatch[1].toLowerCase();
      const normalized = normalizeMode(pill);
      if (normalized) { activateMode(normalized, event); return; }
      const colorMapped = COLOR_MAP[pill];
      if (colorMapped) { activateMode(colorMapped, event); return; }
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx?.sessionManager?.getBranch?.() || ctx?.sessionManager?.getEntries?.() || [];
    configuredDefaultMode = getDefaultMode();
    activeModes = resolveSessionModes(entries, configuredDefaultMode);
  });

  pi.on("before_agent_start", async (event) => {
    if (activeModes.size === 0) return;

    const parts = [];
    for (const mode of activeModes) {
      parts.push(getDoseInstructions(mode));
    }

    return {
      systemPrompt: `${event.systemPrompt}\n\nDOSE ACTIVE — pills: ${Array.from(activeModes).join(", ")}\n\n${parts.join("\n\n---\n\n")}`,
    };
  });
}
