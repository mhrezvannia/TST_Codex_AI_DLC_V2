# Charge & Agreements Page Additions

This file contains W2-03 Charge-domain additions only. `design-system/linercore/MASTER.md`, the executable `@erp/ui` package, and the shared authenticated shell remain authoritative. Nothing here changes global navigation, typography, palette, tokens, primitives, or journey-ribbon rules.

## Owned Routes

| Route | Charge-owned purpose |
|---|---|
| `/charge-agreements` | Agreement list and module entry |
| `/charge-agreements/new` | Create a draft agreement version |
| `/charge-agreements/[agreementId]` | Agreement/version detail, rates, lifecycle, and audit |
| `/charge-agreements/[agreementId]/edit` | Edit a draft by creating/updating the current draft version |
| `/charge-agreements/rates` | Unified tariff, surcharge, and local-charge entry list |
| `/charge-agreements/rates/new` | Create an effective rate entry |
| `/charge-agreements/rates/[rateId]` | Rate detail/version history and permitted full-page Draft edit through the same route pattern's `?mode=edit` state |
| `/charge-agreements/manual-pricing` | No-rate exception queue and evidence; no invented resolution workflow |

Module-local tabs may link Agreements, Rate entries, and Manual pricing inside the routed content header. They are not additions to global shell navigation.

All Charge administration routes require **no workflow ribbon** through the shared route-metadata seam. The currently observed `PlatformShell` has no such seam and always renders a title-inferred ribbon; this is dependency DS-03 below, not an existing PASS. The Booking journey ribbon remains owned by Booking context.

## Charge-Specific Vocabulary

- Rate categories are `BASE`, `SURCHARGE`, and `LOCAL`; show readable labels with OFR, BAF, and THC codes.
- Always show rate basis, quantity, currency, amount, effective dates, rate version, agreement version, and pricing reference where applicable.
- Agreement lifecycle labels are Draft, Approved, Suspended, and Expired; status is text/icon plus semantic token, never color alone.
- Approved commercial history is read-only. A correction starts a new draft/version; it never silently edits the approved basis.
- No-rate evidence uses `MANUAL_PRICING_REQUIRED`, the unmatched dimensions, reason, Booking reference, and correlation. Do not offer a fake manual amount or approval action unless a later requirement provides that workflow.

## Rate Version Lifecycle and Applicability

- A rate version moves `Draft -> Approved`. The Pricing Analyst actor creates, edits, reviews, and approves versions under the existing Charge mutation capability model. Approved versions are immutable.
- Effective state is derived, not a separate command: an Approved version is Scheduled before `effectiveFrom`, Effective inside its window, and Expired after `effectiveTo`.
- Agreement approval is permitted only when every attached rate version is Approved and the relevant windows cover the agreement/pricing case.
- `BASE` (OFR) and `SURCHARGE` (BAF) match origin + destination + equipment type for the W2-03 lane slice.
- `LOCAL` (POL THC) matches `pol`/origin port + equipment type. Destination is not captured or matched for the local entry; its locality is visibly fixed to POL in this intent.

## Page Patterns

- Lists use the master command-bar/filter/table pattern with stable result count and pagination. Rate entries use one table filtered by category rather than three duplicate page systems.
- Agreement detail leads with identity, version, status, validity, and permitted actions; then applicability and charge lines; version history; collapsed audit.
- Rate detail leads with code/category, lane/equipment applicability, basis/amount/currency, effective window, version/source, and dependent approved agreements.
- Create/edit uses grouped fields and a compact editable charge-line table. Validate on blur, retain values after errors, focus the error summary after submit failure, and protect dirty state.
- Approval uses a focused confirmation dialog with agreement/version, validity, applicable rate versions, line count, and explicit immutability consequence. Focus returns to the Approve trigger.
- Booking pricing is not redesigned here. W2-03 supplies real itemised data to the existing Booking pricing surface and may add only the minimum line/provenance rendering required by the contract.

## Existing Booking Surface Integration Contract

The existing Booking detail/pricing region must expose, without changing Booking navigation or ownership:

- current pricing state and amendment sequence;
- pricing basis and `pricingRef`;
- each line's charge code, category, per-container basis, quantity, source unit-rate amount, calculated line `amount`, currency, and source rate-version reference;
- total and currency;
- source agreement/version where the basis is `AGREEMENT`;
- prior/current snapshot selector or comparison after repricing; and
- `MANUAL_PRICING_REQUIRED` plus reason for no-rate, distinct from pending/timeout/503/circuit/denied/validation states.

