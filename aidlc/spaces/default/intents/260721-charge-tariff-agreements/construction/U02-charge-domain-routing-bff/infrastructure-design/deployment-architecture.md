# Deployment Architecture - U02 Charge Domain Routing and BFF

## Deployment decision

U02 extends the existing `apps-charge-agreements` Next.js container and nginx
edge. It adds no service, network, database, volume, cache, broker, gateway,
cloud account, region, or production platform. The only full-stack proof uses
`scripts/wave-a-compose.mjs`, exact project `linercore-wave-a`, its
wrapper-owned loopback/resource override, and nginx on
`http://127.0.0.1:18088`.

This is local/acceptance infrastructure only. CI unit/integration tests use
Node processes and test-owned fixtures, not a second Compose topology.
Staging/production availability, TLS, residency, paging, and cost remain future
architecture decisions.

## Runtime and request topology

| Boundary | Runtime | U02 configuration |
| --- | --- | --- |
| browser edge | existing nginx | exact 308 `/charge-agreements` -> `/charge-agreements/`; path-preserving `^~` proxy |
| web/BFF | existing `apps-charge-agreements` | Next `basePath=/charge-agreements`; pages, assets, handlers, health, signed-session policy |
| session library | existing `@erp/auth` | server-only `lc_session` verification and capability extraction |
| Charge backend | `charge-agreement-service:8084` | fixed origin; one bounded request; no redirects, retry, cache, or generic proxy |
| Reference selectors | `reference-data-service:8083` | separate bounded client and service token; labels only |
| U03 assertion verifier | existing Charge backend | dedicated shared HMAC secret, 30-second method/path/correlation assertion |
| observability | existing optional profile | parent/child spans, safe metrics/logs, Prometheus/Grafana/Jaeger/OTel |

Human traffic follows browser -> loopback nginx -> Charge Next server -> fixed
Charge/Reference endpoint. The browser never receives backend/service
credentials and never chooses origin, method, backend path, media type,
capability, actor, or correlation authority.

The nginx `proxy_pass` has no URI suffix. Existing `/`, `/auth`,
`/reference-data`, `/booking`, `/bookings`, and `/health` behavior is
regression-protected. No U02 action targets or controls port 8088.

## Network, ports, and containment

Inter-container calls use Compose DNS on `linercore-wave-a-network`. The Wave A
override binds every diagnostic/public host mapping to `127.0.0.1`; rendered
configuration is rejected if any binding is wildcard or the project/network/
port set differs. Browser acceptance uses only nginx 18088. Direct Charge-app
health is an internal container probe, not a new host port.

`npm run demo:guard` runs before and after the full-stack job. The wrapper may
operate only exact resources it created. Manager containers, images, volumes,
network, project, and port 8088 are probe-only and never restart, rebuild, seed,
clean, or attach to Wave A.

## Compute and memory sizing

The protected-forwarding semaphore has exactly 20 fair permits per Next
process. Admission occurs after session/capability checks but before body
consumption, waits at most 100 ms inside the 2500 ms backend deadline, and is
held through browser delivery/cancellation or the five-second egress deadline.
Reference selectors use a separate 10-permit pool.

The approved ceiling is 24 MiB per protected admission:

| Allocation class | Maximum |
| --- | ---: |
| native chunks | 1 MiB |
| bounded response bytes | 513 KiB |
| decoded UTF-16 text | 1 MiB |
| parsed graph | 16 MiB |
| normalized graph | 2 MiB |
| serialized/queued output | 1 MiB |
| fixed/native margin | 2.5 MiB |

Twenty admissions consume at most 480 MiB plus 64 MiB runtime margin = 544
MiB. The isolated Wave A override sets the Charge-app container to 768 MiB and
`NODE_OPTIONS=--max-old-space-size=512 --max-semi-space-size=8`. The container
limit is a crash-safety ceiling, not the acceptance threshold; its 224 MiB
headroom above 544 MiB allows GC/fragmentation diagnostics to be captured
before cgroup termination. This is not a production size or permission to
change the manager stack.

The gate records heap, external/array-buffer memory, RSS, event-loop delay,
sockets, permits, in-flight requests, and per-request allocation peak. At 20
adversarial concurrent admissions, all ceilings pass simultaneously:

- V8 `heapUsed` <=432 MiB: <=400 MiB request graphs/text/output plus <=32 MiB
  warmed runtime heap;
- Node `external` <=48 MiB (it already includes `arrayBuffers`): <=31 MiB bounded chunks/byte areas plus
  <=17 MiB runtime allowance;
