# Deployment Strategy — W2-03

## Selected strategy

The strategy consumes `ci-config`, `quality-gates`, all
`deployment-architecture` artifacts, and all `cicd-pipeline` artifacts. Use a
guarded recreate of only the isolated Wave A services. Blue/green, canary, and
rolling traffic shifts are rejected because the approved topology is a
single-user local Compose acceptance environment with no load balancer,
production traffic, duplicate environment, or production observability plane.

## Rollout phases

1. **Qualify:** all build, test, coverage, integration, pinned security, and
   live prerequisites must be PASS.
2. **Protect:** prove manager/demo invariants and capture exact inventory.
3. **Prepare:** verify candidate hashes, configuration, resource caps, backups,
   database ownership, and restore isolation.
4. **Recreate:** use only the Wave A wrapper; migrations are additive and
   forward-only.
5. **Observe:** complete authenticated readiness and the closed U06 technical
   acceptance matrix through edge 18088.
6. **Recover/compare:** always tear down/clean owner-scoped targets and compare
   manager fingerprints.
7. **Record:** publish immutable evidence; human approval remains separate.

## Promotion and abort criteria

There is no environment promotion beyond local acceptance. A technical
validation record is promotable only when every required cell is PASS and
artifacts reopen with matching digest/length. Abort on any:

- manager fingerprint/config/port difference;
- unauthorized topology or missing fail-closed secret;
- readiness timeout or authenticated smoke failure;
- migration/catalog/legacy/immutability/restore mismatch;
- commercial, browser, accessibility, performance, security, observability,
  coverage, audit, or preservation failure;
- missing/malformed/fabricated evidence receipt;
- inability to run teardown or post-guard after mutation.

## Database and compatibility stance

Charge V1–V4 and Booking V1–V3 are additive authority. After W2 migration or
write, normal recovery is forward repair. A prior image is eligible only where
the exact unit-owned predicate proves drained/read-only compatibility and zero
incompatible rows; it cannot receive new writes. A backup restore is tested
only in an owner-specific isolated target with verified OIDs/markers/catalogs
and guarded cleanup.

## Security implications

The deployment changes no IAM, network policy, encryption setting, or public
endpoint. It preserves signed human/service authority, local-only credentials,
loopback ingress, manager isolation, and evidence redaction. Future non-local
deployment requires an explicit security and infrastructure review.

