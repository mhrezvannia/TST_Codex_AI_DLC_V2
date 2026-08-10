# Business Rules - U02 Reference Data Operational Completion

## Source Alignment

These rules implement U02 `unit-of-work.md` and `unit-of-work-story-map.md` against `requirements.md`, while refining `components.md`, `component-methods.md`, and `services.md` and preserving U01 Functional Design. Higher UI authority remains the W4 security/accessibility contract, LinerCore MASTER, Reference page contract, and approved Reference uplift.

## Authorization and Trust Rules

| Rule | Invariant |
| --- | --- |
| BR2-001 | Every read, create, update, retry, reconcile, and post-command re-read evaluates the current authenticated request through Identity. |
| BR2-002 | Read, create, and update are distinct capabilities; a prior page decision or visible button is never command authority. |
| BR2-003 | DENY and Identity unavailable terminate before Reference provider access; Identity outage maps to retryable unavailable/503 with zero provider calls. |
| BR2-004 | Browser actor, capability, service credential, correlation authority, and provider version authority are ignored or rejected. |
| BR2-005 | Read-only users retain authorized provider truth; create/update commands are absent with a concise explanation. |

## Route, Query, and Read Rules

| Rule | Invariant |
| --- | --- |
| BR2-010 | Canonical routes use exact provider `setCode` and `recordId`; create/edit use focused child routes and direct refresh. |
| BR2-011 | Record list accepts only `includeInactive`, one-based page, size 25/50/100, and bounded focus; provider order remains fixed. |
| BR2-012 | Duplicate, unknown, malformed, or overlong query keys yield `invalid-query` before provider access. |
| BR2-013 | Search, selectable sort, client filtering, and client page merging are absent. |
| BR2-014 | History failure is scoped to History when Summary/Attributes remain trustworthy; it does not blank the entire record. |
| BR2-015 | A trustworthy stale value requires current authorization plus provider-owned source/time metadata. |

## Form Schema and Validation Rules

| Rule | Invariant |
| --- | --- |
| BR2-020 | The BFF `ReferenceFormCatalogV1` and provider `ReferenceFieldCatalogV1` must match one executable producer/consumer fixture; U02 adds no runtime schema endpoint or mutation schema version. |
| BR2-021 | The BFF/browser render only V1-approved attributes; arbitrary JSON and raw attribute editors are prohibited. Existing records with uncatalogued keys stay readable but cannot be edited until covered. |
| BR2-022 | Unknown attributes, invalid discriminators/types/formats, and catalog-fixture drift fail closed before persistence. |
| BR2-023 | Labels remain persistent; issues have stable field paths and are linked from the error summary and affected controls. |
| BR2-024 | Client validation is advisory feedback; the BFF repeats the source-aligned base/V1 catalog rules and the provider rejects unknown keys before its domain/cross-record validation. |
| BR2-025 | Only current BFF base normalization applies: trim code/displayName/reason within 2-32/2-120/0-240 limits. Missing required attribute values are never invented. |

## Mutation and Concurrency Rules

| Rule | Invariant |
| --- | --- |
| BR2-030 | Create and update are the only U02 mutation controls. Validate, deactivate, and reactivate remain absent and BLOCKED. |
| BR2-031 | Update carries the exact provider version read with the draft; constants, latest-version substitution, and client-generated versions are forbidden. |
| BR2-032 | Version mismatch retains draft values and focus and requires explicit authoritative reconciliation. |
| BR2-033 | There is no last-write-wins, automatic merge, automatic resubmit, or implicit update-to-create behavior. |
| BR2-034 | Only the submitting command is disabled while pending; duplicate activation produces no second provider request. |
| BR2-035 | Every command retry reauthorizes and revalidates. |
| BR2-036 | Accepted provider mutation is followed by `getRecord`; submitted input alone never becomes success truth. |
| BR2-037 | Browser create remains POST, but the BFF generates one UUID attempt ID before dispatch and invokes the existing provider PUT-by-ID create behavior with `version=0`; browser update never exposes zero-version create. |
| BR2-038 | A create retry reuses the same attempt ID only after authoritative terminal 404; same-ID match is success, mismatch is conflict/support, and provider conflict always causes exact-ID re-read. |

## Result and Recovery Rules

