# Logical Components - U06 Reference Data App

## Component Overview

`apps/reference-data` is a Next.js App Router application and BFF boundary for reference administration and lookup. It consumes `identity-service` for permission context, `reference-data-service` for canonical reference APIs, U04 status APIs for publication visibility, and U07-supplied contract/developer content where available.

## Components

### Workspace Shell

Loads app session, permission context, reference-set metadata, navigation state, and read-only/denied state. It renders loading, empty, error, denied, read-only, and usable content states.

### Route Protection and Session Guard

Sends unauthenticated users through the approved auth flow with validated return path. It does not replace BFF/server authorization.

### BFF Route Handlers

Validate request shape, resolve authorization context, propagate correlation ids, call backend APIs through `@erp/api-core`, and normalize standard error envelopes for the UI.

### Reference List Views

Render paginated, filterable, stable-sorted, active-default lists for all nine reference sets. They preserve prior usable data during refresh and map validation/filter errors to controls.

### Detail Views

Render platform id, business key, status, metadata, relationship fields, sensitive-data cues, and recent change/status information. Event/history failures are non-blocking.

### Form Workflows

Use reference-set metadata, React Hook Form, and Zod for create/update/deactivate/reactivate workflows. They preserve drafts, map service validation to fields/summaries, and refresh list/detail state after success.

### TradeLane Form

Loads active Region options through BFF, validates origin/destination presence client-side, and relies on U03 for active-region and relationship invariants.

### Event Status and History Panel

Loads recent history and publication status separately. It displays actor, timestamp, operation, event id, status, correlation id, and accessible text labels for pending, published, failed, retrying, stale, and unknown states.

### Access Denied and Request Access

Displays requested area/action, safe reason, correlation id, and request-access affordance where available. It does not grant permissions.

### Observability Layer

Emits BFF logs, metrics, and traces for list, detail, search/filter, submit, status commands, event status, identity-service latency, reference-data-service latency, error category, and correlation id.

## Dependency Direction

Browser components depend on BFF route handlers and shared UI/types. BFF handlers depend on identity-service, reference-data-service, status APIs, and shared API clients. Browser code does not depend on backend service credentials, database access, tokens, or domain aggregate internals.

## Source Trace

This design implements constraints from `business-logic-model.md`, `tech-stack-decisions.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md`.
