# Rough Mockups Questions - Shared Platform

> Stage: Rough Mockups & Concept Visualization
> Intent record: `260630-shared-platform`
> Source context: `intent-statement.md`, `scope-document.md`, `intent-backlog.md`, Enterprise Technical Environment v1.1 frontend standards.

## Q1. Primary entry points

Which entry points should the rough mockups prioritize?

A. `apps/auth` sign-in plus `apps/reference-data` admin workspace (recommended)
B. `apps/reference-data` only; defer auth UI sketches
C. Include downstream module entry points for Charge, Booking, and Container Movement
X. Other (please specify)

[Answer]: A. Auth plus admin (Recommended)

## Q2. Core happy path

What core user flow should be sketched first?

A. Internal user signs in, lands in reference admin, edits a reference record, and sees sync/event status (recommended)
B. Platform operator reviews Kafka topic health only
C. Downstream module user consumes reference data in their own module UI
X. Other (please specify)

[Answer]: A. Sign in and edit reference (Recommended)

## Q3. Information hierarchy

How should `apps/reference-data` organize the nine reference sets?

A. Left navigation by reference set, list/detail workspace, validation/event status panel (recommended)
B. One dashboard with cards for all reference sets and modal-only editing
C. Separate top-level app route per reference set with no shared workspace
X. Other (please specify)

[Answer]: A. Nav plus list/detail (Recommended)

## Q4. Form factors

Which form factors must rough mockups consider?

A. Desktop-first admin workflow with responsive tablet/mobile read-only consideration (recommended)
B. Mobile-first editing workflow
C. Desktop only, no responsive consideration at this stage
X. Other (please specify)

[Answer]: A. Desktop first (Recommended)

## Q5. Accessibility baseline

What accessibility target should the mockups annotate?

A. WCAG 2.1 AA with keyboard navigation, landmarks, heading hierarchy, visible focus, and text error states (recommended)
B. Basic color contrast only
C. Accessibility deferred to Refined Mockups
X. Other (please specify)

[Answer]: A. WCAG 2.1 AA (Recommended)
## Q6. Design system and brand guidance

Which design-system or brand guidance should the rough mockups follow?

A. Follow Enterprise Technical Environment v1.1 frontend standards and the `@erp/ui` atomic-design component library; no separate brand system is provided yet (recommended)
B. Use a separate LinerCore brand/design system if one exists outside the provided docs
C. Defer design-system alignment until Refined Mockups
X. Other (please specify)

[Answer]: A. Enterprise + @erp/ui (Recommended)