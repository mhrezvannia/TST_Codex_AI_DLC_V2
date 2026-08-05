# Incident Runbooks - W2-01 App Shell and Auth

## Upstream Inputs And Authority

These runbooks consume `dashboards`, `alarms`, per-unit `reliability-design`, per-unit `security-design`, and per-unit `deployment-architecture` artifacts. The target is the local/on-prem Compose and Nginx proof stack. The `dashboards` and `alarms` artifacts define intended signals, but application scrape targets and paging routes are not live; operators must use endpoint checks, container logs, browser evidence, and the acceptance manifest.

Automation may collect diagnostics and evidence only. A human release owner must approve every restart, rollback, role change, policy change, or data-restoration action. Never run `docker compose down -v`, delete volumes, expose tokens, or replace the W1-01 BLOCKED waiver with a PASS.

## Common Intake And Diagnostics

1. Open `incident-YYYYMMDD-HHMM-<short-name>` in the team incident log/channel.
2. Record detection time, reporter, affected route, actor role, correlation id, last known good commit/image, and current W2 evidence-manifest hash.
3. Classify severity using `incident-plan.md`; assign the proof-run release owner as incident commander for P1/P2.
4. Capture diagnostics before mutation:

```powershell
docker compose -p linercore-w2-01 ps
docker compose -p linercore-w2-01 logs --since 15m nginx apps-shell apps-auth apps-booking booking-service identity-service keycloak
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8088/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:9090/-/ready
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:9200/_cluster/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:15601/api/status
```

5. Redact `Authorization`, cookies, `lc_session`, OAuth/OIDC tokens, service tokens, passwords, and secrets before attaching output.
6. Announce the next update time. P1/P2 updates are due every 30 minutes even when there is no status change.

## RB-01 OIDC, Session, Or Sign-Out Failure

**Trigger:** Login callback loop, issuer/audience/JWKS/nonce validation error, Keycloak unavailable, session cookie not cleared, protected route visible without a valid session, or stale BFF call not returning `401 AUTH_REQUIRED`.

**Containment:** Treat protected shell and Booking routes as unavailable. Do not bypass OIDC, mint a local session, disable issuer/audience/nonce checks, make cookies browser-readable, or add a `local-user` fallback.

**Triage:**

1. Check Nginx, `apps-auth`, `apps-shell`, and Keycloak health and recent logs.
2. Confirm configured external issuer matches the browser-visible Keycloak issuer and internal JWKS discovery remains trusted.
3. Check callback correlation and nonce without recording token values.
4. Reproduce with one allowed user, then verify sign-out clears `lc_session` and a stale call fails closed.

**Recovery:** After human approval, restart only the failed container or restore the last known-good auth/shell image. Do not rotate credentials as an exploratory action. If configuration changed, restore the reviewed configuration and restart the smallest affected service set.

**Exit:** Login, protected route, sign-out, reauthentication, and stale-call scenarios pass with the same real subject and no raw-token leakage.

## RB-02 Authorization Drift Or Identity Failure

**Trigger:** Booking user denied unexpectedly, reference administrator allowed unexpectedly, Identity timeout/error rate exceeds the `alarms` threshold, actor is blank, or `local-user` appears anywhere in mounted runtime evidence.

**Containment:** Stop W2 promotion. If unauthorized data or mutation access is possible, declare P1 and disable the affected route at the edge until authorization is restored. Never change roles merely to make acceptance pass.

**Triage:**

1. Correlate Booking BFF, booking-service, and identity-service records by correlation id and subject.
2. Verify the session-derived actor header is nonblank and the trusted BFF service identity is valid.
3. Inspect effective assignments and policy version for `booking:create`, `booking:read`, `booking:validate`, `booking:request-pricing`, and `booking:confirm`.
4. Distinguish expected deny from timeout, malformed response, stale assignment, and catalog drift.

**Recovery:** Human approval is required for any role/policy repair. Apply the smallest reviewed correction, rerun focused Identity/Booking tests, reseed idempotently, and rerun both allow and deny live scenarios.

**Exit:** Allowed and denied users produce the expected backend decision, no data is disclosed on deny, actor/correlation evidence matches, and detector 6d reports zero hardcoded-auth hits.

