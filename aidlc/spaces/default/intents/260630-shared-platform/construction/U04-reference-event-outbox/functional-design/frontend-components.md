# Frontend Components - U04 Reference Event Outbox and Kafka Publication

## Source Trace

This U04 frontend integration design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U04 is a backend/messaging unit. It does not implement React components, but it defines the event status data consumed by `apps/reference-data` in U06.

## Event Status View Model

Purpose: Let reference administrators and platform operators inspect whether recent reference changes have been queued, published, retried, or failed.

Fields:

| Field | Purpose |
|---|---|
| `eventId` | Stable event id. |
| `referenceSet` | Changed reference set. |
| `recordId` | Changed record id. |
| `recordCode` | Safe business code where available. |
| `operation` | Created, updated, deactivated, reactivated. |
| `status` | Pending, in progress, retrying, published, failed, recovery required. |
| `attemptCount` | Publication attempts. |
| `lastAttemptAt` | Last attempt timestamp. |
| `publishedAt` | Successful publish timestamp. |
| `brokerMetadata` | Safe topic/partition/offset summary. |
| `lastError` | Safe error code/message. |
| `correlationId` | Support trace id. |

## Future U06 Components Enabled

| Future component | U04 data used |
|---|---|
| `EventStatusBadge` | Current publication status. |
| `EventStatusTimeline` | Attempt timestamps and state changes. |
| `RecentPublicationPanel` | Recent events by reference record or set. |
| `PublicationFailureNotice` | Safe failure summary and support correlation id. |
| `ContractEventExampleView` | Event type, schema version, and sample envelope metadata. |

## BFF Consumption Pattern

```text
apps/reference-data page
  -> BFF route handler checks session and authorization
  -> BFF calls reference-data-service event status API
  -> BFF maps status DTO to UI view model
  -> UI renders badge, timeline, or failure notice
```

Browser JavaScript does not call backend services directly.

## Status UI States

| Status | UI behavior |
|---|---|
| `PENDING` | Show queued state. |
| `IN_PROGRESS` | Show publishing state. |
| `RETRYABLE` | Show retrying with attempt count. |
| `PUBLISHED` | Show success with published timestamp. |
| `FAILED_PERMANENT` | Show failed state and support correlation id. |
| `RECOVERY_REQUIRED` | Show operator attention required. |

## API Error States for UI

| API condition | UI implication |
|---|---|
| Authorization denied | Show access denied/read-only operator state. |
| Event not found | Show no publication record yet or missing event state. |
| Status dependency unavailable | Show retry/support message. |
| Validation error | Show filter/search validation error. |

## Validation Rules

- Status APIs must not expose broker credentials, internal stack traces, or unsafe payload contents.
- Correlation id must be visible for support.
- Failed status display must distinguish retrying from permanently failed.
- Published broker metadata must be safe for admin/operator visibility.
- U04 must not implement U06 React components or routes.

## Out of Scope

- Full reference admin UI implementation.
- Downstream consumer health dashboards.
- Charge, Booking, or Container Movement event consumer screens.
