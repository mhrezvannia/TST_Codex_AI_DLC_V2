# Functional Design Questions — booking-design-system-closure

## Context

These questions refine the single Unit in `unit-of-work.md` and its story allocation in `unit-of-work-story-map.md`. They preserve `requirements.md`, `components.md`, `component-methods.md`, and `services.md`: the existing authenticated shell is canonical, `packages/ui` owns shared presentation, the current Booking BFF/service contracts remain authoritative, and live proof uses only the isolated Wave A stack.

The ui-ux-pro-max search reinforces data density, filtering, focus visibility, reduced motion, and responsive verification. Its Enterprise Gateway, marketing CTA/hero, alternate blue/amber palette, remote Fira fonts, and spinner recommendations are rejected because they conflict with the LinerCore master, executable `--erp-*` tokens, system font policy, and shared Skeleton contract.

## Q1 — Route and State Model

Should list/detail reads remain server-oriented with focused client components owning filters, form/actions, announcements, and retry state, expressed through explicit discriminated UI states rather than a new global store?

- **A (recommended):** Server-oriented reads plus focused route-local client state; explicit `loading | empty | populated | denied | error | degraded` view models.
- **B:** Introduce a new cross-route/global client state store for Booking.

[Answer]: A — Server-oriented reads plus focused route-local client state with the approved `populated` discriminator and explicit normalization from existing shell load results.

## Q2 — Duplicate Presentation Closure

How should the standalone `apps/booking` presentation routes be handled while retaining their existing BFF endpoints and protections?

- **A (recommended):** Replace standalone presentation entry points with same-origin redirects to canonical shell `/booking` routes; retain `apps/booking/app/api/**` and its BFF libraries.
- **B:** Keep both presentations but hide the standalone links.
- **C:** Delete the Booking app including its BFF surface and move the BFF into the shell.

[Answer]: A — Redirect standalone presentation entry points to the canonical shell routes while retaining the Booking BFF.

## Q3 — Lifecycle Action Orchestration

Should create → validate → price → confirm remain an explicit UI orchestration over the existing endpoints and returned Booking state, with one in-flight command, preserved valid form data, typed recoverable outcomes, and no new backend state machine?

- **A (recommended):** Preserve existing endpoints/contracts and model only presentation/action state locally.
- **B:** Add a new aggregate UI endpoint that performs all lifecycle actions server-side.

[Answer]: A — Preserve existing lifecycle endpoints and contracts; model only presentation/action state locally with one command in flight.

## Q4 — Difficult-State Proof Boundary

Where should deterministic loading, empty, error/retry, denied, and degraded setup live?

- **A (recommended):** In Playwright helpers/request interception or isolated controlled service conditions, with no production query flag or runtime test mode; semantic locators first and stable `data-state`/`data-testid` only where needed.
- **B:** Add production-visible query flags or a debug state picker to canonical pages.

[Answer]: A — Keep difficult-state setup in Playwright or isolated controlled service conditions; add no production debug state.

## Q5 — Validation, Focus, and Evidence Contract

Should form validation and recovery use the existing field vocabulary plus a shared error-summary/status pattern, preserving valid values and moving focus only on submission outcomes, while tests assert semantic roles/labels before test IDs?

- **A (recommended):** Yes; add the smallest shared primitive only if `@erp/ui` lacks a genuinely generic capability.
- **B:** Replace the existing form schema and interaction sequence as part of the closure.

[Answer]: A — Preserve the existing field vocabulary and valid values, use shared status/error patterns, and prefer semantic assertions.

## Ambiguity Analysis

All five answers select explicit, compatible boundaries. There is no “mix of,” conditional, or unresolved choice. The answers preserve the approved application design: one canonical shell route, retained BFF/service contracts, no new global store or aggregate API, no production test flags, and shared UI/accessibility behavior.
