# Practices Discovery Evidence — W3-04 Booking Request Completeness

## Sources scanned

- Refreshed CodeKB: `code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md`.
- Current Git history/branches, `.github/workflows/quality-gates.yml`, root workspace/build/lint/test configuration, Compose/infrastructure configuration, contract catalogs/schemas/fixtures, migration ledgers, representative Booking/Reference/Charge/CMM/UI source, and committed evidence manifests.
- Existing `aidlc/spaces/default/memory/team.md` and `org.md` practice defaults.

This was a read-only discovery scan. No test, build, GitHub workflow, browser journey, scanner, or live Compose run was executed during this stage.

## Pipeline and delivery finding

Git evidence shows short-lived intent-scoped branches, an integration line named `integ/main-reconciled`, and merge commits that converge program intents. The quality workflow runs on PRs/pushes to both `main` and the integration branch using a self-hosted on-prem runner, but repository evidence cannot prove external branch protection, reviewer requirements, one universal merge style, runner isolation, deployment frequency, or production promotion.

CI statically defines Java/frontend tests, selected lint/type/build checks, contract validation, high-severity Yarn audit, Compose syntax validation, readiness/evidence aggregation, and audit detectors. Several live/browser/security activities are dry-run, typecheck-only, advisory, BLOCKED, or dependent on external settings, so “workflow configured” is not “current commit passed.”

## Quality finding

Static inventory found JUnit/Surefire/Testcontainers, Vitest/Testing Library, Playwright/Axe, Node/Bun test surfaces, and 213 test files. Recent path-filtered history supports tests-alongside/co-commit practice—23 production-and-test commits versus 11 production-only among 34 relevant commits—but cannot prove red-green TDD because feature history is frequently squashed.

No repository-wide JaCoCo/Istanbul/c8/Vitest threshold exists. The 80% rule is an affirmed W3-04 requirement that must be measured with scoped changed-line evidence until executable CI automation is added. Required live tests must account for assumptions/skips; a generic green test invocation may omit unavailable PostgreSQL, Docker, Reference Data, or browser fixtures.

## Developer and architecture finding

The repository consistently uses reverse-domain Java packages, technology-neutral application/port names, technology-explicit adapters, thin controllers, application-service transaction coordination, repository ports with JDBC adapters, domain invariants, immutable records/closed outcomes, service-owned persistence, idempotency/audit/outbox, and strict typed Next.js/BFF boundaries. Booking and CMM strongly follow domain-core → application-service → dataaccess/messaging → container; other services vary and no ArchUnit enforcement exists.

Expected operational outcomes use typed results, while conflicts/dependency failures use translated typed exceptions and simple invariants still use standard state/argument exceptions. This mixed model is established; W3-04 preserves Booking’s correlated error envelope rather than inventing a universal `Result<T,E>` or central exception framework.

UI evidence shows broad `@erp/ui` use and strict TypeScript, but two independently implemented Booking surfaces/routes already drift. The one-shell governance rule is affirmed; canonical route/component allocation remains a Requirements/Application Design decision rather than a practice-scan invention.

## DevSecOps finding

Executable controls include immutable Yarn install, high-severity Yarn audit, TypeScript lint, selected build/type/test gates, limited workflow permissions, authentication/authorization tests, redaction helpers, and Compose syntax validation. No executable repo-wide SAST, secret scan, Maven CVE scan, image/IaC scan, SBOM, signing/attestation, update automation, Java formatter/linter, or digest-pinned image policy was found.

Documented Semgrep/Gitleaks/Trivy/Syft controls are not implemented; the current security gate honestly exits BLOCKED because its trusted toolchain lock/runners are unavailable. Local example credentials and environment-variable injection are acceptable only for the local profile and must not be represented as production secret management.

## Interview decisions

| Practice area | Evidence gap | Affirmed W3-04 decision |
|---|---|---|
| Way of Working | Merge style and external protection not observable | Intent branch → `integ/main-reconciled`; do not invent merge policy |
| Walking Skeleton | Team judgment, not inferable from source | PB-01 authoritative request spine first and gated |
| Testing Posture | TDD and executable coverage floor not established | Tests alongside; 80% changed executable lines; full risk/live evidence |
| Deployment | No established production pipeline/cadence | Blocking fast CI plus serialized manual isolated-Compose gate; production unclaimed |
| Code Style | No universal formatter/ArchUnit convention | Preserve established hexagonal, typed, strict TypeScript and LinerCore conventions |

## Unresolved topics routed forward

- Requirements/Application Design must resolve canonical Booking route/form ownership, `booking.confirmed` versus `booking.events` topic authority, nullable/quantity-aware CMM consumption, full Booking OpenAPI ownership, reference/CMM migration mechanisms, error-field vocabulary, and shared-type allocation.
- Delivery/quality design must define the changed-line coverage collector, required skip count, browser/manual accessibility evidence, contract/provider execution, evidence freshness/retention, flake ownership, and actual branch-protection required check.
- Security/NFR work must decide trusted scanner provisioning, Maven dependency audit, runner isolation, secrets/rotation, image/SBOM/signing expectations, DAST scope, and waiver authority. Missing controls remain explicit gaps.

