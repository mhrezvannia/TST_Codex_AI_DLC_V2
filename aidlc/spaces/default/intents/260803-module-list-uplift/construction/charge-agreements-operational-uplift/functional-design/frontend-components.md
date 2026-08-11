# Frontend Components - U03 Charge Agreements Operational Uplift

## Source Alignment and UI Authority

This UI design implements U03 in `unit-of-work.md`, its US-007 through US-010 and US-015 allocation in `unit-of-work-story-map.md`, and `requirements.md`, refining `components.md`, `component-methods.md`, and `services.md`. Authority order is approved W4 scope and requirements, the security and accessibility contract, LinerCore MASTER and executable `@erp/ui`, the `charge-and-agreements.md` page contract, the reviewed Charge uplift, then advisory UI/UX Pro Max output.

The advisory input contributes table responsiveness, visible focus, persistent labels, announced errors, and reduced motion; those are retained. Its marketing gateway and hero composition, replacement palette and fonts, charts and KPI walls, spinner-only loading, generic bulk actions, and Server Actions that bypass the BFF are rejected, as is any shell, theme, or shared-component fork.

## Ownership and Canonical Component Tree

```text
ChargeRootLayout
  PlatformShell                          [W2-02; exactly one instance]
    RouteStateBoundary
      AgreementListPage                  [US-007 full list states]
      AgreementDetailPage                [US-008 Summary/Rates/D&D/History]
        AgreementSummaryPanel
        AgreementRatesPanel              [US-015 exact bound versions]
        AgreementDndPanel                [not-integrated BLOCKED region]
        AgreementStatusHistoryPanel
        AgreementActionRail
          ChargeLifecycleDialog          [narrow composition over shared Dialog]
      CreateAgreementPage
        AgreementForm
      EditAgreementDraftPage
        AgreementForm
      CreateSuccessorPage
      RateAuthorityListPage              [supporting]
      RateVersionDetailPage              [US-015 exact rate/version]
      ApprovalQueuePage                  [two independently admitted segments]
      ManualPricingEvidencePage          [read-only OPEN evidence]
```

`ChargeRootLayout` is the only shell placement. Route, loading, denied, not-found, error, detail, and form components render domain composition only. No local fallback shell, rail, navigation, theme, typography system, or shared-component copy exists anywhere in the tree.

## Route Components

| Route | Server responsibility | Focused client responsibility |
| --- | --- | --- |
| `/charge-agreements` | Policy, strict query parse, `status` adaptation, paging conversion, provider page read, label resolution, typed state | Supported filter and page navigation, return focus, retry |
| `/charge-agreements/[agreementId]` | Policy, one atomic detail read carrying Summary and history, independently resolved bound rate versions and Reference labels, action capabilities | URL tabs, disclosure, Retry scoped to separately sourced regions, return focus |
| `/charge-agreements/new` | Create policy, bounded Reference options, safe return | Transient draft, validation display, submit and dirty protection |
| `/charge-agreements/[agreementId]/edit` | Read and update policy, authoritative detail, expected version and row version | Transient draft, reconciliation, submit and dirty protection |
| `/charge-agreements/[agreementId]/successor` | Successor policy, current version evidence, safe return | Confirmation, submit, dirty protection |
| `/charge-agreements/rates` | Rate read policy, provider-supported rate query, typed state | Supported filter and page navigation, return focus |
| `/charge-agreements/rates/[rateId]` | Rate read policy, exact rate and version detail plus immutable history | Disclosure, Retry, validated Agreement return |
| `/charge-agreements/approvals` | Read policy plus per-segment admission check, server-filtered paged reads | Segment switch, page navigation, focus |
| `/charge-agreements/manual-pricing` | `charge-manual-cases:read` policy, provider OPEN evidence read | Supported filter and page navigation only |

Server components own authenticated context, action-specific capabilities, provider results, option resolution, and safe navigation. Client components own only draft edits, dirty and pending flags, local field feedback, tab and dialog state, announcements, and focus restoration. The four approved Charge legacy paths are handled by 308 redirect handlers that retain only validated `returnTo` and `tab`.

## List Composition

