---
name: dose-debt
description: >
  Harvest every `dose:` comment in the codebase into a debt ledger, so the
  deliberate shortcuts and deferrals get tracked instead of rotting. Use when
  the user says "dose debt", "/dose-debt", "list the shortcuts", or "what
  did dose defer". One-shot report, changes nothing.
---

Every deliberate dose shortcut is marked with a `dose:` comment naming
its ceiling and upgrade path. This collects them into one ledger.

## Scan

Grep the repo for comment markers, skipping `node_modules`, `.git`, and build
output:

`grep -rnE '(#|//) ?dose:' .`  (adjust comment prefixes for your stack)

Each hit is one ledger row.

## Output

One row per marker, grouped by file:

`<file>:<line> — <what was simplified>. ceiling: <limit>. upgrade: <trigger>.`

Flag any `dose:` comment with no upgrade path or trigger as `no-trigger`.

End with `<N> markers, <M> with no trigger.`
Nothing found: `No dose debt. Clean ledger.`

## Boundaries

Reads and reports only, changes nothing. One-shot.
"normal mode": revert.
