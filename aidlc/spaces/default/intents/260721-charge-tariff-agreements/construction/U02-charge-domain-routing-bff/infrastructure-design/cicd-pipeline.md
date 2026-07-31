# CI/CD Pipeline - U02 Charge Domain Routing and BFF

## Pipeline boundary

U02 builds and verifies the existing Charge Next.js image and additive nginx/
Compose configuration. It does not deploy to cloud, staging, production, or a
second full-stack Compose project. Full-stack evidence is serialized through
the guarded Wave A wrapper.

## Static and component stages

| Stage | Exact command/capability | Blocking result |
| --- | --- | --- |
| quality registry | `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json` | any required gate missing/failed |
| Charge tests | `corepack yarn workspace @erp/app-charge-agreements test` | any policy/session/stream/route-state failure |
| Charge typecheck | `corepack yarn workspace @erp/app-charge-agreements typecheck` | any error |
| Charge lint | add and run `corepack yarn workspace @erp/app-charge-agreements lint` | any error |
| Charge build | add and run `corepack yarn workspace @erp/app-charge-agreements build` | basePath/build/route failure |
| nginx syntax | pinned nginx image runs `nginx -t` on checked-in config | any syntax/include error |
| rendered topology | `npm run wave-a:config` plus closed assertion script | wrong project/network/port/bind/resource/secret mode |
| contracts | `npm run contracts:validate` and `npm run contracts:verify` | any provider/consumer mismatch |

Component tests use bounded fake streams and two independently started Next
processes. They prove compile-time policies, session/capability denial before
forwarding, exact origins/media/headers, byte-exact assertion golden vectors
and replay claims, body limits, semaphore lifecycle, normalization, and
stateless parity.

## Security and supply chain

U02 reuses the concrete locked toolchain established by the infrastructure
stage: Semgrep 1.136.0 with checked-in `.semgrep.yml`, Gitleaks 8.24.3 with
`.gitleaks.toml`, Yarn 4.5.3 audit through the report-validating wrapper, Trivy
0.64.1 filesystem/image reports with finding exit disabled, Syft 1.30.0 SBOM,
and `verify-security-waivers.mjs` as the sole High/Critical finding-policy exit.
Tool/config/report failure and verified secrets block immediately.

The lock records tool download/image SHA-256 digests. Scans cover Charge app,
nginx/Compose/Next configuration, shared auth consumption, dependencies, image,
and generated browser bundles. CI rejects a session/assertion/service secret in
source, build args, layers, bundles, logs, or artifacts.

U02 owns creation and wiring of these exact checked-in files during Code
Generation:

| File | Required contract |
| --- | --- |
| `infrastructure/security-tools.lock.json` | schema `linercore.security-tools/v1`; exact name/version/download-or-image reference and lowercase 64-hex SHA-256 for Semgrep, Gitleaks, Trivy, Syft, and nginx; tag-only entries fail |
| `.semgrep.yml` | local-only Java/TypeScript/JavaScript security rules; no remote config |
| `.gitleaks.toml` | default rules plus LinerCore session/assertion/service-secret patterns and explicit test allowlist |
| `scripts/run-security-scan.mjs` | distinguishes finding exit from execution failure and validates one complete raw report |
| `scripts/run-security-suite.mjs` | verifies lock digests, runs exact tools, emits normalized reports and a closed target registry |
| `scripts/verify-security-waivers.mjs` | sole High/Critical finding-policy exit |
| `security/waivers.yaml` | schema `linercore.security-waivers/v1`; initially empty entries |
| `scripts/run-quality-gates.mjs` | required `security-suite` and `security-waivers` gate IDs |

Every normalized report at
`artifacts/security/normalized/<tool>.json` uses schema
`linercore.security-report/v1` with exact fields:
`tool{name,version,digest}`, `startedAt`, `completedAt`,
`execution{status,exitCode}`, `targets[]`, and `findings[]`.
Each finding contains `fingerprint`, closed severity
`LOW|MEDIUM|HIGH|CRITICAL`, `ruleId`, optional `cve`, repository-relative
`artifact`, and `messageHash`; raw secrets are forbidden.

