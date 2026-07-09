# NFR Requirements Questions - U08 Local Runtime, Seed, Smoke, Readiness

## Questions

### Q1. What runtime evidence is required?

A. Backend health, UI route, API lifecycle, active lookup, dependency status, and exact failing URL/port/process details on failure.
B. Backend health only.
C. Manual screenshots only.
X. Other (please specify)

[Answer]: A

### Q2. What reliability applies?

A. Host-runtime readiness is separate from blocked Compose readiness and must not claim Docker parity until Compose is healthy.
B. Host-runtime success implies Docker success.
C. Readiness checks can ignore dependency status.
X. Other (please specify)

[Answer]: A

### Q3. What tech choices apply?

A. Existing Node smoke/readiness scripts plus Maven/Yarn commands, with deterministic exit codes for CI adoption.
B. New unrelated test harness.
C. Manual commands without scripts.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
