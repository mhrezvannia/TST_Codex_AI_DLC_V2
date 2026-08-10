$ui-ux-pro-max

Act as a principal enterprise frontend engineer and senior UX implementation
lead with deep experience in Next.js App Router, accessible design systems,
data-dense operational software, ocean-freight Booking workflows, resilient
service integration, and Playwright visual testing.

Implement the complete approved LinerCore Booking experience for pages 10
through 13 as one coordinated change. This is an implementation task, not
another design or inception task.

Do not run, resume, modify, or advance AI-DLC. Do not create new AI-DLC
artifacts. Use UI/UX Pro Max guidance directly while implementing the approved
designs.

## Approved source of truth

Read these complete approved design documents before editing:

- `docs/ui-ux-design/10-booking-operations-queue.md`
- `docs/ui-ux-design/11-new-booking.md`
- `docs/ui-ux-design/12-booking-operational-record.md`
- `docs/ui-ux-design/13-booking-failure-recovery.md`
- `docs/ui-ux-design/03-09-auth-shell-inception-design.md` only for approved
  Shell, navigation, authentication-boundary, and visual-language context.

Also inspect:

- The current `@erp/ui` package and its tests.
- The Booking and Shell Next.js applications.
- Current Booking BFF/read helpers and route handlers.
- Booking service response and error contracts.
- Authentication and authorization helpers.
- Existing test IDs and automated tests.
- Current Compose and nginx routing.
- The running demo at `http://127.0.0.1`.
- The direct Booking application when needed for comparison.

Treat the approved page documents as binding UX specifications. Where a design
depends on a backend capability that does not exist, implement the strongest
honest supported state and clearly report the remaining dependency. Do not
invent archive records, business-scope decisions, latest revisions, canonical
labels, prices, journey events, or access-request capabilities.

## Required implementation scope

### Shared foundations

Implement or extend reusable `@erp/ui` components needed across pages 10-13:

- Breadcrumbs.
- Compact page and record headers.
- Buttons with stable busy states.
- Lucide icon buttons and tooltips.
- StatusBadge sentence-case mappings.
- RouteTabs for URL-backed record views.
- DefinitionList.
- Dense responsive Table behavior.
- Filter toolbar and active-filter chips.
- Pagination controls.
- Combobox improvements required by the create form.
- StatusStrip with semantic tone, heading, actions, focus target, and controlled
  live announcements.
- FailureState.
- EmptyState heading semantics.
- PartialDataNotice.
- ConflictStrip.
- TechnicalDetails.
- IdentifierValue.
- CopyButton.
- Record, table, form, timeline, and failure Skeleton patterns.

Keep shared components domain-neutral. Booking lifecycle rules, command
eligibility, Booking failure classification, and Booking-specific content must
remain in Booking compositions or server-owned view models.

Use Lucide icons from the existing or approved icon library. Do not add
hand-drawn SVG icons or emoji.

### Page 10: Booking operations queue

Implement the approved design at:

- `http://127.0.0.1/bookings`

Required behavior:

- Compact page header, result count, and primary `New booking` command.
- Dense, scannable desktop table.
- Search and supported filters persisted in the URL.
- Active-filter chips.
- Supported sorting, pagination, and page-size controls.
- Sticky table header.
- Stable row hover, keyboard focus, and open behavior.
- Filtered-list context preserved when opening a booking.
- Mobile record-list transformation at 390px with no page-level horizontal
  overflow.
- Loading, filtered-empty, no-bookings, unavailable, stale, partial,
  authorization-limited, and pagination-failure states.

Only implement voyage/date, exception, owner, saved views, or richer sorting
when the corresponding API and URL contracts exist or are safely added as part
of this change. Do not render nonfunctional filters.

### Page 11: New Booking

Implement the approved design at:

- `http://127.0.0.1/bookings/new`

Required behavior:

- One efficient page with Customer, Route and voyage, Equipment and cargo, and
  Review and create sections.
- Searchable canonical-reference comboboxes.
- Visible voyage-derived route values and source explanation.
- Domain-permitted editing only.
- Required-reference, distinct-location, route-voyage, UN/LOCODE, ISO 6346,
  equipment compatibility, duplicate-equipment, and stale-reference validation.
