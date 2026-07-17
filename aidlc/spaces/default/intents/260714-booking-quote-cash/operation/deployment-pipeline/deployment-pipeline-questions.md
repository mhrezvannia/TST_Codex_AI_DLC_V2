# Deployment Pipeline Questions - W1-01

## Questions And Answers

### Q1. What deployment strategy should W1 use?

A. Local Compose acceptance promotion with manual release approval
B. Blue/green production deployment
C. Canary production deployment
D. Rolling production deployment
E. Continuous deployment to production on merge
X. Other (please specify)

[Answer]: A

Rationale: `ci-config`, `quality-gates`, every unit `deployment-architecture`, and every unit `cicd-pipeline` point to local Docker Compose as the canonical W1 delivery environment. Cloud or production deployment is not part of this intent's completed evidence.

### Q2. What environment promotion gates are required?

A. PR CI only
B. PR CI, manual live acceptance on the local Compose stack, audit review, then manual release tag
C. Automatic staging and production deployment after CI
D. Production deploy after container startup only
E. Manual approval without evidence
X. Other (please specify)

[Answer]: B

Rationale: `quality-gates.md` defines PR gates, while the release gate remains `node scripts/w1-live-acceptance.mjs --run-id <new-id>` on a Docker host with required images available.

### Q3. What approval workflow is required for production?

A. No production approval required
B. Manual production approval after live evidence and audit review
C. Automatic production approval from CI success
D. Product-only approval without technical gate review
E. Security-only approval without business acceptance
X. Other (please specify)

[Answer]: B

Rationale: Team deployment practice requires separate manual approval before production promotion. W1 currently stops at local release proof, so production approval is a later Operation-stage control.

### Q4. What rollback procedure is required?

A. Reset all Docker volumes and rerun from scratch
B. Revert to prior compatible images, preserve PostgreSQL volumes, and use tested dump or forward repair for data recovery
C. Drop changed tables and restart services
D. Delete Kafka topics and re-create them from contracts
E. No rollback procedure required
X. Other (please specify)

[Answer]: B

Rationale: Unit `deployment-architecture` and `cicd-pipeline` files forbid destructive reset as success evidence and require additive-compatible schemas, retained volumes, and fresh failed-run IDs.

### Q5. What feature flag strategy is required?

A. No W1 feature flags; keep W1 isolated behind branch/release gates and local profile controls
B. AWS AppConfig flags
C. CloudWatch Evidently experiments
D. In-database feature flags owned by Booking
E. Browser local-storage flags
X. Other (please specify)

[Answer]: A

Rationale: W1 is a local Compose release proof. Feature flag infrastructure belongs to later production-grade operation work.

## Open Follow-Ups

- Decide whether the release-proof runner is a dedicated self-hosted GitHub Actions runner or a manually operated workstation with cached images.
- Add production environment promotion only after environment provisioning, deployment execution, observability, incident response, and performance validation stages define those controls.
