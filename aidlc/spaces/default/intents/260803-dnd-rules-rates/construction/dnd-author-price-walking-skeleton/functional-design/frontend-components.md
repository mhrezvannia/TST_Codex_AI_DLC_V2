# Frontend Components - dnd-author-price-walking-skeleton

## Authority, ownership and accepted guidance

This UI contract refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`, plus approved Refined Mockups and LinerCore authority.

Precedence is approved W3-01 behavior -> security/accessibility/technical standards -> `design-system/linercore/MASTER.md` and executable `@erp/ui` -> approved D&D design/mockups -> page contract -> UI/UX Pro Max. Charge owns routed composition and domain state. W2-02 exclusively owns `packages/ui`, shell and shared Dialog.

Adopted UI/UX Pro Max advice: labelled forms, server-rendered reads, focused client interaction, stable loading dimensions, keyboard/focus discipline and 375/768/1024/1440 verification. Rejected: Enterprise Gateway/marketing composition, hero/logo/CTA sections, replacement blue/orange palette, Lexend/Source Sans fonts, promotional animation and any calculation simulator. The obsolete page-contract split `/rules`/`/rates` routes and evaluation panel are superseded by approved `/dnd/terms` combined routes and direct-API evaluation acceptance.

## Route and component hierarchy

```text
PlatformShell (W2-02, Charge Agreements active, no journey ribbon)
  DndTermsListRoute /charge-agreements/dnd/terms
    DndTermsFilters
    DndTermsResultsTable | DndTermsRecordList
    Pagination
  DndTermsCreateRoute /charge-agreements/dnd/terms/new
    DndTermsForm
      FixedRuleBounds
      PricingBasisFields
      ApplicabilityFields
      FlatTermsFields
      EffectiveWindowFields
      ErrorSummary
  DndTermsDetailRoute /charge-agreements/dnd/terms/[dndTermsId]
    DndTermsIdentityHeader
    CommercialTermsSection
    VersionEvidenceSection
    DndStatusStrip
    CollapsedAuditEvidence
    DndApprovalDialog (shared Dialog dependency)
```

The route composition uses server components for authorised initial reads. Client components are limited to filters, form state, pending commands, confirmation and announcements.

## View models and state ownership

| Component | Server facts/props | Local client state | Commands |
| --- | --- | --- | --- |
| `DndTermsListRoute` | Page, safe query, capability | Filter draft before Apply | URL navigation only |
| `DndTermsForm` | Reference options, fixed rule mapping, initial Draft values | Dirty fields, touched/errors, pending | Create Draft |
| `DndTermsDetailRoute` | Exact selected version, actions, audit discriminator | Disclosure state | Open approval confirmation |
| `DndApprovalDialog` | Exact Draft summary and expected row version | Open/pending/error | Approve once |

Authorization-derived actions come only from server view models. Browser state never grants capability or supplies movement bounds/side.

## Form and interaction rules

- Persistent labels and required indicators precede controls.
- Rule type change derives readable DCSA code/qualifier pair and POD/POL side without an editable override.
- Canonical reference comboboxes show code plus readable label; provider failure never invents options.
- Blur validation is advisory; submit repeats full server validation. Server field paths map to controls and a linked summary.
- Validation, reference error, overlap or service failure preserves every safe entered value and focuses/announces the summary.
- Save/Approve disables duplicate command submission while pending. A persistent returned detail proves success; Toast is supplementary.
- Approval summary names exact version, applicability, inclusive window, flat terms, basis link, reason, overlap status and immutability consequence.

## Designed states

| State | Composition/recovery | Evidence status before live run |
| --- | --- | --- |
| Loading | Geometry-matched shared Skeleton | BLOCKED |
| True empty | `No D&D terms yet` plus permitted Create | BLOCKED |
| Filtered empty | Active filters plus Clear/edit recovery | BLOCKED |
| Denied | Shared no-disclosure state; no commercial facts | BLOCKED |
| Read-only | Mutation commands absent; readable status | BLOCKED |
| Validation blocked | Error summary, field links, retained values | BLOCKED |
| Pending | Stable command label; duplicate blocked | BLOCKED |
| Success | Stable detail and one concise announcement | BLOCKED |
| Conflict/overlap | Exact expected/current or authorised conflict; review/correct | BLOCKED |
| Provider error | Affected control/section names source and Retry | BLOCKED |

`BLOCKED` means designed but not yet observed; mockups or source review do not constitute PASS.

## Responsive and accessibility contract

- 375: shared mobile shell, record list, one-column form, wrapped commands, no page-level horizontal scroll.
- 768: filters may form two columns; tables use labelled inner overflow or records.
- 1024/1440: compact table and detail/evidence rail with controlled line length.
- Keyboard order matches visual order; focus uses `--erp-focus-ring`; skip link reaches the shared main landmark.
- Status pairs token color with text; DCSA codes include readable meanings; money includes currency and calendar-day basis.
- Dialog requires accessible title and description, trap, safe Escape and trigger restoration. Until W2-02 ships the description seam, dialog integration is BLOCKED and no local fork is permitted.
- Announcements are concise; reduced motion is respected; light/dark WCAG 2.1 AA and 200% zoom are required.

## API integration and acceptance traceability

The BFF calls only `/api/charge-dnd-terms` administration endpoints with server identity/correlation. It never calls service storage, exposes service tokens, or adds a browser calculation action. U01 UI evidence must link the create/approve/detail ids to the direct provider zero/non-zero results and the recorded merged W2-02 package revision.

| Surface | Requirement/story | Shared reuse | Domain composition | Status |
| --- | --- | --- | --- | --- |
| List/create/detail | FR-01, FR-02, FR-09; US-01 | Shell, form, table, Button, Skeleton, StatusStrip | D&D filters/form/facts | BLOCKED pending live Bolt |
| Approval | FR-03 foundation, FR-12 | Shared Dialog after W2-02 seam | Exact terms review command | BLOCKED on platform + live evidence |
| Responsive/a11y | NFR-06, US-01 AC4 | Tokens and primitives | Route state/focus mapping | BLOCKED pending Playwright |
