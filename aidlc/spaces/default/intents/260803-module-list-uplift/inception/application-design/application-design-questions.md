# Application Design Questions - W4-01 Module List-Detail Uplift

## Upstream Sources and Decision Boundary

These questions refine approved `requirements.md` and `stories.md` against brownfield `architecture.md`, `component-inventory.md`, and `team-practices.md`, plus the approved Refined Mockups artifacts. Existing service-owned data, ports-and-adapters boundaries, Kafka/Avro flows, one LinerCore shell, shared auth/tokens/`@erp/ui`, and the isolated Compose acceptance boundary are fixed constraints, not choices.

Choose one option for each question. Options do not authorize new business behavior, a shared-component fork, new AWS infrastructure, or production claims.

## Q1. Container Movement frontend source boundary

Where should the absent CMM frontend and BFF be owned?

- A. New shellless `apps/container-movement` domain app (Recommended) - Own CMM routes/BFF/view models in a feature-local Next.js app, mounted under the existing shell and edge; it must not create its own shell, theme, or auth boundary.
- B. Routes directly inside `apps/shell` - Let the platform shell own CMM domain composition and BFF code.
- C. Routes inside `apps/booking` - Extend the Booking app because it already displays a Journey projection.
- X. Other (please specify)

[Answer]: A

## Q2. Canonical shell composition for existing domain apps

How should Reference Data and Charge Agreements join the canonical shell without relocating their domain code?

- A. Shell registry plus edge-mounted domain routes (Recommended) - Keep domain route/BFF ownership in each app; the platform registry owns navigation, permission metadata, chrome, and canonical mount paths.
- B. Move all domain pages into `apps/shell` - Consolidate source code physically under the shell.
- C. Keep standalone app shells - Link from LinerCore to each independently themed/chromed app.
- X. Other (please specify)

[Answer]:A
## Q3. Container Movement timeline normalization owner

Which boundary owns the one ordered expected/actual timeline and canonical movement labels?

- A. Additive CMM provider projection (Recommended) - The service exposes a typed ordered timeline/read projection; the BFF performs transport-to-view translation only.
- B. Contracted CMM BFF normalization - The BFF combines current `expectedMovements` and `history` under a versioned, producer-approved mapping and exhaustive tests.
- C. Browser calculation - The client joins arrays, infers lifecycle, and chooses the next movement.
- X. Other (please specify)

[Answer]:A

## Q4. Identity and action-capability enforcement

Where should actor identity and module/action authorization be enforced for all new routes?

- A. Fail-closed BFF policy adapter (Recommended) - Derive subject from the real session, authorize each read/action through Identity, strip browser actor/capability inputs, and call providers only after ALLOW.
- B. Shell navigation only - Treat hidden navigation and client capability flags as sufficient enforcement.
- C. Provider-local fallback actor - Continue browser or `local-user` actor input when Identity is unavailable.
- X. Other (please specify)

[Answer]:A

## Q5. Charge Approval Queue route admission

When should `/charge-agreements/approvals` become implementation-binding?

- A. Only after both bounded server filters are verified (Recommended) - Admit each Agreements/rates segment only with its own Draft/pending filter and pagination; otherwise render that segment unavailable and retain existing direct workflows.
- B. Build one client-merged queue now - Download Agreement and rate pages and combine/sort them in the browser.
- C. Remove all approval navigation - Require users to find Drafts only through unrelated list routes even when server filters exist.
- X. Other (please specify)

[Answer]:A

## Q6. Last-known and degraded read source

What may supply last-known Reference, Charge, or CMM facts during a dependency outage?

- A. Existing authorized provider persistence/metadata only (Recommended) - Show last-known only when the owning service/BFF already returns persisted facts with freshness/source time; add no W4 cache, and otherwise show provider error.
- B. New shared UI cache - Persist prior browser responses across sessions and reuse them during outage.
- C. Silent stale fallback - Show the last response without a freshness label while actions remain available.
- X. Other (please specify)

[Answer]:A

## Q7. Shared behavior and safe-return gaps

How should missing shared shell/`@erp/ui`/safe-navigation behavior be handled during W4 implementation?

- A. Platform dependency with fail-closed domain adapter (Recommended) - Consume existing shared exports first; use only narrow domain composition around existing primitives, route general gaps to W2-02, and keep affected evidence BLOCKED until the shared release is integrated.
- B. Temporary domain forks - Copy shell, Drawer, form, token, or return-validator behavior into each app and consolidate later.
- C. Relax validation - Permit arbitrary return URLs or incomplete focus/dialog behavior until a shared primitive arrives.
- X. Other (please specify)

[Answer]: A

## Answer Analysis

All seven answers are complete and valid. They consistently preserve brownfield service/data ownership, one LinerCore shell, domain-owned shellless route/BFF composition, provider-owned lifecycle truth, fail-closed Identity enforcement, verified server-side query capability, existing authorized freshness evidence only, and platform ownership of shared behavior. They introduce no new AWS topology, database, cache, synchronous Booking-to-CMM command, app-to-app business import, browser-authoritative policy, or UI-derived business state. No ambiguity or contradiction blocks artifact generation.
