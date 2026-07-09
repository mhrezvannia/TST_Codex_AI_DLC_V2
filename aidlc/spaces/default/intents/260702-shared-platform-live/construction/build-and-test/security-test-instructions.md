# Security Test Instructions

## Inputs

Security tests cover auth/session and BFF behavior introduced in the `code-generation-plan.md` and `code-summary.md` outputs.

## Commands

```powershell
node_modules\.bin\vitest.cmd run packages/auth/src/index.test.ts apps/auth/lib/auth-server.test.ts apps/reference-data/lib/service-clients.test.ts --config vitest.config.ts
node_modules\.bin\eslint.cmd packages/auth apps/auth apps/reference-data --max-warnings=0
```

## Security Assertions

- `AUTH_BYPASS=true` is ignored outside local/test runtime profiles.
- `NODE_ENV=production` disables bypass even if other env values say local.
- BFF routes do not call browser-to-Java directly.
- BFF mutations deny writes without permission and return service-unavailable errors when upstreams are down.
- Seed and readiness outputs do not contain secret values.
