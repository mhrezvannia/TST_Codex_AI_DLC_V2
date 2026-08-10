# Practices Discovery Evidence — W2-03 Charge Tariffs & Agreements

## Pipeline and Deployment Scan

The pipeline role inspected Git branches/history, `docs/intents/00-INTENT-BACKLOG.md`, `.github/workflows/quality-gates.yml`, `compose.yaml`, `infrastructure/runtime/profiles.json`, `scripts/wave-a-compose.mjs`, `scripts/demo-guard.mjs`, and prior evidence manifests. Actual Wave A work uses retained `intent/*` branches and an `integ/main-reconciled` integration line; there is no evidence for a complete GitFlow release model, direct-main-only flow, production deployment cadence, or committed staging/production topology.

The runtime model is local Compose with service-owned databases, Keycloak, Kafka/Schema Registry, business services, Next applications, nginx, and optional observability. The manager demo uses `linercore-shared-platform` at port 8088; Wave A acceptance uses isolated `linercore-wave-a` with shifted host ports. The Charge app is present in Compose but lacks an explicit nginx `/charge-agreements` route, and `profiles.json` names an app absent from `compose.yaml`; both are design/runtime gaps rather than inferred practices.

## Quality Scan

The quality role found 81 test files across JUnit, Vitest/Testing Library, and Node tests, including meaningful Charge agreement/pricing/manual-case and Booking pricing/snapshot/manual-state coverage. Recent feature commits carry tests with code, but test-first TDD sequencing is not evidenced. No JaCoCo, Istanbul, Sonar, coverage threshold, or other quantitative collector is committed, so the user explicitly affirmed an 80 percent changed-code floor.

Most CI commands block on failure. Charge test/typecheck are required by the aggregator, but Charge lint/build are absent. The audit detector pipelines use `tee` without visible `pipefail`, so their blocking semantics require correction or explicit verification. Playwright is installed but has no baseline config/spec, and no W2-03 live harness exists.

## Developer Pattern Scan

The developer role verified Java domain/application/data-access/messaging/container boundaries, immutable records/value objects, explicit IDs/statuses, application ports, adapter exception translation, and correlation/idempotency metadata. Booking owns transaction snapshots and reaches Charge through `PricingPort` → `ChargePricingPortAdapter` → `HttpChargePricingClient`; Charge owns matching, calculation, approved authority, and manual cases.

Expected business non-success is modeled through typed statuses/reason codes and boundary exceptions, not a repository-wide `Result<T,E>` convention. Current `NO_RATE`/`MANUAL_PRICING` vocabulary, lossy Booking maps, wall-clock pricing date, silent defaults, divergent OpenAPI authority, SQL-init versus Flyway behavior, and unsupported outbox defaults remain design/reliability gaps.

## DevSecOps Scan

The DevSecOps role found non-local fail-closed auth/session-secret behavior, redaction, ignored real environment files, local-only example credentials, runtime profile checks, strict ESLint including `no-explicit-any`, Booking hex-color restrictions, EditorConfig rules, immutable Yarn installs, centralized Maven versions, restricted GitHub Actions permissions, and version-tagged runtime images.

It found no repository-configured SAST, DAST, secret scanning, dependency/CVE gate, update automation, image/IaC scanning, SBOM, signing, provenance, or attestation. Actions and container bases use mutable tags rather than commit/digest pins, Maven has no lock equivalent, and external organization protections are not visible. The user kept those broad gaps as program debt while requiring existing fail-closed controls to remain intact.

## Questions and Resolutions

Evidence could not legitimately decide the scoped integration policy, Construction skeleton, quantitative coverage floor, deployment claim, error-style convention, or ownership of broad AppSec gaps. The user selected the program integration path, the real Charge-to-Booking risk-first skeleton, tests plus an 80 percent changed-code floor, isolated Wave A acceptance only, preservation of ports/adapters and typed outcomes without a Result-monad mandate, and preservation/recording rather than repository-wide DevSecOps expansion.

The authoritative answers are recorded in `practices-discovery-questions.md`.

## Upstream Sources

All four role scans consumed `code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md` from `aidlc/spaces/default/codekb/TST_Codex_W2-03/`.

## Static-Evidence Limitation

Practices Discovery was a read-only evidence and affirmation stage. It did not run builds, tests, Docker, port 8088 probes, Playwright, live pricing, `aidlc-audit`, or `erp-fidelity-audit`; no statement here is a runtime PASS.

