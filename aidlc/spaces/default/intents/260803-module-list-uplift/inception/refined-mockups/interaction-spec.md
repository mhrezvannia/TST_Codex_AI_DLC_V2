<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). Enforces product-grade UX, not a workbench. -->

# Interaction Spec - W4-01 Module List-Detail Uplift

This specification consumes the approved `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`, plus the reviewed page designs 21, 22, and 23. Provider truth and approved W4 requirements override illustrative controls from rough mockups or generic UX guidance.

## Navigation & Shell Context

All routes render inside the single authenticated LinerCore shell. The shell owns session validation, permission-aware navigation, skip link, header, breadcrumbs, landmarks, theme, and route registry. Navigation order is Overview, Booking, Charge Agreements, Container Movement, Reference Data.

Every BFF derives the authenticated subject and current capability decision from the request. Browser-provided actor, role, capability, or arbitrary return URL is never authoritative. Denied direct links render the shared denied state without a provider-data flash.

Each list-to-detail transition carries only validated, bounded, relative same-shell return context. Back restores supported query state and row focus where possible; otherwise it returns to the canonical list and focuses its heading. Cross-module links use exact canonical identifiers and independently authorize at the target.

## Screens & Routes

| Route | Type | Purpose |
| --- | --- | --- |
| `/reference-data` | List | Enumerate provider reference sets. |
| `/reference-data/[setCode]` | List | Page one set with `includeInactive`, page, and size only. |
| `/reference-data/[setCode]/[recordId]` | Detail | Summary, Attributes, and History for one stable record. |
| `/reference-data/[setCode]/new` | Task | Create when the exact server capability permits. |
| `/reference-data/[setCode]/[recordId]/edit` | Task | Edit using current provider version and conflict recovery. |
| `/charge-agreements` | List | Filter and page Agreements using provider-supported keys only. |
| `/charge-agreements/new` | Task | Create an Agreement when provider capability permits. |
| `/charge-agreements/[agreementId]` | Detail | Summary, Rates, D&D, and Status history for one versioned Agreement. |
| `/charge-agreements/[agreementId]/edit` | Task | Edit the current Draft with version/precondition. |
| `/charge-agreements/[agreementId]/successor` | Task | Create a new Draft successor without rewriting history. |
| `/charge-agreements/rates` | List | Provider-filtered Rate Authority and exact Agreement return context. |
| `/charge-agreements/rates/new` | Task | Create a rate Draft under the existing Rate Authority contract. |
| `/charge-agreements/rates/[rateId]` | Detail | Exact rate/version facts and immutable history. |
| `/charge-agreements/approvals` | List candidate | Independently paged Draft Agreements or rate versions; server-filtered only. |
| `/charge-agreements/manual-pricing` | Evidence list | Permission-gated OPEN manual-pricing evidence without resolution actions. |
| `/container-movement` | List | Fixed recent Journey order with bounded limit and Refresh only. |
| `/container-movement/journeys/[journeyId]` | Detail | Summary, Movement timeline, Linked booking, and permitted capture. |

Reference and Charge legacy behavior follows the approved retirement matrices; no ambiguous redirect is invented. Container Movement has no prior frontend and therefore no legacy redirects. The CMM routes are proposed, not implemented: source, mount, navigation, and BFF remain Application Design dependencies.

## List Page Spec

### Shared list grammar

Every list has one H1, concise context, supported controls, a status/result summary, native record links, loading/empty/error/denied/degraded treatment, and responsive semantic records. URL state includes only provider-backed keys. Late responses cannot overwrite a newer URL generation. Unsupported keys are rejected or normalized, never silently simulated.

### Reference Data

- Set list: provider-enumerated set links; omit metadata columns the provider does not supply.
- Record list: `includeInactive`, validated page, and bounded size; no text search or selectable sort.
- Columns: code/key, display name, active/effective state, provider validity when supplied, version, last change.
- Pagination uses provider total/page evidence; changing filter or size returns to page 1.
- Create appears only with current action-specific capability. Validate/deactivate/reactivate remain absent while blocked.

### Charge Agreements

- Inputs: canonical `customerId`, `tradeLaneId`, `commodityId`, lifecycle `status`, ISO `validOn`, `includeInactive`, page, and size.
- No generic search, origin/destination/equipment filter, client-side sort, or selectable server sort.
- Columns: agreement number, customer, coverage, status, version, validity.
- Fixed provider order is plain explanatory text. Counts are shown only from provider total evidence.
- Unresolved Reference labels show safe raw IDs plus `Label unavailable`; they never block the identity link.
- Rate Authority supports only provider `q`, category, lifecycle, `asOf`, origin, destination, equipment type, page, and size. Provider ordering remains authoritative.
- Manual pricing evidence supports only provider reason, Booking reference, opened range, page, and size. It never exposes resolve, close, assign, repricing, zero-price, manual-amount, or approval actions.
- The Approval Queue candidate switches between independently server-filtered/paged Draft Agreements and Draft rate versions. If either bounded filter is absent, that segment is unavailable; the browser never downloads and merges full resources.

