# Code Quality Assessment

## Existing Quality Evidence

The repository has meaningful automated coverage: the developer scan counted 40 frontend/script test files and 41 Java test files. Root `package.json` exposes build, lint, typecheck, frontend test, backend build/test, contract, readiness, quality-gate, Wave A, and demo-guard commands. Focused W2-02 preflight evidence reports seven UI/Booking files plus 49 tests with TypeScript and ESLint passing. Representative tests include `packages/ui/src/interactive.test.tsx`, `packages/ui/src/contrast.test.ts`, `apps/booking/app/bookings/new/BookingCreateForm.test.tsx`, and `apps/shell/lib/booking-client.test.ts`.

The codebase demonstrates explicit BFF protections, service-layer boundaries, local-noop messaging guards, and tests adjacent to frontend components and Java controllers. These are strengths to preserve during a presentation-only closure.

## Gaps and Technical Debt

- `apps/booking` declares `@erp/ui` but does not import or render it; raw `button`, `input`, `select`, and `table` elements plus `booking-*` classes remain on the closure-critical pages.
- `apps/booking/app/booking.css` is a complete hardcoded module theme. Current ESLint bans hardcoded hex only in non-test Booking TypeScript/TSX, ignores CSS, and does not enforce the prohibition on local style systems.
- The shared `Skeleton` exists in `packages/ui` but Booking does not use it, and no stable loading presentation is proven.
- Booking still exposes standalone header/navigation/layout behavior despite the canonical route being owned by `apps/shell`; `apps/shell/app/ShellFrame.tsx` and `packages/ui` shell patterns are not reconciled.
- `packages/ui/src/index.tsx` retains fixed brand hex and `Record<string, CSSProperties>` inside the owning package. This should be treated as centralized debt and tokenized where the design master requires it, not copied into applications.
- Booking imports `@erp/auth` without declaring it in `apps/booking/package.json`.
- No stable Playwright configuration/spec suite was found, and no `artifacts/w2-02-live/` evidence proves responsive, keyboard, theme, loading, empty, error, or denied behavior.
- Vitest has no observed coverage threshold. `.github/workflows/quality-gates.yml` lacks explicit `@erp/ui` consumption/enforcement and W2-02 live browser jobs.

## Risk-Ranked Closure Actions

1. High: migrate the canonical Booking list/create/detail/actions to `@erp/ui` and shared tokens without bypassing the BFF or changing business contracts.
2. High: reconcile local Booking chrome/theme with the authenticated shell route and remove duplicate navigation/theme ownership.
3. High: add live Playwright proof for keyboard create-to-confirm, responsive widths 375/768/1024/1440, light/dark themes, and loading/empty/error/denied network states.
4. Medium: strengthen lint or a deterministic detector to reject new Booking-local hardcoded CSS/theme systems and undeclared raw primitives; include a negative probe.
5. Medium: declare `@erp/auth` correctly if the import remains, and use the shared `Skeleton` for stable loading UI.
6. Medium: wire durable CI/audit evidence and update the backlog only after observed Compose acceptance and both audits are green.

## Acceptance Quality Bar

Run prechecks and tests, then `npm run demo:guard`, bring up only `linercore-wave-a` via `scripts/wave-a-compose.mjs`, execute Playwright against the live authenticated shell/BFF/backend journey, retain results under `artifacts/w2-02-live/`, and run `npm run demo:guard` again. `aidlc-audit` and `erp-fidelity-audit` must both pass before closure.

The preflight artifact's older `fc502a9` baseline is historical and must remain unchanged. New evidence must name `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f`. Likewise W1 remains historically `BLOCKED` with a separate waiver; no W2-02 quality report may rewrite that waiver as a real pass.
