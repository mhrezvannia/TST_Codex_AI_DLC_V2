# Rough Mockups Questions — W4-01 Module List-Detail Uplift

## Upstream and Answer Mode

Upstream sources: `intent-statement.md`, `scope-document.md`, and `intent-backlog.md`.

- Answer mode: Guide me.
- Confirmation: Confirmed on 2026-08-03.
- Design authorities: LinerCore `MASTER.md`, `SESSION-PROMPT.md`, executable `@erp/ui`, and the active page contracts.

## Confirmed Answers

1. **Primary entry points?**
   [Answer]: Permitted module navigation in the one authenticated shell and exact canonical deep links/cross-links.
2. **Concept fidelity?**
   [Answer]: One shared low-fidelity list/detail pattern plus three domain-specific information-hierarchy variants.
3. **Detail hierarchy?**
   [Answer]: Object identity and status, permitted action area, domain tabs/sections, then collapsed audit/evidence.
4. **Narrow list behavior?**
   [Answer]: Keep identity link and key status visible; use intentional horizontal handling for secondary columns.
5. **State coverage?**
   [Answer]: Loading, true-empty, filtered-empty, denied/read-only, error/retry, degraded, populated, action pending/success/validation/conflict/error, stale, and not-found as applicable.
6. **Accessibility baseline?**
   [Answer]: WCAG AA interaction notes for headings, landmarks, keyboard entry/order, focus, labels, announcements, reduced motion, and responsive behavior.
7. **Detailed task timing?**
   [Answer]: Tasks 21 → 22 → 23 remain deferred until Requirements Analysis and User Stories are approved, within the same parked Refined Mockups stage.

## UI/UX Skill and Governance Disposition

Accepted advisory guidance:

- Data-dense table/list composition with filters and clear row links.
- Visible focus, logical keyboard order, accessible names, announced errors/status, reduced motion, and stable skeletons.
- Intentional mobile table overflow/priority handling and verification at 375/768/1024/1440 (plus intent-required 390).
- Server-rendered reads, route loading boundaries, reserved dimensions, and authorized/validated server actions.

Rejected advisory guidance:

- Marketing gateway, hero/video, logo carousel, industry tabs, sales CTA, and conversion composition.
- Alternate blue/amber palette, Fira/remote fonts, decorative dashboard cards, or raw spinner-first loading.
- Bulk actions as table stakes; they are explicitly out of W4-01 scope.

## Contradiction Analysis

- Low-fidelity domain variants do not approve exact fields, actions, or provider capabilities.
- Direct module ports are implementation/diagnostic surfaces, never the canonical journey.
- “Shared pattern” means shared shell/tokens/primitives and predictable behavior; it does not mean a generic domain component or app-to-app import.
- A dense table may scroll intentionally on narrow screens, but the page itself may not overflow and primary record access cannot disappear.
- The workflow ribbon remains absent from Reference Data and appears only where explicit journey context requires it.
- No decision conflicts with `intent-statement.md`, `scope-document.md`, or `intent-backlog.md`.
