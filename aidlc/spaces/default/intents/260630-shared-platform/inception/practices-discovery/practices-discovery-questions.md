# Practices Discovery Questions - Shared Platform

> Stage: Practices Discovery
> Intent record: `260630-shared-platform`
> Mode: Greenfield interview using org defaults and Shared Platform module tech-env.

## Q1. Way of Working

Which branching and merge practice should this workflow affirm?

A. Trunk-based development on `main`, short-lived feature/Bolt branches, squash-merge each Bolt (recommended)
B. GitHub Flow with feature branches that may live several days
C. Long-lived release branches by environment
X. Other (please specify)

[Answer]: A. Trunk-based squash (Recommended)

## Q2. Walking Skeleton

Which walking-skeleton stance should this greenfield MVP use?

A. Run the walking-skeleton Bolt first, gated, then ask the autonomy ladder prompt (recommended)
B. Scope-dependent; decide later during Delivery Planning
C. Never run a walking skeleton for this project
X. Other (please specify)

[Answer]: A. Skeleton first (Recommended)

## Q3. Testing Posture

Which testing posture should be affirmed?

A. Tests written alongside code, CI-blocking gates, Shared Platform 85% line coverage target for both services (recommended)
B. Tests after implementation with 80% line coverage minimum
C. Minimal tests only until MVP integration is working
X. Other (please specify)

[Answer]: A. Tests plus 85% (Recommended)

## Q4. Deployment

Which deployment practice should be affirmed?

A. Deploy on merge to staging through GitHub Actions/self-hosted runners; production requires manual approval (recommended)
B. Manual staging and production deploys until MVP is complete
C. Continuous deployment directly to production on every green commit
X. Other (please specify)

[Answer]: A. Staging on merge (Recommended)

## Q5. Code Style

Which code-style posture should be affirmed?

A. Follow Enterprise Tech Env v1.1 and project configs: Java/Spring hexagonal skeleton, pure domain core, TS strict, frontend constitution, no prohibited libraries (recommended)
B. Let generated code decide conventions during Construction
C. Use ad hoc per-service conventions where convenient
X. Other (please specify)

[Answer]: A. Env v1.1 + configs (Recommended)