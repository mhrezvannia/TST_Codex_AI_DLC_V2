# Code Generation Plan - local-runtime-foundation

## Plan Context

Unit: `local-runtime-foundation`

Scope: Harden the existing local Docker Compose substrate, environment defaults, prerequisite/readiness scripts, reverse proxy route metadata, and tests so local runtime readiness is honest and profile-aware.

Test strategy: Comprehensive. This plan includes script unit tests for profile classification, readiness aggregation, environment safety, evidence writing, and profile command behavior. Real Docker startup is not required during code generation because Build and Test can exercise workstation-specific runtime startup later.

Workspace target: changes stay at the workspace root under `compose.yaml`, `infrastructure/env/`, `infrastructure/runtime/`, `scripts/`, and package scripts as needed. This unit must not implement domain behavior, service migrations, business seed data, production cloud provisioning, or observability dashboards.

## Story-To-Step Traceability

| Story or requirement | Plan steps |
|---|---|
| US-SP-001 - Local auth/runtime substrate | Step 1, Step 2, Step 3, Step 5 |
| US-RUN-001 - Run locally on Windows | Step 1 through Step 8 |
| US-RUN-002 - Start infrastructure dependencies | Step 1, Step 2, Step 4, Step 5 |
| FR-RUN-001 through FR-RUN-006 | Step 1 through Step 9 |
| NFR-SEC-001 through NFR-SEC-004 | Step 2, Step 3, Step 6 |

## Sequential Implementation Steps

- [x] Step 1: Inventory current runtime assets.
  - Confirm existing `compose.yaml`, `infrastructure/env/local.env.example`, prerequisite checks, readiness scripts, reverse proxy script, and tests.
  - Preserve existing shared-platform service wiring and contract hooks.
  - Traceability: US-RUN-001, US-RUN-002.

- [x] Step 2: Make Compose profiles explicit and honest.
  - Ensure `core`, `app`, `observability`, `devtools`, and `full` are represented through service profiles.
  - Keep PostgreSQL, Keycloak, Kafka, and Schema Registry in `core` and `full`.
  - Keep implemented apps/proxy/contract hooks in `app` and `full`.
  - Keep observability services in `observability` and `full`.
  - Add a light `devtools` profile if missing, without making it required for readiness claims.
  - Traceability: FR-RUN-001, FR-RUN-002, FR-RUN-003.

- [x] Step 3: Harden local environment defaults.
  - Add explicit local-only mode, profile, port, service URL, callback URL, and auth/JWT variables to `local.env.example`.
  - Keep committed defaults deterministic and secret-free, with no production-looking secrets.
  - Traceability: NFR-SEC-001 through NFR-SEC-004, FR-RUN-006.

- [x] Step 4: Add runtime profile metadata and command surface.
  - Add machine-readable runtime profile metadata describing profiles, service ownership, ports, and readiness states.
  - Add or extend script command behavior for setup/health/start/stop/reset/logs where a deterministic dry-run path can be tested locally.
  - Traceability: FR-RUN-003, FR-RUN-006.

- [x] Step 5: Improve prerequisite and readiness checks.
  - Make checks profile-aware so `core`, `app`, `observability`, `devtools`, and `full` report included services separately.
  - Distinguish `container_started`, `infrastructure_ready`, `application_ready`, and `evidence_ready` in evidence output.
  - Keep Docker and unavailable runtime services as blockers, not green status.
  - Traceability: US-RUN-001, US-RUN-002, FR-RUN-006.

- [x] Step 6: Document and validate independent IDE mode.
  - Add host-run service metadata and environment override guidance for local-only IDE mode.
  - Ensure readiness output can mark host-run services separately from container-run services.
  - Traceability: US-RUN-001, FR-RUN-006.

- [x] Step 7: Add Comprehensive tests.
  - Cover profile metadata, environment safety, profile readiness aggregation, evidence-file writing, blocked vs failed classification, and local-only IDE mode classification.
  - Use injected runners and temporary evidence paths rather than requiring Docker.
  - Traceability: all unit stories.

- [x] Step 8: Run verification commands and fix failures.
  - Run `node --test scripts/local-readiness.test.mjs` and any new local runtime script tests.
  - Run `yarn local:check:json` only if it can run without requiring live Docker services; otherwise record why it is expected to block in this environment.
  - Run existing affected script tests if shared helpers change.
  - Traceability: FR-RUN-006.

- [x] Step 9: Write the code summary and mark this plan complete.
  - Produce `code-summary.md` under this unit's `code-generation` record directory.
  - Summarize files changed, implementation decisions, test coverage, command results, and deviations from this plan.
  - Traceability: all unit stories.

## Implementation Guardrails

- Do not implement domain service behavior, migrations, or business seeds in this unit.
- Do not claim local enterprise readiness from container startup alone.
- Do not require remote runtime servers for local verification.
- Do not commit real secrets; local placeholders must be visibly local-only.
