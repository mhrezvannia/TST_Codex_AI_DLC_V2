# Technology Stack Decisions - U02 Reference Data Operational Completion

## Source Alignment

Per the answered Q3, this artifact records the inherited verified stack, states that U02 selects no new technology, and lists the decisions the unit does make. Evidence is the brownfield `technology-stack.md` scan; the unit's choices come from its `business-logic-model.md` and `business-rules.md`. `requirements.md` NFR-009 forbids a local theme, shell, or shared-component fork and any universal formatter or result-pattern migration; NFR-012 bounds the runtime claim to local Compose.

## No New Technology

U02 introduces **no** new language, framework, runtime, database, cache, Kafka topic, schema, infrastructure tool, build tool, test framework, third-party service, or deployable. It extends existing Reference routes, BFF seams, and provider contracts additively and preserves Reference-owned persistence.

One decision is explicitly a *removal* of proposed technology: an earlier design introduced a runtime provider field-schema endpoint and a mutation `schemaVersion`. Both were withdrawn in favour of compile-time catalogs held to an executable fixture — a smaller surface with no new runtime contract.

## Inherited Stack (verified)

| Layer | Technology | Verified version | U02 use |
| --- | --- | --- | --- |
| Frontend framework | Next.js | 15.5.21 | Reference routes including `new` and `edit` child routes, and BFF handlers |
| UI library | React | 18.3.1 | Reference domain composition and form |
| Frontend language | TypeScript | 5.7.2 | Strict typed app and BFF code |
| Runtime validation | Zod | 3.24.1 | Query parsing, command body validation, V1 attribute allow-listing |
| Shared UI | `@erp/ui` | workspace package | `PlatformShell`, Field/Input/Select/Combobox/Button/StatusStrip/Dialog/Skeleton; no fork (NFR-009) |
| Client state | Zustand | 5.0.2 (present in Reference Data) | Available in this app; used only if focused draft state needs it beyond component state |
| Server-state | TanStack Query | 5.62.7 (present in Reference Data) | Available; U02's authoritative reads are server-side, so it is not required |
| Backend language | Java | 21 | Reference service validator and controller |
| Backend framework | Spring Boot | 3.3.7 | Existing Reference REST contracts |
| Persistence | PostgreSQL | version not retained in scan | Reference-owned database; `Map<String,String>` attribute shape retained |
| Lint | ESLint / typescript-eslint | 9.17 / 8.19.1 | Existing flat config |
| Unit/component test | Vitest | 3.2.6 at root | Route, reducer, form, and component tests |
| Browser test | Playwright | 1.61.1 | Live mutation, recovery, responsive, accessibility journeys |
| Accessibility | axe-core | manifest-defined | Automated WCAG checks |
| Workspace/build | Yarn workspaces + Turbo | 2.3.3 | Existing task orchestration |

## Decisions U02 Makes Within the Stack

| Decision | Choice | Rationale |
| --- | --- | --- |
| Form schema | Compile-time `ReferenceFormCatalogV1` (BFF) and `ReferenceFieldCatalogV1` (provider), proven equal by one executable fixture | Removes a runtime schema endpoint that does not exist in source; drift becomes a build-time test failure rather than a runtime surprise |
| Create transport | Browser-facing POST, BFF-generated UUID, existing provider PUT-by-ID with `version=0` | Uses a seam that already exists in the provider rather than adding an idempotency API; gives the create a stable identity before dispatch, which is what makes unknown-outcome recovery possible |
| Update concurrency | The exact provider version read with the draft | Corrects the current hard-coded `version=1`; the correction is the unit's central integrity fix |
| Result modelling | A Reference-local discriminated union with exhaustive switch | Upstream `MutationResult<T>` cannot express known-acceptance-without-authoritative-value; local scope changes no other domain |
| Attribute persistence | Retain the provider's existing `Map<String,String>` shape | A remodel would be a provider-wide migration for no unit need |
| State management | Server components for authoritative reads; transient client state for draft, dirty, pending, dialog, and focus only | Matches the App Router pattern; keeps provider truth off the client |
| Validation split | Client validation advisory; BFF re-validates; provider remains authoritative for uniqueness, related-record activity, and cross-field rules | Client checks improve feedback without becoming an authority the server does not re-check |

## Version and Compatibility Risks Touching U02

- **Vitest split.** `packages/ui` declares `^2.1.8` against a root of 3.2.6. U02 has the largest component and form test surface of the Reference units, so a resolution mismatch bites here first and must be verified rather than assumed.
- **Next.js 15 lint flow.** Older `next lint` flows are removed or de-emphasized; scripts must match the actual manifest commands.
- **Zod version pinning.** U02 leans on Zod for the V1 allow-list at both the query and command boundaries; the pinned 3.24.1 behaviour for unknown-key stripping versus rejection must be explicit, since "strip" and "reject" differ in exactly the way BR2-021 cares about.
- **Unresolved versions.** PostgreSQL, Node.js, Yarn, and browser-runtime versions were not retained in the scan; confirmed from the running stack at Build and Test.
- **Spring transitives.** Not exhaustively resolved from the effective POM. U02 does change the provider validator, so this is genuine unit risk rather than inherited risk.

## Evidence Boundary

Every version above is manifest and build-scan evidence, not runtime evidence: no dependency installation, effective-POM export, lockfile audit, container image inspection, or runtime version command was executed. Per NFR-011 that distinction is preserved rather than smoothed over.