### Container Movement

- Inputs: bounded `limit` only; UI choices 25, 50, and 100; default 25. Refresh repeats the exact read.
- No search, filters, selectable sort, total, cursor, page, actor, bulk action, or Journey creation.
- Columns: container, Booking, status, latest accepted event only if public ordering is confirmed, freshness.
- Result copy uses `returned`, not a fabricated total. Empty copy is `No recent Journeys returned` with no create CTA.

## Detail Page Spec

### Shared master-detail behavior

Each detail has Back, exact identity H1, text status, secondary identifiers, stable URL-backed views, provider-backed facts, role-aware action placement, and collapsed sanitized technical evidence. Unsupported tab values normalize to the default by replace navigation. Refresh never changes record identity implicitly.

### Reference record

- Summary: exact code, display name, set, status, version, supported ownership/validity, created/updated/status-change evidence.
- Attributes: ordered set-specific labelled values and verified relationships; never raw JSON.
- History: approved provider order, readable before/after summary, actor/time/reason/reference when supplied; scoped failure preserves other tabs.
- Edit passes current provider version. Version conflict retains the draft and offers review/reapply or discard.

### Charge Agreement

- Header distinguishes agreement number, ID, and version; Approved versions are visibly immutable.
- Summary: customer, coverage, validity, lifecycle, and provider-backed pricing evidence.
- Rates: exact bound Freight, Surcharge, and Local versions with amount/currency/basis/scope; not a Rate Authority workbench.
- D&D: explicit provider evidence or honest unavailable/degraded state.
- Status history: provider lifecycle/version/approval events with actor/time/reason when supplied.
- Exact supporting rate links open `/charge-agreements/rates/[rateId]` using the provider's stable rate ID/version and validated Agreement `returnTo`; a newer current rate is never substituted.
- Rate detail shows labelled category, scope, amount/currency/basis, lifecycle, validity, source version, and immutable approved history only when supplied.
- Charge Reader mode shows the same facts and OPEN manual-pricing evidence while Agreement/rate mutation and case-resolution commands are absent.
- Agreement-to-Booking links stay absent until additive canonical identifiers are approved and evidenced.

### Container Journey

- Summary: exact Journey/container/Booking identity, revision, provider status, freshness/dependency/capture availability, and only supplied timestamps.
- Movement timeline: one provider/BFF-normalized semantic ordered list combining expected and accepted evidence. Browser logic may not infer lifecycle, next move, lateness, or expected/actual matching.
- Linked booking: exact `/booking/[bookingId]` link with independent target authorization; never search by label or container.
- Record Movement appears only with current capture authority and `captureEnabled=true`. It accepts supported event code, canonical active location, and occurrence time. The trusted server owns actor, idempotency, and correlation.
- Capture success requires authoritative re-read before status/timeline update. Typed conflicts retain values and expose current lifecycle/required next move. Unknown network outcome refetches before replay or a success claim.
- History is append-only. No correction, publication status, or Booking-application status is shown without an approved public contract.

### Booking relationship to Journey

The Booking-owned relationship region performs an authorized server/BFF lookup by exact `bookingId`. On a returned Journey it renders a native `/container-movement/journeys/[journeyId]` link from the provider ID and validated Booking return context. Provider absence renders `Journey not created`. Dependency failure renders a scoped unavailable state with Retry and preserves the Booking. Denial renders no Journey data. Returning from CMM restores the invoking Booking relationship link when safe context is valid. The browser never guesses from container, projection label, or stale client state.

## States

| State | Binding response | Recovery/focus |
| --- | --- | --- |
| Loading | Shape-stable Skeleton for page/table/header/panel; no false data. | Routine load does not steal focus. |
| True empty | Entity-specific message and only an actually permitted next step. | Focus result heading; Refresh or permitted Create. |
| Filtered empty | Only where a real admitted filter can cause it. | Clear/change supported control; retain focus. |
| Populated | Provider facts, supported controls, native links. | Normal reading and navigation order. |
| Denied | Shared denial; no data or technical-evidence flash. | Focus denied heading and safe help path. |
| Read-only | Facts remain; mutation commands are absent with concise explanation. | Continue inspection without disabled-command maze. |
| Not found | Named entity not-found state; never guess another identifier. | Canonical list/back link and error-heading focus. |
| Validation | Error summary plus linked field errors; values retained. | Focus summary, then invalid field. |
| Pending | Only initiating command disabled; duplicate submission blocked. | Announce once; Cancel remains when safe. |
| Success | Re-read provider truth and announce persisted/accepted outcome. | Focus success summary or logical detail heading. |
| Conflict/rejection | Current provider state and typed safe guidance; no optimistic update. | Preserve inputs; focus persistent conflict summary. |
| Provider error | Safe actionable copy, Retry, correlation/reference where permitted. | Retry exact failed scope; preserve query/tab/form/focus context. |
| Last-known/stale | Source/time and unavailable dependency named; unsafe actions disabled. | Current-request authorization remains mandatory; Retry. |
| Partial/degraded | Trustworthy regions remain; failed facet named separately. | Region-specific Retry; no blanking valid content. |

