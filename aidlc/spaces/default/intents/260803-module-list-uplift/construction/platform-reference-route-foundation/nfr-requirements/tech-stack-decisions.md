# Technology Stack Decisions - U01 Platform and Reference Route Foundation

## Source Alignment

Per the answered Q3, this artifact records the inherited verified stack, states that U01 selects no new technology, and lists the decisions the unit does make. Evidence is the brownfield `technology-stack.md` scan; the unit's choices come from its `business-logic-model.md` and `business-rules.md`. `requirements.md` NFR-009 forbids a local theme, shell, or shared-component fork and any universal formatter or result-pattern migration; NFR-012 bounds the runtime claim to local Compose.

## No New Technology

U01 introduces **no** new language, framework, runtime, database, cache, Kafka topic, schema, infrastructure tool, build tool, test framework, third-party service, or deployable. It replaces Reference's local shell composition at the canonical root and drives one thin provider-backed read path using components that already exist. Its most consequential decision is what it refuses to build.

## Inherited Stack (verified)

| Layer | Technology | Verified version | U01 use |
| --- | --- | --- | --- |
| Frontend framework | Next.js | 15.5.21 | `/reference-data*` App Router routes and BFF handlers at the canonical base path |
| UI library | React | 18.3.1 | Reference domain composition only |
| Frontend language | TypeScript | 5.7.2 | Strict typed app and BFF code |
| Runtime validation | Zod | 3.24.1 | Route and query parsing before provider access |
| Shared UI | `@erp/ui` | workspace package | W2-02 `PlatformShell`, route registry, tokens, primitives — consumed, never forked |
| Backend language | Java | 21 | Reference service (unchanged by U01) |
| Backend framework | Spring Boot | 3.3.7 | Reference REST contracts (unchanged by U01) |
| Persistence | PostgreSQL | version not retained in scan | Reference-owned database (unchanged by U01) |
| Edge | Nginx | Compose-managed | Canonical prefix mount, URI/asset preservation, trust-header policy |
| Lint | ESLint / typescript-eslint | 9.17 / 8.19.1 | Existing flat config |
| Unit/component test | Vitest | 3.2.6 at root | Route and component tests |
| Browser test | Playwright | 1.61.1 | Live state, responsive, accessibility journeys |
| Accessibility | axe-core | manifest-defined | Automated WCAG checks |
| Workspace/build | Yarn workspaces + Turbo | 2.3.3 | Existing task orchestration |

## Decisions U01 Makes Within the Stack

| Decision | Choice | Rationale |
| --- | --- | --- |
| Shell consumption | Consume the published W2-02 `PlatformShell` and route registry; replace Reference's local shell composition | The unit exists to prove the shared contract works; a compatibility shim would prove the opposite and is explicitly prohibited |
| Blocked-dependency posture | If the required shared shell or registry behaviour is absent, U01 stays `BLOCKED` rather than shipping a local shell | A local compatibility shell would be indistinguishable from a fork once merged |
| Base path | Next `basePath=/reference-data` matching the Nginx prefix | Assets resolve under the same prefix without edge rewriting; direct refresh is an ordinary document request |
| Query parsing | Zod schema as the single allow-list boundary before provider access | One enforceable point for the invalid-query contract rather than per-handler checks |
| Paging convention | Browser one-based, converted to provider zero-based in the BFF only | Keeps the provider convention out of URLs and the browser convention out of provider calls |
| Read result modelling | The approved `ReadResult<T>` union with exhaustive mapping | Compile-time exhaustiveness rather than review-time vigilance |
| State management | Server components for reads; no client store | U01 has no mutation or draft state to hold |
| Architecture tests | Prohibit domain-app React imports, a second shell/theme, arbitrary return URLs, browser actor authority, and provider calls after DENY | The cheapest place to prevent a whole class of later regression is the first integrated route |

## Version and Compatibility Risks Touching U01

- **Shared shell release.** U01's entire premise depends on the W2-02 `PlatformShell`/registry API being published with the session, visible-routes, active-module, breadcrumbs, and children contract. This is a named blocker, not a version risk to be worked around.
- **Vitest split.** `packages/ui` declares `^2.1.8` against a root of 3.2.6; U01 composes shared UI, so the effective version must be verified rather than assumed.
- **Next.js 15 lint flow.** Older `next lint` flows are removed or de-emphasized; scripts must match the actual manifest commands.
- **Unresolved versions.** PostgreSQL, Node.js, Yarn, and browser-runtime versions were not retained in the scan; U01 asserts nothing depending on them and they are confirmed from the running stack at Build and Test.

## Evidence Boundary

Every version above is manifest and build-scan evidence, not runtime evidence: no dependency installation, effective-POM export, lockfile audit, container image inspection, or runtime version command was executed. Per NFR-011 that distinction is preserved rather than smoothed over.
