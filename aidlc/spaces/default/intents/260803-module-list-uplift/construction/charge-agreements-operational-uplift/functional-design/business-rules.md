# Business Rules - U03 Charge Agreements Operational Uplift

## Source Alignment

These rules implement U03 in `unit-of-work.md` and its US-007 through US-010 and US-015 allocation in `unit-of-work-story-map.md` against `requirements.md`, while refining `components.md`, `component-methods.md`, and `services.md`. Higher UI authority remains the approved W4 security and accessibility contract, LinerCore MASTER and `@erp/ui`, the `charge-and-agreements.md` page contract, and the reviewed Charge uplift. Every rule below is an invariant a contract, component, or live test can falsify.

## Authorization and Trust Rules

| Rule | Invariant |
| --- | --- |
| BR3-001 | Every read, command, retry, reconcile, and post-command re-read evaluates the current authenticated request through Identity. |
| BR3-002 | `charge-agreements:read`, `:create`, `:update`, `:approve`, `:create-successor`, `:suspend`, `:expire`, `charge-rates:*`, and `charge-manual-cases:read` are distinct capabilities. A prior page decision, a visible button, or a browser role label is never command authority. |
| BR3-003 | DENY and Identity outage terminate before any Charge or Reference provider access; Identity outage maps to retryable `unavailable` / HTTP 503 with zero provider calls and no data flash. |
| BR3-004 | Browser-supplied actor, capability, service credential, correlation authority, replay key, and provider version are ignored or rejected at the BFF boundary. |
| BR3-005 | Charge Reader sees the same provider truth as Pricing Analyst with mutation and case-resolution commands absent and a concise explanation — not disabled controls. |
| BR3-006 | The BFF's Reference option call uses the existing fixed Charge service credential and trusted correlation; it never forwards or borrows browser authority. |

## Route, Query, and Read Rules

