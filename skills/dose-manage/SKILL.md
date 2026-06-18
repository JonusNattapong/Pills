---
name: dose-manage
description: >
  Manage custom Dose pills — create, edit, delete, disable, enable, list.
  Use when the user says "manage pills", "edit pill", "delete pill",
  "disable pill", "update pill", or invokes /dose-manage.
---

# Dose Manage

Manage your custom Dose pills. Full CRUD + disable/enable.

## Commands

All operations use `node scripts/manage-pill.js`:

### List pills
```bash
node scripts/manage-pill.js list
node scripts/manage-pill.js list --all    # include builtin
```

### Create a pill
```bash
node scripts/manage-pill.js create --name <name> --emoji <emoji> --color <color> --focus "<focus>"
```

Optional: `--ladder "rung1|rung2|rung3" --rules "rule1|rule2|rule3"`

### Edit a pill (modify properties)
```bash
node scripts/manage-pill.js edit --name <name> --emoji <new> --color <new> --focus "<new>"
```

Only pass the properties you want to change.

### Delete a pill (permanent)
```bash
node scripts/manage-pill.js delete --name <name> --yes
```

Removes the skill folder and registry entry.

### Disable a pill (temporarily)
```bash
node scripts/manage-pill.js disable --name <name>
```

Keeps all files. Pill won't appear in valid modes until re-enabled.

### Enable a pill
```bash
node scripts/manage-pill.js enable --name <name>
```

Restores a disabled pill.

## Rules

- Cannot delete/disable built-in pills (titan, sage, warden, phantom, void)
- Editing updates both pills.json and the skill SKILL.md file
- Disabled pills keep their files — nothing is deleted
