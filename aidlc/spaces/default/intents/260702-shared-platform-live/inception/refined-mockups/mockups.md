# Refined Mockups - Shared Platform Local Functionality

## Context

These refined mockups consume `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. They refine the Shared Platform UI around the Reference Data module while keeping Charge, Booking, Container Movement, finance integration, and production deployment out of scope.

## Screen Map

| Screen | Primary stories | Primary requirements | Purpose |
| --- | --- | --- | --- |
| Auth sign-in and session | US-005, US-016 | FR-010, FR-011, FR-014 | Prove local auth or local-only bypass and expose safe session state. |
| Reference Data workbench | US-006, US-007 | FR-012, FR-013, FR-015, FR-016, FR-020 | Replace view-only behavior with backend-backed lists, detail, permissions, and status. |
| Create/edit record drawer | US-008, US-009 | FR-017, FR-018, FR-021 | Capture validated mutations with history and publication evidence. |
| Deactivate confirmation | US-010 | FR-019, FR-021 | Deactivate as audited status change, not hard delete. |
| Seed runs | US-011 | FR-022, FR-023, FR-024 | Show dry-run/apply behavior, idempotency, and partial failures. |
| Publication and contract readiness | US-012, US-013 | FR-025, FR-026, FR-027, FR-028, FR-029 | Make downstream-readiness evidence inspectable. |
| Local readiness | US-001, US-002, US-003, US-014, US-015 | FR-001, FR-002, FR-003, FR-004, NFR-003, NFR-004 | Separate environment blockers from code failures. |

## Auth Sign-In and Session

```text
+--------------------------------------------------------------------------------+
| Shared Platform Auth                                      [Local] [corr-...]    |
+--------------------------------------------------------------------------------+
| Sign in                                                                         |
|                                                                                |
| [Continue with Keycloak]      [Use local bypass]                               |
|                                                                                |
| Session summary                                                                 |
| Subject              local.reference.admin                                      |
| Roles                reference-data-admin                                       |
| Permissions          reference-data:read, reference-data:write                  |
| Auth mode           Keycloak or Local bypass                                    |
| Correlation id       corr-20260703-...                                          |
|                                                                                |
| [View safe session JSON] [Sign out]                                             |
+--------------------------------------------------------------------------------+
```

State requirements:

- No session: show sign-in action and no token details.
- Keycloak unavailable: show service-down state and local bypass only if enabled by local profile.
- Local bypass active: show a persistent local-only status label.
- Signed in: expose safe subject, roles, permissions, auth mode, and correlation id.

## Reference Data Workbench

```text
+--------------------------------------------------------------------------------+
| Shared Platform / Reference Data             [Write enabled] [corr-...]        |
+----------------------+--------------------------------+------------------------+
| Reference sets       | Canonical records              | Record detail          |
|----------------------|--------------------------------|------------------------|
| > Currency           | Search [USD               ]    | CURRENCY / USD         |
|   Location / Port    | [ ] Include inactive           | Display: US Dollar     |
|   Region             | [Create] [Apply seed]          | Status: ACTIVE         |
|   Charge Code        |                                | Version: 7             |
|   Equipment Type     | Code   Name        Pub         | Updated by: admin      |
|   Commodity          | USD    US Dollar   Published   | Correlation: corr-...  |
|   Trade Lane         | EUR    Euro        Pending     |                        |
|                      |                                | History                |
|                      | [Edit] [Deactivate] [History]  | Created -> Updated     |
|                      |                                | Publication            |
|                      |                                | Published [Retry]      |
+--------------------------------------------------------------------------------+
```

State requirements:

- Loading: table and detail regions use skeleton rows with preserved layout.
- Empty set: show empty state with create action if permitted.
- Unauthorized read: show access-denied panel with request-access path.
- Read-only write denial: keep create/edit/deactivate visible but disabled with reason.
- Backend unavailable: replace fixture-like success with service-down message and correlation id.
- Permission loaded: action availability comes from identity authorization, not static client state.

## Create/Edit Record Drawer

```text
+--------------------------------------------------------------+
| Edit Currency Record                                   [X]   |
+--------------------------------------------------------------+
| Code *              [USD]                  immutable          |
| Display name *      [US Dollar                         ]      |
| Effective status    (o) ACTIVE   ( ) INACTIVE                 |
| Minor unit          [2                                 ]      |
| Change reason *     [Correct display metadata          ]      |
|                                                              |
| Validation summary                                            |
| Code is immutable after creation.                             |
| Change reason is required for audit history.                  |
|                                                              |
| [Save changes] [Cancel]                                      |
+--------------------------------------------------------------+
```

State requirements:

- Create mode: code is editable, default status is active.
- Edit mode: immutable keys are visible but locked.
- Validation failure: preserve draft, focus first invalid field, list field-level errors.
- Stale version: show conflict message and reload option.
- Save success: close drawer, refresh detail/history/publication status.

## Deactivate Confirmation

```text
+--------------------------------------------------------------+
| Deactivate Reference Record                                  |
+--------------------------------------------------------------+
| CURRENCY / USD - US Dollar                                   |
|                                                              |
| This will remove the record from active lookups. History and  |
| publication evidence remain available.                       |
|                                                              |
| Reason * [Retired from local test set                  ]      |
|                                                              |
| [Deactivate] [Cancel]                                        |
+--------------------------------------------------------------+
```

State requirements:

- Reason is mandatory.
- Confirm action is disabled until reason is present.
- Success refreshes status, history, and outbox publication.
- Failure preserves reason and shows correlation id.

## Seed Runs

```text
+--------------------------------------------------------------------------------+
| Seed Data Runs                                             [Refresh] [Run]      |
+--------------------------------------------------------------------------------+
| Dataset [shared-platform-mvp]   Mode [Dry run v]   [Apply with confirmation]   |
|                                                                                |
| Run history                                                                    |
| Time      Mode    Result    Upserted  Skipped  Failed   Notes                  |
| 09:15     apply   OK        11        42       0        idempotent             |
| 09:03     dry     WARN      0         42       1        duplicate natural key  |
|                                                                                |
| Failed rows                                                                     |
| Set          Key          Error                                                |
| Currency     USD          duplicate active key                                 |
+--------------------------------------------------------------------------------+
```

State requirements:

- Dry-run and apply modes are visually distinct.
- Apply requires confirmation.
- Partial failure keeps successful row counts and links failed rows to validation detail.
- Repeated apply shows skipped/unchanged records rather than duplicates.

## Publication and Contract Readiness

```text
+--------------------------------------------------------------------------------+
| Integration Readiness                                                          |
+--------------------------------------------------------------------------------+
| Outbox status                                                                  |
| Record     Operation   Schema subject       Status      Broker metadata        |
| USD        updated     reference-data.v1    Published   kafka offset 128       |
| EUR        created     reference-data.v1    Retrying    schema registry down   |
|                                                                                |
| Contract catalog                                                               |
| OpenAPI provider     PASS                                                      |
| Avro compatibility  PASS                                                      |
| Pact/message checks  PENDING                                                   |
+--------------------------------------------------------------------------------+
```

State requirements:

- Pending, retrying, failed, and published states use text labels, not color alone.
- Retry action is available only to authorized users.
- Contract checks distinguish not-run from failed.
- Event status includes correlation id or record id for traceability.

## Local Readiness

```text
+--------------------------------------------------------------------------------+
| Local Readiness                                             [Run checks]        |
+--------------------------------------------------------------------------------+
| Toolchain                 Services                     Quality gates           |
| Node       OK             Keycloak       healthy       Frontend tests OK        |
| Yarn       OK             PostgreSQL     healthy       Backend tests BLOCKED    |
| Java       Missing        Kafka          stopped       Contracts PENDING        |
| Maven      Missing        Ref service    stopped       Seed validation OK       |
| Docker     Not running    Identity svc   stopped       Smoke BLOCKED           |
|                                                                                |
| Blocking next: install Java 21, Maven 3.9+, start Docker runtime.              |
+--------------------------------------------------------------------------------+
```

State requirements:

- Missing prerequisites are blocker states, not failed code tests.
- Checks include clear recovery hints.
- Quality gates link to evidence output when available.
- Status remains useful without Docker, Java, or Maven installed.

## Responsive Behavior

| Breakpoint | Behavior |
| --- | --- |
| Mobile below 768px | Reference sets become a select/menu, table rows become stacked summaries, detail/status panels move below the list, mutation drawer becomes full-screen dialog. |
| Tablet 768px to 1024px | Two-column layout with reference-set nav above or left, records and detail stacked. |
| Desktop above 1024px | Three-column workbench with stable widths for nav, table, and detail/status. |

## Review

Verdict: READY

Inline fallback review finds the refined mockups aligned with `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. The designs stay scoped to Shared Platform and turn the current view-only Reference Data surface into an explicit functional UX contract for authorization, backend-backed state, mutation forms, seed apply, publication status, contract readiness, local readiness, and failure states.

