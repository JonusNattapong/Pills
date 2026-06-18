---
name: prism-help
description: >
  Quick-reference card for all prism pills, skills, and commands.
  One-shot display, not a persistent mode.
---

# Prism Help

Pop a pill. Gain a power. Switch anytime.

## Pills

| Color | Pill | Command | What it does |
|-------|------|---------|-------------|
| 🔴 Red | **Titan** | `/prism red` | Performance. Cache. Parallel. Fast. |
| 🔵 Blue | **Sage** | `/prism blue` | Architecture. Patterns. Clean code. |
| 🟢 Green | **Warden** | `/prism green` | Security. Validation. Safety. |
| 🟡 Yellow | **Phantom** | `/prism yellow` | Minimal. Ship. Delete. Less. **Default.** |
| 🟣 Purple | **Void** | `/prism purple` | Full spectrum. Chooses per task. |

## Commands

| Command | What it does |
|---------|--------------|
| `/prism [color]` | Pop the pill. Sets your active mode. |
| `/prism-status` | Show which pill is active. |
| `/prism-review` | Review diff for over-engineering. |
| `/prism-audit` | Audit entire repo for bloat. |
| `/prism-debt` | Harvest `prism:` shortcuts into a ledger. |
| `/prism-create` | Create a custom pill. Describe what you want. |
| `/prism-manage` | Edit, delete, disable, enable custom pills. |
| `/prism-help` | This card. |

## Deactivate

Say "normal mode" or `/prism off`. Resume with `/prism [color]`.

## Configure

```bash
export PRISM_DEFAULT_MODE=sage
```

Or in `~/.config/prism/config.json`: `{ "defaultMode": "titan" }`

Default is `phantom`.

## More

https://github.com/DietrichGebert/ponytail — forked from Ponytail.
