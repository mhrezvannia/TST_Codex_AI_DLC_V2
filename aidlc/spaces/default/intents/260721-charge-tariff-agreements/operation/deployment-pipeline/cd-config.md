# CD Configuration — W2-03

## Inputs and deployment boundary

This provider-neutral configuration consumes `ci-config`, `quality-gates`,
every unit `deployment-architecture`, and every unit `cicd-pipeline`. It
configures validation deployment only to the existing isolated
`linercore-wave-a` Compose project through `scripts/wave-a-compose.mjs`.
There is no dev/staging/production promotion, cloud account, registry,
credential, production approval workflow, or continuous delivery claim.

## Ordered validation deployment

| Order | Gate/action | Required outcome |
| --- | --- | --- |
| 1 | Verify CI release gates and immutable candidate identity | all mandatory cells PASS; exact commit/build/image/config hashes |
| 2 | `npm run demo:guard` and manager inventory/fingerprint | PASS before any mutation |
| 3 | resource/disk/tool/native-writer preflight | PASS; capability denial stops before mutation |
| 4 | render `node scripts/wave-a-compose.mjs config` | exact project/network, loopback edge 18088, no manager 8088 publication |
| 5 | owner-separated backup and migration preconditions | exact catalogs/hashes, restore targets, run-owner marker |
| 6 | guarded recreate/start through the wrapper | only candidate Wave A services; bounded readiness |
| 7 | authenticated smoke and full U06 acceptance | exact closed registry and evidence publication |
| 8 | unconditional recovery lane | teardown/cleanup plus post-guard/inventory/fingerprint |
| 9 | validation promotion record | only after every gate and artifact verifies |

No direct `docker compose`, alternate project, alternate port, direct service
acceptance, manager mutation, or evidence-writer fallback is permitted.

## Environment and approval matrix

| Environment | Purpose | Automatic action | Approval |
| --- | --- | --- | --- |
| CI component/Testcontainers | unit/integration isolation | run per merge candidate | CI gate only |
| `linercore-wave-a` | guarded local acceptance | validation deployment after all prerequisites pass | human AI-DLC/release-review approval after technical PASS |
| Production | not defined | none | requires a separate approved platform/deployment intent |

The current checkout cannot enter the Wave A mutation step because
`quality-gates` carries unresolved Docker/native-writer/frontend/dependency/
coverage/security/live evidence. The CD design does not convert those blockers.

## Artifact, secret, and feature configuration

- Consume immutable candidate hashes; never `latest`.
- Publish only bounded evidence by commit SHA/build ID under the CI-native
  retention policy; deployable registry publication remains disabled.
- Inject local-only service/signed-session secrets at runtime, redact every
  command/trace, and never store them in artifacts.
- No feature flag service is introduced. Existing fail-closed environment
  configuration is deployment configuration, not a business release flag.
- Any future production pipeline must separately define secret custody,
  approvers, observability thresholds, deployment window, and registry
  provenance before execution.

## Success and abort

Success requires authenticated readiness, commercial/browser/performance/
security/observability/preservation/quality/audit PASS, verified writer-backed
ledger/manifest, teardown, and unchanged manager fingerprint. Any FAIL or
BLOCKED aborts promotion. After any possible mutation, recovery gates run even
when the main lane fails.

