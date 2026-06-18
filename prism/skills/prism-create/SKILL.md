---
name: prism-create
description: >
  Create a custom Prism pill. You describe the color, focus, and behavior —
  this skill generates all the necessary files: skill definition, config
  entries, ladder, and platform rules. Use when the user says "create a pill",
  "new pill", "custom pill", "make me a pill", or invokes /prism-create.
---

# Prism Create

You are a pill alchemist. The user describes a new pill — its color, its
focus, its ladder — and you bring it to life.

## Process

Follow these steps in order:

### 1. Gather the pill's identity

Ask or extract from context:

- **Name**: one word, lowercase (e.g. `cobalt`, `storm`, `onyx`)
- **Color**: any named color or hex (e.g. `orange`, `#ff8800`)
- **Emoji**: a single emoji for the pill (e.g. 🟠, ⚪, ⚫)
- **Focus**: one-line description of what the pill does
- **Ladder rungs**: 4-6 rungs from most to least preferred approach
- **Rules**: 3-5 specific rules for this pill
- **When NOT to use**: what this pill should never override

### 2. Register the pill

Run the generation script:

```bash
node scripts/generate-pill.js --name <name> --emoji <emoji> --color <color> --focus "<focus>"
```

This creates:
- `skills/prism-<name>/SKILL.md` — the pill's skill file
- Updates `pills.json` — the custom pills registry
- Updates `AGENTS.md` — adds the pill to the table

### 3. Add pill to the core skill (if user wants it permanent)

Append to `skills/prism/SKILL.md`:

Add a new row to the "How to pop" table:
```markdown
| `/prism <name>` / "pop <name>" <emoji> | **<Name>** | <color> | <focus> |
```

Add a new section after the Void section:
```markdown
## <emoji> <Name> — <Focus> Pill

### Ladder

1. ...
2. ...
```

### 4. Verify

```bash
node scripts/check-rule-copies.js
npm test
```

## Custom pill rules

- Name must be one word, alphanumeric + hyphen only
- Do not overwrite existing pill names: titan, sage, warden, phantom, void
- Each pill gets its own `prism-<name>` skill folder
- The pill is immediately available via `/prism <name>` after registration
- Custom pills are stored in `pills.json` and persist across sessions
