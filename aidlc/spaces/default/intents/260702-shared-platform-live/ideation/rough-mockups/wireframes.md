# Wireframes - Shared Platform Local Functionality

## Purpose

These low-fidelity wireframes consume `intent-statement`, `scope-document`, and `intent-backlog`. They sketch the screens needed to turn the current read-only Shared Platform UI into a functional local operations workspace for authentication, reference data mutation, seed apply mode, publication status, and local readiness evidence.

The sketches are intentionally operational and compact. They do not define Charge, Booking, or Container Movement screens.

## Information Architecture

```text
Shared Platform
  Auth
    Sign in
    Session
    Request access
  Reference Data
    Workbench
    Create/Edit record
    Deactivate record
    Record history
    Publication status
  Integration Readiness
    Seed runs
    Contract catalog
    Event/outbox status
  Local Readiness
    Toolchain checks
    Compose/service health
    Quality gate evidence
```

## Screen 1 - Auth Sign In and Session

```text
+------------------------------------------------------------+
| Shared Platform Auth                         [Status chip] |
+------------------------------------------------------------+
| Sign in                                                    |
|                                                            |
| [Continue with Keycloak]   [Use local bypass if enabled]   |
|                                                            |
| Session summary                                            |
| +----------------------+  +-----------------------------+  |
| | Subject              |  | local.reference.admin       |  |
| | Roles                |  | reference-data-admin        |  |
| | Permissions          |  | read, create, update        |  |
| | Correlation id       |  | corr-...                    |  |
| +----------------------+  +-----------------------------+  |
|                                                            |
| [View safe session JSON] [Sign out]                        |
+------------------------------------------------------------+
```

Accessibility note: `h1` is "Shared Platform Auth"; landmarks are `main` and optional `nav`; first keyboard entry is "Continue with Keycloak"; session fields use a description list.

Implementation intent:

- Existing `apps/auth/app/sign-in/page.tsx` and `apps/auth/app/session/page.tsx` remain the entry points.
- `AUTH_BYPASS=true` appears only when the server reports local bypass enabled.
- Session summary should show user, roles, permissions, and correlation id without exposing tokens.

## Screen 2 - Reference Data Workbench

```text
+--------------------------------------------------------------------------------+
| Shared Platform / Reference Data                 [Write enabled] [corr-...]    |
+----------------------+--------------------------------+------------------------+
| Reference sets       | Canonical records              | Record detail          |
|----------------------|--------------------------------|------------------------|
| > Currency           | Search [ USD       ] [ ]Inactive| Code: USD              |
|   Location / Port    | [Create record] [Apply seed]   | Display: US Dollar     |
|   Party / Customer   |                                | Status: ACTIVE         |
|   Charge Code        | Set      Code  Name     Pub     | Classification: Int.   |
|   Equipment Type     | CURR     USD   US Dol.  Published| Updated by: admin     |
|   Commodity          | CURR     EUR   Euro     Pending |                        |
|   Trade Lane         | LOC      USNYC New York Published| Publication status    |
|                      |                                | [Retry] [Copy IDs]     |
|                      | [Edit] [Deactivate] [History]  |                        |
+----------------------+--------------------------------+------------------------+
| Contract catalog: OpenAPI OK | Avro OK | Pact pending                            |
+--------------------------------------------------------------------------------+
```

Accessibility note: `h1` is "Reference Data"; landmarks are `main`, `nav`, and named `section` regions; keyboard order starts at search, then create/apply actions, table rows, and detail actions; status uses text labels, not color alone.

Implementation intent:

- The current disabled actions become permission-aware actions.
- The table remains the scanning surface for all nine reference sets.
- The detail panel remains persistent and shows event status, history, correlation id, and mutation actions.
- BFF route handlers own calls to backend services; browser code does not call services directly.

## Screen 3 - Create or Edit Record Drawer

```text
+------------------------------------------------------+
| Edit Currency Record                         [Close] |
+------------------------------------------------------+
| Code *             [ USD                         ]   |
| Display name *     [ US Dollar                   ]   |
| Status             ( ) ACTIVE  ( ) INACTIVE          |
| Attributes                                             |
|   Minor unit       [ 2                           ]   |
| Change reason *    [ Correct display metadata    ]   |
|                                                      |
| Validation summary                                   |
| +--------------------------------------------------+ |
| | Code is immutable after creation.                | |
| | Change reason is required for audit history.     | |
| +--------------------------------------------------+ |
|                                                      |
| [Save changes] [Cancel]                              |
+------------------------------------------------------+
```

