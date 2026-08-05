# Logical Components - U06 Isolated Acceptance and Preservation

## Boundary

U06 is one checked-in Node/Java/Playwright evidence package, not a deployable
application. It owns no commercial state, route, UI primitive, service, or
infrastructure resource.

## Orchestration components

| Component | Responsibility |
| --- | --- |
| Run coordinator | collision-free root, ordered DAG, terminal state |
| Wave A wrapper adapter | config/up/exec/log/restart/teardown only through existing wrapper |
| Manager guard adapter | default demo guards and read-only inventory fingerprint |
| Bounded readiness driver | per-service deadline plus authenticated probe |
| Gate executor | redacted command, output, semantic assertions, one ledger result |

## Evidence components

| Component | Responsibility |
| --- | --- |
| Append-only ledger | length/hash frames, sync, torn-tail recovery, unique gate attempts |
| Artifact writer | registry paths, reparse/hardlink/same-volume guards, atomic writes |
| Manifest compiler | closed IDs, ledger reconciliation, versioned publication, derived status |
| Trace sanitizer/redaction scanner | entry-level ZIP sanitation, canaries/pattern leads and disposition |
| Report renderer | human-readable summary derived from machine records |

## Verification components

Migration/guarded-restore, seed/commercial journey, fresh performance, security matrix,
preservation, telemetry, quality, and audit drivers are separate gate adapters.
DB adapters execute bounded redacting queries per owner. The performance driver
streams unique raw samples and recomputes percentiles. No adapter may assign
PASSED directly.

## Browser components

Playwright session setup authenticates through edge 18088. Matrix generation
enumerates representative page families, four widths, two themes, and required
states exactly once. Network, keyboard/focus, axe, screenshot, trace, console,
and semantic assertion collectors write redacted indexed artifacts.

The live product remains the shared LinerCore shell and existing Charge/Booking
pages. U06 introduces no page, palette, typography, component library, or
browser authority.

## Control and data flow

```text
Coordinator -> pre-guard/config -> wrapper lifecycle -> bounded gates
Each gate -> streamed artifact -> semantic assertion -> ledger
Ledger + closed schemas + rehash -> derived manifest status
Post-guard/inventory -> final rehash -> technical PASSED/BLOCKED/FAILED
```

Terminal failure skips later unsafe gates but still closes required IDs. A new
attempt links rather than mutates the prior manifest.

## Verification and traceability

Component tests cover path containment, atomic evidence writes, crash recovery,
closed-set compilation, bounded workers/polls, unique performance identities,
owner-local SQL, redaction, UI matrices, manager equality, and technical/human
gate separation.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
