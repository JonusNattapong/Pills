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
} = require("../hooks/prism-config.js");
const { getPrismInstructions, filterSkillBodyForMode } = require("../hooks/prism-instructions.js");

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

export function resolveSessionMode(entries, fallbackMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(fallbackMode) || DEFAULT_MODE;
  if (!Array.isArray(entries)) return fallback;

  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (entry?.type !== "custom" || entry?.customType !== "prism-mode") continue;

    const mode = normalizePersistedMode(entry?.data?.mode);
    if (mode) return mode;
  }

  return fallback;
}

export function parsePrismCommand(text, defaultMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(defaultMode) || DEFAULT_MODE;
  const normalizedText = String(text || "").trim().toLowerCase();

  if (!normalizedText || normalizedText === "status") {
    return { type: "status" };
  }

  if (normalizedText === "off") {
    return { type: "set-mode", mode: "off" };
  }

  if (normalizedText === "default") {
    return { type: "set-default", mode: fallback };
  }

  // Check built-in + custom pills
  const allPills = getAllPills();
  if (allPills.includes(normalizedText)) {
    return { type: "set-mode", mode: normalizedText };
  }

  // Check color aliases
  if (COLOR_MAP[normalizedText]) {
    return { type: "set-mode", mode: COLOR_MAP[normalizedText] };
  }

  if (normalizedText.startsWith("default ")) {
    const mode = normalizeConfigMode(normalizedText.slice(8).trim());
    return mode ? { type: "set-default", mode } : { type: "invalid", reason: "invalid-default-mode" };
  }

  const mode = normalizeMode(normalizedText);
  return mode ? { type: "set-mode", mode } : { type: "invalid", reason: "invalid-pill", pill: normalizedText };
}

export { writeDefaultMode };

export default function prismExtension(pi) {
  let currentMode = DEFAULT_MODE;
  let configuredDefaultMode = getDefaultMode();
  let pillSymbols = getPillSymbols();

  const refreshSymbols = () => { pillSymbols = getPillSymbols(); };

  const setMode = (mode, ctx) => {
    const normalized = normalizePersistedMode(mode);
    if (!normalized) return;

    currentMode = normalized;
    pi.appendEntry("prism-mode", { mode: normalized });
    const symbol = pillSymbols[normalized] || "";
    ctx?.ui?.notify?.(`${symbol} Prism: ${normalized} pill popped.`, "info");
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

  pi.registerCommand("prism", {
    description: "Pop a Prism pill (titan|sage|warden|phantom|void|custom) or get status",
    handler: async (args, ctx) => {
      const parsed = parsePrismCommand(args, configuredDefaultMode);

      if (parsed.type === "status") {
        const symbol = pillSymbols[currentMode] || "";
        ctx?.ui?.notify?.(`${symbol} Prism: ${currentMode} pill active • default ${configuredDefaultMode}`, "info");
        return;
      }

      if (parsed.type === "set-default") {
        const written = writeDefaultMode(parsed.mode);
        if (written) {
          configuredDefaultMode = getDefaultMode();
          const message = configuredDefaultMode === written
            ? `Default Prism pill set to ${written}.`
            : `Saved default ${written}, but env override keeps default at ${configuredDefaultMode}.`;
          ctx?.ui?.notify?.(message, "info");
        }
        return;
      }

      if (parsed.type === "set-mode") {
        setMode(parsed.mode, ctx);
        return;
      }

      ctx?.ui?.notify?.("Unknown pill. Try: titan, sage, warden, phantom, void, or a custom pill name.", "warning");
    },
  });

  pi.registerCommand("prism-review", {
    description: "Run /skill:prism-review",
    handler: (_args, ctx) => sendAlias("/skill:prism-review", "", ctx),
  });

  pi.registerCommand("prism-audit", {
    description: "Run /skill:prism-audit",
    handler: (_args, ctx) => sendAlias("/skill:prism-audit", "", ctx),
  });

  pi.registerCommand("prism-debt", {
    description: "Run /skill:prism-debt",
    handler: (_args, ctx) => sendAlias("/skill:prism-debt", "", ctx),
  });

  pi.registerCommand("prism-help", {
    description: "Run /skill:prism-help",
    handler: (_args, ctx) => sendAlias("/skill:prism-help", "", ctx),
  });

  pi.registerCommand("prism-create", {
    description: "Create a custom Prism pill",
    handler: (_args, ctx) => sendAlias("/skill:prism-create", _args, ctx),
  });

  pi.registerCommand("prism-manage", {
    description: "Manage custom pills — edit, delete, disable, enable, list",
    handler: (_args, ctx) => sendAlias("/skill:prism-manage", _args, ctx),
  });

  pi.on("input", async (event) => {
    if (event?.source === "extension") return;
    refreshSymbols();

    const text = String(event?.text || "");

    // "normal mode" / "stop prism"
    if (currentMode !== "off" && /\b(normal mode|stop prism)\b/i.test(text)) {
      setMode("off");
    }

    // Detect "/prism <name>" where name is any valid pill (including custom)
    const prismCmd = text.match(/^\/prism\s+(\S+)/i);
    if (prismCmd) {
      const pill = prismCmd[1].toLowerCase();
      if (pill === "off") { setMode("off", event); return; }
      const normalized = normalizeMode(pill) || COLOR_MAP[pill];
      if (normalized) { setMode(normalized, event); return; }
    }

    // Detect "pop <name>" / "pop the <name> pill"
    const popMatch = text.match(/\bpop\s+(?:the\s+)?([a-z-]+)\b/i);
    if (popMatch) {
      const pill = popMatch[1].toLowerCase();
      const normalized = normalizeMode(pill) || COLOR_MAP[pill];
      if (normalized && normalized !== currentMode) {
        setMode(normalized, event);
      }
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx?.sessionManager?.getBranch?.() || ctx?.sessionManager?.getEntries?.() || [];
    configuredDefaultMode = getDefaultMode();
    currentMode = resolveSessionMode(entries, configuredDefaultMode);
  });

  pi.on("before_agent_start", async (event) => {
    if (!currentMode || currentMode === "off") return;
    return { systemPrompt: `${event.systemPrompt}\n\n${getPrismInstructions(currentMode)}` };
  });
}
