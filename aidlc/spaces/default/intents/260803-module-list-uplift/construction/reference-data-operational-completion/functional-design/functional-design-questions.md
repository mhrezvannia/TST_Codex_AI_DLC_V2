# Functional Design Questions - U02 Reference Data Operational Completion

## Source and Authority Alignment

This U02 question set consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus the approved U01 Functional Design. Binding UI authority remains the W4 requirements, LinerCore MASTER, Reference page contract and approved mockups. It retains visible focus, inline/server validation and reduced motion while rejecting marketing composition, new fonts/colors, animated badges, generic Server Actions that bypass the approved BFF, and any shared UI fork.

## Mutation and Domain Questions

### Q1. What is the canonical create/update command workflow?

A. Focused task route -> current session -> action-specific Identity decision -> strict input/schema validation -> Reference BFF `createRecord`/`updateRecord` -> provider mutation -> authoritative `getRecord` re-read -> typed success/detail; every retry reauthorizes and no browser field carries actor/capability authority (recommended)
B. Optimistically update the browser before provider acceptance
C. Write Reference tables directly from the frontend
D. Reuse the prior page's cached authorization
X. Other (please specify)

[Answer]: A

### Q2. What entities/state should U02 add?

A. Add no new persistence; model a transient create/update draft, provider field issues, expected version, mutation disposition, and authoritative post-command detail around the approved inputs and `MutationResult<T>` (recommended)
B. Persist drafts and permissions in a new BFF database
C. Create a shared generic workflow aggregate for all modules
D. Store mutation state in browser local storage
X. Other (please specify)

[Answer]: A

### Q3. How should set-specific attributes be validated?

A. Render and validate only the server/provider-approved field schema for the selected set; reject unknown fields, normalize allowed strings without inventing defaults, keep persistent labels and linked errors, and repeat validation at the BFF/provider boundary (recommended)
B. Accept arbitrary JSON attributes from the browser
C. Infer missing required values client-side
D. Display one raw JSON textarea
X. Other (please specify)

[Answer]: A

### Q4. How should optimistic concurrency work?

A. Update submits the provider version read with the draft; a mismatch maps to typed conflict with current version/reference, retains entered values/focus, offers authoritative re-read/reconcile, and never silently overwrites or auto-resubmits (recommended)
B. Last write wins
C. Automatically retry with the newest version
D. Hide the conflict and show success
X. Other (please specify)

[Answer]: A

### Q5. Which actions are in U02?

A. Only create and update when their exact current-request capabilities and provider preconditions pass; Validate/deactivate/reactivate remain absent and BLOCKED, while read-only users retain provider truth with a concise explanation (recommended)
B. Add all lifecycle controls disabled
C. Implement Validate/deactivate/reactivate client-side
D. Hide the entire detail from users lacking mutation capability
X. Other (please specify)

[Answer]: A

## Outcome and Recovery Questions

### Q6. How should mutation outcomes map?

A. Exhaustively map success, validation, conflict, denied, not-found, unavailable-known-no-mutation, unavailable-unknown-outcome, and unexpected; prevent duplicate submission while pending, preserve drafts/focus, announce the result, and require re-read before retry after unknown outcome (recommended)
B. Collapse every failure to a toast
C. Treat timeout as failure-safe and resubmit automatically
D. Clear the form on every response
X. Other (please specify)

[Answer]: A

### Q7. How should stale/degraded reads affect actions?

A. Show only authorized provider-returned last-known data with source/time; disable all freshness-dependent mutation with the precise reason and Retry; Identity outage remains unavailable/503 with zero provider calls, and no trustworthy view means provider error rather than cached truth (recommended)
B. Allow updates against stale records
C. Cache authorization with stale business data
D. Use local fixtures during provider outage
X. Other (please specify)

[Answer]: A

### Q8. What success navigation should follow a command?

A. After provider acceptance, re-read authoritative detail, announce saved/created status, focus the detail heading/status, retain validated list return context, and ensure browser history supports safe Back; never render success from submitted input alone (recommended)
B. Redirect to the root and discard context
C. Render the submitted draft as success without re-read
D. Keep the form pending until the user refreshes
X. Other (please specify)

[Answer]: A

## Frontend and Evidence Questions

### Q9. What component/form design is binding?

A. Exactly one root-layout `PlatformShell`; feature-local CreateRecordForm/EditRecordForm use shared Input/Select/Combobox/Button/StatusStrip/Dialog only where required, server-owned capabilities/schema/results, focused client draft/dirty/pending/error state, stable Skeletons, persistent labels, error summary/links, cancel/dirty protection, and no workflow ribbon or local visual system (recommended)
B. Put Reference forms in `packages/ui`
C. Build a module-local form library/theme
D. Use a raw JSON editor and spinner-only loading
X. Other (please specify)

[Answer]: A

### Q10. Which U02 scenarios define completion?

A. Complete list/detail/history plus create/update success, validation, duplicate submit, version conflict, read-only/denied, Identity outage, provider outage with/without trustworthy stale data, unknown mutation outcome, recovery/re-read, exact five widths/two themes, keyboard/screen-reader/reduced-motion/zoom, performance and live evidence are mandatory; unsupported actions remain absent (recommended)
B. Happy-path create/update only
C. Defer conflicts/degradation/accessibility to final intent acceptance
D. Count mockups and unit tests as live completion
X. Other (please specify)

[Answer]: A

## Ambiguity Analysis Placeholder

## Ambiguity Analysis

- Recorded response: `All A` (Q1-Q10 = A).
- No vague, conditional, or incomplete answer remains.
- No answer conflicts with the approved U01 Functional Design, U02 scope, provider and Identity ownership, typed mutation-result semantics, LinerCore UI authority, or B02 entry gates.
- The combined decisions define a single consistent workflow: current-request authorization, strict schema validation, provider-owned mutation, optimistic concurrency, authoritative re-read, exhaustive typed outcomes, safe degraded behavior, and feature-local composition inside the one W2-02-owned `PlatformShell`.
- Validate, deactivate, and reactivate remain explicitly outside U02 completion and must not appear as inert or speculative controls.
- Artifact generation is unblocked after the required consolidated-answer confirmation.
