#!/usr/bin/env node
// Build OpenClaw skill packages from skills/ directory.
// Reads skills/<name>/SKILL.md and copies to .openclaw/skills/<name>/SKILL.md

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const OPENCLAW_DIR = path.join(ROOT, ".openclaw", "skills");

const SKILL_NAMES = ["prism", "prism-review", "prism-audit", "prism-debt", "prism-help"];

for (const name of SKILL_NAMES) {
  const src = path.join(SKILLS_DIR, name, "SKILL.md");
  const dest = path.join(OPENCLAW_DIR, name, "SKILL.md");

  if (!fs.existsSync(src)) {
    console.error(`MISSING: ${src}`);
    continue;
  }

  let content = fs.readFileSync(src, "utf8");

  // Strip Pi-specific frontmatter that OpenClaw doesn't need
  content = content.replace(/^---[\s\S]*?---\s*/, "");

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content.trim() + "\n");
  console.log(`Built: .openclaw/skills/${name}/SKILL.md`);
}
