# NFR Requirements Questions - U07 Contracts DX

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Compatibility posture

What status is acceptable for contract freeze?

A. Only compatible status with recorded validation evidence; unknown/incompatible/failed blocks freeze (recommended)
B. Unknown is acceptable if contracts look complete
C. Freeze without compatibility checks
X. Other (please specify)

[Answer]: A. Compatible evidence required (Recommended)

## Q2. Contract scope

What may downstream modules receive from U07?

A. Contracts, examples, fixtures, and review findings only; no runtime services, screens, or stubs (recommended)
B. Generated downstream service stubs
C. Shared database schemas
X. Other (please specify)

[Answer]: A. Contract-only downstream package (Recommended)

## Q3. Security posture

What must contracts avoid exposing?

A. Service database tables, secrets, raw tokens, unsafe payload internals, and unauthorized policy details (recommended)
B. Everything helpful for downstream debugging
C. Internal persistence contracts
X. Other (please specify)

[Answer]: A. Safe public contract surface (Recommended)

## Q4. Catalog UX

What accessibility expectation applies to read-only contract views?

A. Accessible tabs, code blocks, description lists, text status labels, and keyboard navigation (recommended)
B. Raw downloadable files only
C. Color-only badges
X. Other (please specify)

[Answer]: A. Accessible read-only views (Recommended)

## Q5. Performance scope

What performance matters for U07?

A. Contract validation, diff, example validation, and catalog rendering must be bounded enough for CI/review workflows (recommended)
B. Runtime API p95 targets
C. No performance constraints
X. Other (please specify)

[Answer]: A. Bounded validation/review workflow (Recommended)

## Ambiguity Analysis

- `business-rules.md` fixes compatible/freeze behavior and downstream boundary.
- `requirements.md` fixes OpenAPI, Avro, Schema Registry, Pact/message-pact, and CI compatibility expectations.
- No follow-up questions are needed for U07.

