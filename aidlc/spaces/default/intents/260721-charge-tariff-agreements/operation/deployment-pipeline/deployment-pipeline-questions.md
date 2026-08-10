# Deployment Pipeline Questions — W2-03

## Upstream context

This question set consumes `ci-config`, `quality-gates`, every unit
`deployment-architecture`, and every unit `cicd-pipeline`. Those artifacts
define one guarded local acceptance environment (`linercore-wave-a`, edge
18088), prohibit manager port 8088 mutation, add no production/cloud
environment, and make post-write database rollback forward-repair-first.

## Decisions required

1. Should local deployment use a guarded recreate, or should this feature
   invent blue/green, canary, or rolling production infrastructure?
2. Is the promotion path validation-only on isolated Wave A, or should
   dev/staging/production tiers and production approvers be introduced?
3. Should recovery remain forward repair plus owner-isolated restore and exact
   compatibility-gated prior-image use, and should feature flags remain absent?

## Recommended answers

- Use guarded recreate through `scripts/wave-a-compose.mjs`; blue/green,
  canary, and rolling traffic shifting do not exist in the approved topology.
- Keep this pipeline validation-only. Require a separately approved platform
  intent before defining production environments, credentials, windows, or
  approvers.
- Use forward repair after W2 writes/migrations. Permit a previous image only
  under the existing drained/read-only/zero-incompatible-row predicates; test
  restores only in owner-isolated targets. Add no cloud feature-flag service or
  business behavior flag.

