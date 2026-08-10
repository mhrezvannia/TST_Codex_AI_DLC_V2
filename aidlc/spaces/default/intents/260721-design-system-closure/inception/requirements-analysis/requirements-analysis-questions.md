# Requirements Analysis Questions — W2-02 Design-System Closure

## Context Already Fixed

The following constraints are already decided by `intent-statement.md`, `scope-document.md`, `business-overview.md`, `architecture.md`, `code-structure.md`, and `team-practices.md`: this is a brownfield vertical closure; preserve baseline `c2f13dd` and prior merged work; retain one authenticated shell; use `@erp/ui`; protect the manager demo; verify only through the isolated `linercore-wave-a` stack; preserve the historical W1 blocked/waived record; and require live Playwright plus both closure audits.

## Q1. How should the canonical shell and Booking module boundary be expressed as a testable requirement?

A. The user-facing `/booking` journey remains hosted by the existing authenticated `apps/shell` shell; Booking may retain its BFF and internal route code, but duplicate module chrome/navigation/theme must be removed or bypassed, and applicable Booking presentation must consume `@erp/ui` (recommended)
B. Keep both shell-owned and standalone Booking chrome as long as their visuals match
C. Replace the existing W2-01 shell wholesale with the `packages/ui` shell primitive
D. Treat shell reconciliation as out of scope and verify the standalone Booking frontend instead
X. Other (please specify)

[Answer]: A — Preserve one shell (Recommended) — 2026-07-21T13:36:03Z — **Mode:** guided

## Q2. How may difficult loading, empty, error, denied, pending, success, and degraded states be produced for Playwright evidence?

A. Exercise the real live backend for the happy path and use documented, deterministic request interception or controlled service conditions only for otherwise impractical state variants, always against the running canonical route (recommended)
B. Require every state to arise naturally from live service data, even if the run becomes non-deterministic
C. Permit a detached mocked page or component harness as equivalent acceptance evidence
D. Require source-level tests only for the non-happy-path states
X. Other (please specify)

[Answer]: A — Controlled live route (Recommended) — 2026-07-21T13:36:03Z — **Mode:** guided

## Q3. What anti-drift enforcement should close the current styling loopholes?

A. Enforce application-wide rejection of hardcoded color literals and local `CSSProperties` style systems across applicable TS/TSX/CSS sources, while allowing the owning `packages/ui` token implementation and documented semantic-native exceptions; prove rejection with non-writing negative probes (recommended)
B. Keep the current Booking TS/TSX-only hex check unchanged
C. Ban every native HTML element even where it is the correct accessible semantic primitive
D. Rely on reviewer inspection without an automated rejection gate
X. Other (please specify)

[Answer]: A — Application-wide (Recommended) — 2026-07-21T13:36:03Z — **Mode:** guided

## Q4. How should closure react if any required live check, demo guard, production build, Playwright matrix item, or audit fails?

A. Keep W2-02 acceptance pending, preserve the failure evidence, fix only in-scope causes, and rerun the affected proof plus final demo guard and audits; never convert partial success or the W1 waiver into PASS (recommended)
B. Close W2-02 when the happy path passes and log remaining failures as follow-up work
C. Close W2-02 when static checks pass even if live proof is unavailable
D. Allow an audit waiver to replace failed live evidence
X. Other (please specify)

[Answer]: A — Remain pending (Recommended) — 2026-07-21T13:38:21Z — **Mode:** guided