The provider contract's line `amount` remains the calculated line amount. Quantity, per-container basis, unit-rate source, and exact rate/agreement versions are persisted as Booking snapshot provenance; additive wire evolution requires synchronized Charge-provider and Booking-consumer sign-off.

## Roles and Route Behavior

| Role/capability | Agreements | Rate versions | Manual queue |
|---|---|---|---|
| Charge reader/auditor | Read and audit | Read and audit | No implicit access; manual-case counts/evidence require the explicit Pricing Analyst manual-evidence capability |
| Pricing analyst | Create/edit/approve versions; suspend/expire where permitted | Create/edit/approve versions | Responsible role queue; investigate missing basis; no invented manual amount |
| Booking desk | No Charge mutation | No Charge mutation | Opens its related Booking state |

An authenticated user without Charge-read capability receives the shared denied route. A Charge reader without mutation capability sees agreement/rate pages in read-only mode with mutation commands absent and an explanatory status. Charge-read alone never discloses manual-case counts, reasons, Booking references, or correlations; the manual queue/API requires the explicit Pricing Analyst manual-evidence capability.

## Async Command Behavior

- Save/Approve/Reprice commands disable while pending and expose `Saving...`, `Approving...`, or `Repricing...` text; duplicate submission is impossible.
- Success uses a concise toast/live announcement and updates identity/status without moving focus unexpectedly.
- Validation/conflict returns focus to the error summary first, then its links move to fields.
- Service/degraded failures preserve form or selected record, identify the affected action, and offer a safe Retry when the contract permits it.

## Responsive Additions

- At 1440 and 1024px, list/detail pages may use a main content region plus a compact evidence rail; do not nest cards.
- At 768px, evidence moves below primary content or into an accessible disclosure. Forms use two columns only where labels and controls remain readable.
- At 375px, commands wrap, forms become one column, evidence follows the primary task, and tables use a labelled horizontal scroll region or compact record rows. Editing remains available.
- Keep object identity and primary action visible without sticky elements covering content. No page-level horizontal scroll.

## Required States

Every owned route specifies skeleton loading, empty, populated, service error/retry, denied/read-only, validation, long-content/overflow, and light/dark behavior. Dynamic save, approve, pricing, and exception changes use polite announcements and never steal focus.

## Accessibility Additions

- One `h1` names the route; sections use ordered `h2`/`h3` headings.
- Lists/tables expose captions or labelled regions, real column headers, keyboard-reachable row links/actions, and non-color status text.
- Money values use readable currency/amount text; identifiers use the existing mono token only where useful.
- Every form input has a persistent label and associated hint/error; invalid submit focuses a summary linked to fields.
- Approval dialog must trap focus, support Escape when safe, and restore focus; current implementation depends on DS-01 below and is not presumed compliant.
- The manual queue announces filter/result updates and exposes reason plus recovery ownership in text.

## Observed Shared-Capability Dependencies

These are current-source observations, not Charge-owned redesign requests. W2-03 must not edit `packages/ui` or the shared shell and must keep the affected acceptance cells blocked until the named behavior is proved on the integrated Wave A stack.

| ID | Observed limitation | Charge treatment / owner |
|---|---|---|
| DS-01 | Current shared `Dialog` focuses its container and handles Escape but does not trap Tab or restore the trigger. | A Charge-local lifecycle-dialog composition may wrap the existing primitive to store/restore its trigger and scope Tab while open; general remediation remains W2-02. No new shared export. |
| DS-02 | Current shared `Combobox` lacks `aria-activedescendant` and explicit async loading/error inputs. | Surround with existing `Skeleton`/`StatusStrip` and mount after options settle; full active-option semantics remain a W2-02 dependency or use an approved existing alternative. Do not claim the cell passed from design intent. |
| DS-03 | Current `PlatformShell` always renders the ribbon using title inference and exposes no route-metadata suppression seam. | Integrate W2-02's shared-shell seam through the program merge protocol. Charge must not hide/restyle it locally. No-ribbon Playwright evidence remains blocked until the running shell proves suppression. |

## Explicitly Rejected Skill Suggestions

- Marketing hero, logo carousel, industry conversion tabs, Contact Sales, or gateway composition.
- New blue/amber palette, Fira fonts, remote font imports, gradients, or Charge-local theme.
- Spinners in place of stable-size LinerCore skeletons.
- Generic bulk edit, chart/KPI dashboards, or pricing simulation beyond the approved thin slice.
- Local shell, module sidebar, global navigation reorder, or `packages/ui` changes.
