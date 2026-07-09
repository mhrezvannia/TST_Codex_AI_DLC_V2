# Rough Mockups Questions - Shared Platform Local Functionality

## Context

This questions file consumes `intent-statement`, `scope-document`, and `intent-backlog`. Existing app inspection shows `apps/reference-data/app/page.tsx` already has the core workspace layout, reference-set navigation, status/history panels, and disabled create/edit/deactivate buttons. The rough mockups therefore target the transition from static/read-only UI to functional BFF-backed platform operations.

## Questions and Answers

### Q1. What are the primary user entry points and key screens/views?

A. Marketing landing page only.
B. Reference Data Workbench, record create/edit drawer, deactivate confirmation, publication/history panel, auth sign-in/session view, seed run/status view, and local readiness dashboard.
C. Charge agreement screens.
D. Booking screens.
E. Container movement screens.
X. Other (please specify)

[Answer]: B - The key screens are Reference Data Workbench, record create/edit drawer, deactivate confirmation, publication/history panel, auth sign-in/session view, seed run/status view, and local readiness dashboard. Charge, Booking, and Container Movement screens are out of scope for this intent.

### Q2. What is the core user flow?

A. User views static demo data only.
B. User starts/signs into local stack, chooses a reference set, creates or updates a record, verifies persistence, observes history and publication status, and uses contracts/seeds for downstream readiness.
C. User books shipment directly.
D. User generates invoice directly.
E. User deploys production.
X. Other (please specify)

[Answer]: B - The happy path must prove local platform functionality through auth, BFF, backend, persistence, outbox/event status, and contracts/seeds.

### Q3. What does the information hierarchy look like?

A. Single centered card.
B. Dense operations workspace: top status bar, left reference-set navigation, center records table/forms, right details/history/publication panel, lower contract/seed/runtime evidence panels.
C. Hero page with feature descriptions.
D. Mobile-only wizard.
E. Terminal-only output.
X. Other (please specify)

[Answer]: B - The UI should remain an operations workspace, optimized for scanning and repeated administrative tasks.

### Q4. Are there existing UI patterns to follow?

A. Replace everything with a new marketing design.
B. Preserve the current Next.js/BFF page structure and improve it into functional task surfaces with standard forms, tables, panels, status chips, and confirmations.
C. Use a public cloud console style.
D. Use only API docs.
E. Unknown.
X. Other (please specify)

[Answer]: B - Preserve and evolve the existing app structure. This avoids unnecessary redesign and targets the "view-only" issue directly.

### Q5. What device/form factors must be supported?

A. Desktop only.
B. Desktop-first with usable tablet/mobile fallback for record lookup and status inspection.
C. Mobile only.
D. Print only.
E. Terminal only.
X. Other (please specify)

[Answer]: B - Desktop-first is appropriate for internal administration, with responsive fallback for lookup/status workflows.

### Q6. What accessibility requirements apply?

A. None.
B. WCAG 2.1 AA baseline: semantic headings, landmarks, keyboard navigation, focus management for drawers/dialogs, non-color status labels, and accessible error summaries.
C. Color-only indicators are acceptable.
D. Mouse-only actions are acceptable.
E. Unknown.
X. Other (please specify)

[Answer]: B - WCAG 2.1 AA baseline applies. Every actionable control must be keyboard reachable and every status must be text-labeled.

## Analysis

No contradiction exists between UX expectations and scope constraints. The `intent-statement` asks for functional Shared Platform flows, the `scope-document` requires BFF/backend/auth/event proof, and the `intent-backlog` prioritizes U04-U08 as the user-visible platform slice.
