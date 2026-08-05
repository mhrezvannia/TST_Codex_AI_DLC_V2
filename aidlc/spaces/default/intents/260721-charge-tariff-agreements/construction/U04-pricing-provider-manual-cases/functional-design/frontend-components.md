# Frontend Components — U04 Pricing Provider and Manual Cases

## UI Boundary and Route

U04 owns only `/charge-agreements/manual-pricing`, the already approved read-only OPEN manual-pricing evidence surface. A selected record is deep-linked as `?case=<caseId>` on the same page; list state uses `reasonCode`, `bookingRef`, `openedFrom`, `openedTo`, and one-based `page`. Unknown or unsafe query fields are dropped during canonicalization.

U04 does not add a global or nested route, navigation, shell element, palette, typography, token, global style, `packages/ui` component, quote form, assignment, resolution, approval, or closure control. The page composes existing `@erp/ui` primitives and the Charge-local patterns already recorded in `design-system/linercore/pages/charge-and-agreements.md`.

## Component Hierarchy

```text
ManualPricingPage (server)
  ChargeDomainHeader + existing module-local links
  ManualCaseFilterBar (URL form)
  ManualCaseResultsRegion
    ManualCaseTable / ManualCaseCompactRecords
    Pagination
  ManualCaseEvidencePanel (selected by ?case=)
    RequestIdentity
    ReasonAndStatus
    PricingContext
    CorrelationEvidence
```

The Server Component performs signed-session and `charge-manual-cases:read` checks before calling the BFF. Client code is limited to accessible filter submission, selected-row focus restoration where navigation requires it, and live announcements. RTK is absent and prohibited for this slice; URL/server state is sufficient.

## Evidence Queue

- One `h1` names Manual pricing. Introductory copy states that the view records automatic-pricing exceptions and does not provide a quoting workflow.
- The filter form has persistent labels for booking reference, reason, and opened date range. Apply writes a canonical URL; Clear removes only manual-list filters and selected case.
- The desktop/tablet table columns are Booking reference, pricing request ID, reason, requested departure, opened time, and OPEN status. Rows link to the same canonical URL with `case=<id>` while retaining sanitized filters/page.
- Stable order is opened time descending with NULL legacy times last, then case ID. Reason labels remain exact enough to distinguish no rate, agreement ambiguity, base ambiguity, surcharge ambiguity, and local ambiguity; status never relies on color.
- At 375 px, rows become compact labelled records in the same information order. At 768/1024/1440, the evidence panel moves beside or below the table according to available width. Page-level horizontal scrolling is forbidden; a dense table may use one labelled overflow region.
- Empty without filters explains that no OPEN automatic-pricing exceptions exist. Empty with filters offers Clear filters. Neither invents sample/count data.
- Loading uses stable filter/table/evidence skeleton geometry. Service error preserves safe URL state and offers retry. Denied state exposes no count, booking reference, reason, case identity, or selected-record existence.

## Selected Evidence Detail

`ManualCaseEvidencePanel` renders only after the authorized service returns the selected OPEN case. It shows:

- case ID, pricing request ID, Booking reference and amendment sequence;
- exact safe reason label/code and OPEN status;
- trade lane, POL, POD, equipment type, commodity code, reefer/DG flags, requested/effective dates, equipment quantity, and retained TEU;
- correlation ID, request hash, and opened timestamp; and
- a clear note that pricing has no automatic total and must be handled outside this slice's automatic path.

For an unchanged canonical backfilled winner, the panel shows a restrained `Legacy evidence` marker and renders each unavailable booking/hash/correlation/time/context field as `Unavailable in legacy evidence`; it never parses opaque snapshot JSON, fills values from the current request, or hides the record by inventing a completeness filter.

It never shows or derives a unit rate, line amount, total, agreement/rate candidate count, candidate customer name, assignment, owner, note editor, quote input, approve/reject, resolve, close, or retry/reprice action. Exact IDs wrap without truncating evidence. Copy-to-clipboard is omitted; operators can select text with native browser behavior.