Accessibility note: drawer/dialog has `h2`, focus moves to the first invalid field on validation failure, Escape closes only when no unsaved changes exist, and Save/Cancel are reachable by keyboard.

Implementation intent:

- Create and edit share one mutation form.
- Required fields, immutable fields, and field-level errors come from backend validation or mirrored schema.
- Save submits through the BFF and returns persisted state plus publication status.

## Screen 4 - Deactivate Confirmation

```text
+------------------------------------------------------+
| Deactivate Record                                    |
+------------------------------------------------------+
| Record: CURRENCY / USD - US Dollar                   |
| Impact: downstream modules will no longer receive    |
| active lookup results for this code.                 |
|                                                      |
| Reason * [ Retired from local test set           ]   |
|                                                      |
| [Deactivate] [Cancel]                                |
+------------------------------------------------------+
```

Accessibility note: modal has `role="dialog"` and labelled heading; focus is trapped inside the modal; the destructive action is text-labeled and requires a reason.

Implementation intent:

- Deactivation is a state change, not hard delete.
- The operation writes history and creates an outbox event.

## Screen 5 - Seed Run and Apply Status

```text
+--------------------------------------------------------------------------------+
| Seed Data Runs                                                        [Refresh] |
+--------------------------------------------------------------------------------+
| Mode        [Dry run v]  Dataset [shared-platform-mvp]  [Run] [Apply]          |
|                                                                                |
| Run history                                                                    |
| +----------+-----------------------+--------+--------+----------------------+  |
| | Time     | Dataset               | Mode   | Result | Notes                |  |
| | 09:15    | shared-platform-mvp   | apply  | OK     | 11 upserted         |  |
| | 09:03    | shared-platform-mvp   | dry    | WARN   | 1 duplicate code    |  |
| +----------+-----------------------+--------+--------+----------------------+  |
|                                                                                |
| Affected reference sets: Currency, Location, Region, Voyage, Charge Code       |
+--------------------------------------------------------------------------------+
```

Accessibility note: `h1` is "Seed Data Runs"; table has caption and column headers; apply action has a confirmation state before it mutates live data.

Implementation intent:

- Dry-run and apply modes are visually distinct.
- Apply is idempotent and reports upserted/skipped/failed records.
- Failed rows link to validation details.

## Screen 6 - Local Readiness Dashboard

```text
+--------------------------------------------------------------------------------+
| Local Readiness                                                    [Run checks] |
+--------------------------------------------------------------------------------+
| Toolchain                    | Services                  | Quality gates        |
|-----------------------------|---------------------------|----------------------|
| Node        OK v24.18.0     | Keycloak        healthy   | Frontend tests OK    |
| Yarn        OK 4.5.3        | PostgreSQL      healthy   | Backend tests BLOCK  |
| Java        Missing         | Kafka           stopped   | Contracts pending    |
| Maven       Missing         | Ref service     stopped   | Security pending     |
| Docker      Not running     | Identity svc    stopped   |                      |
|                                                                                |
| Blocking next: install Java 21, Maven 3.9+, start Docker runtime               |
+--------------------------------------------------------------------------------+
```

Accessibility note: `h1` is "Local Readiness"; status cells include text plus severity; "Run checks" is the first action; failures are summarized in an alert region.

Implementation intent:

- This can start as a runbook/check output surface if a full UI page is deferred.
- It should make environment blockers visible instead of allowing false green status.

## Responsive Behavior

- Desktop: three-column workbench with left reference-set nav, center records area, right detail panel.
- Tablet: reference-set nav collapses above the table; detail panel moves below selected record.
- Mobile: table switches to stacked record rows; mutation forms remain full-width dialogs; contract/readiness sections collapse into accordion-like regions.

## Design Constraints

- Use compact internal-tool layout, not a landing page.
- Keep tables, forms, status chips, dialogs, tabs, and panels predictable.
- Do not hide mutation state behind decorative cards.
- Every status must be readable without color.
- All write actions must show permission state and correlation id context.

## Review

Verdict: READY

Product-lead review finds the rough mockups aligned with the approved Shared Platform Local Functionality scope. The artifacts support the goal of making Shared Platform locally functional and integration-ready by covering local auth, permission-aware reference-data mutations, BFF/backend integration, persistence/history, seed apply mode, outbox/publication status, contract readiness, and local runtime/quality evidence.

No blocking changes are required for this stage. Follow-on design stages should preserve the same operational focus and ensure later refined mockups keep explicit testable states for auth failure, authorization denial, backend downtime, validation errors, seed partial failure, and publication retry/failure.
