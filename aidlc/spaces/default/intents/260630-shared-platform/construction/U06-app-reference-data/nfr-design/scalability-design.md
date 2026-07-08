# Scalability Design - U06 Reference Data App

## Scalability Goals

U06 scales as one BFF-governed reference workspace covering all nine MVP reference sets. It avoids separate apps per set, browser-side full dataset caches, local replicas, and a generic metadata editor that bypasses aggregate-specific validation.

## Navigation and Data Access

Workspace navigation loads reference-set metadata and selected set data on demand. List views are paginated, filterable, stable-sorted, and active-default. Detail views load relationship labels, audit metadata, and event status through APIs.

All backend access flows through BFF handlers and shared API clients rather than direct browser-to-service calls.

## Form Growth

Per-set metadata plus React Hook Form and Zod support optional fields and set-specific validation while preserving service-driven rules. Future reference-set field additions should extend metadata and DTOs without changing the app boundary.

Zustand is limited to bounded UI state and must not become a local authorization/domain-state replica.

## Event and History Growth

History and event status are loaded separately and paginated/filterable where applicable. They remain non-blocking so growing inactive history or publication status volume does not degrade basic record reads.

## Mobile and Contract Views

Mobile defaults to read-only lookup unless later approved for create/edit parity. U07-supplied contract/developer views are display-only in U06 and do not create downstream runtime screens.

## Source Trace

This design implements constraints from `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
