# Infrastructure Design Questions - contract-platform-catalog

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required for this Construction unit. Prior stages already resolve the deployment, compute, monitoring, CI/CD, secrets, and scaling posture for `contract-platform-catalog`.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Local-first executable contract platform using repository scripts, Docker Compose only for registry-dependent checks, and GitHub Actions for CI evidence. |
| Compute | Validator commands run as local/CI jobs, not as a first-release always-on service. |
| Storage | Contract source, generated metadata index, validation reports, and health snapshots are repository/CI artifacts; no central contract database in the first release. |
| Networking | Local Schema Registry is reached through the approved Docker Compose profile when Avro compatibility is in scope. Read-only health views consume generated artifacts through Enterprise Web or operations surfaces. |
| Monitoring | Contract validation emits structured result records, compact health snapshots, CI summaries, and links to verbose validator logs. |
| Security | CI artifacts and reports are internal/confidential, redacted, access-controlled, retained for release candidates, and not manually editable to green. |
| Scaling | Protocol and seam partitioning supports at least 75 contract assets, 25 registry subjects, 20 Pact/message-pact suites, 10 seams, and 500 result records per run. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact package names, command names, GitHub Actions workflow filenames, and generated artifact paths are implementation details constrained by this design.