`AgreementListPage` renders a filter region, a results region, and a pagination region. The filter region exposes exactly `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, and `includeInactive`; there is no search box, no origin/destination/equipment control, and no sort control, including as a disabled placeholder. Canonical selectors use the bounded Reference option port and never accept a free-text label as an ID.

Columns are agreement number, customer, coverage, status, version, and validity. Fixed provider order is stated as plain explanatory text rather than implied by an interactive header. Counts render only from provider total evidence. An unresolved label renders the safe raw authorized ID with `Label unavailable` and never suppresses the row or its identity link. Changing a filter or size returns to page 1; every URL change reauthorizes and refetches.

The eight list states of FR-010 are distinct compositions: loading (stable-size Skeleton), true empty, filtered empty, populated, denied, provider error, degraded, and stale with source and time.

## Detail Composition and Region Independence

`AgreementDetailPage` renders an exact identity header distinguishing agreement number, `agreementId`, and current version, with approved versions visibly marked immutable. Tabs are URL-backed; an unsupported value normalizes to Summary by replace navigation without changing record identity.

Failure containment follows the declared seams. Summary and Status history come from the one atomic `getAgreement` read and therefore share a read result; bound rate versions, Reference labels, and D&D are separately sourced and independently contained:

| Panel | Content | Source seam | Failure behaviour |
| --- | --- | --- | --- |
| `AgreementSummaryPanel` | Customer, coverage, validity, lifecycle, version, provider-backed pricing evidence | `getAgreement` | Summary failure is the only failure that can empty the record |
| `AgreementRatesPanel` | Exact bound Freight, Surcharge, and Local versions with amount, currency, basis, scope; links to `/charge-agreements/rates/[rateId]` at the exact version | one `getRateVersion` per bound version | Row- and panel-scoped FailureState with an exactly owned Retry; Summary and tabs remain |
| `AgreementDndPanel` | Honest not-integrated state naming the W3-01 owner and evidence path | none while W3-01 is open | Never renders a value, rule, or term; never derives from rate rows |
| `AgreementStatusHistoryPanel` | Provider-ordered lifecycle, version, and approval events with actor, time, reason | same `getAgreement` payload as Summary | Shares Summary's result — no independent history failure state is claimed. Incomplete or absent provider `activity` renders a provider-signalled partial-history notice inside an otherwise authoritative record |

The relationship region reserved for Booking renders `Related bookings unavailable`. It contains no link, no disabled link, and no search affordance.

## Action Rail and Lifecycle Dialog

`AgreementActionRail` renders only commands whose exact capability the current request allows and whose provider lifecycle precondition is satisfied. An unsupported or unauthorized command is absent, not disabled. Charge Reader therefore sees the same provider facts with an empty rail and a concise explanation.

`ChargeLifecycleDialog` is a narrow Charge composition over the shared `@erp/ui` Dialog. It supplies domain consequence copy, the precondition summary, and reason capture where the provider requires one, for approve, suspend, and expire. It does not reimplement focus trap, overlay, or dismissal semantics — those remain shared behaviour, and any gap in them is a W2-02 dependency and BLOCKED evidence rather than a local fork.

## Form Component Contract

`AgreementForm` receives mode, verified Agreement identity, expected version and row version for edit, bounded Reference option sources, action availability, safe return context, and an already-safe initial status. It never receives a raw provider payload, cached authorization, unrestricted keys, or a browser-supplied version or replay key.

Its transient state is:

- draft values keyed only by allow-listed field paths;
- dirty field set and submit-attempt flag;
- pending boolean and active correlation or reference;
- field and general issues;
- terminal mutation disposition;
- optional reconciliation context and current authoritative summary;
- dirty-confirmation dialog state.

The form composes shared `Field`, `Input`, `Select`, `Combobox`, `Button`, `StatusStrip`, `Dialog`, and layout primitives. When the bounded option port cannot verify options, the affected canonical control is unavailable with a precise reason and the submit that depends on it is blocked — free-text is never promoted to an ID.

## Command Interaction

Open command -> server authorizes the exact capability and validates provider preconditions -> focus `h1` or first field -> edit transient draft -> validate on blur where useful -> submit validates all -> focus first issue or enter confirmation for approve, suspend, and expire -> set pending and block duplicate activation -> BFF derives the replay key and dispatches -> map exactly one terminal disposition -> authoritative re-read before any confirmed success.

Success announces politely, navigates to authoritative detail, and focuses the detail heading or status. No lifecycle state, badge, or history row advances anywhere in the client before provider acceptance and re-read.

## Outcome-to-Component Mapping

| Result / state | Composition | Focus / announcement | Preserved context |
| --- | --- | --- | --- |
| Loading | Stable-size list, detail, or form Skeleton | Busy label; no blank spinner page | URL and route |
| Validation | Error summary plus linked field messages | Alert summary, then first invalid field | Full draft |
| Pending | Submitting command busy and disabled | One polite pending update | Draft and Cancel when safe |
| Accepted / confirmed | Authoritative detail from re-read | Success polite; detail heading and status focus | Safe list return and tab |
| Accepted / unconfirmed | StatusStrip with stable reference and Re-read | Attention status; strip heading focus | Draft snapshot and Agreement identity |
| Conflict / policy rejection | ConflictStrip plus retained form and current summary | Conflict heading focus | Draft, expected and current version, required next state, return context |
| Denied / read-only | Concise explanation; command absent from the rail | Explanation associated with the action region | Provider read truth and draft until navigation |
| Not found | Route-owned not-found and recovery | Not-found heading focus | Safe canonical list target |
| Known unavailable | FailureState or StatusStrip plus Retry | Error summary focus | Draft, field focus, correlation |
| Unknown outcome | UncertainOutcomeStrip plus Re-read; no Retry command yet | Assertive once; strip focus | Submitted snapshot, identity, reference |
| Unexpected | Safe FailureState plus reference | Error summary focus | Draft and safe navigation |
| Stale region | Source and time StatusStrip; freshness-dependent commands disabled | Stale status announced | Trustworthy provider value and tab |
| Separately sourced region unavailable (rate version, Reference label) | Panel- or row-scoped FailureState with exact Retry ownership | Panel heading focus on Retry | Summary truth, tab, list return |
| Partial history evidence | Provider-signalled partial-history notice inside the History panel | Panel heading reachable in order | Full record, tab, list return |
| D&D not integrated | Honest not-integrated panel with owner and evidence | Panel heading reachable in order | Record and tab unchanged |
| Segment unadmitted | Queue segment unavailable with owner and evidence | Segment heading focus | Other segment, page, focus |

## Approval Queue and Manual Evidence Composition

`ApprovalQueuePage` switches between Agreement and Rate segments. Each segment renders only when its own server Draft/pending filter, bounded pagination, and read capability are evidenced; an unadmitted segment shows an unavailable state with owner and evidence path while the other segment continues to work. There is no client download, merge, filter, sort, bulk selection, or bulk approval anywhere on the page.

`ManualPricingEvidencePage` renders provider OPEN evidence in provider order with only `reasonCode`, `bookingRef`, `openedFrom`, `openedTo`, page, and size 25. No resolve, close, assign, reprice, manual-amount, or approval control exists — not even disabled. `MANUAL_PRICING_REQUIRED` is presented as evidence and never as a zero price.

## Dirty Navigation and Browser History

Native Back and same-module links remain usable. When a form is dirty, a concise shared `Dialog` names the unsaved task and offers Stay or Discard and leave. Focus is trapped, Escape returns to the trigger when safe, and cancelling navigation leaves route and draft unchanged. Confirmed command navigation does not trigger dirty confirmation because the authoritative provider result has replaced the draft.

## Responsive Composition

- 375 / 390: semantic mobile records instead of a squeezed table, stacked filters, single-column detail and form, primary identity, status and action visible, full-width error summary, actions in logical DOM order.
- 768: labelled keyboard-reachable inner table overflow; filter wrapping; rate evidence, history, and reconciliation comparison stack below primary content.
- 1024: compact table; bounded two-column detail and form with secondary evidence beside but after the primary content in DOM order.
- 1440: the same hierarchy at bounded readable width; no stretched fields and no empty card grid.

All five widths, light and dark themes, 200% and 400% zoom, long agreement numbers and identifiers, and the absence of page-level horizontal overflow require observed evidence. Intentional table overflow is labelled and keyboard reachable.

## Accessibility Contract

One `h1`, ordered headings, shell skip and main landmarks, native links and buttons, persistent labels, `aria-describedby` issue links, summary-to-field anchors, logical tab order, visible shared focus ring, non-color status meaning, minimum target sizes, honoured reduced motion, and bounded live regions are mandatory. Validation, conflict, and unknown outcomes receive immediate attention; result counts and success use polite announcements. The lifecycle and dirty dialogs trap and restore focus. Status never relies on a Toast alone; inline context remains after the announcement. Overflow menus carry accessible labels.

## Shared Primitive and Ownership Matrix

| Surface | Shared owner / source | Charge composition | Required states | Design status |
| --- | --- | --- | --- | --- |
| Shell, navigation, theme, session | W2-02 `PlatformShell` and registry | Active module, breadcrumbs, children | denied, read-only | BLOCKED until integrated live evidence |
| Lists and detail | `@erp/ui` Table, Tabs, Badge, Skeleton, EmptyState, StatusStrip | Agreement columns, tabs, rate evidence | full read matrix | BLOCKED until implementation and live evidence |
| Form fields and actions | `@erp/ui` Field, Input, Select, Combobox, Button | Charge labels and bounded option sources | dirty, validation, pending | BLOCKED until option port and runtime evidence |
| Lifecycle confirmation | shared Dialog with narrow Charge composition | Consequence copy, precondition summary, reason capture | confirm, cancel, pending, denied | BLOCKED if shared focus or dismissal behaviour is missing; no general fork |
| Conflict and recovery | shared StatusStrip and Dialog; shared conflict pattern if published | Version comparison and Charge recovery | conflict, unknown, unavailable | BLOCKED if shared behaviour missing; no local general fork |
| Audit evidence | shared Disclosure and TechnicalDetails | Safe Charge reference and history evidence | collapsed, access-appropriate | BLOCKED until live accessibility proof |

No row is PASS merely because a component is named. A missing platform primitive routes to W2-02; Charge may use semantic HTML with existing shared tokens for narrow domain composition only where that does not recreate a general primitive.

## Component Verification and Traceability

| Outcome | Requirements / stories | Component evidence |
| --- | --- | --- |
| Aligned Agreement list | US-007; FR-002, FR-005, FR-009, FR-010, FR-015, FR-016, FR-017 | Exact filter set, no search or sort control, provider order copy, URL survival, 308/404 matrix |
| Agreement detail and rate evidence | US-008, US-015; FR-005, FR-011 | Distinct identity header, per-panel results, exact rate-version links, validated Agreement return |
| Honest absence | US-008; FR-014 | Not-integrated D&D panel, `Related bookings unavailable`, no disabled placeholders |
| Lifecycle commands | US-009; FR-006, FR-012, FR-013 | Capability- and precondition-gated rail, lifecycle dialog, pending, duplicate-submit block, re-read |
| Outcome matrix | US-009; FR-011, FR-013; NFR-005 | Every disposition composition, retained context and focus, no false success |
| Queue and manual evidence | US-010; FR-009, FR-012 | Independent segment admission, no merge or bulk control, read-only OPEN evidence |
| Degradation and recovery | US-008, US-010; FR-019, FR-020, FR-021 | Region-scoped FailureState, stale source and time, label fallback, exact Retry ownership |
| Shared grammar | US-007-US-010, US-015; FR-001, FR-022; NFR-002, NFR-003, NFR-009 | One shell, shared primitives, responsive and accessibility matrix, no fork |
| U03 live acceptance | NFR-001, NFR-004, NFR-005, NFR-010, NFR-011, NFR-012 | Real Identity, Charge and Reference providers, Compose stack, warmed route and BFF sample, observability, both audits |
| Intent-exit verdict | NFR-006, NFR-007, NFR-008 | Combined manager-guard, coverage, security, and audit evidence |

Component and route tests must cover every state, duplicate submission, tab normalization, URL persistence, safe return, dirty navigation, and focus. Integrated Playwright must exercise real list, detail, lifecycle, conflict, outage, and recovery paths at 375, 390, 768, 1024, and 1440 CSS pixels in both themes with keyboard, screen-reader, reduced-motion, zoom and reflow, and no page-level overflow. The warmed ten-user route and BFF sample and the final live and audit gates remain required; source review, mockups, and screenshots alone are never PASS.
