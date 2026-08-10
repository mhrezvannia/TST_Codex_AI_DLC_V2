# Deployment Strategy - W2-01 App Shell and Auth

## Upstream Inputs

This strategy consumes `ci-config`, `quality-gates`, per-unit `deployment-architecture`, and per-unit `cicd-pipeline` artifacts.

## Strategy

W2-01 uses manual continuous delivery to the existing Compose/Nginx runtime. The release candidate is every commit that passes CI, but promotion is blocked until live local/on-prem evidence passes.

Blue/green, canary, and rolling production strategies are deferred. The current deployment target is not a production fleet; it is the local/on-prem stack required to observe the app shell, auth app, Booking, identity-service authorization, Keycloak, and Nginx edge behavior.

## Traffic And Cutover

| Surface | Current behavior | W2-01 cutover behavior |
| --- | --- | --- |
| `/` | Nginx routes to the configured app surface | Route to `apps-shell` protected landing |
| `/booking*` | Existing Booking surface | Route to `apps-shell` mounted Booking routes |
| `/bookings*` | Legacy Booking routes | Route to shell compatibility redirects |
| `/auth*` | Existing auth app | Preserve `apps-auth` ownership |

Cutover is not complete until live evidence proves login, Booking create/detail with the real subject, denied access inside shell, sign-out/stale-call failure, and `/bookings*` compatibility.

## Promotion Gates

| Gate | Required outcome |
| --- | --- |
| CI code gates | All W2-01 app/package/backend tests, typechecks, lints, and builds pass |
| Compose static validation | `docker compose config --quiet` passes |
| Live runtime | Full Compose profile starts through Nginx and Keycloak |
| Final evidence | `node scripts/w2-01-live-acceptance.mjs --validate --require-pass` exits `0` |
| Detector 6d | Zero hardcoded-auth hits in mounted shell/Booking surfaces |
| ERP fidelity audit | Exits `0` |
| AI-DLC audit | Exits `0` |
| Human approval | Explicit approval after reviewing evidence package |

## Smoke Tests

After deployment to the local/on-prem proof stack:

1. Open `http://127.0.0.1:8088/` unauthenticated and verify redirect to Keycloak/auth.
2. Sign in as the allowed Booking actor and land inside the shell.
3. Navigate to `/booking/new`, create a Booking, and verify backend evidence uses the real subject, not `local-user`.
4. Sign in as the denied actor and verify the denied surface renders inside the shell.
5. Sign out, revisit `/booking`, and verify login is required and stale BFF calls fail closed.
6. Visit `/bookings`, `/bookings/new`, and `/bookings/{id}` and verify canonical shell behavior.

## Observability

Minimum release metrics for this intent:

| Metric | Threshold |
| --- | --- |
| Shell route availability | 99.9% over a 30-day rolling window after production adoption |
| Shell 5xx rate | Alert above 1% over 5 minutes |
| Auth redirect/sign-out failures | Alert on any sustained nonzero failures over 5 minutes |
| Booking BFF authorization failures | Alert on unexpected spike above the baseline denied-role scenario |

These are release-readiness targets. The current W2-01 artifact does not add monitoring infrastructure.

## Abort Criteria

- Evidence package final decision remains `BLOCKED`.
- Any live scenario records `BLOCKED`.
- `local-user` appears in mounted shell/Booking runtime actor evidence.
- `erp-fidelity-audit` or `aidlc-audit` fails or cannot run.
- Nginx route compatibility breaks W1 Booking routes.
- Sign-out does not clear the session or stale calls do not fail closed.

## Preservation Constraints

- Preserve W0-01 platform/eventing behavior.
- Preserve W0-02 reference-data behavior.
- Preserve W1-01 Booking behavior and keep its live-proof waiver explicit as BLOCKED at compose-start.
- Preserve W2-02 design-system foundation; W2-01 does not redesign primitives.
