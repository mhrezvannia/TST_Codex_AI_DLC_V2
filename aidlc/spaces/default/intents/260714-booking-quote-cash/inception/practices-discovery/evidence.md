# Practices Discovery Evidence - W1-01

## Pipeline and Deployment Scan

The lead-role scan inspected recent Git history, local branches, `docs/intents/00-INTENT-BACKLOG.md`, `compose.yaml`, `.github/workflows/quality-gates.yml`, and `scripts/run-quality-gates.mjs`. History is linear and feature/intent-oriented with no recent merge commits; the clone has no `main` branch, so the user selected `integ/main-reconciled` as the W1 Bolt base/target. Compose is the established local environment and already maps PostgreSQL to host port 55432 by default.

## Quality Scan

The quality-role scan found 30 Java and 15 TypeScript/React test files, feature commits that include tests, and a required quality aggregator covering backend tests, selected frontend tests/typechecks, contracts, seeds, skeleton, package-manager policy, and domain purity. There is no configured JaCoCo/frontend coverage collector or threshold, so the user affirmed the org feature floor of 80 percent plus mandatory seam, redelivery, restart, and live-flow evidence.

The aggregator currently omits Booking frontend tests/typecheck and its domain-purity policy list omits Booking and CMM. Those are evidence-backed W1 pipeline gaps, not accepted exceptions.

## Developer Pattern Scan

The developer-role scan verified Java domain/application/data-access/messaging/container boundaries, immutable records, constructor validation, application-service orchestration, repository ports, and controller exception mapping. W1-relevant domain-core sources have no intended Spring/persistence dependency; Java uses explicit exceptions rather than a `Result<T,E>` convention. Frontend configuration is TypeScript strict where apps exist and shares workspace packages, but `apps/booking` lacks a complete Next.js route/test structure.

## DevSecOps Scan

The security-role scan inspected `.github`, root lint/config files, quality scripts, auth/token redaction utilities, runtime profiles, and dependency manifests. Positive controls include immutable Yarn usage, domain purity policy, strict TypeScript, redaction helpers, local-noop protection, and restricted GitHub Actions permissions. No CodeQL/SAST, dependency vulnerability scanner, secret scanner, Dependabot/Renovate configuration, DAST, or IaC scanner was found.

## Questions and Resolutions

Evidence could not determine the desired W1 skeleton, numeric coverage floor, or actual base branch because the affirmed enterprise practice and backlog referred to `main` while this clone has none. The user selected a Kafka round-trip skeleton, 80 percent plus seam proof, and `integ/main-reconciled`.

## Upstream Sources

The role scans consumed `code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md` from `aidlc/spaces/default/codekb/TST_Codex_W1-01/`.
