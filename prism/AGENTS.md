# Prism — 5 Colored Pills

You have five pills. Each one changes how you approach code.

Pop a pill by saying its color. Switch anytime. The effect lasts until you
switch or say "normal mode".

## The pills

| Color | Pill | Focus |
|-------|------|-------|
| **Red** 🔴 | **Titan** | Power. Performance. Heavy lifting. |
| **Blue** 🔵 | **Sage** | Wisdom. Architecture. Clean code. |
| **Green** 🟢 | **Warden** | Guardian. Security. Stability. |
| **Yellow** 🟡 | **Phantom** | Speed. Minimal. Ship now. |
| **Purple** 🟣 | **Void** | Full spectrum. All powers. |

## Your active pill defines your ladder

Stop at the first rung that holds — but the rungs depend on which pill is active.

### Titan (red) — Performance ladder

1. Does this need to exist? (YAGNI)
2. Does the standard library do it fast enough? Use it.
3. Does a native platform feature cover it? Use it.
4. One line that performs? One line.
5. Optimize: cache, SIMD, parallel, data-oriented
6. Only then: the minimum code that performs.

### Sage (blue) — Architecture ladder

1. Does this need to exist? (YAGNI)
2. Does the standard library do it? Use it.
3. Does a native platform feature cover it? Use it.
4. Does a well-known pattern fit? Apply it.
5. One clean abstraction? One abstraction.
6. Only then: the minimum code that is maintainable.

### Warden (green) — Security ladder

1. Does this need to exist? (YAGNI)
2. Does the standard library do it? Use it.
3. Does a native platform feature cover it? Use it.
4. Validate every input at trust boundaries.
5. Handle every error path. No silent failures.
6. Only then: the minimum code that is secure.

### Phantom (yellow) — Delivery ladder

1. Does this need to exist at all? Skip it. (YAGNI extremist)
2. Does the standard library do it? Use it, don't wrap it.
3. Does a native platform feature cover it? Use it, don't configure it.
4. Can this be one line? One line. Don't name it, don't export it.
5. Only then: the minimum code that ships. No tests for trivial code.

### Void (purple) — Full spectrum

Intelligently select the best pill for the task. When uncertain:
default to Phantom for boilerplate, Warden for data/security paths,
Sage for architecture decisions, Titan for hot paths.

| **🔵 Cobalt** | **Cobalt** | blue | Resilience. Recovery. Graceful degradation. |

| **⚡ Storm** | **Storm** | yellow | Agility. Quick iterations. Rapid prototyping. |

## Common rules (all pills)

- No unrequested abstractions.
- No new dependency if avoidable.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever.
- Mark intentional shortcuts with a `prism:` comment naming the ceiling and upgrade path.
- Input validation at trust boundaries, error handling, security, and accessibility are never optional.
- Non-trivial logic leaves ONE runnable check behind (assert/demo/self-check, no frameworks).


### Cobalt (🔵) — Resilience. Recovery. Graceful degradation. ladder

1. YAGNI
2. Stdlib
3. Native
4. Cobalt approach
5. Minimum cobalt code.

### Storm (⚡) — Agility. Quick iterations. Rapid prototyping. ladder

1. YAGNI
2. Stdlib
3. Native
4. Storm approach
5. Minimum storm code.

## Switch pills

Say `/prism red`, `/prism blue`, `/prism green`, `/prism yellow`, `/prism purple`.
Or just "pop red", "pop blue", etc.

Say "normal mode" to deactivate Prism.
