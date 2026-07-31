# Deployment Pipeline Questions — W2-02 Design-System Closure

## Resolved deployment choices

The answers below are fixed by `construction/ci-pipeline/ci-config.md`, `construction/ci-pipeline/quality-gates.md`, `booking-design-system-closure/infrastructure-design/deployment-architecture.md`, and `booking-design-system-closure/infrastructure-design/cicd-pipeline.md`.

### Q1. Which deployment strategy applies?

An ephemeral isolated Compose deployment applies. The repository-owned `scripts/wave-a-compose.mjs` wrapper creates or starts only `linercore-wave-a`, verifies it, and removes it after evidence capture. Blue/green, canary, rolling production rollout, and in-place manager deployment are not applicable to this closure.

### Q2. Which environment promotion gates apply?

There is one local acceptance environment and no dev → staging → production promotion chain. Promotion means accepting a workspace-bound evidence manifest for program integration after CI gates and the canonical live gate pass. It does not mean deploying artifacts to a persistent runtime.

### Q3. What production approval workflow applies?

No production deployment exists in W2-02. The stage approval and later integration decision do not authorize production promotion. A separate future intent must define environment ownership, secrets, artifact repositories, production smoke tests, and explicit manual approval.

### Q4. What is the rollback procedure?

On any preflight or runtime failure, retain immutable failed evidence, clean only attempt-owned `linercore-wave-a` resources through the wrapper, verify project absence, and rerun the protected manager guard. Source rollback uses ordinary version control and a new lineage-linked attempt; failures are never overwritten.

### Q5. Which feature-flag strategy applies?

No feature-flag platform or runtime flag is introduced. CloudWatch Evidently, AppConfig, and equivalent production systems are outside the local/on-prem closure scope. Existing test controls are evidence mechanisms, not deployable product feature flags.

## Deferred production decisions

Registry selection, environment promotion, traffic shifting, release windows, production approvers, secret stores, database migration orchestration, automated rollback metrics, and production feature flags remain intentionally undecided until an approved production-deployment intent supplies real infrastructure.