## RB-03 Booking, PostgreSQL, Charge, Or Pricing Failure

**Trigger:** Booking read/create/validate/price/confirm fails, PostgreSQL is unavailable, the approved Charge agreement prerequisite is missing, or a service cannot restart against existing data.

**Containment:** Preserve existing volumes and evidence. Do not report an empty list as success, fabricate pricing, skip authorization, or recreate the database.

**Triage:**

1. Check `apps-booking`, booking-service, PostgreSQL, charge-agreement-service, and identity-service health/logs.
2. Confirm the deterministic approved agreement `W2-01-LIVE-NA-EU-GEN` exists and its OFR TEU USD term remains approved.
3. Verify schema startup is idempotent and existing data is readable after restart.
4. Use the failing request's correlation id to separate validation, authorization, pricing, persistence, and transport failures.

**Recovery:** With human approval, restart the single failed service. Recreate only the deterministic acceptance prerequisite through the real Charge API if absent; do not edit persisted rows directly. Database restore is not authorized because W2-01 defines no backup or RPO contract.

**Exit:** The full Booking lifecycle passes and the created Booking remains retrievable after the relevant service restart.

## RB-04 Nginx Or Route Compatibility Failure

**Trigger:** `/`, `/booking*`, or `/bookings*` routes return the wrong owner/status, bypass authentication, call a backend before canonical redirect, or lose actor/session semantics.

**Containment:** Stop promotion and preserve the current Nginx configuration and response evidence. Do not patch around the shell by routing browsers directly to business services.

**Triage:** Validate Compose configuration, inspect Nginx route order, and compare `/bookings`, `/bookings/new`, and `/bookings/{id}` responses with canonical `/booking*` behavior.

**Recovery:** After approval, restore the last reviewed Nginx/shell route configuration and recreate only Nginx and the affected frontend container.

**Exit:** All compatibility redirects, protected-route checks, and canonical Booking actions pass without a pre-redirect backend call.

## RB-05 Telemetry Blind Spot

**Trigger:** Prometheus application target down, invalid metrics payload, Spring `/actuator/prometheus` 404, no application OTLP spans, no searchable application log index, or an alarm cannot evaluate.

**Containment:** Mark monitoring coverage BLOCKED; do not claim a production SLO, normal service health, or automatic paging from missing telemetry. Continue manual endpoint/log checks for the proof stack.

**Triage:** Check Prometheus target errors, expected content type, OTel Collector logs, Jaeger service list, Elastic indices, and Kibana data views. Base infrastructure health does not prove application ingestion.

**Recovery:** Telemetry instrumentation is a reviewed follow-up, not an incident-time hot patch. Correct scrape endpoints/exporters/log shipping in a tested change, then validate target health and representative metrics/spans/logs.

**Exit:** Every required application target is up and at least one sanitized request can be followed through metrics, trace, and logs. Until then, anomaly detection remains disabled.

## RB-06 Acceptance Evidence Or Waiver Integrity Failure

**Trigger:** W2 manifest disagrees with command/scenario rows, stale `blockers.jsonl` remains beside a PASS, a required audit cannot run, evidence contains secrets, or W1 waiver text is changed to PASS.

**Containment:** Stop promotion and quarantine the affected evidence package. Never manually edit a failing result into PASS.

**Triage And Recovery:**

```powershell
node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth
node scripts/w2-01-live-acceptance.mjs --validate --require-pass --output-root artifacts/w2-01-live/app-shell-auth
```

Confirm detector 6d and both Bash audit commands exit `0`, no blocker rows remain on W2 PASS, and the final decision still states: W1-01 live-proof waiver remains BLOCKED at compose-start; not a W2-01 PASS.

**Exit:** The package validator passes with runtime, four scenarios, and three command checks PASS; redaction checks are clean; W1 history remains unchanged.

## Recovery And Disaster Limits

The local restoration objective is 30 minutes from declaration to a healthy W2 proof stack. W2-01 defines no production RTO, RPO, replication, point-in-time recovery, AWS Backup configuration, or zero-data-loss guarantee. Existing Docker volumes must be preserved, and any future restore procedure requires a separately tested backup contract. AWS SSM Automation and Incident Manager are not generated because `deployment-architecture` provisions no AWS runtime.
