# Functional Design Questions - U03 Charge Agreements Operational Uplift

## Source and Authority Alignment

This U03 question set consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus the approved Charge uplift and the W2-03/W3-01 authority available in this workspace. Binding precedence is approved W4 requirements/security/accessibility, LinerCore MASTER and `@erp/ui`, `charge-and-agreements.md`, the reviewed Charge uplift, then advisory UI/UX Pro Max output. The advisory table responsiveness, visible focus, persistent labels, announced errors, and reduced motion are retained. Marketing gateway/hero composition, new palette/fonts, charts/KPIs, spinner-only loading, generic bulk actions, Server Actions that bypass the BFF, and any shell/theme/shared-component fork are rejected.

Indexed source confirms that Agreement/rate/manual-evidence and lifecycle routes exist, the current Agreement list uses `lifecycle` and omits approved query keys, the bounded `proxyReferenceOptions` seam exists, and commands derive replay keys when a validated client request ID is present. No `listApprovalCandidates` implementation resolves. The program backlog says W3-01 is ready to start, not closed; therefore D&D provider evidence is not treated as available.

## Read and Domain Questions

### Q1. What is the canonical Agreement list workflow and query contract?

A. Canonical URL -> current session -> `charge-agreements:read` -> reject duplicate/unknown/malformed keys before Charge provider access -> accept only `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, `includeInactive`, one-based page and size 25/50/100 -> explicitly adapt `status` to the verified provider vocabulary -> fixed agreement-number then ID order -> typed page VM; generic `q`, origin/destination/equipment filters and selectable sort remain absent (recommended)
B. Keep the current `lifecycle` UI contract and silently ignore missing W4 keys
C. Forward every browser query key and let the provider decide
D. Fetch broadly and filter/sort in the browser
X. Other (please specify)

[Answer]: A - Strict BFF query contract (Recommended) - 2026-08-10T19:47:12Z - **Mode:** guided - User response: `A. Strict BFF query contract (Rec)`

### Q2. Which entities and boundary state should U03 add?

A. Add no new persistence or shared aggregate; retain provider-owned Agreement, AgreementVersion, immutable RateVersion links, activity/history, and manual-pricing evidence, while adding only typed list/detail/tab/action/reconciliation VMs and transient form/dialog state in the Charge BFF/UI (recommended)
B. Mirror Agreements and rate versions in a new BFF database
C. Create a generic cross-domain commercial aggregate
D. Persist capabilities and drafts in browser storage
X. Other (please specify)

[Answer]: A - No new persistence or shared aggregate; typed VMs only (Recommended) - 2026-08-10T19:47:12Z - **Mode:** guided - User response: `A. No new persistence, VMs only (Rec)`

### Q3. How should Charge resolve Reference options?

A. Use only the approved `ChargeReferenceOptionsPort`: exact `/charge-agreements/api/reference-options` query with one `domain`, one `kind`, optional bounded `q`; current-request Charge read capability; service credential/correlation; active Reference page 0/size 50; at most 50 typed options; invalid/denied/unavailable/empty remain distinct. Read surfaces may retain safe raw IDs with “Label unavailable,” but create/edit/bind actions requiring canonical validation remain unavailable when options cannot be verified; no app import, shared SQL, cache authority, or broad merge (recommended)
B. Import Reference React/components and data helpers into Charge
C. Query the Reference database directly
D. Accept arbitrary user labels as canonical IDs
X. Other (please specify)

[Answer]: A - Bounded `ChargeReferenceOptionsPort` only (Recommended) - 2026-08-10T19:47:12Z - **Mode:** guided - User response: `A. Bounded ChargeReferenceOptionsPort (Rec)`

### Q4. What is authoritative Agreement detail and tab behavior?

A. Stable detail exposes Summary, exact bound RateVersion evidence, D&D, and Status history from provider truth; current Agreement/version/row version remain distinct, and rate links always target exact immutable provider IDs. Because W3-01 is not closed or merged, D&D renders the honest not-integrated/BLOCKED state with no fabricated rules or values. Agreement-to-Booking stays unavailable without exact Booking IDs, and `agreementVersionId` is never treated as `agreementId` (recommended)
B. Derive D&D from existing rate rows
C. Link the newest approved rate instead of the bound version
D. Reverse-search Booking by customer/lane labels
X. Other (please specify)

[Answer]: A - Provider truth with honest not-integrated/BLOCKED D&D (Recommended) - 2026-08-10T19:47:12Z - **Mode:** guided - User response: `A. Provider truth, honest BLOCKED D&D (Rec)`

## Commands and Recovery Questions

### Q5. How should create, edit, successor, approve, suspend, and expire work?

A. Each command reauthorizes its exact capability, validates provider lifecycle/preconditions, carries current Agreement/version/row-version evidence and a server-derived replay key from a bounded client request ID, prevents duplicate submission, shows a consequence-specific confirmation/reason where required, preserves immutable approved history, creates successor as a new Draft, and performs an authoritative detail re-read before confirmed success (recommended)
B. Infer action legality from client role labels and visible buttons
C. Mutate an approved version in place
D. Optimistically advance lifecycle before provider acceptance
X. Other (please specify)

[Answer]: A - Reauthorized commands with version/replay evidence and authoritative re-read (Recommended) - 2026-08-10T19:49:10Z - **Mode:** guided - User response: `A. Reauthorize + version evidence (Rec)`

### Q6. How should Charge mutation outcomes map?

A. Define one exhaustive Charge-local result/transport union for accepted-confirmed, accepted-unconfirmed, validation, conflict/stale, denied, not-found, unavailable-known-no-mutation, unavailable-unknown-outcome, and unexpected/protocol failure. Retain form/dialog context and focus, expose only safe reference evidence, re-read before retry after uncertainty, and never announce success from the submitted command alone (recommended)
B. Treat every non-2xx response as a generic toast
C. Treat timeout as known failure and resubmit automatically
D. Close the dialog and clear state for every response
X. Other (please specify)

[Answer]: A - One exhaustive Charge-local result/transport union (Recommended) - 2026-08-10T19:49:10Z - **Mode:** guided - User response: `A. Exhaustive result union (Rec)`

### Q7. How should Approval Queue and manual-pricing evidence behave?

A. Admit Agreement and Rate queue segments independently only after their server Draft/pending filter plus bounded pagination contract tests pass; otherwise that segment is unavailable and no client merge occurs. Manual pricing requires `charge-manual-cases:read`, shows provider OPEN evidence only, and offers no resolve/close/reprice/zero-price workflow (recommended)
B. Download all Agreements/rates and build a client queue
C. Add bulk approval because it is convenient
D. Add manual amount and close actions in the UI
X. Other (please specify)

[Answer]: A - Independently contract-test-gated queue segments; read-only manual evidence (Recommended) - 2026-08-10T19:49:10Z - **Mode:** guided - User response: `A. Segment-gated on contract tests (Rec)`

### Q8. How should denied, stale, partial, and dependency failures behave?

A. Reauthorize every read/action; DENY and Identity outage stop before Charge/Reference calls. Show stale business truth only when the owning provider returns source/time under current authorization; disable freshness-dependent actions. Scope Rate/D&D/history/Reference-label failures to their regions, retain verified Agreement truth and context, use raw authorized IDs only for read fallback, and provide exact Retry ownership without fabricating completeness (recommended)
B. Cache capabilities with stale Agreement data
C. Hide the entire record if one tab or label dependency fails
D. Use browser fixtures when Charge or Reference is unavailable
X. Other (please specify)

[Answer]: A - Reauthorized, region-scoped degradation with exact Retry ownership and no fabrication (Recommended) - 2026-08-10T19:49:10Z - **Mode:** guided - User response: `A. Region-scoped, no fabrication (Rec)`

## Frontend and Evidence Questions

### Q9. What component ownership and interaction design is binding?

A. Exactly one W2-02 `PlatformShell` at the Charge root; Charge owns only module navigation, Agreement/rate/manual compositions, forms, action rail, and domain copy using shared `@erp/ui` tokens/primitives. Stable Skeletons, semantic mobile records, URL tabs, labelled overflow, persistent labels, linked error summaries, dirty protection, focus trap/restore, live announcements, and non-color states are mandatory. A narrow Charge lifecycle-dialog composition may wrap the shared Dialog for domain behavior, but missing general primitive behavior remains a W2-02 BLOCKED dependency; no local shell/theme/shared library (recommended)
B. Keep or expand Charge-local global CSS/theme and shell composition
C. Copy shared Dialog/Table/Tabs into the Charge app
D. Put Charge workflows inside `packages/ui`
X. Other (please specify)

[Answer]: A - One `PlatformShell`, Charge-owned compositions over shared `@erp/ui` only (Recommended) - 2026-08-10T19:52:00Z - **Mode:** guided - User response: `A. One PlatformShell, @erp/ui only (Rec)`

### Q10. Which U03 scenarios define completion?

A. Provider-aligned Agreement list/detail/Rates/history; exact rate-version navigation; legal lifecycle/successor success, validation, denial, policy rejection, stale conflict, duplicate submit, unknown outcome and re-read; read-only/manual evidence; Reference-option invalid/denied/empty/unavailable/cardinality; truthful D&D and queue segment unavailability; four approved Charge 308 redirects and 404 matrix; five widths/two themes, keyboard/screen-reader/reduced-motion/zoom, warmed 10-user route/BFF sample, live Compose and audit evidence are mandatory. Blocked Booking/D&D/queue capabilities remain absent, not simulated (recommended)
B. Happy-path Agreement list/detail and approval only
C. Defer recovery, accessibility, performance, and dependency failures to intent exit
D. Count static design/source inspection as live completion
X. Other (please specify)

[Answer]: A - Full live evidence bar; blocked capabilities absent, not simulated (Recommended) - 2026-08-10T19:52:00Z - **Mode:** guided - User response: `A. Full evidence bar, blockers absent (Rec)`

## Ambiguity Analysis Placeholder

After answers are recorded, they will be checked against U03 scope, actual Charge/Reference contracts, W3-01/Booking blockers, provider lifecycle/version rules, the approved Application Design, and the LinerCore ownership map. Vague or contradictory answers must be resolved before generating `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, and `frontend-components.md`.
