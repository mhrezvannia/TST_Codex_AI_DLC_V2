# Deployment Strategy — W2-02 Design-System Closure

## Inputs

The strategy follows `construction/ci-pipeline/ci-config.md`, `construction/ci-pipeline/quality-gates.md`, `booking-design-system-closure/infrastructure-design/deployment-architecture.md`, and `booking-design-system-closure/infrastructure-design/cicd-pipeline.md`.

## Selected strategy: isolated ephemeral recreate

W2-02 deploys a complete, isolated acceptance stack and destroys it after verification. This is a recreate-style test deployment, not a production rollout. It is selected because:

- the environment exists only to produce closure evidence;
- fixed project and host-port isolation prevent collision with the manager demo;
- the canonical test requires a known-clean lifecycle;
- no persistent user traffic, staging environment, production environment, load balancer, or artifact registry exists in scope.

Blue/green would duplicate a nonexistent persistent environment. Canary and rolling strategies require production traffic, health metrics, and mixed-version compatibility that are neither available nor authorized.

## Release candidate definition

A workspace revision becomes an integration candidate only when both layers are green:

1. deterministic CI gates described by `ci-config.md` and `quality-gates.md`; and
2. a current terminal-last live evidence manifest for the same workspace identity.

The accepted Build and Test run is the current proof. Any later source change that alters workspace identity requires a new lineage-linked live run.

## Traffic and feature flags

There is no traffic shifting. Nginx exposes only the isolated edge for the duration of acceptance. The protected manager remains continuously independent and is checked before and after.

No feature flag service is configured. Acceptance-only controls such as the SSR proxy token, profile selection, and verified-prebuilt switch are test infrastructure controls with fail-closed validation; they are not user-facing release flags.

## Promotion and approval

| Transition | Automated checks | Human decision |
|---|---|---|
| Source → CI-qualified | GitHub Actions quality gates | Pull-request/integration review |
| CI-qualified → live-evidence candidate | Manager guard, Wave A lifecycle, 98 cases, cleanup, audits, manifest | Build and Test approval |
| Evidence candidate → program integration | Construction verification and intent review | Explicit program-owner integration decision |
| Program integration → staging/production | Not defined | New approved deployment scope required |

No stage approval in this intent grants production authority.

## Abort conditions

Deployment aborts on manager-guard failure, pre-existing Wave A resources, config/project/port mismatch, image verification failure, readiness failure, any browser case failure, unsafe trace content, cleanup failure, manager regression, audit execution failure, workspace drift, or terminal-manifest validation failure.

Abort retains failure evidence and invokes only authorized Wave A cleanup. The protected manager is never torn down or rebuilt by this deployment pipeline.

## Data and migration posture

Wave A volumes are ephemeral for this closure. Additive database migrations execute through existing service startup and are verified by the live journey. Deleting the attempt-owned volumes is cleanup, not a production rollback or durability claim. No production expand-contract migration procedure is implied.
