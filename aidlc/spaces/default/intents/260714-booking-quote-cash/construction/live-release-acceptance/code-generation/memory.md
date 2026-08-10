# Code Generation Memory - live-release-acceptance

## Interpretations

- 2026-07-16T15:16:31Z - Treated U07 code generation as producing and executing the acceptance harness, not manufacturing a green release when the live environment blocks image pulls.
- 2026-07-16T15:16:31Z - Treated `MESSAGING_REQUIRE_REAL=true` as mandatory for live acceptance; local-noop remains useful for local development but cannot satisfy release proof.

## Deviations

- 2026-07-16T15:16:31Z - Reviewer subagent invocation is unavailable in this Codex surface; an inline review was performed and appended to `code-summary.md`.

## Tradeoffs

- 2026-07-16T15:16:31Z - The acceptance harness currently records manifest/index/hashes and blocked semantics without implementing external Ed25519 signing; signing remains an operational hardening step once the live run can proceed past image startup.
- 2026-07-16T15:16:31Z - Grafana was moved to host port 3003 rather than moving the Booking app, because Booking UI port 3001 is already used by existing local proof and user workflows.

## Open Questions

- 2026-07-16T15:16:31Z - Restore Docker HTTPS/proxy access or pre-pull Elastic observability images, then rerun `node scripts/w1-live-acceptance.mjs --run-id <new-id>` to drive the actual continuous user journey.
