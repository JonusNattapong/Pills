// Dose OpenCode plugin — loads hooks and registers commands.
// Finds hooks/ relative to this plugin file.
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

export default {
  name: "dose",
  description: "5 colored pills for AI agents. Pop a pill, gain a power.",
  hooks: {
    sessionStart: async () => {
      try {
        const activate = join(ROOT, "hooks", "dose-activate.js");
        const { execSync } = await import("child_process");
        execSync(`node "${activate}"`, { stdio: "inherit" });
      } catch {}
    },
    beforePrompt: async (context) => {
      try {
        const { getDoseInstructions } = await import(join(ROOT, "hooks", "dose-instructions.js"));
        const { getDefaultMode } = await import(join(ROOT, "hooks", "dose-config.js"));
        const mode = getDefaultMode();
        const instructions = getDoseInstructions(mode);
        return instructions ? { systemPrompt: instructions } : undefined;
      } catch {
        return undefined;
      }
    },
  },
  commands: {
    dose: {
      description: "Pop a Dose pill (titan|sage|warden|phantom|void)",
      handler: async (args) => {
        const { parseDoseCommand } = await import(join(ROOT, "pi-extension", "index.js"));
        return parseDoseCommand(args);
      },
    },
  },
};
