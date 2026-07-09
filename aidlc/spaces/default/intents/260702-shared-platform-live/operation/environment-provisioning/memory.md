# Environment Provisioning Memory

## Interpretations

- 2026-07-03T23:00:00Z - Treated environment-provisioning as local/on-prem validation rather than AWS provisioning; this intent's `deployment-architecture`, `infrastructure-services`, and `cd-config` artifacts all target Compose/self-hosted runtime.

## Deviations

- 2026-07-03T23:01:00Z - Did not provision AWS VPC, subnet, IAM, Secrets Manager, or Parameter Store resources because the approved scope is local Shared Platform functionality and no cloud target is configured.

## Tradeoffs

- 2026-07-03T23:02:00Z - Used readiness evidence as the source of truth for environment validation; it already distinguishes blocked prerequisites from code failures and is repeatable locally and in CI.

## Open questions

- 2026-07-03T23:03:00Z - Confirm whether Docker Desktop, Java 21, Maven, and local service images should be installed/configured on this workstation or only on the self-hosted CI runner.
