# User Flow - Shared Platform Local Functionality

## Purpose

This user-flow artifact consumes `intent-statement`, `scope-document`, and `intent-backlog`. It maps the rough UI to the functional platform path required by U04 through U08: local auth, BFF-backed reference-data mutation, persistence, history, outbox publication, and integration readiness evidence.

## Happy Path

```text
[Start local stack]
        |
        v
[Open Auth app]
        |
        v
[Sign in with Keycloak]
        |
        +-- if local bypass enabled --> [Create local dev session]
        |
        v
[Open Reference Data Workbench]
        |
        v
[Select reference set]
        |
        v
[Create or edit record]
        |
        v
[BFF validates session and permission]
        |
        +-- no permission --> [Access denied / request access]
        |
        v
[BFF calls reference-data-service]
        |
        v
[Service validates and persists change]
        |
        v
[Outbox record created]
        |
        v
[Kafka / Schema Registry publication]
        |
        v
[UI refreshes detail, history, publication status]
        |
        v
[Contract and seed readiness visible]
```

## Alternate Flows

### Missing Auth or Permission

```text
[Open workbench]
        |
        v
[No valid session or missing write permission]
        |
        +--> [Read-only banner]
        |
        +--> [Request access]
        |
        +--> [Mutation actions disabled with reason]
```

### Validation Failure

```text
[Submit create/edit]
        |
        v
[Backend validation fails]
        |
        v
[BFF returns field errors + correlation id]
        |
        v
[Drawer keeps draft, focuses first invalid field]
```

### Publication Failure

```text
[Record saved]
        |
        v
[Outbox publication failed or retrying]
        |
        v
[Detail panel shows failed/retrying status]
        |
        v
[Retry action visible if permission allows]
```

### Seed Apply Failure

```text
[Run seed apply]
        |
        v
[Some records fail validation or service call]
        |
        v
[Run history shows partial failure]
        |
        v
[Failed rows link to validation details]
```

## Screen-to-Backlog Traceability

| Screen / flow | Backlog units |
| --- | --- |
| Auth sign-in/session | U04, U12 |
| Reference Data Workbench | U05, U06 |
| Create/edit drawer | U05, U06 |
| Deactivate confirmation | U05, U06 |
| History/publication panel | U05, U08 |
| Seed runs | U07 |
| Contract catalog | U09 |
| Local readiness dashboard | U01, U02, U03, U10, U11 |

## Interaction Rules

1. Read-only state is explicit and actionable: the user sees why writes are unavailable and where to request access.
2. Mutation actions are enabled only when session and `reference-data:write` authorization are present.
3. Every mutating flow displays or carries a correlation id.
4. Save/deactivate/apply actions never silently succeed; they return persisted status and history/publication evidence.
5. The UI must tolerate backend/service downtime by showing health-aware error states rather than static placeholder success.
6. Seed apply mode requires a confirmation step and shows dry-run vs apply mode clearly.
7. Contract/event readiness is visible enough for downstream module teams to trust the Shared Platform boundary.

## UX Acceptance Criteria

- Keyboard-only user can sign in, open the workbench, search records, open a record, edit fields, submit, and inspect status/history.
- Screen reader user can identify the current reference set, permission state, selected record, validation errors, and publication status.
- Authorized user sees enabled create/edit/deactivate actions; unauthorized user sees disabled actions with reason and request-access path.
- Failed backend, auth, seed, or publication operations show recovery guidance and correlation id.
- Mobile users can inspect records and status, while complex batch administration remains desktop-first.
