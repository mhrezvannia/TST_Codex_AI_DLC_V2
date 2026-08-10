# Integration Test Instructions — W2-02 Design-System Closure

## Scope and prerequisites

Integration coverage follows `booking-design-system-closure/code-generation/code-generation-plan.md` and `booking-design-system-closure/code-generation/code-summary.md`. It proves one authenticated shell, shell-to-Booking BFF/service traffic through the acceptance-only SSR control proxy, route/state contracts, Wave A ownership, and manager-demo isolation.

Before any Wave A mutation run `npm run demo:guard`. The acceptance input is an ignored local-profile storage state for `local.booking.user`. The isolated project must be absent before the run; a pre-existing `linercore-wave-a` project is a hard stop.

## Live command and expected evidence

```powershell
npm run demo:guard
corepack yarn w2-02:live-acceptance --storage-state .w2-02-auth/storage-state.json
npm run demo:guard
```

The runner must register and execute exactly 98 cases: 24 route/theme/viewport visuals, 72 state/theme/viewport cases, and two keyboard journeys. Required outputs include authenticated list/create/detail proof, causal proxy observations, zero serious/critical axe findings, focus/live-region/reduced-motion/layout assertions, screenshots, a sanitized successful mutation trace, direct pre/post guard records, direct `aidlc-audit` and `erp-fidelity-audit` exits, immutable attempt lineage, and a publicly valid terminal-last envelope.

## Failure and rerun policy

On failure, retain the FAILED attempt and use `--rerun-of <run-id>` after correction. Never overwrite or relabel a failure. Cleanup is wrapper-only and only for the attempt-owned stack. The post-run manager guard must remain green even when acceptance fails.