- remaining native/code/stack memory
  `RSS - heapUsed - external` <=64 MiB;
- absolute RSS <=544 MiB;
- old-space headroom >=80 MiB at the 432 MiB heap-used gate under the explicit
  512 MiB limit; the 8 MiB semi-space bounds young-generation growth.

The driver samples baseline, all 20 held admissions, GC where available, and
60-second quiescence. Any 24 MiB/admission or partition/total breach forces a
lower response limit, lower permits, or bounded incremental parser; it does not
justify an unreviewed memory increase.

## Lifecycle and health

The Charge app health route is
`/charge-agreements/api/health`. It returns only JSON
`service`, `status`, and UTC ISO timestamp with exact content type. Valid
configuration yields 200/UP; invalid mandatory configuration yields 503/DOWN.
It is process/config-local and never calls Charge, Identity, or Reference Data.
Direct-container and nginx probes must match schema/status semantics.

On SIGTERM the process rejects new protected admissions, waits at most six
seconds for the five-second egress bound plus cleanup, aborts remaining
fetch/streams, releases permits, and exits. Compose grants ten seconds.
Stateless restart must reach health and one authenticated protected read within
120 seconds.

## Environment and configuration

| Environment | Full topology | Configuration |
| --- | --- | --- |
| developer | optional existing local Compose | explicit local secrets/origins; no acceptance claim |
| CI unit/integration | none | Node tests, fake bounded streams, two independent processes |
| Wave A acceptance | guarded `linercore-wave-a` only | loopback override, 768 MiB, 512 MiB old/8 MiB semi-space, nginx 18088, deterministic secrets |
| staging/production | undefined | requires a later approved design |

Mandatory Wave A settings are:

- `AUTH_SESSION_SECRET` for existing signed-session verification;
- `CHARGE_AGREEMENT_SERVICE_URL=http://charge-agreement-service:8084`;
- `REFERENCE_DATA_SERVICE_URL=http://reference-data-service:8083`,
  `REFERENCE_DATA_BFF_TOKEN`, and fixed BFF service ID;
- `CHARGE_PUBLIC_ORIGINS=http://127.0.0.1:18088`;
- dedicated `CHARGE_BFF_ASSERTION_SECRET`, identically injected into the Charge
  BFF issuer and U03 backend verifier, never reused as `AUTH_SESSION_SECRET`;
- `CHARGE_BFF_ASSERTION_KID=w2-03-wave-a-v1` and verifier nonce-cache capacity
  4096;
- exact base path, 20/10 permits, 100 ms admission, 2500/2000 ms backend
  deadlines, five-second egress, 32/512/128 KiB bounds, and forbidden bypass
  mode.

Startup validates URLs/origins as fixed tuples, rejects credentials/path/query/
fragment where prohibited, rejects missing/weak/equal session/assertion
secrets, and exposes no secret in health/logs/evidence. Invalid configuration
keeps protected routes fail-closed with
`CHARGE_CONFIGURATION_INVALID`.

## Version-controlled infrastructure

The infrastructure definition is the existing Compose file, wrapper-owned Wave
A override/env, nginx configuration, Next config/Dockerfile, healthcheck, and
observability configuration. CI renders/hash-checks them and runs `nginx -t`.
Image and evidence manifests record commit, image digest, rendered config hash,
Node/nginx versions, and manager guard fingerprints.

## Internal subject assertion wire contract

The one allowed header is `X-LinerCore-Subject-Assertion`. Duplicate, folded,
comma-joined, empty, or multiple headers fail before authorization. Its ASCII
value is:

`v1.<kid>.<payload-base64url-no-pad>.<signature-base64url-no-pad>`

`kid` matches `^[A-Za-z0-9_-]{1,32}$` and must equal the `kid` field in the
payload. Wave A uses `w2-03-wave-a-v1`. The payload is the UTF-8 bytes of this
fixed-order length-prefixed record:

```text
lc-bff-assertion:v1\n
iss:<n>:<value>\n
kid:<n>:<value>\n
sub:<n>:<value>\n
mth:<n>:<value>\n
pth:<n>:<value>\n
cid:<n>:<value>\n
iat:<n>:<value>\n
exp:<n>:<value>\n
nonce:<n>:<value>\n
```

`<n>` is the unsigned decimal UTF-8 byte length with no leading zero except
zero. Values are valid UTF-8 with no control character. `iss` is exactly
`charge-agreements-bff`; `mth` is uppercase ASCII; `pth` is the policy's
normalized backend path with no query/fragment, single percent-encoding, and
uppercase percent hex; `cid` follows the safe correlation grammar; `iat` and
`exp` are Unix seconds without leading zeros and `exp=iat+30`; `nonce` is 16
cryptographically random bytes encoded base64url without padding.