- Linked error summary and field-level errors.
- Primary `Create draft` and secondary `Cancel`.
- Duplicate submission prevention with idempotency.
- Stable submitting state.
- Recoverable failures retain entered values.
- Successful creation redirects to the created Booking record.
- Unsaved-change protection that does not create redirect loops or inaccessible
  modal behavior.
- One-column mobile layout with reachable actions.

Preserve existing API contracts and idempotency semantics. Improve contracts
only where required for the approved behavior and add tests for every change.

### Page 12: Booking operational record

Implement the approved central record at:

- `http://127.0.0.1/bookings/[bookingId]`

Required behavior:

- Back restores the validated filtered queue context.
- Compact record header with booking number, resolved customer, sentence-case
  status, revision, blocker, one primary next action, and overflow actions.
- Route-backed `Overview`, `Charges`, `Journey`, and `Activity` views.
- Overview route timeline, voyage, equipment, cargo, validation, and blockers.
- Charges itemization using authoritative snapshot values only.
- Journey current state, expected event, location, freshness, and timeline using
  authoritative data only.
- Activity business events with actor and timestamp.
- Closed Technical details disclosures with safe copy affordances.
- Lifecycle-specific action rules and duplicate-command prevention.
- Honest Manual pricing, pending journey, partial pricing, incomplete legacy,
  unavailable-service, and correction-required states.
- Stale-revision conflict behavior without automatic command replay.
- Long identifiers wrap safely.
- Compact one-column mobile record with bounded route-view navigation.

Do not calculate authoritative commercial totals in the browser. Do not invent
agreement names, rate versions, movement events, actor names, or latest
revisions. When required data is absent, implement the approved honest partial
or pending state.

### Page 13: Booking failure and recovery

Implement the approved route-level and in-record failure system:

- Invalid or malformed Booking link.
- Authorized Booking not found.
- Authoritative retired, archived, deleted, or replaced result only when the
  backend supports it.
- Module/action permission denial.
- Record-level business-scope denial only when policy safely supplies it.
- Booking service temporarily unavailable.
- Partial Booking data.
- Stale revision.
- Unexpected route-render failure.

Required security behavior:

- Validate Booking ID format before calling the service.
- Preserve authorization-before-record-lookup behavior.
- Never leak whether a protected Booking exists.
- Never display raw messages such as `booking command denied`,
  `No value present`, stack traces, service tokens, cookies, claims, internal
  host names, callback URLs, or ports.
- Normalize failures into a server-owned safe presentation model.
- Preserve a validated same-origin Booking-list return destination.
- Unsafe, malformed, double-encoded, cross-origin, or oversized destinations
  become `/bookings`.
- Retry only transient or partial reads.
- Prevent duplicate Retry.
- Request access only when a real safe denial context and request capability
  exist.
- Open latest revision only when the server provides an authoritative
  allowlisted destination.
- Add a route error boundary with safe recovery and diagnostics.

Enrich the Booking read result so the page can safely receive canonical code,
status, retryability, support reference, timestamp, and optional trusted
metadata. Do not classify failures by matching raw message text in React.

## Shared visual requirements

Implement the approved LinerCore enterprise ERP language:

- White and cool-neutral surfaces.
- Near-black body text.
- Restrained maritime blue for navigation, links, information, and focus.
- Green or teal for success.
- Amber for warnings.
- Red only for errors or destructive actions.
- Inter or the approved existing body stack.
- Tabular numerals for money, quantity, revision, timestamp, and identifiers.
- 4-8px radii.
- Subtle borders and minimal shadows.
- Stable dimensions and hover behavior.

Do not use:

- Gradients.
- Glassmorphism.
- Decorative blobs.
- Giant hero sections.
- Marketing copy.
- Stock imagery.
- Illustration-first failure pages.
- Floating page sections.
- Nested cards.
- Walls of KPI cards.
- Blue-only palettes.
- Raw enum labels.
- Excessive whitespace.

Use page sections and unframed layouts. Use cards only for genuine repeated
records or framed tools where the approved designs require them.

## Accessibility

Meet WCAG 2.2 AA:

- Complete keyboard operation.
- Logical focus order.
- Visible, unobscured focus.
- Skip link in the authenticated Shell.
- Semantic landmarks and headings.
- Real table semantics on desktop.
- Linked error summaries and field errors.
- Accessible comboboxes, dialogs, disclosures, menus, tabs, and icon buttons.
- Controlled live announcements for filters, loading, submission, retry,
  copying, conflict, and recovery.
