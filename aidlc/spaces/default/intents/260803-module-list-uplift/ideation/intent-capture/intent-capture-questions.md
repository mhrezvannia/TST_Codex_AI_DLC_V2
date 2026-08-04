# Intent Capture Questions — W4-01 Module List-Detail Uplift

## Q1. Release outcome

Which outcome defines the business success of W4-01?

- A. All three operational modules reach Booking-level shell-mounted list/detail parity and their legacy standalone workbench routes are retired (recommended)
- B. Improve the three standalone applications without changing their canonical mount
- C. Deliver Reference Data only and defer Charge and Container Movement
- X. Other (please specify)

`[Answer]:` A — Three-module parity (Recommended)

## Q2. Delivery and approval boundary

How should the three vertical module units relate to the intent-level release?

- A. Keep each module independently mergeable in Reference Data → Charge → Container Movement order, but close W4-01 only after all three pass live evidence and audits (recommended)
- B. Merge and release all three only as one indivisible batch
- C. Close W4-01 after Reference Data proves the pattern; track the other two separately
- X. Other (please specify)

`[Answer]:` A — Independent units (Recommended)

## Q3. Missing Container Movement frontend

The current workspace has no `apps/container-movement` source or standalone workbench. How should W4-01 frame this unit?

- A. Treat the W2-04 service, contracts, approved page contract, and design artifacts as the source; create the canonical shell-mounted route directly and retire no nonexistent standalone UI (recommended)
- B. Restore or provide the expected `apps/container-movement` source before Requirements Analysis
- C. Defer the Container Movement unit to a separate intent
- X. Other (please specify)

`[Answer]:` A — Build shell route (Recommended)

## Q4. Brownfield treatment of existing module surfaces

How should the current Reference Data and Charge frontends be treated?

- A. Reuse their existing BFF/domain behavior, migrate canonical page composition into the shared shell, preserve Charge's current list/detail routes, and retire only legacy workbench/standalone entrypoints (recommended)
- B. Rewrite both frontends from scratch
- C. Keep the workbenches and add separate new canonical pages alongside them indefinitely
- X. Other (please specify)

`[Answer]:` A — Reuse and migrate (Recommended)

## Q5. Provider capability gaps

If the current backend cannot support a required server-side filter, sort, pagination, tab relationship, or action, what is the acceptance policy?

- A. Record an owning-module/provider dependency, keep affected evidence BLOCKED, and never simulate or fork the capability locally (recommended)
- B. Implement client-only simulation and count it as complete
- C. Remove the affected UX requirement without recording a gap
- X. Other (please specify)

`[Answer]:` A — Block honestly (Recommended)

## Q6. Decision and review authority

Who decides whether W4-01 artifacts and live behavior are acceptable?

- A. The program/product owner holds final gate authority; the UI Driver leads and Reference Data, Charge, Container Movement, accessibility, and quality owners review their seams (recommended)
- B. The UI Driver alone decides every domain and release question
- C. Each module independently approves its own shell, token, and navigation choices
- X. Other (please specify)

`[Answer]:` A — Shared review (Recommended)
