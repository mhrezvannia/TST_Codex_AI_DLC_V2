# Deployment Architecture - U06 Final Live Acceptance and Audit

## Source Context

This deployment architecture consumes U06 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U06 `business-logic-model.md`. It maps final acceptance evidence to local Compose/Nginx and local command execution.

## Compute Model

| Component | Deployment design | U06 role |
| --- | --- | --- |
| Local Compose/Nginx runtime | Existing W2-01 target. | Provides shell/auth/Booking/identity/Keycloak through accepted local entrypoint. |
| Scenario runner/live proof driver | Local command or scripted browser driver. | Executes allow, deny, sign-out, and compatibility scenarios through Nginx. |
| Detector 6d | Existing local detector command. | Scans mounted shell/Booking surfaces for hardcoded auth. |
| `erp-fidelity-audit` | Existing local audit command. | Produces ERP fidelity status. |
| `aidlc-audit` | Existing local audit command. | Produces AIDLC state/artifact/gate status. |
| Evidence package writer | Local filesystem artifact. | Writes required files under `artifacts/w2-01-live/app-shell-auth/`. |

## Runtime Topology

U06 does not change runtime topology. It observes the local stack established by U01-U05:

```text
Browser/scenario driver -> Nginx -> apps-shell -> auth/Booking/identity services
Local commands -> detector/audits -> artifacts/w2-01-live/app-shell-auth
```

Text fallback: U06 runs finite local scenarios through Nginx and local detector/audit commands, then writes parseable evidence files. It does not add infrastructure to the user path.

## Evidence Root

All U06 deployment evidence is written below `artifacts/w2-01-live/app-shell-auth/`:

- `manifest.json`
- `runtime-readiness.json`
- `scenarios.jsonl`
- `actor-evidence.jsonl`
- `sign-out-evidence.json`
- `compatibility-preservation.md`
- `detector-6d.txt`
- `erp-fidelity-audit.txt`
- `aidlc-audit.txt`
- `blockers.jsonl` when any status is `BLOCKED`
- `final-decision.md`

## Environment Definitions

No new environment service is required. Scenario and command runners may read existing local URLs and env values but must not write raw tokens, service tokens, cookies, or secrets to evidence. Browser entrypoint is Nginx host port `8088` or the configured local edge URL recorded in `runtime-readiness.json.entrypointUrl`.

## Preservation Boundary

U06 deployment architecture does not add AWS, cloud deployment, CDN, managed observability, database, queue, or continuous worker. It preserves W0-01, W0-02, W1-01, and W2-02 boundaries and records W1 waiver as BLOCKED at `compose-start`.