- Focus placement and restoration matching the approved documents.
- Status conveyed by text and structure, not color alone.
- Reduced-motion behavior.
- At least 4.5:1 normal-text contrast.
- 200% and 400% zoom/reflow support.
- Mobile touch targets of at least 44px where appropriate.

At 390px:

- No page-level horizontal overflow.
- No hidden critical status or primary action.
- No text truncation that changes meaning.
- Mobile keyboards must not obscure required fields or submission status.

## Architecture and engineering constraints

- Use Next.js App Router patterns.
- Prefer Server Components for initial reads and composition.
- Use small client islands for combobox state, filters where necessary,
  commands, dialogs, menus, copy feedback, retry, and async announcements.
- Do not duplicate session, authorization, safe-return, failure-classification,
  or domain logic inside page components.
- Preserve current routes, API behavior, authorization boundaries, and test IDs
  unless a change is necessary and covered by updated tests.
- Work with existing uncommitted changes. Do not revert unrelated user or agent
  work.
- Keep edits scoped to the approved Booking workflow and required shared
  foundations.
- Do not perform unrelated refactors.
- Do not make a git commit unless explicitly requested.

## Realistic demo data

Use existing authoritative seed data when available:

- Booking `BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3`.
- Record ID `ecebf4a8-bbbd-4468-980b-0e9dfdf0e73a`.
- Customer Northstar Retail only when canonical seed/reference data supports
  that display name.
- Route `USNYC` to `NLRTM`.
- Voyage `VOY-LOCAL-002` only when the canonical voyage contract supports it.
- Equipment `LCRU1000055`.
- Equipment type `22G1`.
- Quantity `1`.
- Currency `USD`.
- FCL dry, non-reefer, non-dangerous goods.
- One Manual pricing example.
- One Draft requiring reference correction.
- Honest pending Journey state when confirmed movement evidence is absent.

Add or adjust deterministic local seed data only when required for the approved
demo and consistent with existing domain contracts. Do not hard-code demo
records directly in React pages.

## Required execution sequence

1. Audit the current implementation and tests against all four approved design
   documents.
2. Produce a short implementation checklist and begin implementation
   immediately.
3. Implement shared `@erp/ui` foundations with focused tests.
4. Implement structured Booking read/failure and safe-return contracts.
5. Implement page 10.
6. Implement page 11.
7. Implement page 12.
8. Implement page 13.
9. Add or update unit, component, integration, and Playwright tests.
10. Run formatting, typecheck, lint, focused tests, production builds, and
    `git diff --check`.
11. Start or reuse the local demo stack.
12. Verify the complete queue-to-create-to-detail-to-recovery journey in the
    browser.
13. Capture and inspect screenshots at 390, 768, 1024, and 1440px.
14. Fix visual overflow, overlap, broken focus, inaccessible controls, raw
    errors, and inconsistent states before finishing.

Do not stop after creating components or describing remaining work. Complete
the implementation and verification as far as the repository and available
services allow.

## Required verification

Verify at minimum:

- Booking queue search, supported filters, pagination, opening, and Back
  restoration.
- Mobile queue scanning.
- New Booking keyboard entry, validation summary, canonical selection,
  duplicate-submit prevention, successful creation, and recoverable failure.
- All four Booking record views.
- Lifecycle action visibility and authorization.
- Charges and Journey honest partial/pending states.
- Invalid link with no service request.
- Authorized not found.
- Permission denial without existence leakage.
- Service outage and successful Retry.
- Partial-record recovery.
- Stale revision without command replay.
- Unsafe return destination neutralization.
- Session expiry removes protected data.
- No stack trace, raw backend error, secret, token, cookie, internal host, or
  port appears in UI or client payloads.

Run the repository's authoritative test commands discovered from package
scripts. Include focused tests for every changed package and route, then run the
relevant broader checks.

## Final response

Report:

1. What was implemented for pages 10, 11, 12, and 13.
2. Shared `@erp/ui` additions or changes.
3. Backend/BFF contract changes.
4. Tests and builds run with exact pass/fail totals.
5. Browser routes and viewport screenshots verified.
6. Any capability intentionally left in an honest unavailable/future state and
   the exact missing contract.
7. Files changed, grouped by shared UI, Booking frontend, contracts/services,
   tests, and seed/demo data.

Do not claim completion for checks that were not run. Do not modify AI-DLC
state. Do not produce another design package. Implement the approved pages.