| Rule | Invariant |
| --- | --- |
| BR2-040 | Mutation reduction is exhaustive: accepted-confirmed, accepted-unconfirmed, validation, conflict, denied, not-found, unavailable-known, unavailable-unknown, and unexpected. |
| BR2-041 | Validation/conflict/denied/unavailable/unexpected retain recoverable draft values and logical focus. |
| BR2-042 | Unknown outcome is neither success nor known failure and always requires authoritative re-read before retry. |
| BR2-043 | Create unknown-outcome recovery uses the pre-dispatch attempt ID; it cannot resubmit until exact-ID read establishes terminal absence, and retry remains explicit. |
| BR2-044 | Safe user text and correlation/reference evidence are primary; raw transport/payload evidence stays collapsed and access-appropriate. |
| BR2-045 | Provider acceptance with failed confirmation re-read is announced as persisted-but-unconfirmed, never as fully confirmed detail. |
| BR2-046 | Retry is user-triggered and scoped to the failed read/facet/command; it does not replay an uncertain command blindly. |

## Navigation, Focus, and Dirty-State Rules

| Rule | Invariant |
| --- | --- |
| BR2-050 | `returnTo` remains Reference-relative, <=2,048 decoded characters, prefix-bound, duplicate-free, and query allow-listed. |
| BR2-051 | Success navigates to authoritative stable detail, announces result, and focuses the detail heading/status. |
| BR2-052 | Back/Cancel preserve validated list/tab context and browser history; invalid context falls back to the canonical set/list. |
| BR2-053 | Dirty navigation requires concise confirmation. Dialog focus traps/restores; Escape closes only when safe. |
| BR2-054 | Validation focuses the first invalid field; conflict focuses its heading; provider error focuses the error summary while retaining the initiating context. |

## UI Ownership and Presentation Rules

| Rule | Invariant |
| --- | --- |
| BR2-060 | `ReferenceRootLayout` renders exactly one W2-02-owned `PlatformShell`; route, loading, error, and form states render no second/fallback shell. |
| BR2-061 | Shared tokens and Input/Select/Combobox/Button/StatusStrip/Dialog/Skeleton primitives come from `@erp/ui`; Reference owns only domain composition and vocabulary. |
| BR2-062 | A missing shared primitive is a W2-02 dependency and BLOCKED evidence; no local theme or shared-component fork is allowed. |
| BR2-063 | No workflow ribbon, hero, marketing gateway, replacement palette/font, animated badge, chart wall, spinner-only page, or raw JSON editor appears. |
| BR2-064 | Status includes text/non-color meaning; technical evidence is secondary; hover/focus causes no layout shift. |

## Accessibility and Responsive Rules

- BR2-070: One h1, ordered headings, skip/main landmarks, native links/buttons, and persistent form/control labels are mandatory.
- BR2-071: Error summary links, field descriptions, async announcements, visible shared focus, and logical keyboard order are mandatory.
- BR2-072: Reduced motion is honored; pending and result announcements are bounded and non-repetitive.
- BR2-073: 375/390 use semantic records and one-column forms; 768 uses labelled keyboard-reachable inner overflow; 1024/1440 use dense table/detail/form composition.
- BR2-074: Light/dark, 200%/400% zoom, long identifiers, and no page-level overflow require observed evidence.

## Persistence and Boundary Rules

U02 adds no draft database, cache, local storage authority, shared table, or cross-service SQL. The Reference service owns records, versions, validation, history, and outbox evidence. The BFF owns request parsing, action-specific authorization, its V1 form catalog, outcome mapping, and authoritative re-read. The BFF-generated create attempt ID is the provider record identity, not a persisted idempotency record. Browser state is transient interaction state only.

## Rule Verification

Contract tests cover current-request policy, provider-call prohibition, exact V1 producer/consumer fixture parity, unknown-key rejection, body/query allow-lists, actual expected version, stable-ID create, all result/HTTP mappings, and authoritative re-read. Component/route tests cover duplicate prevention, draft retention, dirty protection, focus, and announcements. Integrated Playwright/Compose evidence covers every read/mutation/recovery state at 375, 390, 768, 1024, and 1440 in both themes, plus keyboard/screen-reader/reduced-motion/zoom, the warmed route/BFF sample, manager guards, and audit gates. This supplies U02 evidence for US-003-US-006, FR-001-FR-004, FR-009-FR-013, FR-015-FR-017, FR-019-FR-022, and NFR-001-NFR-005/NFR-009-NFR-012; NFR-006-NFR-008 receive the combined intent-exit verdict. Unsupported actions must be absent; static design is not PASS.