Event persistence, publication, and downstream application are separate truths. A successful write is never labelled Published or Applied without matching evidence.

## Design System Usage

Consume existing shared exports first: `PlatformShell`, `PageHeader`, `RecordHeader`, `Breadcrumbs`, `RouteTabs`, `FilterToolbar`, `Field`, `Input`, `Select`, `Combobox`, `Button`, `TableContainer`, `Table`, `Pagination`, `StatusBadge`, `StatusStrip`, `PartialDataNotice`, `FailureState`, `EmptyState`, `Skeleton`, `DefinitionList`, `ConflictStrip`, `TechnicalDetails`, `Dialog`, and shared toast/live-region behavior where executable.

All colors, spacing, typography, borders, focus, elevation, and motion use shared `--erp-*` tokens. Lucide icons are supplementary and never replace text. No local inline style system, hard-coded hex palette, remote font, theme, Drawer framework, shell, or generalized primitive is authorized.

If an executable shared primitive cannot satisfy a required behavior, the domain records a UI-platform dependency with owner and acceptance evidence. It stays BLOCKED until the shared package releases and the integrated runtime proves it; the domain does not fork it.

## Domain-True Forms

Reference create/edit uses persistent labels, canonical code and display name, provider/set-specific attributes, live Reference-backed selections, change reason, and current version. Lifecycle commands are separate actions, not an editable status field.

Charge W4 is read-oriented except for provider-supported lifecycle actions already admitted by the capability matrix. It does not recreate Rate Authority, D&D authoring, manual pricing, or broad Agreement editing. Any concise confirmation uses the shared Dialog only when the action is irreversible and executable.

Container capture uses canonical movement event and location choices plus occurrence time. Container identity is read-only. Actor subject, capability, idempotency key, correlation ID, source, classifier, publication, correction, and Journey creation are never browser-owned fields.

All forms validate on blur where helpful and always on submit, retain entered values after recoverable failure, block duplicate submission, and treat the provider as authoritative.

## Accessibility & Responsiveness

Design target is WCAG 2.2 AA; implemented acceptance must meet the approved WCAG 2.1 AA baseline and the detailed `accessibility-checklist.md`.

- One H1, ordered headings, shell landmarks, skip link, persistent labels, native links/buttons, visible shared focus ring, and non-color status.
- Tables have captions and scoped headers. Inner overflow is labelled and keyboard reachable only when it actually scrolls.
- Tabs expose current state and shared keyboard semantics; active panel relationships are explicit.
- Forms use error summaries, `aria-describedby`, first-error focus, pending state, and status announcements without repetitive polling noise.
- Dialogs, only where used, trap/restore focus and support Escape when safe. In-flow mobile/tablet tasks require no trap.
- Timeline uses `ol`/`li`; static evidence is not a tab stop. Code is paired with readable meaning.
- Touch targets are at least 44 CSS pixels; reduced motion is honored; text and identifiers wrap without losing meaning.

At 375/390px use semantic records and one-column details/tasks. At 768px wrap controls and stack action rails; use labelled inner table overflow only when required. At 1024/1440px use dense tables and bounded two-column detail/action layouts. Verify both themes, 200%/400% zoom, text spacing, long localized labels, keyboard-only use, and screen-reader announcements. No page-level horizontal overflow is allowed.

## Open Questions

The seven stage questions are answered in `refined-mockups-questions.md`; no unresolved visual preference blocks the gate. Application Design must resolve these implementation dependencies:

1. Exact source/mount/BFF boundaries and shell permission strings for all canonical routes, especially the absent CMM frontend.
2. Safe return-context schemas and exact Reference/Charge retirement implementation.
3. Typed view models and normalization for Reference history, Charge D&D/rate evidence, and CMM timeline.
4. Provider and Identity exit evidence for every BLOCKED control or cross-link.
5. Shared-component gaps, including any future Drawer need, through the `@erp/ui` owner.
6. Product owner resolved the CMM foundation decision on 2026-08-09: approved W2-04 artifacts plus candidate 23 are the reviewed W4 input; missing standalone 90/91 files are an evidence note, not duplicate-design work.

These are named design-to-architecture dependencies, not permission to invent behavior during implementation.

## Review

**Verdict: READY FOR PRODUCT REVIEW.** The interaction contract is traceable to the approved rough wireframes, user flow, stories, requirements, team practices, and three ordered page-level designs. Runtime and provider blockers remain explicit.
