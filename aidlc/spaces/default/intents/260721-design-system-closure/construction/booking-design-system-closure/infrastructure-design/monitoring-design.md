# Monitoring Design — booking-design-system-closure

## Design Inputs

Run-scoped monitoring implements `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md`, while observing `components.md`, `services.md`, and `business-logic-model.md`. It does not create production observability infrastructure.

## Acceptance Signals

| Signal | Source | Durable evidence |
|---|---|---|
| Demo health before/after | Assert effective project `linercore-shared-platform`, edge `http://127.0.0.1:8088`, image tag `demo-20260721`; then run `npm run demo:guard` | Effective inputs plus pre/post direct guard result |
| Compose identity/config | Wave A wrapper config/status | Project, profiles, services, ports |
| Container/service readiness | Existing health/status/logs | Command/output with timestamps |
| Browser runtime health | Playwright page error/rejection/console collectors | Per-case result and trace/screenshot |
| Request behavior | Browser network events | Path/method/status/duration/correlation-safe ID |
| UI outcome | Semantic/state assertions | Route/action discriminator and result |
| Accessibility/responsive | severity checker plus manual/asserted matrix | Findings, viewport/theme/state |
| Trace safety | sanitizer/redaction/rescan/replay | Hashes, command/version, zero-forbidden result |
| Static/build/audits | direct command results | Exit code and output path |

## Correlation and Redaction

Correlation is captured across shell adapter/BFF/backend where the existing system exposes it safely. Tokens, cookies, authorization headers, credentials, secret values, and request bodies are never copied into the manifest.

Raw trace archives are written only to gitignored staging. The sanitizer parses/redacts/rebuilds/rescans/replay-validates them; only proven clean archives enter durable evidence. Failure deletes raw staged data, writes a secret-free failure report, and fails closure.

## Evidence Manifest

Each run records commit, timestamp, host/tool versions needed for reproduction, wrapper command, fixed Compose project, profile, canonical edge, route, story/requirement IDs, state setup, viewport, theme, timing, assertions, artifact hashes/paths, exit result, and rerun linkage.

Missing expected entries, unresolved paths, masked exit status, overwritten failures, or wrong project identity are monitor failures.

## Local Alerts and Stop Conditions

There is no paging/alerting service. The acceptance orchestrator stops immediately on:

- effective demo-guard project, edge URL, or image tag mismatch before either guard;
- failed pre-demo guard;
- wrapper/config project mismatch;
- stack readiness failure;
- real happy-path failure;
- secret-bearing evidence/sanitizer failure;
- final demo guard failure;
- failed audit.

Other UI matrix failures are retained, corrected within scope, and rerun with terminal guards/audits.

Environment overrides are not trusted implicitly. The harness resolves the same defaults as `demo-guard.mjs`, compares them to the required project/URL/image tag, and writes the effective values beside each direct result. A green guard against any other target is invalid and fails closure.

## Non-Claims

No production dashboard, alert threshold, SLI/SLO history, log aggregation, distributed tracing platform, retention policy, on-call process, incident runbook, Prometheus/Grafana/Jaeger deployment, or monitoring availability is added or claimed. Existing optional Compose observability ports/profiles remain outside W2-02 unless already required by the chosen stack profile.
