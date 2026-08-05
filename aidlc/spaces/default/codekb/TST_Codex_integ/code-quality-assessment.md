# Code Quality Assessment - TST_Codex_integ

## Source Context

Assessment based on fresh codebase-memory MCP index, root scripts, and W2-01 source-verified seams.

## Quality Gates Present

Root package scripts provide:

- frontend build/lint/typecheck/test via Turbo;
- backend build/test via Maven;
- local prerequisite checks;
- contract validation and provider verification;
- local readiness and smoke scripts;
- quality-gates evidence script;
- W1 live acceptance/replay scripts.

## Test and Verification Assets

MCP search found tests around:

- Booking local identity filter.
- Booking local authorization.
- Booking API header/idempotency behavior.
- identity-service authorization decisions.
- auth package/session behavior.

These are useful starting points for W2-01 but not sufficient for live shell/auth acceptance.

## W2-01 Quality Risks

| Risk | Evidence | Required response |
|---|---|---|
| Static actor propagation | `apps/booking/lib/bookings.ts::serviceHeaders` sets `x-linercore-actor-id` to `local-user`. | Replace in mounted path and add detector/test evidence. |
| Backend fallback hides missing subject | `BookingApiController.actor` returns `local-user` when blank. | Fail closed or constrain fallback to explicit local/test path. |
| Local bypass too broad | `BookingLocalIdentityFilter` allows configured static local actors. | Keep local-only and logged; deny outside local profile. |
| Stale Graphify | Graphify report built at older commit. | Use fresh MCP/source verification for implementation. |
| W1 evidence ambiguity | W1 live proof waived/blocked due image pull. | Preserve waiver as not-pass. |

## Quality Recommendations

- Add W2-specific tests for session-derived subject propagation.
- Add/extend `erp-fidelity-audit` detector 6d evidence for mounted surfaces.
- Add live Compose evidence for login -> shell -> Booking -> backend subject -> denied -> sign-out.
- Keep audit and readiness evidence under `artifacts/`.
- Run `yarn lint`, `yarn typecheck`, relevant frontend tests, `yarn backend:test`, and targeted live smoke before completion.

## Residual Unknowns

- Exact shell host package/app is not yet selected.
- Existing auth app's session model needs source-level review during requirements/application design.
- Named security and quality reviewers remain unconfirmed.
