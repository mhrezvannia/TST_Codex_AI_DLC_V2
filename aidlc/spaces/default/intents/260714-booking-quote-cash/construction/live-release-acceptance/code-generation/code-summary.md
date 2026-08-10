# Code Summary - live-release-acceptance

## Produced

| Area | Files / changes |
|---|---|
| Acceptance orchestrator | `scripts/w1-live-acceptance.mjs` |
| Acceptance tests | `scripts/w1-live-acceptance.test.mjs` |
| Package commands | `package.json` adds `w1:live-acceptance` and `w1:live-acceptance:dry-run` |
| Real messaging guard | `NoopMessagingGuard`, `PlatformMessagingTest`, `compose.yaml` service env |
| Full-profile Compose fix | Grafana default host port changed to 3003 to avoid Booking UI port 3001 |
| Evidence | `artifacts/w1-01-live/codegen-dry-run/` and `artifacts/w1-01-live/codegen-live-blocked-image-pull/` |

## Key Decisions

- The acceptance command writes an indexed run directory even when blocked. This follows U07 failure semantics and prevents replacing a partial/failed run with an edited green result.
- Live acceptance now fails closed if any local-noop messaging adapter is active while `MESSAGING_REQUIRE_REAL=true`.
- The Compose full profile can no longer self-conflict on host port 3001. Booking app stays on 3001; Grafana defaults to 3003.
- The code-generation live attempt was run and retained. It did not reach the user journey because Docker Desktop could not fetch Elastic observability images due HTTPS proxy/network access to `docker-auth.elastic.co`.

## Test Coverage

- Full backend Maven suite passed.
- Script tests passed for acceptance, replay/restart, readiness, quality gates, and seed tooling.
- Booking frontend tests/typecheck/lint/build passed.
- Compose static validation passed.
- `git diff --check` passed with line-ending warnings only.
- Both audit detectors exited 0 with LEADS output.

## Live Evidence

- Planned dry run: `artifacts/w1-01-live/codegen-dry-run/manifest.json` and `index.md`.
- Live blocked run: `artifacts/w1-01-live/codegen-live-blocked-image-pull/manifest.json` and `index.md`.
- Block reason: `compose-start` could not pull `docker.elastic.co/elasticsearch/elasticsearch:8.16.1` because Docker Desktop had no HTTPS proxy path to `docker-auth.elastic.co`.

## Deviations

- Reviewer subagent invocation is unavailable in this Codex surface, so the review was performed inline and recorded below.
- The full live user journey remains blocked by Docker image-pull networking. This is not a green release claim; the evidence is intentionally `BLOCKED`.

## Review

Verdict: READY

Findings:
- No blocking code issues found in the acceptance harness or guard changes.
- Release acceptance itself is not passed. The run is correctly marked `BLOCKED`, with preflight and Compose config passing and `compose-start` blocked on external image pull.
- The next live attempt should either restore Docker HTTPS/proxy access to Elastic images or pre-pull/cache the observability images, then rerun `node scripts/w1-live-acceptance.mjs --run-id <new-id>`.

Evidence:
- Host tests and detectors are green as listed in `code-generation-plan.md`.
- Live blocked evidence path: `artifacts/w1-01-live/codegen-live-blocked-image-pull/index.md`.
