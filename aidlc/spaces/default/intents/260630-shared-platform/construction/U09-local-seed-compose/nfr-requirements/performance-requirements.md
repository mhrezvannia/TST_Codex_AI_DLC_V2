# Performance Requirements - U09 Local Seed Compose

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines local startup, seed pack loading, reference data seed, identity/Keycloak seed, Compose health, smoke, and error handling workflows. `business-rules.md` fixes idempotency, deterministic identifiers, health checks, API-driven smoke reads, and successful seed summaries. `requirements.md` fixes FR-050, NFR-005, NFR-017, C-002 through C-006, and local/on-prem reproducibility.

## Target Requirements

| Requirement | U09 obligation |
|---|---|
| Local startup time | Compose and seed loader should be bounded and diagnosable rather than retrying indefinitely. |
| Seed execution | Seed packs must validate before writes and load in dependency order. |
| Repeat run performance | Second run of the same seed version should skip/current records rather than rewrite everything. |
| Smoke execution | Smoke checks must use APIs/BFF paths and remain small enough for local and CI use. |
| Diagnostics | Failures must name missing packs, invalid paths, dependency health, and conflicting immutable keys. |

## Measurement Requirements

- Record seed run duration, service wait duration, records created/updated/skipped/failed, smoke duration, and correlation id.
- Track per-pack and per-target-service timing.
- Report dependency timeout separately from validation or data conflicts.
- Use deterministic smoke subsets through `smokeTags`.

## Non-Goals

- No production migration performance target.
- No final platform load profile validation.
- No direct database smoke shortcuts for speed.

