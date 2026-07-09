# Domain Entities - UOW-04 Reference Data Service Core

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Entities

| Entity | Attributes | Lifecycle |
| --- | --- | --- |
| ReferenceSet | enum value, label | cataloged |
| ReferenceRecord | id, set, code, displayName, status, version, attributes, audit fields | created -> updated -> inactive |
| ReferenceChange | changeId, set, recordId, operation, before, after, actor, reason, correlationId | appended -> queried |
| ReferenceMutationCommand | set, code, displayName, attributes, actor, operation, reason, correlationId | received -> validated -> applied |
| ReferencePage | records, page, size, total | queried -> returned |

## Relationships

- ReferenceSet has many ReferenceRecords.
- ReferenceRecord has many ReferenceChanges.
- Mutation command produces a record change and an outbox event.

