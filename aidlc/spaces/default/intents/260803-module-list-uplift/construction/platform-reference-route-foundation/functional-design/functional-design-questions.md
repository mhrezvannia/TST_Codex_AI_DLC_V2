# Functional Design Questions - U01 Platform/Reference Route Foundation

## Source and Authority Alignment

This B01/U01 question set consumes approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. UI authority is, in order: active W4-01 requirements and security/accessibility constraints; `design-system/linercore/MASTER.md`; `design-system/linercore/pages/reference-data.md`; approved `mockups.md`; then advisory ui-ux-pro-max output. The advisory data-dense master/detail, table-responsiveness, visible-focus, and announced-error guidance is retained. Marketing gateway/hero composition, new colors/fonts, spinner-first loading, generic client authority, and any local shell/theme/component fork are rejected.

The user selected `execute` for this conditional stage. These questions cover B01 only; B02-B04 do not enter Functional Design until their Bolt gates permit it.

## Workflow and Data Questions

### Q1. What is the canonical U01 read workflow?

A. Server-first sequence: canonical route -> host session -> current-request Identity decision -> strict route/query validation -> Reference BFF -> Reference service/database -> typed view model -> shared-shell render; DENY or invalid query stops before provider access (recommended)
B. Fetch provider data first, then hide it if authorization fails
C. Let the browser call Reference directly using a local actor header
D. Use client-side cached permissions and records for faster navigation
X. Other (please specify)

[Answer]: A - Server-first authorized read workflow (Recommended) - 2026-08-10T13:02:03Z - User response: `All A`

### Q2. What domain/data model should U01 introduce?

A. No new persisted domain entity; use the approved `ReferenceSetRowVm`, `ReferenceRecordRowVm`, `ReferenceRecordDetailVm`, `ReferenceRecordQuery`, `ReadResult<T>`, shell route registration, and safe-return value objects as boundary models (recommended)
B. Add a shared W4 database that mirrors Reference records
C. Persist page/session state in the BFF
D. Create a generic cross-domain `EntityRecord` model and migrate all modules to it
X. Other (please specify)

[Answer]: A - Boundary models only; no persistence (Recommended) - 2026-08-10T13:02:03Z - User response: `All A`

### Q3. How should list query and safe-return validation work?

A. URL is the authoritative UI state; accept only `setCode`, `includeInactive`, browser-one-based `page`, enumerated `size` 25/50/100, and `focus`; convert page to provider-zero-based only inside the BFF, reject `page=0`, non-enum sizes and duplicate/unknown/malformed keys before the provider, and accept only a <=2,048-character relative Reference-prefix return target (recommended; clarified by review)
B. Preserve all query parameters and return URLs supplied by the browser
C. Decode external absolute return URLs if they use HTTPS
D. Silently client-filter invalid provider results
X. Other (please specify)

[Answer]: A - Strict browser-one-based/enumerated-size URL and safe-return validation (Recommended; review clarification approved) - 2026-08-10T13:02:03Z - User responses: `All A`; `approved`

### Q4. How should read outcomes map to page behavior?

A. Exhaustively map `ok`, `invalid-query`, `not-found`, `denied`, `stale`, and `unavailable`; never flash data on denial, never fabricate last-known data, show provider source/time for authorized stale truth, and preserve safe route/focus context for retry (recommended)
B. Collapse all failures to one generic error page
C. Treat stale data as current without a timestamp
D. Redirect denied/not-found/error outcomes to the module root
X. Other (please specify)

[Answer]: A - Exhaustive typed read outcomes (Recommended) - 2026-08-10T13:02:03Z - User response: `All A`

## Frontend and Interaction Questions

### Q5. Which component ownership and hierarchy should U01 use?

A. The Reference root layout renders exactly one W2-02 `PlatformShell`; route pages render only the state boundary and feature-local Reference composition using shared primitives; missing shared behavior remains a W2-02 dependency and route-level/fallback shells are prohibited (recommended; clarified by review)
B. Copy shell and shared primitives into the Reference app
C. Render Reference pages in a standalone domain theme
D. Move Reference page composition into `packages/ui`
X. Other (please specify)