| Rule | Invariant |
| --- | --- |
| BR3-010 | Canonical routes are `/charge-agreements`, `/charge-agreements/[agreementId]`, and the approved task/rate/queue/manual children; detail resolves by stable `agreementId` only. |
| BR3-011 | The Agreement list accepts exactly `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, `includeInactive`, one-based `page`, `size` in {25, 50, 100}, and bounded `focus`. |
| BR3-012 | Duplicate, unknown, malformed, or overlong query keys return `invalid-query` / HTTP 400 before any provider access. |
| BR3-013 | `status` is adapted to the verified provider vocabulary by an explicit contract-tested BFF mapping; the current `lifecycle` key is corrected, never silently aliased, and no browser value reaches the provider unmapped. |
| BR3-014 | Generic `q`, origin/destination/equipment Agreement filters, user-selectable sort, client-side filtering, client-side sorting, and client page merging are absent at every layer. |
| BR3-015 | Provider order is fixed at agreement number ascending then ID ascending, and is described as plain explanatory text; counts render only from provider total evidence. |
| BR3-016 | Browser paging is one-based; only the BFF converts to provider zero-based paging. Changing a filter or size returns to page 1. |
| BR3-017 | Rate Authority reads admit only provider `q`, `category`, `lifecycle`, `asOf`, `originId`, `destinationId`, `equipmentTypeId`, `page`, and `size`; manual pricing admits only `reasonCode`, `bookingRef`, `openedFrom`, `openedTo`, `page`, and size 25. |
| BR3-018 | A trustworthy stale value requires current authorization plus provider-owned source and `dataUpdatedAt`; freshness-dependent commands are disabled with a precise reason. |

## Identity, Version, and Relationship Rules

| Rule | Invariant |
| --- | --- |
| BR3-020 | Current Agreement ID, current version, and row version are three distinct values; none is ever substituted for another. |
| BR3-021 | `agreementVersionId` is never treated as `agreementId`, and no route of the form `/charge-agreements/[agreementVersionId]` is constructed. |
| BR3-022 | Rate links target the exact immutable provider rate ID and version bound to the Agreement version being viewed; a newer current rate is never substituted. |
| BR3-023 | Agreement-to-Booking and Booking-to-Agreement remain absent — no link, no disabled placeholder, no label-, customer-, or lane-derived reverse search — until their `requirements.md` Cross-Link Direction Matrix exit conditions are approved and evidenced. |
| BR3-024 | Approved Agreement and rate versions are immutable; history is never rewritten, reopened, or edited in place. |
| BR3-025 | D&D content is provider-owned. While W3-01 is open, the D&D region renders the honest not-integrated/BLOCKED state with owner and evidence path; no rule, term, or value is derived from rate rows or any other surface. |

## Command and Concurrency Rules

| Rule | Invariant |
| --- | --- |
| BR3-030 | The only U03 commands are create, edit Draft, create successor, approve, suspend, and expire. Manual-case resolution, repricing, zero-price, bulk approval, and generic bulk actions do not exist in any state. |
| BR3-031 | Each command reauthorizes its own exact capability for the current request and validates the provider's lifecycle preconditions before dispatch. |
| BR3-032 | Each command carries the exact Agreement ID, the version read with the draft, and the row version; constants, latest-version substitution, and client-generated versions are rejected. |
| BR3-033 | The replay key is derived server-side from a bounded validated client request ID; the browser never supplies the replay key. |
| BR3-034 | Only the submitting command is disabled while pending, and duplicate activation produces no second provider request. |
| BR3-035 | `createSuccessor` always produces a new Draft; no approved version is mutated in place and no lifecycle advances optimistically before provider acceptance. |
| BR3-036 | Approve, suspend, and expire present a consequence-specific confirmation, capturing a reason where the provider requires one, before dispatch. |
| BR3-037 | Every accepted provider mutation is followed by an authoritative detail re-read; submitted input alone never becomes success truth and success is never announced from the submitted command. |
| BR3-038 | Every command retry reauthorizes and revalidates, and reuses the original server-derived replay key so the provider's idempotency makes it duplicate-safe. |

## Result and Recovery Rules

| Rule | Invariant |
| --- | --- |
| BR3-040 | Mutation reduction is exhaustive across `accepted-confirmed`, `accepted-unconfirmed`, `validation`, `conflict`, `denied`, `not-found`, `unavailable-known-no-mutation`, `unavailable-unknown-outcome`, and `unexpected`. |
| BR3-041 | `validation`, `conflict`, `denied`, both `unavailable` branches, and `unexpected` retain recoverable form and dialog values, tab and list context, and logical focus. |
| BR3-042 | Unknown outcome is neither success nor known failure; it always requires an authoritative re-read before any retry, and never advances lifecycle. |
| BR3-043 | Provider acceptance with a failed confirmation re-read is announced as accepted-with-confirmation-unavailable, never as confirmed detail. |
| BR3-044 | Only safe reference evidence — correlation, provider reference, version — is primary; raw transport, payload, and schema evidence stays collapsed and access-appropriate. |
| BR3-045 | Retry is user-triggered and scoped to the failed read, region, or command; no uncertain command is replayed automatically and no read is auto-refreshed into a claim of freshness. |
| BR3-046 | A separately sourced region failure — a bound rate version, a Reference label, or the D&D region — never blanks the record; verified Agreement truth, the selected tab, and return context are retained, and the Retry names its exact owner. |
| BR3-047 | Status history is delivered atomically with Summary by the single `getAgreement` read and shares its read result; U03 claims no independent history failure state and adds no independent history endpoint. Incomplete or absent provider `activity` evidence is reported as a provider-signalled partial-history condition inside an otherwise authoritative detail. |

## Reference Option Rules

| Rule | Invariant |
| --- | --- |
| BR3-050 | Reference options resolve only through `ChargeReferenceOptionsPort`; no Reference React component, data helper, database query, or shared SQL is used. |
| BR3-051 | The browser request carries exactly one `domain`, one `kind`, and at most one trimmed `q` of at most 128 characters; duplicate or unknown keys return `invalid-query` / HTTP 400 with no provider call. |
| BR3-052 | The provider call is bounded to active records at page 0, size 50, and returns at most 50 typed options; there is no cache authority and no broad merge. |
| BR3-053 | `invalid-query`, `denied`, `unavailable`, and successful-empty remain four distinct outcomes and are never collapsed into one message. |
| BR3-054 | Read surfaces may show safe raw authorized IDs with `Label unavailable`; arbitrary user labels are never accepted as canonical IDs. |
| BR3-055 | Create, edit, and bind actions that require canonical validation are unavailable with a precise reason whenever options cannot be verified. |

## Approval Queue and Manual Evidence Rules

| Rule | Invariant |
| --- | --- |
| BR3-060 | The Agreement and Rate queue segments are admitted independently, each only after its own server Draft/pending filter, bounded pagination contract test, and exact read capability are evidenced. |
| BR3-061 | An unadmitted segment renders unavailable with owner and evidence path; the browser never downloads broad sets, merges, filters, or paginates them client-side. |
| BR3-062 | Manual-pricing evidence requires `charge-manual-cases:read`, shows provider OPEN evidence in provider order only, and exposes no resolve, close, assign, reprice, manual-amount, or approval control. |
| BR3-063 | `MANUAL_PRICING_REQUIRED` remains evidence; it is never rendered as a zero price or converted into a workflow. |

## Navigation, Focus, and Dirty-State Rules

| Rule | Invariant |
| --- | --- |
| BR3-070 | `returnTo` stays Charge-relative, at most 2,048 decoded characters, prefix-bound, duplicate-free, and limited to the Charge allow-list `customerId,tradeLaneId,commodityId,status,validOn,includeInactive,page,size,focus`. |
| BR3-071 | Schemes, hosts, protocol-relative paths, backslashes, control characters, encoded separators, and traversal segments are rejected; invalid context falls back to the canonical Charge list. |
| BR3-072 | The four approved Charge legacy paths return 308 to their canonical targets retaining only validated `returnTo` and `tab`; every other alleged legacy path returns 404, and empty, malformed, encoded-separator, or ambiguous IDs return 404. |
| BR3-073 | Tabs are URL-backed presentation state; an unsupported tab value normalizes to Summary by replace navigation without changing record identity. |
| BR3-074 | Confirmed success navigates to authoritative detail, announces the result, and focuses the detail heading or status. |
| BR3-075 | Dirty navigation requires a concise confirmation; dialogs trap and restore focus, and Escape closes only when safe. |
| BR3-076 | Validation focuses the first invalid field, conflict focuses the conflict heading, and provider error focuses the error summary while retaining the initiating context. |

## UI Ownership and Presentation Rules

| Rule | Invariant |
| --- | --- |
| BR3-080 | The Charge root layout renders exactly one W2-02-owned `PlatformShell`; route, loading, error, denied, and form states render no second or fallback shell. |
| BR3-081 | Shared tokens and Table/Tabs/Badge/Skeleton/EmptyState/StatusStrip/Field/Input/Select/Combobox/Button/Dialog primitives come from `@erp/ui`; Charge owns only module navigation, domain composition, and domain vocabulary. |
| BR3-082 | A narrow Charge lifecycle-dialog composition may wrap the shared Dialog for domain consequence copy, reason capture, and precondition summary. It may not reimplement focus trap, overlay, or dismissal semantics, and it is not a general primitive. |
| BR3-083 | A missing general shared-primitive behaviour is a W2-02 dependency and BLOCKED evidence; no local shell, theme, token set, or shared-component fork is created. |
| BR3-084 | No marketing gateway or hero composition, replacement palette or fonts, charts or KPI walls, animated badges, spinner-only loading, generic bulk actions, raw JSON editor, or Server Action bypassing the BFF appears. |
| BR3-085 | Loading uses stable-size Skeletons; status carries text and non-color meaning; hover and focus cause no layout shift. |

## Accessibility and Responsive Rules

- BR3-090: One `h1`, ordered headings, shell skip and main landmarks, native links and buttons, and persistent form and control labels are mandatory.
- BR3-091: Error summaries link to their fields, controls carry descriptions, async outcomes are announced, focus is visibly shared, and keyboard order is logical.
- BR3-092: Reduced motion is honoured; pending and result announcements are bounded and non-repetitive; status never relies on a Toast alone.
- BR3-093: 375 and 390 use semantic mobile records and one-column forms; 768 uses labelled keyboard-reachable inner overflow; 1024 and 1440 use dense table, detail, and form composition.
- BR3-094: Light and dark themes, 200% and 400% zoom, long agreement numbers and identifiers, and no page-level horizontal overflow require observed evidence.

## Persistence and Boundary Rules

U03 adds no database, cache, BFF persistence, browser-storage authority, shared table, cross-service SQL, or shared aggregate. The Charge service remains the system of record for Agreements, versions, immutable rate-version bindings, lifecycle, activity and history, and manual-pricing evidence. The Reference service remains the owner of canonical options. Identity owns policy decisions. W2-02 owns shell, session presentation, and shared UI. The Charge BFF owns request parsing, status adaptation, paging conversion, action-specific authorization, the bounded Reference option port, outcome mapping, and the authoritative re-read. The browser owns transient interaction state only.

## Rule Verification

Contract tests cover current-request policy, the provider-call prohibition on DENY and Identity outage, the exact query allow-list and duplicate/unknown-key rejection, the `status` adaptation table, one-based to zero-based paging, exact version and row-version propagation, server-derived replay keys, every result-to-HTTP mapping, the authoritative post-acceptance re-read, the bounded Reference option query/auth/cardinality/failure matrix, and independent queue-segment admission. Component and route tests cover duplicate-submit prevention, retained form and dialog context, tab normalization, dirty protection, focus, and announcements. Integrated Playwright and Compose evidence covers every read, command, and recovery state at 375, 390, 768, 1024, and 1440 CSS pixels in both themes, plus keyboard, screen-reader, reduced-motion, and zoom behaviour, the warmed ten-user route and BFF sample, the four 308 redirects and 404 matrix, manager-demo guards, and both audits.

This supplies U03 evidence for US-007, US-008, US-009, US-010, and US-015; FR-001, FR-002, FR-005, FR-006, FR-009 through FR-017, and FR-019 through FR-022; and NFR-001 through NFR-005 and NFR-009 through NFR-012. NFR-006, NFR-007, and NFR-008 receive the combined intent-exit verdict. Unsupported and blocked controls must be absent rather than simulated; static design is never PASS.