The signature is HMAC-SHA-256 over exact ASCII
`v1.<kid>.<payload-base64url-no-pad>`, encoded base64url without padding.
Verification decodes strictly, reconstructs no alternate representation,
compares in constant time, requires issuer/key/method/path/correlation equality,
accepts at most five seconds skew (`iat <= now+5`, `exp >= now-5`), and rejects
unknown/duplicate/missing fields or trailing bytes.

After cryptographic/time/context verification and before authorization, U03
atomically inserts `<kid>:<nonce>` into a process-local replay map. Entries
expire at `exp+5`; capacity is 4096. Duplicate nonce is 401
`INVALID_SUBJECT_ASSERTION`; capacity exhaustion is safe 503. Wave A has one
Charge backend process, supplying single-use within its runtime. Restart clears
the map and permits a captured assertion only within the remaining <=35-second
window; that local residual is explicit. Multi-instance/production deployment
requires shared replay authority or a separately approved replay decision.

TypeScript issuer and Java verifier share blocking golden vectors for Unicode,
percent-encoded paths, time boundaries, malformed envelopes, wrong context,
duplicate nonce, and key failure.

The exact shared fixture is
`contracts/security/charge-subject-assertion-v1.json`, schema
`linercore.charge-subject-assertion-vectors/v1`. Each vector contains
`id`, `kid`, non-production `secretHex`, the nine decoded claim values, exact
`payloadUtf8Hex`, exact compact header value, verification instant, expected
closed result/code, and optional mutation describing one malformed input.
Both TypeScript and Java tests read the same file; no implementation regenerates
expected bytes.

Replay tests atomically claim exactly 4096 distinct valid nonces, assert
reported occupancy 4096, require the 4097th distinct valid assertion to return
safe 503 with no authorization, require a duplicate of an occupied nonce to
return 401, advance the injected clock past `exp+5`, verify occupancy returns
to zero, and then admit a new valid nonce.

## Upstream traceability

This deployment design consumes `performance-design.md`,
`security-design.md`, `scalability-design.md`, `reliability-design.md`,
`logical-components.md`, `components.md`, `services.md`, and
`business-logic-model.md`. It implements their exact base path, signed-session
boundary, fixed-policy forwarding, 544 MiB bound, stateless restart,
Charge-only ownership, and manager preservation.

## Review

**Iteration 1 verdict: NOT-READY.**

The exact nginx redirect/path-preserving proxy and Next `basePath`, signed-session
and fixed-policy BFF boundary, 20 protected/10 selector permits, fail-closed
health/readiness behavior, same-origin and open-proxy defenses, sole
`linercore-wave-a` Compose topology, shared-shell ownership, and manager
8088/W1 preservation are mutually consistent. The five primary artifacts also
contain the required section depth, reference all eight upstream inputs, and
contain no TypeScript/JavaScript implementation snippets.

### Blocking findings

1. **P0 — the U02/U03 assertion is not a complete bilateral wire contract.**
   The artifacts name the claims and HMAC algorithm, but do not define the
   header/envelope, canonical byte encoding and field ordering, path and subject
   escaping, timestamp/signature encoding, allowed clock skew, or contract
   version/key identifier. Independently implemented issuer and verifier can
   therefore sign different bytes. A signed random nonce also does not make the
   assertion single-use: no bounded nonce store, uniqueness rule, replica/restart
   behavior, or explicit decision to tolerate replay inside the 30-second window
   is defined. Specify the exact wire/canonicalization contract with shared
   golden vectors and define the verifier's replay policy and bounded state
   before U02 and U03 can interoperate safely.

2. **P0 — the CI security gates are named but not executable from this
   design/workspace.** `cicd-pipeline.md` lists tool versions and refers to a
   locked toolchain/report wrapper, yet gives no exact commands, lock/report
   paths and schemas, pinned nginx/scan image digests, or waiver-file contract.
   The referenced `.semgrep.yml`, `.gitleaks.toml`,
   `verify-security-waivers.mjs`, and security tool lock are absent from the
   current workspace. Define and own those files, wire exact commands into the
   quality registry, and state deterministic exit criteria for scan failure,
   report validation, severity policy, expiry, and malformed/missing waivers.

