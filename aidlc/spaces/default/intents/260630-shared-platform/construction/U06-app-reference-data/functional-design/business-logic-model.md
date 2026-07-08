# Business Logic Model - U06 Reference Data Frontend App and BFF

## Source Trace

This U06 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

It covers US-003, US-005, US-006, US-007, US-008, US-009, US-010, US-011, and US-019. It implements the `apps/reference-data` responsibilities from `services.md`: reference admin and lookup workspace, BFF calls to `reference-data-service` and `identity-service`, contract/developer views where supplied by U07, and mobile read-only lookup by default.

## Unit Purpose

U06 provides the Shared Platform reference administration frontend and its BFF boundary. It lets authorized carrier staff browse, search, inspect, create, update, deactivate, reactivate, and monitor reference records across all nine MVP reference sets while preserving the approved security model: browser clients do not call backend services directly, and authorization decisions come through `identity-service`.

## Workspace Navigation Workflow

```text
Authenticated user opens apps/reference-data
  -> proxy/session guard validates app session
  -> BFF resolves user permissions from identity-service
  -> workspace shell loads reference-set metadata
  -> user selects reference set
  -> BFF calls reference-data-service list API
  -> UI renders list, empty, loading, error, or read-only state
```

Decision points:

| Decision | Rule |
|---|---|
| User not authenticated? | Redirect through approved auth/session flow, not direct backend access. |
| User lacks reference read permission? | Render access denied with correlation id and request-access path where available. |
| User has read but not write permission? | Render read-only list/detail and suppress or disable mutating actions with an explanation. |
| Reference set is empty? | Render empty state for the selected set, not a system error. |
| API returns validation/filter error? | Preserve prior usable state and show field/control-level error. |

## List, Search, and Detail Workflow

```text
Select reference set
  -> load page with stable sort and default active filter
  -> submit search/filter/page changes through BFF
  -> inspect selected record
  -> load identifiers, business fields, status, audit metadata, relationships
  -> load recent change and publication status where available
```

Processing rules:

1. Each list request includes reference set, filters, search text, page cursor or page number, page size, sort, and active/inactive status.
2. BFF validates request shape and passes correlation id to `reference-data-service`.
3. UI keeps previous data visible during refresh where possible.
4. Detail view displays platform id, business key, status, created/updated metadata, relationship fields, and per-set sensitive-data cues.
5. Event status and history are non-blocking: a failure to load status does not prevent the record detail from rendering.

## Create and Update Workflow

```text
Authorized user starts create/edit
  -> UI builds form from reference-set metadata
  -> React Hook Form tracks draft
  -> Zod validates client shape
  -> BFF submits command to reference-data-service
  -> service returns success or structured error envelope
  -> UI maps success to detail/list refresh or maps errors to fields and summary
```

Create/update decisions:

| Scenario | Behavior |
|---|---|
| Missing required field | Show field error and validation summary. |
| Duplicate business key | Show conflict error and keep draft values. |
| Relationship invalid | Show relationship-specific error, such as missing Country for Port or inactive Region for TradeLane. |
| Authorization denied | Show denied state with requested action and correlation id. |
| Success | Refresh detail/list state, show status, and expose pending/published event status when available. |

## Deactivate and Reactivate Workflow

```text
Authorized user opens record detail
  -> chooses deactivate or reactivate
  -> confirmation dialog names record and consequence
  -> optional reason captured where required
  -> BFF sends status command
  -> service audits and queues event
  -> UI refreshes record status and history
```

Inactive records remain readable. Default list filters show active records, but users can include inactive records where their permission allows.

## TradeLane Workflow

TradeLane forms use Region selectors for origin and destination. The UI must prevent obvious empty submissions, but the service remains authoritative for active-region and relationship validation.

```text
Open TradeLane create/edit
  -> load active Region options through BFF
  -> choose origin and destination Region
  -> validate both references are present
  -> submit TradeLane command
  -> service rejects missing/inactive Region or persists valid pair
```

The UI must not hard-code final trade lanes. U09 provides configurable seed defaults, and U03 owns aggregate invariants.

## Event Status and History Workflow

```text
Record detail loads
  -> BFF requests recent history/status projection
  -> UI renders actor, timestamp, operation, event id, status, correlation id
  -> user can copy event id or correlation id
  -> failed/retrying/pending states are visible without blocking record reads
```

Status states: pending, published, failed, retrying, stale/unknown. Status labels must use text, not color alone.

## Error Handling

| Failure | User-facing behavior |
|---|---|
| `identity-service` unavailable | Protected actions fail closed; read screens show authorization unavailable where needed. |
| `reference-data-service` unavailable | BFF returns standard error envelope; UI shows service unavailable with retry action. |
| Validation error | UI maps errors to fields and summary, preserving draft data. |
| Conflict | UI identifies duplicate or stale record state and keeps user on the workflow. |
| Event status unavailable | Detail renders record data with non-blocking status warning. |
| Session expired | Route guard sends user through auth flow and preserves intended return path where safe. |

## Non-Goals

- No direct browser calls to backend services.
- No generic metadata-only editor that bypasses aggregate-specific validation.
- No mobile create/edit parity unless separately approved.
- No downstream Charge, Booking, or Container Movement runtime screens.
- No ownership of `reference-data-service` aggregate rules or Kafka publisher internals.
