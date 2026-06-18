---
name: dose-manage
description: Manage custom Dose pills — create, edit, delete, disable, enable, list.
---

# Dose Manage

Full CRUD for custom pills. Use `node scripts/manage-pill.js`.

- `list` — show all custom pills
- `create` — create new pill
- `edit --name <n> --emoji/--color/--focus` — modify pill
- `delete --name <n> --yes` — remove permanently
- `disable --name <n>` — temporarily deactivate
- `enable --name <n>` — reactivate
