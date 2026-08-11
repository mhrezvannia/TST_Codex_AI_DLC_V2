# Technology Stack Decisions - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

Per the answered Q3, this artifact records the inherited verified stack, states what U04 does and does not introduce, and lists the decisions the unit makes within that stack. Evidence is the brownfield `technology-stack.md` scan; the unit's choices come from `business-logic-model.md` and `business-rules.md`. `requirements.md` NFR-009 forbids a local theme, shell, or shared-component fork, and NFR-012 bounds the runtime claim to local Compose.

U04 is the **only** W4-01 unit that adds a deployable. That makes the distinction between "new deployable" and "new technology" the central statement here.

## New Deployable, No New Technology

U04 creates `apps/container-movement` — a new Next.js application, image, Compose service, and Nginx prefix mount. It introduces **no** new language, framework, runtime, database, cache, Kafka topic, Avro schema, schema-registry subject, infrastructure tool, build tool, test framework, or third-party service. The new app is assembled entirely from the stack the other three apps already use.

Two additive **contracts** are introduced (distinct from technology): the CMM v2 media types on existing endpoints, and `CmmReferenceLocationsPort`. Both are additive to existing services over existing HTTP, require producer/consumer sign-off, and add no component to the topology.

## Inherited Stack (verified)

| Layer | Technology | Verified version | U04 use |
| --- | --- | --- | --- |
| Frontend framework | Next.js | 15.5.21 | New app with `basePath=/container-movement`; App Router routes and BFF handlers |
| UI library | React | 18.3.1 | Journey domain composition |
| Frontend language | TypeScript | 5.7.2 | Strict typed app and BFF code |
| Runtime validation | Zod | 3.24.1 | `limit` allow-list, capture body validation, v2 response schemas |
| Shared UI | `@erp/ui` | workspace package | `PlatformShell` from first render; tokens and primitives; no fork (NFR-009) |
| Backend language | Java | 21 | CMM service v2 controller and `timelineV1` projection |
| Backend framework | Spring Boot | 3.3.7 | v2 media negotiation and assertion verification |
| Persistence | PostgreSQL | version not retained in scan | CMM-owned database (no schema owned by U04) |
| Messaging | Spring Kafka | build-managed | Existing consumers/publishers only — no new topic |
| Schema format | Apache Avro | 1.11.4 | Existing `booking.confirmed` and `containermovement.status` contracts, unchanged |
| Schema registry | Confluent Platform | 7.7.1 | Existing subjects, unchanged |
| Lint | ESLint / typescript-eslint | 9.17 / 8.19.1 | Existing flat config, extended to the new app |
| Unit/component test | Vitest | 3.2.6 at root | Route, reducer, and component tests |
| Browser test | Playwright | 1.61.1 | Live state, responsive, accessibility journeys |
| Accessibility | axe-core | manifest-defined | Automated WCAG checks |
| Workspace/build | Yarn workspaces + Turbo | 2.3.3 | New app joins the existing workspace and task graph |

## Decisions U04 Makes Within the Stack

| Decision | Choice | Rationale |
| --- | --- | --- |
| App topology | A separate Next.js deployable rather than routes inside `apps/shell` | Matches the established per-domain app pattern and keeps CMM's BFF and view models feature-local (`services.md`); folding it into the shell would put domain data logic in the platform owner |
| Base path | `basePath=/container-movement` matching the Nginx prefix | Assets resolve under the same prefix without edge rewriting; direct refresh is an ordinary document request |
| Shell consumption | W2-02 `PlatformShell` from first implementation | A new app is the easiest place to accidentally grow a local shell; consuming the shared one from the first render forecloses it |
| Subject assertion | Reuse the existing Charge HMAC assertion pattern with a dedicated CMM key | A proven in-repo pattern rather than a new mechanism; a dedicated key limits blast radius |
| Idempotency | Server-issued signed attempt token carrying a server-generated key | Keeps the key out of the browser entirely, which a client-generated key cannot do |
| Timeline ownership | Computed in the CMM service, rendered verbatim downstream | Puts the merge rules where the data and its tests live; a BFF implementation would need the same rules duplicated and could drift |
| Client data libraries | None added | Reads are server-side; TanStack Query and Zustand exist in Reference Data but would be new dependencies here for no unit need |
| State management | Server components for authoritative reads; client state only for draft, dirty, pending, and focus | Matches the existing App Router pattern |

## Version and Compatibility Risks Touching U04

- **Vitest split.** `packages/ui` declares `^2.1.8` against a root of 3.2.6. A brand-new app joining the workspace is exactly where a resolution mismatch surfaces first; the effective version must be verified rather than assumed.
- **Next.js 15 lint flow.** Older `next lint` flows are removed or de-emphasized. The new app's scripts must be written against the actual manifest commands rather than copied from an older app's assumptions.
- **New app in the Turbo graph.** Task wiring, caching keys, and the coverage-measurement set (NFR-006) must all include the new package; a new app silently missing from the changed-code set would understate coverage.
- **Unresolved versions.** PostgreSQL, Kafka broker, Node.js, Yarn, and browser-runtime versions were not retained in the scan. The new app's container image pins a Node version that must be recorded from the running stack at Build and Test, not inferred here.
- **Spring transitives.** Not exhaustively resolved from the effective POM. U04 does change Java code (the v2 controller and projection), so this is genuine unit risk rather than inherited risk — unlike U03.

## Evidence Boundary

Every version above is manifest and build-scan evidence, not runtime evidence: no dependency installation, effective-POM export, lockfile audit, container image inspection, or runtime version command was executed. Per NFR-011 that distinction is preserved rather than smoothed over.
