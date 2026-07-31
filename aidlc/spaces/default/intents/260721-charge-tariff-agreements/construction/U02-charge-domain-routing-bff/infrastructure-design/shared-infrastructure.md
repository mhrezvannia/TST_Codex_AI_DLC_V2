# Shared Infrastructure - U02 Charge Domain Routing and BFF

## Shared-resource ownership

| Resource | Owner | U02 authority |
| --- | --- | --- |
| nginx/shared edge | Wave A platform | add exact Charge locations; regression-protect every existing location |
| `apps-charge-agreements` | Charge UI | own base path, BFF/session/policy/route states |
| `packages/ui`, shell, navigation, tokens | W2-02 | consume unchanged; no global CSS/component fork |
| Auth/session seam | Auth domain | consume `@erp/auth`; no new identity/session format |
| Charge backend | U01/U03/U04 domain units | fixed forwarding only; no domain behavior |
| Reference Data | Reference domain | selector labels through existing BFF credential |
| assertion secret/verifier | U02 issuer / U03 verifier | shared dedicated secret and exact assertion contract only |
| Wave A wrapper/override | U06 integration | consume guarded project, loopback bindings, U02 768 MiB/512 MiB/8 MiB memory override |
| observability | platform/U06 evidence | emit safe closed metrics/logs/traces |
| manager 8088 and W1 evidence | protected baseline | probe/preserve only |

## Shared edge contract

U02's nginx change is additive and order-sensitive: the exact and `^~` Charge
locations precede catch-all behavior but do not shadow existing Auth, Reference,
Booking, health, or shell routes. The full base-path URI reaches Next unchanged.
Nginx diagnostic forwarded headers are never origin or authorization authority.

The Wave A override binds all host ports to loopback and changes only isolated
Charge-app memory/Node settings needed for the 544 MiB bound. It is always
applied by the wrapper and never changes manager runtime configuration.

## Shared secret and authorization boundaries

`AUTH_SESSION_SECRET`, `REFERENCE_DATA_BFF_TOKEN`, and
`CHARGE_BFF_ASSERTION_SECRET` are distinct. Assertion header, key ID
`w2-03-wave-a-v1`, byte framing, signature, time/skew, and nonce rules are one
bilateral U02/U03 contract with golden vectors. The assertion secret is available
only to the Charge BFF and U03 backend verifier. Browser, nginx, logs, traces,
metrics, images, and evidence receive none of them.

The U03 process-local replay map holds at most 4096 `<kid>:<nonce>` entries
until `exp+5`. Duplicate and capacity outcomes fail closed. The bounded restart
replay limitation is explicit and prevents a multi-instance/production claim.

BFF capabilities and U03 subject assertions are defense-in-depth context, not
commercial authorization. U01/U03/U04 services independently authorize exact
actions. Reference selector access requires page/domain capability before the
call and cannot authorize a command.

## Shared capacity and failure domains

| Pressure/failure | Blast radius | Containment |
| --- | --- | --- |
| Charge BFF 20-permit saturation | new protected Charge forwards in one process | 100 ms then typed 503; no body/backend allocation |
| selector 10-permit saturation | selector calls only | separate 100 ms/2000 ms/128 KiB bounds |
| Charge-app memory pressure | Charge UI/BFF | 768 MiB crash ceiling; 24 MiB/admission plus heapUsed 432, external 48 (includes arrayBuffers), residual-native 64, RSS 544 MiB gates; no manager change |
| invalid Charge config | protected Charge routes | minimal DOWN health and safe config 503, no forwarding |
| nginx Charge defect | Charge mount, potentially shared edge | syntax + preserved-route matrix blocks release |
| Charge/Reference outage | relevant forwarded request | bounded typed 503; no cached/fabricated success |
| observability outage | diagnosis/evidence | no authority change; acceptance may fail |

No BFF database, cache, shared semaphore service, session affinity, broker, or
new gateway is introduced. Per-process state is recreated deterministically.

## Cross-unit handoff

U01 supplies Rate endpoints and service authorization. U02 supplies the stable
edge/BFF seam. U03 consumes the exact signed subject assertion and vendor media.
U04 uses the same policy/normalization mechanism for pricing/manual evidence.
U05 remains behind Booking. U06 owns integrated live proof and safe evidence
manifesting.

Adding a route requires a compile-time policy entry and matrix coverage. Adding
an assertion field, changing secret/issuer/time/path canonicalization, or
changing nginx/basePath is a coordinated U02/U03 compatibility change, not a
runtime configuration toggle.

## Preservation and cleanup

All full-stack operations use exact `linercore-wave-a` identities and
wrapper-created resources. Broad cleanup, unresolved variables, wildcard host
binding, manager project overlap, or port 8088 targeting aborts. `demo:guard`
runs before and after.

The original W1 blocked/waived artifact remains immutable and non-PASS. U02
source/health evidence is not live acceptance; later green W2-03 proof is
separate and cannot upgrade historical status or unresolved DS-02/DS-03.

## Upstream traceability

This shared contract consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. It preserves
their U02/U03 ownership seam, shared-edge constraints, bounded per-process
resources, no-affinity design, and acceptance ownership.