3. **P1 — the 448 MiB old-space setting is not proven by the 544 MiB RSS
   arithmetic.** The per-admission table can retain about 20 MiB of JavaScript
   data (decoded text, parsed graph, normalized graph, and serialized output);
   twenty admissions can therefore approach 400 MiB before the stated 64 MiB
   runtime margin. The design does not partition that margin or the admission
   budget among old-space, young-generation heap, external buffers, native
   memory, and code, so a process can hit the 448 MiB old-space limit before the
   640 MiB container or 544 MiB RSS gate. Add independently measured heap,
   external/native, and RSS ceilings with GC headroom and a max-concurrency
   adversarial gate; then adjust old-space, permits, or response/parsing bounds
   so all limits close simultaneously.

### Nonblocking findings

1. Staging/production topology is correctly marked undefined. Keep the 640/448
   MiB Wave A result as isolated-local acceptance evidence only; it must not be
   promoted into an availability, capacity, TLS, or secret-rotation claim
   without a later production design.

2. The fair-semaphore tests should include cancellation while queued and while
   streaming, FIFO handoff, double-release prevention, and five-second egress
   expiry so the otherwise sound 20/10 isolation contract cannot leak permits
   under disconnect storms.

### Iteration 2

**Verdict: NOT-READY.**

Iteration-1 assertion blocker 1 is resolved: the design now fixes
`X-LinerCore-Subject-Assertion`, the compact `v1` envelope, byte-length-framed
UTF-8 payload, signature/time/context rules, 4096-entry atomic replay map,
single-process/restart limitation, and blocking TypeScript/Java golden vectors.
Iteration-1 CI blocker 2 is resolved: U02 explicitly owns the lock, local
configs, wrappers, normalized-report and waiver schemas, quality-registry gate
IDs, exact commands, and fail-closed outcomes. Iteration-1 sizing blocker 3 is
only partially resolved: the 768 MiB container, 512 MiB old space, 8 MiB
semi-space, 432/48/64/544 MiB partitions, 80 MiB old-space headroom, and
20-admission adversarial gate are now explicit, but their measurement formula
is incorrect.

#### Blocking findings

1. **P0 — the memory partition double-counts `arrayBuffers`.** Node's
   `process.memoryUsage().arrayBuffers` is already included in `external`.
   The design gates `external + arrayBuffers` and computes remaining native
   memory as `RSS - heapUsed - external - arrayBuffers`; both operations count
   the same ArrayBuffer allocation twice. The latter can understate the
   residual native/code/stack bucket and allow a false 64/544 MiB pass, so the
   prior memory blocker is not closed. Gate `external` once, retain
   `arrayBuffers` only as a diagnostic subset, and compute the conservative
   remainder as `RSS - heapUsed - external` (or define other demonstrably
   non-overlapping runtime metrics). Reconcile that corrected formula across
   deployment, services, monitoring, shared infrastructure, and CI before
   accepting the 432/48/64/544 MiB proof.

2. **P1 — waiver expiry is evaluated against source-commit time.** The required
   `--as-of-source-commit` command conflicts with the claim that expired waivers
   fail: rebuilding or promoting an older commit after a waiver's UTC expiry
   can continue to accept it. Evaluate expiry against a trusted current
   CI/release timestamp, or define and enforce an equivalent artifact-freshness
   rule that prevents post-expiry build and promotion; record the chosen time
   source in normalized evidence.

#### Nonblocking findings

1. Give the shared assertion golden-vector corpus one checked-in path, schema,
   and U02 owner so the TypeScript issuer and Java verifier cannot create
   parallel fixtures with the same prose contract.

2. Size and monitor replay-map occupancy against the maximum accepted local
   request rate; the defined 4096-entry exhaustion behavior is safely
   fail-closed but could otherwise become an avoidable 503 source during a
   legitimate burst.

## Post-review lead corrections

The iteration-2 NOT-READY verdict above is immutable. Its remaining findings
are implemented without claiming a third reviewer pass:

1. Node `external` is counted once because it already includes
   `arrayBuffers`; `arrayBuffers` remains a diagnostic subset only. The
   non-overlapping gates are `heapUsed <=432 MiB`, `external <=48 MiB`,
   `rss-heapUsed-external <=64 MiB`, and `rss <=544 MiB`, reconciled across all
   U02 infrastructure artifacts.
2. Waiver expiry uses synchronized trusted current runner UTC, recorded in the
   evaluation report and freshness-checked against the CI control plane.
   Rebuilding an older source commit cannot resurrect an expired waiver.
3. The shared golden-vector corpus has exact path/schema/fields, and the replay
   proof covers occupancy 4096, fail-closed 4097, duplicate detection, expiry
   cleanup, and post-expiry admission.
