# Prism Architecture

## Overview

Prism is a plugin/ruleset for AI coding agents that provides 5 themed "pills" —
each pill changes the agent's behavior and approach to coding tasks.

## Structure

```
prism/
├── package.json           # Pi agent package config
├── AGENTS.md              # Main ruleset (many agents read this automatically)
├── skills/                # Skill definitions (SKILL.md files)
│   └── prism/             # Core skill: 5 pill classes with ladders, rules
│   └── prism-review/      # Over-engineering review skill
│   └── prism-audit/       # Repo-wide bloat audit skill
│   └── prism-debt/        # Shortcut/debt ledger skill
│   └── prism-help/        # Reference card skill
├── hooks/                 # Lifecycle hooks for Claude Code / Codex
│   ├── hooks.json         # Hook registration
│   ├── prism-config.js    # Config read/write, default mode resolution
│   ├── prism-instructions.js # Instruction builder (mode-based filtering)
│   ├── prism-activate.js  # Session start activation
│   ├── prism-mode-tracker.js # Mode persistence between prompts
│   ├── prism-runtime.js   # Environment detection
│   └── prism-statusline.* # Terminal statusline helpers
├── pi-extension/          # Pi agent harness plugin
│   ├── index.js           # Command registration, mode switching
│   └── test/              # Plugin tests
├── .cursor/rules/         # Cursor rules
├── .windsurf/rules/       # Windsurf rules
├── .clinerules/           # Cline rules
├── .github/               # GitHub Copilot instructions + workflows
├── .kiro/steering/        # Kiro steering rules
├── .opencode/             # OpenCode commands + plugin
├── .openclaw/skills/      # OpenClaw skill packages
├── .claude-plugin/        # Claude Code plugin manifest
├── .codex-plugin/         # Codex plugin manifest
├── gemini-extension.json  # Gemini CLI extension
└── LICENSE                # MIT
```

## How pills work

1. User pops a pill (says "pop red" or `/prism titan`)
2. Pi extension or hook intercepts the input
3. Mode is persisted in session state and a temp file
4. On next agent invocation, the pill's instructions are injected into
   the system prompt
5. Agent follows the pill's ladder and rules for every response
6. User switches pills anytime — effect is instant

## The ladder pattern

Each pill defines a prioritized sequence of approaches ("ladder"). The agent
stops at the first rung that works. This is the key mechanism that produces
different behavior per pill — the same task gets different solutions depending
on which rung fires first.

## Platform support

Prism adapts to each agent's native mechanism:
- **Claude Code / Codex**: Full plugin with hooks + skills + commands
- **Pi**: Extension with command registration
- **OpenCode**: Plugin + commands
- **Gemini CLI**: Extension with commands
- **OpenClaw**: Skill packages
- **Cursor / Windsurf / Cline**: Static rules files (always-on, no commands)
- **GitHub Copilot**: Instruction file
- **Kiro**: Steering file
