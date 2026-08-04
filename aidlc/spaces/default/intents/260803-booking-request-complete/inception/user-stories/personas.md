# Personas — W3-04 Booking Request Completeness

Source basis: `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. These are goal-based operational archetypes, not fixed Identity roles or permission bundles. Every protected story states its required action permission independently.

## Persona 1 — Booking Desk Agent (Primary)

**Role and context:** Repeatedly creates and progresses FCL-dry booking requests in the authenticated LinerCore shared shell. Works in a dense operational queue and needs fast, predictable keyboard-friendly entry without sacrificing commercial truth.

**Goals**

- Capture every required commercial fact once and reopen it exactly as accepted.
- Understand requested versus carrier-derived schedule dates before committing.
- Validate and price the current revision without guessed defaults.
- Confirm exactly once without waiting for physical container assignment.

**Pain points**

- Duplicate Booking forms behave differently and currently require a physical equipment ID.
- Missing/stale reference data or provider timeouts can force re-entry or create outcome uncertainty.
- Generic errors and multiple competing actions make the next safe step unclear.

**Success signals:** One canonical `/booking` workflow, persistent labels and input, exactly one permitted next action, authoritative schedule/price provenance, and a durable confirmed record with correlation evidence.

## Persona 2 — Customer Service Agent (Primary for Recovery)

**Role and context:** Reopens existing requests to answer customer questions, correct incomplete or stale facts, and inspect current status. Often encounters legacy records and requests whose authoritative references changed after initial capture.

**Goals**

- Find and understand an existing request without exposing unauthorized information.
- Correct the same record rather than duplicate or destructively replace it.
- See why a record is incomplete, stale, conflicted, unpriced, or awaiting a provider outcome.
- Preserve customer/request/list/tab context through recovery.

**Pain points**

- Legacy snapshots may contain only a physical-equipment-shaped subset.
- Stale references and optimistic conflicts can obscure which revision is authoritative.
- Raw provider errors do not explain whether to Correct, Refresh, Retry, or Inspect.

**Success signals:** Explicit incompleteness reasons, stable field errors, deterministic recovery action, no fabricated upcast values, and safe detail views across all supported states.

## Persona 3 — Booking Supervisor (Exception Oversight)

**Role and context:** Oversees operational exceptions and commercial handoff quality. May have permission to progress some records, but the stories never assume a fixed bundle.

**Goals**

- Distinguish manual/no-rate, denied, malformed, conflict, unavailable, pending, and replay outcomes.
- Verify the request, schedule, pricing authority, revision, and downstream handoff before intervening.
- Confirm that retries and refreshes do not create duplicate commercial or confirmation effects.
- Escalate safely using correlation/reference evidence without exposing PII-rich payloads.

**Pain points**

- Outcome classes can collapse into one generic error or invite unsafe repeated commands.
- Topic/consumer drift and nullable-equipment incompatibility can make a UI success operationally false.
- Diagnostics can expose too much raw detail or dominate the operator workflow.

**Success signals:** One state-specific action, privacy-safe collapsed diagnostics, immutable pricing evidence, exactly-once confirmation, and visible pending-assignment handoff.

## Persona 4 — Operational Auditor (Supporting, Read-Only)

**Role and context:** Reviews whether the intent’s controls and observed evidence support a truthful operational claim. This persona does not gain mutation rights from the archetype.

**Goals**

- Trace each outcome from approved requirement and story through contract, migration, test, browser, and live Compose evidence.
- Verify authorization denials, redaction, idempotency, correlation, and absence of fabricated/lost facts.
- Distinguish PASS, BLOCKED, and NOT APPLICABLE without reusing another intent’s evidence.

**Pain points**

- Static fixtures or green unit tests can be mistaken for integrated proof.
- Skipped live prerequisites can be reported as PASS.
- Raw payload logging can make evidence itself a privacy leak.

**Success signals:** A W3-04-tagged evidence manifest, observed durations labeled local/non-production, mandatory gates green or honestly BLOCKED, and no raw party/customer/cargo values.

## Relationships and Priority

| Persona | Journey relationship | Priority |
|---|---|---|
| Booking Desk Agent | Creates, validates, prices, and confirms the current request | Primary |
| Customer Service Agent | Reopens, explains, corrects, and recovers existing/legacy requests | Primary |
| Booking Supervisor | Oversees manual/provider/contract/handoff exceptions | Secondary |
| Operational Auditor | Inspects control and evidence outcomes without mutation | Supporting |

Booking Desk and Customer Service share the same canonical composition but may receive different authorized actions. The Supervisor uses the same operational record and recovery semantics rather than a second admin frontend. The Auditor consumes privacy-safe evidence and detail surfaces; Kafka payloads and schemas remain secondary/collapsed.

## Permission and Accessibility Posture

- `read`, `create`, `correct`, `validate`, `price`, and `confirm` are independently enforced server-side; no persona definition assigns them implicitly.
- A denied/session-boundary experience discloses no protected existence or payload facts.
- Every applicable persona workflow is keyboard-operable with visible focus, persistent labels, linked/announced errors, controlled live regions, focus restoration, reduced motion, and non-color state meaning.
- Required evidence covers 390, 768, 1024, and 1440 px plus 200% zoom in light/dark themes; story acceptance may not claim PASS from source inspection or mockups alone.
