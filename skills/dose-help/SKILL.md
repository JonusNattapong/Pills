---
name: dose-help
description: >
  Quick-reference card for all dose pills, skills, and commands.
  One-shot display, not a persistent mode.
---

# Dose Help

Pop a pill. Gain a power. Switch anytime.

## Pills

| Color | Pill | Command | What it does |
|-------|------|---------|-------------|
| 🔴 Red | **Titan** | `/dose red` | Performance. Cache. Parallel. Fast. |
| 🔵 Blue | **Sage** | `/dose blue` | Architecture. Patterns. Clean code. |
| 🟢 Green | **Warden** | `/dose green` | Security. Validation. Safety. |
| 🟡 Yellow | **Phantom** | `/dose yellow` | Minimal. Ship. Delete. Less. **Default.** |
| 🟣 Purple | **Void** | `/dose purple` | Full spectrum. Chooses per task. |

## Commands

| Command | What it does |
|---------|--------------|
| `/dose [color]` | Pop the pill. Sets your active mode. |
| `/dose-status` | Show which pill is active. |
| `/dose-review` | Review diff for over-engineering. |
| `/dose-audit` | Audit entire repo for bloat. |
| `/dose-debt` | Harvest `dose:` shortcuts into a ledger. |
| `/dose-create` | Create a custom pill. Describe what you want. |
| `/dose-manage` | Edit, delete, disable, enable custom pills. |
| `/dose-help` | This card. |

## Deactivate

Say "normal mode" or `/dose off`. Resume with `/dose [color]`.

## Configure

```bash
export PRISM_DEFAULT_MODE=sage
```

Or in `~/.config/dose/config.json`: `{ "defaultMode": "titan" }`

Default is `phantom`.

## More

https://github.com/DietrichGebert/ponytail — forked from Ponytail.
