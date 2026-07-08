# Refined Mockups Questions - Shared Platform MVP

> Stage: Refined Mockups
> Intent record: `260630-shared-platform`
> Source context: `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, `team-practices.md`, Enterprise Technical Environment v1.1, `@erp/ui`.

## Q1. UI representation coverage

How should each story be represented in the refined UX artifacts?

A. Map stories to screen groups and state specs rather than one visual per story, with traceability back to story IDs (recommended)
B. Create one mockup section per user story
C. Focus only on the two frontend apps and omit API/event developer experience
X. Other (please specify)

[Answer]: A. Screen groups (Recommended)

## Q2. Interaction patterns

Which interaction patterns should the refined spec prefer for admin workflows?

A. Side navigation, data table/list, detail page or panel, full-page create/edit forms, confirmation dialogs for publish/deactivate, inline validation, progressive disclosure for event/audit details (recommended)
B. Modal-heavy editing for all create/edit workflows
C. Spreadsheet-style inline editing as the primary pattern
X. Other (please specify)

[Answer]: A. Admin patterns (Recommended)

## Q3. Required screen states

Which state coverage should be mandatory in each relevant screen specification?

A. Loading, empty, populated, validation error, authorization denied/read-only, network/system error, publish pending/success/failure, and stale/freshness warning where applicable (recommended)
B. Happy path, loading, and generic error only
C. Only the states shown in the rough wireframes
X. Other (please specify)

[Answer]: A. Full state set (Recommended)

## Q4. Design system alignment

What design-system basis should the mapping use?

A. Enterprise Technical Environment v1.1 plus `@erp/ui` atomic components, with no custom brand system assumed yet (recommended)
B. Define a new LinerCore visual brand system now
C. Keep design-system mapping generic and defer component mapping
X. Other (please specify)

[Answer]: A. @erp/ui basis (Recommended)

## Q5. Accessibility target

What accessibility target should the refined artifacts apply?

A. WCAG 2.1 AA for all auth and reference-data workflows, including keyboard, focus, labels, live regions, contrast, and responsive zoom behavior (recommended)
B. Basic keyboard and labels only for MVP
C. Defer detailed accessibility until implementation
X. Other (please specify)

[Answer]: A. WCAG 2.1 AA (Recommended)

## Q6. Responsive behavior

Which responsive behavior should refined mockups specify?

A. Desktop-first admin workspace, tablet adaptive layout, and mobile read-only/reference lookup by default; mobile editing deferred unless approved later (recommended)
B. Full create/edit parity on mobile for MVP
C. Desktop-only MVP
X. Other (please specify)

[Answer]: A. Mobile read-only (Recommended)

## Q7. API/developer experience

How should API and event developer experience appear in refined mockups?

A. Include developer/consumer contract views for OpenAPI, Avro schema, event envelope, correlation id, and compatibility status without building downstream runtime modules (recommended)
B. Omit API/developer experience because this is a UI stage
C. Include downstream module stub screens now
X. Other (please specify)

[Answer]: A. Contract views (Recommended)
