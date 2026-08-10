# Security Test Instructions - W2-01 App Shell and Auth

## Upstream Inputs

This file consumes U01-U06 code summaries, all unit security requirements, and DevSecOps guidance for SAST, secret handling, dependency risk, and auth bypass prevention.

## Security Commands

Run detector 6d and package validation:
```powershell
node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth
node scripts/w2-01-live-acceptance.mjs --validate --output-root artifacts/w2-01-live/app-shell-auth
```

Run explicit source scans:
```powershell
rg "local-user" apps\shell apps\booking -n
rg "Redux Toolkit|@reduxjs/toolkit|\bswr\b|\.module\.css|styled-components|@emotion|jquery|moment" apps\shell apps\booking packages\auth packages\shared-types scripts\w2-01-live-acceptance.mjs
rg "(TOKEN=|PASSWORD=|SECRET=|COOKIE=|lc_session=)[^\s<]" artifacts\w2-01-live\app-shell-auth -n
```

Run existing audit detectors where the shell has Bash available:
```powershell
bash .claude/skills/erp-fidelity-audit/detectors.sh
bash .claude/skills/aidlc-audit/detectors.sh
```

## Pass Criteria

- Mounted shell/Booking protected paths contain zero hardcoded `local-user` actor fallbacks.
- Evidence output redacts token, secret, cookie, and `lc_session` values.
- Any audit detector finding is reviewed as a lead; final PASS requires green reviewed detector/audit evidence or a concrete W2-01 blocker.
- W1 live-proof waiver remains BLOCKED at `compose-start`, not rewritten as PASS.

## Threat Coverage

- Auth bypass through legacy `/bookings*` routes.
- Stale session or sign-out continuing as `local-user`.
- Unauthorized subject seeing Booking data instead of denied shell state.
- Evidence leakage of cookies, tokens, or secrets.
- Prohibited frontend libraries or broad design-system rewrites.
