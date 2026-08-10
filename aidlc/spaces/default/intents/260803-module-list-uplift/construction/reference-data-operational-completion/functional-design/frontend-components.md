# Frontend Components - U02 Reference Data Operational Completion

## Source Alignment and UI Authority

This UI design implements U02 `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, extending U01 Functional Design. Authority order is approved W4 scope/requirements, security/accessibility standards, LinerCore MASTER and executable `@erp/ui`, Reference page contract, approved Reference uplift, then advisory UI/UX Pro Max. The advisory input contributes visible focus, persistent labels, inline/server validation, stable loading, reduced motion, and responsive form discipline; its gateway/hero, replacement colors/fonts, animated badges, charts, spinners, and generic Server Action guidance are rejected where they conflict with the approved Reference BFF.

## Ownership and Canonical Component Tree

```text
ReferenceRootLayout
  PlatformShell                         [W2-02; exactly one instance]
    RouteStateBoundary
      ReferenceSetListPage              [U01 read foundation; U02 full states]
      ReferenceRecordListPage           [U02 full list states]
      ReferenceRecordDetailPage         [U02 Summary/Attributes/History]
      CreateReferenceRecordPage
        ReferenceRecordForm
      EditReferenceRecordPage
        ReferenceRecordForm
```

`ReferenceRootLayout` is the only shell placement. Route, loading, not-found, denied, error, detail, and form components render only their domain composition. No local fallback shell, rail, navigation, theme, typography system, or shared-component copy exists.

## Route Components

| Route | Server responsibility | Focused client responsibility |
| --- | --- | --- |
| `/reference-data` | Policy, set read, typed state | Retry/focus enhancement only |
| `/reference-data/[setCode]` | Query parse, policy, page read, typed state | Supported filter/page navigation and return focus |
| `/reference-data/[setCode]/[recordId]` | Policy, detail + scoped History read, capabilities | Tabs, disclosure, Retry, return focus |
| `/reference-data/[setCode]/new` | Create policy, BFF V1 form definition, safe return | Transient create draft, validation display, submit/dirty protection |
| `/reference-data/[setCode]/[recordId]/edit` | Read/update policy, detail + V1 catalog-coverage check, expected version | Transient edit draft, conflict reconciliation, submit/dirty protection |

Server components own authenticated context, action-specific capabilities, BFF catalog-derived form definition, record/version, provider results, and safe navigation. Client components own only draft edits, dirty/pending flags, local field feedback, dialog state, announcements, and focus restoration.

## Form Component Contract

`ReferenceRecordForm` receives mode, verified set/record identity, BFF `ReferenceFormCatalogV1`-derived VM, optional authoritative initial record, expected version for edit, action availability, safe return context, and an already-safe initial status. It never receives raw provider payload, cached authorization, unrestricted attribute keys, or a browser-submitted schema version. An existing record with an uncatalogued attribute renders all attributes read-only and does not render Edit.

Its transient state is:

- draft values keyed only by V1-approved field paths and active discriminator;
- dirty field set and submit-attempt flag;
- pending boolean and active correlation/reference;
- field/general issues;
- terminal mutation disposition;
- optional conflict context/current authoritative detail;
- dirty-confirmation dialog state.

The form composes shared `Field`, `Input`, `Select`, `Combobox`, `Button`, `StatusStrip`, `Dialog`, and layout primitives. Canonical selectors use a bounded provider option source; they do not accept arbitrary labels as IDs. A missing required shared primitive is a W2-02 dependency and keeps the affected evidence BLOCKED.

## Create Interaction

Open Create -> server authorizes and loads its V1 form definition -> focus h1/first field -> edit transient draft -> validate on blur where useful -> submit validates all -> focus first issue or set pending -> BFF generates stable attempt ID and dispatches -> map terminal result.

Accepted-confirmed navigates to stable detail with a polite success announcement and detail-heading focus. Accepted-unconfirmed keeps the stable record ID/reference and offers Re-read without rendering draft values as provider truth. Validation retains values and links the error summary. Denied changes to read-only/command-absent behavior. Known unavailable retains the draft and offers explicit Retry. Unknown create re-reads the attempt ID; Retry appears only after terminal absence and reuses that ID.

## Edit and Conflict Interaction

Edit loads authoritative detail and schema together and displays the current version as evidence, not an editable field. Submit sends that exact version. On conflict, the page retains draft fields, announces the conflict, focuses `ConflictStrip`, and shows current provider summary.

`Review current` fetches current truth and presents a labelled comparison. `Reapply` is enabled only after explicit review and uses the newly read version; `Discard draft` requires confirmation. The component never silently merges, overwrites, or retries.

## Outcome-to-Component Mapping

| Result/state | Composition | Focus/announcement | Preserved context |
| --- | --- | --- | --- |
| Loading | Stable-size form/detail Skeleton | Busy label; no blank spinner | URL/route |
| Validation | Error summary + linked field messages | Alert summary, then first invalid field | Full draft |
| Pending | Submit command busy/disabled | One polite pending update | Draft and Cancel when safe |
| Accepted/confirmed | Stable detail from re-read | Success polite; detail heading/status focus | Safe list return/tab |
| Accepted/unconfirmed | StatusStrip with stable reference and Re-read | Attention status; strip heading focus | Draft snapshot/record identity |
| Conflict | ConflictStrip + retained form + current summary | Conflict heading focus | Draft, old/new versions, return context |
| Denied/read-only | Concise explanation; mutation command absent | Explanation associated to action region | Provider read truth/draft until navigation |
| Not found | Route-owned not-found/recovery | Not-found heading focus | Safe set/list target |
| Known unavailable | FailureState/StatusStrip + Retry | Error summary focus | Draft, field focus, correlation |
| Unknown outcome | UncertainOutcomeStrip + Re-read; no Retry command yet | Assertive once; strip focus | Submitted snapshot/reference |
| Unexpected | Safe FailureState + reference | Error summary focus | Draft and safe navigation |
| Stale detail | Source/time StatusStrip; mutations absent | Stale status announced | Trustworthy provider value/tab |
| History unavailable | History-panel FailureState only | Panel heading focus on Retry | Summary/Attributes/tab |

## List and Detail Completion

The U01 set/list/detail components are retained but deepened. Record list exposes only `includeInactive`, page, and size; URL changes reauthorize and refetch. Detail renders provider-labelled Summary, ordered Attributes, History, and collapsed technical evidence. History partial failure does not blank other tabs. Create/Edit appear only from current-request action capability. Validate/deactivate/reactivate controls do not render, including as disabled placeholders.

## Dirty Navigation and Browser History

Native Back and same-module links remain usable. When the form is dirty, a concise shared `Dialog` identifies the unsaved task and offers Stay or Discard and leave. Focus is trapped, Escape returns to the trigger when safe, and canceling navigation leaves route/draft unchanged. Successful command navigation does not trigger dirty confirmation because the confirmed provider result replaces the draft state.

## Responsive Composition

- 375/390: semantic list records, stacked controls, single-column detail/form, primary identity/status/action visible, full-width error summary, actions in logical DOM order.
- 768: labelled keyboard-reachable inner table overflow; filter wrapping; detail/evidence and conflict comparison stack below primary content.
- 1024: compact table; bounded two-column detail/form with secondary evidence beside but after the form in DOM order.
- 1440: same hierarchy with bounded readable width; no stretched fields or excessive empty card grid.

All five widths, light/dark themes, 200%/400% zoom, long codes/names, and no page-level overflow require observed evidence. Intentional table overflow is labelled and keyboard reachable.

## Accessibility Contract

One h1, ordered headings, shell skip/main landmarks, native links/buttons, persistent labels, `aria-describedby` issue links, summary-to-field anchors, logical tab order, visible shared focus ring, non-color status, minimum target sizes, reduced motion, and bounded live regions are mandatory. Validation/conflict/unknown outcomes receive immediate attention; result counts and success use polite announcements. Dialogs trap and restore focus. Status changes never rely on Toast alone; inline context remains after the announcement.

## Shared Primitive and Ownership Matrix

| Surface | Shared owner/source | Reference composition | Required states | Design status |
| --- | --- | --- | --- | --- |
| Shell/nav/theme/session | W2-02 `PlatformShell`/registry | Active module, breadcrumbs, children | denied/read-only | BLOCKED until integrated live evidence |
| Lists/detail | `@erp/ui` Table, Tabs, Badge, Skeleton, EmptyState, StatusStrip | Reference columns/facts/tabs | complete read matrix | BLOCKED until implementation/live evidence |
| Form fields/actions | `@erp/ui` Field/Input/Select/Combobox/Button | Provider schema and Reference labels | dirty/validation/pending | BLOCKED until schema and runtime evidence |
| Conflict/recovery | shared StatusStrip/Dialog; shared conflict pattern if published | Version comparison and Reference recovery | conflict/unknown/unavailable | BLOCKED if shared behavior missing; no local general fork |
| Audit evidence | shared Disclosure/TechnicalDetails | Safe Reference reference/history evidence | collapsed/access-appropriate | BLOCKED until live accessibility proof |

No design row is PASS merely because the component is named. A missing platform primitive is routed to W2-02; U02 may use semantic HTML plus existing shared tokens for narrow domain composition only when that does not recreate a general primitive.

## Component Verification and Traceability

| Outcome | Requirements/stories | Component evidence |
| --- | --- | --- |
| Full Reference reads | US-003/US-004; FR-001, FR-002, FR-003, FR-009, FR-010, FR-011, FR-015, FR-016, FR-017 | Set/list/detail/History state fixtures, strict queries, stable routes |
| Safe create/update | US-005; FR-004, FR-012, FR-013 | V1 form, action capability, stable attempt ID, pending, re-read |
| Conflict/validation | US-005; FR-011; NFR-004, NFR-005 | Linked errors, retained draft, comparison/focus |
| Recovery/degradation | US-006; FR-019, FR-020, FR-021 | Stale/provenance, partial History, unknown outcome |
| Shared grammar | US-003-US-006; FR-022; NFR-002, NFR-003, NFR-009 | One shell, shared primitives, responsive/a11y matrix |
| U02 live acceptance | NFR-001, NFR-004, NFR-005, NFR-009, NFR-010, NFR-011, NFR-012 | Real Identity/provider/Compose, route+BFF sample, observability and audits |
| Intent-exit verdict | NFR-006, NFR-007, NFR-008 | Combined manager-guard, security, audit, and live-stack evidence |

Component/route tests must cover every state, duplicate submit, URL persistence, safe return, dirty navigation, and focus. Integrated Playwright must exercise real create/update/conflict/outage/recovery paths at 375, 390, 768, 1024, and 1440 in both themes with keyboard, screen-reader, reduced-motion, zoom/reflow, and no page-level overflow. The warmed ten-user route/BFF sample and final live/audit gates remain required; source review, mockups, and screenshots alone are not PASS.
