# Logical Components - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Components

| Component | Responsibility | Failure domain |
| --- | --- | --- |
| PrerequisiteProbe | Runs tool/env/port checks. | Local shell/process. |
| ComposeProfileValidator | Validates Compose profiles and build path. | Docker/Compose. |
| EvidenceWriter | Writes JSON/markdown summary. | Filesystem. |
| RemediationCatalog | Maps blockers to next actions. | Static data. |

## Shared Resources

- Local PATH.
- Docker daemon.
- Workspace files.
- Required ports.

