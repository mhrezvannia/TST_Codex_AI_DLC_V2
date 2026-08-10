# Technology Stack Decisions - U06 Isolated Acceptance and Preservation

## Non-deployable brownfield decision

U06 adds checked-in test/evidence drivers and schemas only. It consumes
`business-logic-model.md`, `business-rules.md`, program `requirements.md`, and
brownfield `technology-stack.md`. No service, database, cache, broker, queue,
cloud resource, public route, shared UI component, or commercial fallback is
selected.

## Selected tools

| Concern | Decision | Constraint |
| --- | --- | --- |
| orchestration | Node.js scripts plus existing `scripts/wave-a-compose.mjs` | every Compose mutation through wrapper; exact project `linercore-wave-a`; 18088 only |
| manager protection | existing `npm run demo:guard` plus read-only Docker inventory | default manager settings; before/after equality; no mutation/repair |
| manifest/evidence | versioned JSON Schema, canonical JSON, SHA-256, JSONL/CSV and Markdown reports | one run root, relative paths, typed closed IDs, rehash before decision |
| backend verification | existing Maven/Java 21/JUnit/Spring/Testcontainers/Flyway tooling | service-owned DB tests, migration/transaction/race/restart/restore evidence |
| frontend verification | Yarn 4.5.3/Turborepo, lock-resolved Next 15.5.19/TypeScript 5.9.3/Vitest 2.1.9 | build/lint/type/component/coverage without shared UI redesign |
| browser | Playwright 1.61.1 with axe integration already selected for the intent | normal signed session, finite width/theme/state matrix, screenshots/traces/network/focus assertions |
| performance | checked-in Node/Java HTTP driver with monotonic clock and nearest-rank calculator | unique non-replay identities, raw samples retained, no external load service |
| DB evidence | wrapper `exec`/checked-in redacting SQL harness per owner | no direct credential artifact or cross-database join |
| telemetry | existing Prometheus/Grafana/Jaeger/OTel/log stack plus safe API/log queries | presence is not proof; before/after deltas and correlation required |
| audits | exact Bash detector commands plus manual `.claude/skills` reviews | detector output is lead list; every finding dispositioned |

Versions remain governed by existing Maven/workspace locks and container images;
U06 does not upgrade application dependencies. A minimal evidence-only package
may use already locked libraries or Node built-ins; any new dev dependency must
be pinned, license/security scanned, and absent from production runtime bundles.

## Significant decisions

### One authoritative evidence root

All outputs live under `artifacts/w2-03-live/<run-id>/` and are hashed by one
manifest. Rejected alternatives are scattered screenshots/logs, mutable latest
folders, caller-supplied PASS, and copying/rewriting prior-wave evidence.

### Wrapper-only isolated runtime

The existing Wave A wrapper is the sole mutation seam. Raw Docker is restricted
to read-only manager inventory. Rejected alternatives are raw Compose, manager
project reuse, port fallback, direct backend acceptance, or auto-repairing the
protected demo.

### Checked-in deterministic drivers

Migration, commercial, browser, performance, security, preservation and audit
drivers use fixed seeds/closed matrices and emit machine-readable assertions.
External SaaS/load/browser platforms would add credentials/topology and are not
needed for this local gate.

### Technical decision separate from human approval

Manifest PASSED is derived solely from observed technical gates. It neither
contains nor simulates the later AI-DLC approval. BLOCKED/FAILED runs remain
immutable and linked by later attempts.

## Quality and exit gates

Required commands include backend/frontend build/lint/type/unit/integration/
contract/migration tests, changed-code line coverage >=80%, nginx/base-path
regressions, closed prior-wave preservation, security/observability/redaction,
Playwright accessibility/responsive matrix, fresh p99, restart/restore, both
demo guards, `aidlc-audit`, `erp-fidelity-audit`, and `git diff --check`.

Live execution remains deferred until Docker and required local capabilities are
actually available. An unavailable environment is BLOCKED, never claimed PASS.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, selecting only evidence tooling
needed to prove the W2-03 slice and preserve all ownership/safety boundaries.

