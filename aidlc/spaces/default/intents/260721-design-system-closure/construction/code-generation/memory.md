# Code Generation Memory

## Interpretations

- 2026-07-21T19:34:57Z - Treat dependency installation as an executable baseline prerequisite; the repository has a Yarn install-state file but no usable `node_modules`, so pre-change test commands cannot establish green or red implementation behavior until `corepack yarn install --immutable` runs after plan approval.

- 2026-07-21T20:02:00Z - The immutable install resolves dependencies but the managed Windows sandbox denies esbuild/sharp child-process spawning with EPERM; shell and Booking typecheck/lint remain executable and green, while Vitest cannot load its config and the shared-UI direct binaries are unavailable after the interrupted link.

- 2026-07-21T20:54:00Z - Relocating Yarn's cache and global folders into the writable workspace allowed deterministic lockfile generation and an immutable skip-build link; child-process-dependent Vitest and Next builds remain sandbox-blocked, while all direct typecheck/lint and Node gates are green.

## Deviations

- 2026-07-21T19:34:57Z - Keep live Compose and final audit execution out of the code-generation PASS claim; code generation authors the required harness, while later Build and Test/Operation stages must observe the canonical live route and hard closure gates.

- 2026-07-21T20:02:00Z - Continue implementation after recording the dependency/test baseline environment failure; do not weaken gates or recast spawn EPERM as an application result, and use executable typecheck/lint/Node checks where possible.

- 2026-07-21T20:54:00Z - Removed only unreachable standalone Booking presentation components, tests, CSS, and their presentation-only form helper after canonical shell equivalents and focused tests existed; retained every Booking BFF API route and transport/security helper.

## Tradeoffs

- 2026-07-21T19:34:57Z - Retain the existing shell-owned Booking composition and redirect only standalone presentation pages; this closes duplicate UI ownership while preserving the Booking BFF, service contracts, and prior integrated work.

## Open questions

- 2026-07-21T20:54:00Z - Build and Test must rerun Vitest and production builds where child spawning is permitted, then execute the mutation-gated Playwright suite only on the guarded isolated Wave A stack.