An authorized missing/stale `case` selection renders the safe not-found panel while preserving the queue; it does not infer whether a denied case exists. Closing the panel removes `case` through a normal link and restores a useful heading/result focus after navigation. Browser reload, back, and forward preserve canonical selection.

## BFF and Service Integration

- `listManualCases(searchParams, session)` and `getManualCase(caseId, session)` use U02 compile-time Charge policies with default backend `Accept: application/json`, bounded timeout, correlation propagation, and normalized errors.
- The BFF obtains the human subject/capability from the signed session, strips actor/service/capability headers and unknown parameters, and never calls the service when capability is absent.
- The service independently authorizes `charge-manual-cases:read` before any count or lookup. UI hiding is not authorization.
- List models expose only fields required for rows; detail models expose the safe evidence list above. Neither accepts arbitrary response attributes or commercial values.
- `page` is one-based in the browser and converted to the service's zero-based page. `size` is a fixed Charge-page value within 1–100, not a user-supplied unbounded query.
- 400 filter errors focus/announce a safe filter summary; 403 uses the U02 denied pattern; authorized 404 affects only selected detail; 503 preserves filters/selection and offers retry.

## Accessibility and Responsive Contract

The route provides one `h1`, ordered headings, a real labelled form, table caption/headers or equivalent record labels, visible focus, 44 px targets, keyboard-reachable row/detail/close links, and polite result/detail status regions. Error/denied alerts use assertive announcement only when new. Opened times use semantic `<time>` with UTC source and readable localized presentation.

At 375 px filters are one column and evidence follows the results/selection heading. At 768 px filters wrap without clipped labels and evidence follows the table. At 1024/1440 px the panel may occupy a restrained secondary rail while the results remain primary. Long IDs use overflow wrapping. Light/dark reuse current tokens; animation is nonessential color/opacity feedback, 150–300 ms, disabled for reduced motion. No hover scaling, decorative image, hero, KPI animation, carousel, remote font, or dark-default treatment is introduced.

The page covers loading, empty, filtered-empty, populated, selected detail, selected-not-found, service error/retry, and denied/read-only states. There are no validation-pending/success mutation states because the surface intentionally has no mutation. DS-01/DS-02/DS-03 remain pending until U06 browser evidence; design prose is not a PASS.

## Test and Evidence Hooks

Stable accessible names/test IDs cover filter fields/apply/clear, result region/rows, reason/status, pagination, selected evidence/close, correlation, legacy/unavailable evidence, empty, denied, not-found, and error/retry. Component tests cover URL canonicalization, one/zero-based paging, auth-before-BFF, no unauthorized count, stable NULL-last ordering, safe model projection, unchanged legacy-winner rendering, keyboard navigation, focus after filter/detail navigation, announcements, long content, and absence of every workflow/commercial control.

U06 Playwright evidence must prove direct deep link, reload/back/forward, keyboard-only filter/select/close, real no-rate and ambiguity rows from the isolated stack, safe denied behavior, light/dark, and 375/768/1024/1440 layouts. U04 claims no live or DS pass before that evidence.

## Skill Influence and Rejected Suggestions

`ui-ux-pro-max` was invoked for the manual queue and evidence detail in Next.js. Adopted guidance is semantic table/compact-record responsiveness, persistent labels, keyboard-accessible links, visible focus, URL state, stable loading geometry, restrained line length, Server Components by default, and minimal client interaction.

Suggestions for success actions, destructive confirmations, bulk operations, loading buttons, conversion CTAs, hero content, marketing proof, new palette/type, or decorative motion were rejected because this is a read-only operational exception view under the established LinerCore system. No skill recommendation changes Charge ownership or shared UI.

## Open Questions

The selected detail uses the recorded recommended `?case=` default. No UI-route or interaction ambiguity remains.

## Upstream Coverage

This frontend design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus U04's FR-604/FR-606 boundary, U02 BFF/session/error contracts, `MASTER.md`, `SESSION-PROMPT.md`, and the Charge page override. It does not take U05's Booking-visible breakdown/reprice/manual-state UI or U06's live/Playwright evidence ownership.
