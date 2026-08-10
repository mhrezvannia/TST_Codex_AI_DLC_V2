# Refined Mockups Questions — W2-03 Charge Tariffs & Agreements

## Upstream Basis

These decisions refine the approved [`wireframes.md`](../../ideation/rough-mockups/wireframes.md), [`user-flow.md`](../../ideation/rough-mockups/user-flow.md), [`stories.md`](../user-stories/stories.md), [`requirements.md`](../requirements-analysis/requirements.md), and [`team-practices.md`](../practices-discovery/team-practices.md). `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, `@erp/ui`, and `design-system/linercore/pages/charge-and-agreements.md` are binding; skill/search output is advisory.

## Skill Findings Applied or Rejected

- Apply data-dense tables, filtering, keyboard order, named mobile table overflow/record layouts, blur validation, error announcements, contrast, reduced motion, and finite viewport testing.
- Reject Enterprise Gateway/marketing composition, Contact Sales, logo carousel, a new blue/amber palette, Fira fonts, remote imports, charts/KPI cards, spinner-first loading, new shell/navigation, and generic component-library work.
- Treat Next.js server-read recommendations as advisory; the existing authenticated BFF, `api-core`, query/state conventions, and codebase seams decide implementation in Application Design.

## Questions

### Q1 — Page Coverage

Which routed surfaces should receive refined specifications?

- A. All eight Charge-owned route patterns plus the minimum existing Booking pricing-region integration **(Recommended)**
- B. Agreement and rate happy paths only
- C. Charge pages plus a redesigned Booking detail page

[Answer]: A — All eight Charge-owned route patterns plus the minimum existing Booking pricing-region integration (Recommended).

### Q2 — Primary Interaction Pattern

Which interaction model should be binding?

- A. Routed list/detail/full-page editors, focused approval dialog, URL-backed filters, collapsed audit, and no inline commercial editing **(Recommended)**
- B. Modal create/edit flows throughout
- C. Spreadsheet-like inline editing and bulk approval

[Answer]: A — Routed list/detail/full-page editors, focused approval dialog, URL-backed filters, collapsed audit, and no inline commercial editing (Recommended).

### Q3 — Screen States

What state depth should each applicable page specify?

- A. Loading skeleton, empty, populated, validation/conflict, pending, success, service error/retry, denied/read-only, long-content, and manual/degraded variants **(Recommended)**
- B. Happy path plus generic error
- C. Loading, populated, and no-rate only

[Answer]: A — Loading skeleton, empty, populated, validation/conflict, pending, success, service error/retry, denied/read-only, long-content, and manual/degraded variants (Recommended).

### Q4 — Design-System Mapping

How should components be sourced?

- A. Map only to existing `@erp/ui` primitives/tokens; record any missing shared primitive for W2-02 rather than changing `packages/ui` **(Recommended)**
- B. Add Charge-local copies of missing primitives
- C. Extend `packages/ui` inside W2-03

[Answer]: A — Map only to existing `@erp/ui` primitives/tokens; record missing shared primitives for W2-02 rather than changing `packages/ui` (Recommended).

### Q5 — Accessibility and Responsive Evidence

What verification contract should the mockups carry?

- A. WCAG 2.1 AA, keyboard/focus/live-region/zoom/reduced-motion checks, and light/dark layouts at 375/768/1024/1440 px **(Recommended)**
- B. Desktop WCAG automation only
- C. Responsive screenshots without keyboard or announcement checks

[Answer]: A — WCAG 2.1 AA, keyboard/focus/live-region/zoom/reduced-motion checks, and light/dark layouts at 375/768/1024/1440 px (Recommended).

### Q6 — API and Booking Boundary

How should API developer experience and Booking consumption appear in these UI artifacts?

- A. Document BFF/API/loading/error contracts and annotate only the existing Booking pricing region; do not create developer-facing UI or redesign Booking navigation **(Recommended)**
- B. Omit API/browser-boundary behavior from interaction specs
- C. Add a Charge API explorer and redesign Booking detail

[Answer]: A — Document BFF/API/loading/error contracts and annotate only the existing Booking pricing region; do not create developer-facing UI or redesign Booking navigation (Recommended).

## Ambiguity Check

All six answers select one explicit option, contain none of the ambiguity signals “mix of”, “not sure”, “depends”, or “probably”, and remain consistent with the approved requirements and Wave A ownership. No follow-up is required.
