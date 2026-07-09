# Security Design - U07

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Reference-data calls are read-only. Backend validation stores stable IDs and never copies reference administration data.

## Controls

Propagate auth/correlation conventions used by existing Shared Platform apps.
