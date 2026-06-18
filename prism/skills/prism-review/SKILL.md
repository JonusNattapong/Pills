---
name: prism-review
description: >
  Code review focused on unnecessary complexity. Finds what to delete:
  reinvented stdlib, unneeded deps, speculative abstractions, dead flexibility.
  One line per finding. Use when the user says "review for bloat", "what can we
  delete", "prism-review", or invokes /prism-review.
---

Review diffs for unnecessary complexity. One line per finding: location, what
to cut, what replaces it.

## Format

`L<line>: <tag> <what>. <replacement>.`

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Nothing replaces it.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Examples

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

## Scoring

End with `net: -<N> lines possible.`
Nothing to cut: `Lean already. Ship.` and stop.

## Boundaries

Complexity only — correctness, security, and performance go to a normal review.
"normal mode": revert to verbose review style.
