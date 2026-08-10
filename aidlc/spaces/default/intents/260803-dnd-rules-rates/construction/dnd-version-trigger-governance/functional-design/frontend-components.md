# Frontend Components - dnd-version-trigger-governance

## Authority and ownership

This UI contract refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`, plus approved Refined Mockups and LinerCore authority.

Charge owns list/detail/edit/successor/history and AgreementVersion relationship compositions. W2-02 owns `PlatformShell`, shared navigation/tokens/primitives and the accessible `Dialog`. UI/UX Pro Max is conformance input only: compatible form/table/focus/responsive advice is retained; marketing, new palette/fonts, chart-first, spinner-first, split rule/rate pages and a calculation panel are rejected.

## Component hierarchy

```text
DndTermsListPage
  DndTermsFilters
  DndTermsTable | DndTermsRecordList
DndTermsDetailPage
  DndTermsIdentityHeader
  LifecycleAndEffectiveStatus
  CommercialTerms
  PricingBasisEvidence
  DndVersionHistory
  CollapsedAuditEvidence
  DndApprovalDialog
DndTermsForm
  Create | Edit Draft | Create Successor modes
AgreementVersionDetailPage (existing)
  AgreementVersionDndTermsSection
```

The successor form names and links its source. It copies approved facts defined by Refined Mockups, clears effective dates/reason, and never relabels the source as editable.

## State and command model

| Surface | Discriminator/state | Commands |
| --- | --- | --- |
| Detail | Draft + capabilities | Edit Draft, Review and approve |
| Detail | Approved + capability | Create successor only |
| History | selected/current/predecessor/successor | Navigate exact `?version=` links |
| Agreement section | ready(items) | Open exact D&D version links |
| Agreement section | empty | None |
| Agreement section | denied | None; no count/identity |
| Agreement section | unavailable(correlation) | Retry section only |
| Form | idle/dirty/invalid/pending/conflict/error/success | One guarded mutation at a time |

Server view models own permissions and provider discriminators. Client state owns only form dirtiness, local validation hints, dialog visibility/pending state, disclosures and announcements.

## Form, conflict and approval interactions

- Edit is valid only for the current Draft and carries `expectedRowVersion`.
- Submit validation retains values, focuses the linked summary and maps stable server field paths.
- `409 DND_TERMS_VERSION_CONFLICT` presents expected/current evidence and Reload/Review; it does not silently overwrite.
- `422 DND_TERMS_OVERLAP` names the exact key and authorised conflict/window; users may correct dates or open the conflict.
- Approval Dialog uses exact version/applicability/window/terms/basis/reason and states the immutability consequence.
- Pending commands disable duplicates. Successful successor creation lands on the distinct Draft detail and announces it once.

## Designed state and evidence matrix

| Surface/behavior | Shared primitive/token | Domain composition | Required states | Status |
| --- | --- | --- | --- | --- |
| List/filter/history | Table, Input, Select, Badge, Skeleton | D&D query and version links | loading, true/filtered empty, denied, error, ready | BLOCKED pending live evidence |
| Draft/successor form | Form controls, Button, StatusStrip | Derived bounds, copied/cleared values, errors | validation, pending, conflict, provider error, success | BLOCKED pending live evidence |
| Approval | Shared Dialog | Exact immutable review | open, pending, overlap/conflict, success | BLOCKED on W2-02 Dialog + live evidence |
| Agreement relationship | Skeleton, StatusStrip, Button | ready/empty/denied/unavailable | all four discriminators | BLOCKED pending live evidence |

## Responsive and accessibility behavior

- 375: records instead of wide tables, one-column form, history in reading order, wrapped commands.
- 768: labelled inner table overflow; evidence follows primary content or accessible disclosure.
- 1024/1440: compact table and narrow action/evidence rail.
- Every status includes lifecycle/effective text; selection/current/predecessor/successor does not rely on color.
- Focus moves to error summary on failed submit, to stable Draft heading after successor success, and back to the trigger when Dialog closes.
- Dialog requires name, description, trap, safe Escape and trigger restoration. Evidence remains BLOCKED until the merged W2-02 revision passes package tests.
- Keyboard order, visible focus, announcements, reduced motion, light/dark WCAG AA, 200% zoom and no mobile page overflow are mandatory.

## API integration and traceability

The BFF uses the approved admin endpoints and AgreementVersion relationship endpoint. Query normalization prevents unknown/duplicate parameters from reaching the provider. Known Agreement facts remain visible when only the D&D relationship provider is unavailable.

| Outcome | Requirements/stories |
| --- | --- |
| Immutable lifecycle and successor | FR-03, FR-10, FR-12; US-02 |
| Complete authoring breadth | FR-01, FR-02, FR-09; US-01 |
| Metadata-only fresh triggers and exact replay | FR-10, FR-11; US-02 AC5 |
| Accessible UI states | NFR-06; AC-10 |
