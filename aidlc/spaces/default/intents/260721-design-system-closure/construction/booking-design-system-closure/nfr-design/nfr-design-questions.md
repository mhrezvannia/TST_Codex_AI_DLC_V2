# NFR Design Questions — booking-design-system-closure

## Context

These decisions implement `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, and `tech-stack-decisions.md` while preserving the canonical behavior in `business-logic-model.md`. They select patterns only within the existing local shell/BFF/service and evidence topology.

The repeated ui-ux-pro-max input contributes density, filtering, focus, reduced-motion, and responsive guidance. Marketing gateway composition, alternate palette/fonts, spinners, and cloud/platform expansion remain rejected.

## Q1 — Performance Design

Should the design retain server-oriented reads, URL pagination capped at the existing 25-record page, shared Skeleton geometry, one command in flight, and observed browser/network timing—without adding caches, prefetch layers, client stores, or timeout increases?

- **A (recommended):** Optimize through bounded existing paths and measurement only.
- **B:** Add caching/global state/prefetch infrastructure without a measured bottleneck.

[Answer]: A — Bound and measure the existing server-read, page-size, Skeleton, and one-command path; add no speculative cache or store.

## Q2 — Resilience Design

Should expected failures map through the typed route/action states, existing 2,500 ms deadline and idempotency, with explicit user retry only where safe—without new automatic retry loops, circuit breakers, queues, or fallbacks that could duplicate commands?

- **A (recommended):** Preserve current resilience seams and add presentation recovery/evidence.
- **B:** Add generic automatic retries/circuit breakers at the UI/BFF layer.

[Answer]: A — Use typed outcomes, current deadline/idempotency, and explicit safe user retry; add no automatic retry stack.

## Q3 — Security Design

Should defense in depth remain the current shell session → same-origin shell adapter → protected Booking BFF → service authorization chain, supplemented by redirect allow-listing, safe UI errors, and evidence redaction, with no new identity/encryption/cloud service?

- **A (recommended):** Strengthen executable regression coverage at existing boundaries.
- **B:** Introduce new identity, secrets, encryption, WAF, or AWS components.

[Answer]: A — Harden and regression-test the current shell/session/BFF/service boundaries plus redirect and evidence controls.

## Q4 — Accessibility and Evidence Architecture

Should a root Playwright harness own authentication, semantic assertions, state arrangement, theme/viewport loops, screenshots/traces, and the evidence manifest, adding a dev-only severity-capable axe adapter only if absent, while production routes expose no test modes?

- **A (recommended):** One external harness against the canonical running route.
- **B:** Add debug state selectors/test modes inside production Booking pages.

[Answer]: A — Use one external root Playwright/axe-capable harness against canonical running routes with no production test mode.

## Q5 — Logical and Infrastructure Components

Should NFR patterns attach to existing shared UI, shell routes/adapters, Booking BFF/services, anti-drift gate, Wave A wrapper, and evidence harness only, with no AWS/IaC/deployment component and the manager demo represented solely as a protected guard constraint?

- **A (recommended):** Preserve the existing logical topology and failure domains.
- **B:** Add cloud deployment and new logical runtime components.

[Answer]: A — Attach NFR patterns only to existing logical components and the acceptance harness; add no cloud runtime.

## Ambiguity Analysis

Every answer selects one concrete pattern and excludes its incompatible alternative. There is no mixed retry, cache, security, test-mode, or topology strategy. The choices implement the approved NFR targets without reopening scope or adding unsupported infrastructure.
