# Logical Components - U07 Live Release Acceptance

## Release Components

| Component | Responsibility | Failure domain |
|---|---|---|
| Preflight/schema controller | tools/ports/images/profile/cutover | run only |
| Compose readiness/seed driver | real runtime/canonical data | local environment |
| Browser journey/Playwright | visible workflow/a11y/network | UI/BFF |
| Topic/DB observers | exact contract/business effects | read-only evidence |
| Performance/resource collectors | raw samples/percentiles/envelope | workload |
| Replay/restart/migration harness | recovery proof | local services/volumes |
| Quality/audit runners | tests/coverage/detectors | merge gate |
| Manifest/Merkle finalizer | canonical index, fsync, read-only operational guard | staging/run filesystem |
| Detached Ed25519 attestor | external-key signature and checked-in-key verification | sibling attestation authority |
| Git evidence finalizer | dedicated commit, tree verification, annotated run tag | repository integrity |

## Source Coverage

Inventory bridges `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U07 `business-logic-model.md` to Infrastructure Design.
