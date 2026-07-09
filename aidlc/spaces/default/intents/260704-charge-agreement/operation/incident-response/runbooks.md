# Runbooks - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `dashboards`, `alarms`, `reliability-design`, `security-design`, and `deployment-architecture`.

## Backend Unavailable

Trigger: `alarms` reports backend health or module-info failure.

1. Confirm whether port `8084` has a listener.
2. Review backend process output for startup errors.
3. Re-run the backend targeted test from `build-test-results`.
4. Restart `charge-agreement-service` with the local profile.
5. Re-check `/api/charge-agreements/module-info`.
6. Keep deployment unpromoted until the check passes.

## Frontend Unavailable

Trigger: `alarms` reports frontend health failure.

1. Confirm whether port `3002` has a listener.
2. Review Next.js process output for compile/runtime errors.
3. Re-run Charge Agreement frontend typecheck, test, and build.
4. Restart the `@erp/app-charge-agreements` local dev process.
5. Re-check `/api/health`.

## Proxy Route Broken

Trigger: `dashboards` or `alarms` reports `/charge-agreements/` is not reachable.

1. Confirm the frontend is healthy on `3002`.
2. Confirm the proxy process is running.
3. Check the `/charge-agreements/` route target in `scripts/local-reverse-proxy.mjs`.
4. Restart the proxy and re-check the route.

## Sensitive Metadata Exposure

Trigger: `alarms` reports module-info contains secret/customer/business data.

1. Stop promotion immediately.
2. Inspect the module-info response payload.
3. Remove fields that violate `security-design`.
4. Add or update tests to prevent regression.
5. Re-run the backend targeted test and smoke check.

