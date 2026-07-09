# Security Design - U01

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Expose no sensitive fields from module-info. Render local auth bypass as explicit development status. Keep backend CORS/proxy behavior aligned with existing local apps.

## Controls

Local bypass flags must be environment-scoped and visibly unsafe outside local development.
