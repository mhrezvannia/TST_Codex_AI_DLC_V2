# Technology Stack Decisions - U03 Charge Agreements Operational Uplift

## Source Alignment

Per the answered Q3, this artifact records the inherited verified stack, states explicitly that U03 selects no new technology, and lists the decisions the unit does make within that stack. Evidence is the brownfield `technology-stack.md` scan; the unit's own choices come from `business-logic-model.md` and `business-rules.md`. `requirements.md` NFR-009 forbids a local theme, shell, or shared-component fork and any universal formatter or result-pattern migration, and NFR-012 bounds the runtime claim to local Compose.

## No New Technology

U03 introduces **no** new language, framework, runtime, database, cache, message topic, schema, infrastructure tool, build tool, test framework, or third-party service. It is an uplift of existing `apps/charge-agreements` routes, its BFF, and the existing Charge service contracts. It adds no deployable — U04 is the only unit in W4-01 that does.

## Inherited Stack (verified)

| Layer | Technology | Verified version | U03 use |
| --- | --- | --- | --- |
| Frontend framework | Next.js | 15.5.21 | App Router routes and BFF route handlers for `/charge-agreements*` |
| UI library | React | 18.3.1 | Charge domain composition |
| Frontend language | TypeScript | 5.7.2 | Strict typed app and BFF code |
| Runtime validation | Zod | 3.24.1 | Query allow-list parsing, command body validation, provider response schemas |
| Shared UI | `@erp/ui` | workspace package | Tokens and primitives; no fork (NFR-009) |
| Backend language | Java | 21 | Charge service (unchanged by U03) |
| Backend framework | Spring Boot | 3.3.7 | Charge REST contracts (unchanged by U03) |
| Persistence | PostgreSQL | version not retained in scan | Charge-owned database (unchanged by U03) |
| Lint | ESLint / typescript-eslint | 9.17 / 8.19.1 | Existing flat config |
| Unit/component test | Vitest | 3.2.6 at root | Route, reducer, and component tests |
| Browser test | Playwright | 1.61.1 | Live state, responsive, and accessibility journeys |
| Accessibility | axe-core | manifest-defined | Automated WCAG checks |
| Workspace/build | Yarn workspaces + Turbo | 2.3.3 | Existing task orchestration |

## Decisions U03 Makes Within the Stack

| Decision | Choice | Rationale |
| --- | --- | --- |
| Query parsing | Zod schema as the single allow-list boundary, rejecting duplicate and unknown keys before provider access | Already the codebase's validation idiom; puts BR3-012 at one enforceable point rather than spread across handlers |
| Status vocabulary | An explicit, contract-tested mapping table in the BFF | The current `lifecycle` key must be corrected to the approved contract without silently renaming a provider value (BR3-013) |
| Result modelling | A Charge-local discriminated union with exhaustive switch | TypeScript's exhaustiveness checking makes BR3-040 a compile-time property rather than a review question |
| State management | Server components for authoritative reads; transient client state only for draft, dirty, pending, dialog, and focus | Matches the existing App Router pattern; avoids adding a client store for data the server owns |
| Client data libraries | None added | Reference Data uses TanStack Query 5.62.7 and Zustand 5.0.2, but U03's reads are server-side; adding them here would be a new dependency for no unit need |
| Shared primitives | Consume `@erp/ui`; one narrow Charge lifecycle-dialog composition over the shared Dialog | Domain behaviour without re-implementing focus trap or dismissal (BR3-082) |

## Version and Compatibility Risks Touching U03

- **Vitest split.** `packages/ui` declares `^2.1.8` while the root uses 3.2.6. U03's component tests resolve through the workspace, so the effective version must be verified explicitly rather than assumed — a mismatch surfaces as confusing test-runner behaviour, not a clean failure.
- **Next.js 15 lint flow.** Older `next lint` flows are removed or de-emphasized; any script U03 relies on must be checked against the actual manifest commands rather than assumed present.
- **Unresolved versions.** PostgreSQL, Kafka broker, Node.js, Yarn, and browser-runtime versions were not retained in the developer scan. U03 asserts nothing that depends on them; they are confirmed from the running Compose stack at Build and Test.
- **Spring transitives.** Spring-managed transitive versions were not exhaustively resolved from the effective POM. U03 changes no Java code, so this is inherited risk rather than unit risk.

## Evidence Boundary

Every version above is manifest and build-scan evidence, not runtime evidence: no dependency installation, effective-POM export, lockfile audit, container image inspection, or runtime version command was executed for this scan. Per NFR-011 that distinction is preserved rather than smoothed over — "manifest-defined" means the dependency was found but an exact stable version was not, and it is not filled in with a plausible number here.
