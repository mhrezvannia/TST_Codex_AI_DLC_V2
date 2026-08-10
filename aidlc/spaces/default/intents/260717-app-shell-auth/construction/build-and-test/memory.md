# Build and Test Memory

## Interpretations

- 2026-07-18T00:00:00Z - Treat Build and Test as the first stage that must attempt the full W2-01 verification set after U01-U06 code generation, including live Compose/Nginx proof where the local runtime permits it.

## Deviations

- 2026-07-18T00:00:00Z - Live Compose/Nginx browser proof could not run because `docker compose --profile full up -d --build` failed pulling `docker.elastic.co/elasticsearch/elasticsearch:8.16.1` due Docker Desktop HTTPS proxy/direct-connection timeout.
- 2026-07-18T00:00:00Z - Bash-based `erp-fidelity-audit` and `aidlc-audit` detector commands could not execute in this Windows environment because `/bin/bash` is unavailable through the WSL relay; U06 evidence records them as W2-01 BLOCKED.

## Tradeoffs

- 2026-07-18T00:00:00Z - Keep U06 dry-run evidence BLOCKED until live browser/actor/correlation proof is captured; a schema-valid package is not an acceptance PASS.
- 2026-07-18T00:00:00Z - Treat the initial shell typecheck failure as a generated-types ordering issue because shell production build regenerated `.next/types` and the rerun typecheck passed; no source change was required.

## Open questions