[Answer]: A - Exactly one root-layout shared shell with feature-local route composition (Recommended; review clarification approved) - 2026-08-10T13:02:03Z - User responses: `All A`; `approved`

### Q6. How should server and client component state be divided?

A. Server components/loaders own session, policy, query parsing, provider reads, and result discrimination; focused client components own only supported filter/pagination interaction, retry activation, tabs/disclosure, and focus restoration, with URL state as the durable source (recommended)
B. Make the entire page a client component with a global store
C. Store server results and permissions in browser local storage
D. Use client-side sorting/search to compensate for missing provider operations
X. Other (please specify)

[Answer]: A - Server authority with focused client interaction (Recommended) - 2026-08-10T13:02:03Z - User response: `All A`

### Q7. What responsive and accessibility behavior is binding?

A. Verify 375/390 semantic record layout, 768 labelled keyboard-reachable table overflow/stacked rail, and 1024/1440 dense table/detail layout in light/dark themes; require one h1, landmarks/skip link, ordered headings, persistent labels, visible focus, polite result announcements, non-color status, reduced motion, row-focus restoration, and no page-level overflow (recommended)
B. Test desktop only because Reference is an internal tool
C. Hide columns/actions on mobile without another access path
D. Use color alone for state to preserve density
X. Other (please specify)

[Answer]: A - Exact responsive/accessibility contract (Recommended) - 2026-08-10T13:02:03Z - User response: `All A`

### Q8. Which loading and visual rules should apply?

A. Use stable-size shared Skeletons, compact operational density, IBM Plex/shared tokens, Lucide icons only when needed, 150-250ms non-layout-shifting feedback, and collapsed technical evidence; no spinner-only blank page, new palette/font, decorative card grid, hero, gradient, or workflow ribbon (recommended)
B. Adopt the ui-ux-pro-max marketing gateway and new blue/amber palette
C. Use Fira fonts and loading spinners from the generic recommendation
D. Add a journey workflow ribbon to Reference Data
X. Other (please specify)

[Answer]: A - LinerCore visual/loading rules (Recommended) - 2026-08-10T13:02:03Z - User response: `All A`

## Integration and Scenario Questions

### Q9. How should platform/provider integration blockers behave?

A. If the published W2-02 shell/registry/session primitive, exact edge header policy, Identity fixture, or required Reference provider path is unavailable, B01 remains BLOCKED; direct refresh/assets/session and eleven-header-clear/five-header-replacement evidence must be executable, with no local workaround (recommended)
B. Implement temporary local shell/auth/header behavior
C. Mark design evidence as a runtime pass
D. Skip the affected integrated checks and continue to B02
X. Other (please specify)

[Answer]: A - Hard platform/provider blockers; no workaround (Recommended) - 2026-08-10T13:02:03Z - User response: `All A`

### Q10. Which B01 business scenarios define completion?

A. One permitted Reference set -> record list -> stable detail -> validated Back/focus path plus fresh direct refresh; denied/read-only, invalid-query, unsafe-return, true-empty, provider-unavailable, target-scoped app failure, five-width/two-theme, warmed 10-user p95, manager guard, and both-audit scenarios are mandatory (recommended)
B. Happy-path list rendering only
C. Static screenshots and unit tests are sufficient
D. Defer denied/error/responsive/performance/audit scenarios to the final intent gate
X. Other (please specify)

[Answer]: A - Complete live B01 scenario matrix (Recommended) - 2026-08-10T13:02:03Z - User response: `All A`

## Ambiguity Analysis Placeholder

After answers are recorded, they will be checked against the U01 boundary, U02 deferral, B01 entry dependencies, application contracts, and UI authority map. Any contradiction or vague answer will be resolved before `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, and `frontend-components.md` are generated.

## Ambiguity Analysis

The ten answers are mutually consistent. They introduce no new persistence or business capability, keep U02 mutation/degradation depth deferred, preserve W2-02 and Reference ownership, use one server-authoritative workflow and exhaustive typed results, and make missing platform/provider/runtime evidence a hard B01 blocker. No follow-up question is required.
