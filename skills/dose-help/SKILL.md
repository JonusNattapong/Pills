---
name: dose-help
description: >
  Quick-reference card for all dose pills, skills, and commands.
  One-shot display, not a persistent mode.
---

# Dose Help

Pop pills. Stack them. Switch anytime.

## Pills

| Color | Pill | Command | What it does |
|-------|------|---------|-------------|
| 🔴 Red | **Titan** | `/dose red` | Performance. Cache. Parallel. Fast. |
| 🔵 Blue | **Sage** | `/dose blue` | Architecture. Patterns. Clean code. |
| 🟢 Green | **Warden** | `/dose green` | Security. Validation. Safety. |
| 🟡 Yellow | **Phantom** | `/dose yellow` | Minimal. Ship. Delete. Less. **Default.** |
| 🟣 Purple | **Void** | `/dose purple` | Full spectrum. Chooses per task. |
| 🦥 Gray | **Ponytail** | `/dose ponytail` | Lazy senior dev. Delete before you write. |
| 🧠 Purple | **Karpathy** | `/dose karpathy` | Think first. Simplicity. Surgical. Goal-driven. |

## Multi-pill

Pop multiple pills at once — their rules combine:

```
pop red             → add Titan
pop blue            → add Sage (now Titan + Sage)
pop off red         → remove Titan
normal mode         → deactivate all
/dose off titan     → remove Titan
/dose               → show active pills
```

## Commands

| Command | What it does |
|---------|--------------|
| `/dose [pill]` | Add a pill to active set. |
| `/dose off [pill]` | Remove a specific pill. |
| `/dose off` | Deactivate all pills. |
| `/dose-status` | Show which pills are active. |
| `/dose-review` | Review diff for over-engineering. |
| `/dose-audit` | Audit entire repo for bloat. |
| `/dose-debt` | Harvest `dose:` shortcuts into a ledger. |
| `/dose-create` | Create a custom pill. Describe what you want. |
| `/dose-manage` | Edit, delete, disable, enable custom pills. |
| `/dose-help` | This card. |

## Deactivate

Say "normal mode" or `/dose off`. Resume by popping a pill.

## Configure

```bash
export PRISM_DEFAULT_MODE=sage
```

Or in `~/.config/dose/config.json`: `{ "defaultMode": "titan" }`

Default is `phantom`.

## More

https://github.com/DietrichGebert/ponytail — forked from Ponytail.
