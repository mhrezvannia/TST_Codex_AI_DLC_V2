# CD Configuration — W2-02 Design-System Closure

## Inputs and deployment boundary

This configuration consumes `construction/ci-pipeline/ci-config.md`, `construction/ci-pipeline/quality-gates.md`, `booking-design-system-closure/infrastructure-design/deployment-architecture.md`, and `booking-design-system-closure/infrastructure-design/cicd-pipeline.md`.

W2-02 has no production CD workflow. Its deployment pipeline is the existing local acceptance orchestrator:

- target project: `linercore-wave-a`;
- canonical edge: `http://127.0.0.1:18088`;
- lifecycle wrapper: `scripts/wave-a-compose.mjs`;
- protected non-target: `linercore-shared-platform` at `http://127.0.0.1:8088`;
- terminal evidence runner: `scripts/w2-02-live-acceptance.mjs`.

No GitHub Actions deployment job, persistent environment, registry push, cloud resource, external secret, or production permission is added.

## Pipeline stages

| Stage | Blocking condition | Output |
|---|---|---|
| Source/CI qualification | `ci-config.md` and `quality-gates.md` commands are green | CI evidence |
| Manager pre-guard | Exact manager project, URL, and image inputs validate; guard exits zero | Run-bound guard record |
| Ownership/config | Wave A is absent and effective Compose config matches the fixed project, ports, profiles, and SSR control wiring | Ownership/config records |
| Deploy | Wrapper builds verified images or uses explicitly verified prebuilt images, then invokes `up --no-build --wait` | Startup record |
| Verify | Readiness/status, fixture, authenticated 98-case browser suite, accessibility/layout/keyboard assertions, and trace sanitization pass | Case records, screenshots, sanitized trace |
| Undeploy | Wrapper removes only attempt-owned Wave A containers, networks, and volumes | Cleanup record |
| Safety/audits | Manager post-guard and both mechanical audits exit zero | Guard/audit records |
| Publish evidence | Hash validation, chronology, workspace identity, and terminal-last transaction succeed | Immutable `COMPLETED` manifest |

Every failure stops promotion and publishes or preserves `FAILED` lineage. A partial run never becomes a release candidate.

## Environment promotion matrix

| Environment | Deployment mechanism | Promotion authority | Status |
|---|---|---|---|
| Local Wave A acceptance | Repository wrapper and live-acceptance runner | Exclusive local attempt plus stage approval | Defined and proven |
| Protected manager demo | None; guard-only | Not a deployment target | Forbidden |
| Staging | Not defined | Not granted | Outside scope |
| Production | Not defined | Separate explicit manual approval required in a future intent | Outside scope |

## Artifact and identity handling

Deployment consumes source-bound images and local/test identity material generated for the isolated edge. Browser storage state and raw traces are ignored and never promoted. Durable evidence is sanitized, canonicalized, hash-bound, non-aliased, and linked to its immutable attempt predecessor.

The formal proven instance is run `20260730074058-9adef85fd5de-32c59c26`, which completed 98/98 cases, cleanup, manager guard, audits, manifest validation, and terminal publication.

## Security implications

This stage changes no IAM role, network policy, encryption setting, Compose topology, or protected runtime. The deployment runner fails closed on project/port mismatch, never uses an unscoped Compose teardown, and mounts the workspace read-only for Windows audit containers. Production transport, secret management, encryption, and environment isolation remain unclaimed.

## Operational invocation

Operators generate a short-lived local/test storage state, verify manager health and Wave A absence, and invoke:

```powershell
$env:RUNTIME_PROFILE = "local"
$env:W2_02_BASE_URL = "http://127.0.0.1:18088"
corepack yarn w2-02:storage-state --output .w2-02-auth/storage-state.json
corepack yarn w2-02:live-acceptance --storage-state .w2-02-auth/storage-state.json
```

Reruns after correction must include `--rerun-of <failed-run-id>`. Operators must not substitute raw Compose commands or target port 8088.