Waiver entries contain fingerprint, tool, rule/CVE, artifact, severity, owner,
justification, compensating control, approval reference, and UTC expiry.
Missing/ambiguous/expired/malformed waivers fail; live secrets are non-waivable.
The verifier emits closed statuses
`blocked|waived-active|not-applicable` and exits zero only when every required
report/target/digest is complete and blocked count is zero.

The required commands are:

1. `node scripts/run-security-suite.mjs --lock infrastructure/security-tools.lock.json --output artifacts/security`;
2. `node scripts/verify-security-waivers.mjs --findings-root artifacts/security/normalized --waivers security/waivers.yaml --as-of-current-utc`;
3. `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json`, which treats either nonzero command or missing expected report as failure.

`--as-of-current-utc` reads the synchronized runner wall clock, records it in
the evaluation report, and rejects an absent/invalid clock or a value more than
five minutes from the CI control-plane timestamp. Waiver expiry is therefore
evaluated at rebuild/promotion time; an old source commit cannot resurrect an
expired waiver.

## Route and resource verification

The deterministic suite proves:

- exact 308 and path-preserving HTML/deep-link/reload/asset/BFF/health behavior;
- unchanged `/`, `/auth`, `/reference-data`, `/booking`, `/bookings`, and
  `/health`;
- session 401, capability 403, manual-case disclosure separation, safe return
  URL, no browser authority, and no open proxy;
- same-origin, media, 32 KiB request, query/identifier/UUID validation before
  backend work;
- 20 protected and 10 selector permit pools, admission before body read,
  100/2500/2000/5000 ms deadlines, and every release path;
- 512/128 KiB bounded response, fatal UTF-8, safe error registry, and no 200
  fallback;
- exactly 100 post-warm-up calls per route family, p95 <=100 ms and p99 <=200
  ms BFF overhead;
- adversarial 16 MiB parsed-graph/24 MiB admission measurement with all 20 held
  concurrently; <=432 MiB heapUsed, <=48 MiB Node external (which includes
  arrayBuffers), <=64 MiB `rss-heapUsed-external`, <=544 MiB RSS, >=80 MiB
  old-space headroom, and
  socket/event-loop/quiescence gates;
- two-process policy/session/request-key parity and restart <=120 seconds.

Unexpected outcomes remain failures. Missing/duplicate/negative-delta span
evidence invalidates performance proof.

## Full-stack Wave A job

1. run `npm run demo:guard`;
2. build/record exact Charge-app and nginx image digests;
3. render the wrapper-owned Wave A override and assert all host bindings are
   loopback, Charge app is 768 MiB with 512 MiB old/8 MiB semi-space, nginx is 18088, and project/network
   identities are exact;
4. start/update only through `scripts/wave-a-compose.mjs`;
5. require direct and nginx health schema/status parity;
6. execute the shared
   `contracts/security/charge-subject-assertion-v1.json` TypeScript/Java golden
   vectors plus exact 4096/4097/expiry replay-map occupancy evidence;
7. execute proxy preservation, authenticated BFF, assertion, bounded-fault,
   resource, restart, and redaction evidence;
8. run `npm run demo:guard` again and publish a checksummed manifest.

Live Playwright/business-journey, Booking-visible pricing, final
`aidlc-audit`, and `erp-fidelity-audit` remain U06 exit evidence. U02 does not
claim them from source/component tests.

## Deployment and rollback

Deployment is a controlled recreate of the stateless Charge-app/nginx
containers within Wave A. There is no database migration in U02. Promotion
records previous/candidate image digests, rendered config hashes, health/proxy
matrix, resource evidence, and manager guards.

Application/config rollback may select the previous recorded digests/config
only after rendering proves the same isolated identities and the before/after
preservation matrix passes. Because U02 owns no data, there is no BFF restore or
RPO operation. A lost mutation response is reconciled with the authoritative
domain service; rollback never replays it.

No automatic action touches manager resources. Failed rollout leaves diagnostics
and uses wrapper-only stop/recreate for exact Wave A resources.

## Upstream traceability

This pipeline consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. Its gates cover
their routing, security, latency, capacity, restart, ownership, and evidence
allocation.
