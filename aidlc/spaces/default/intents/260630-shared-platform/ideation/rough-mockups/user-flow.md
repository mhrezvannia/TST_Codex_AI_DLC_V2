# User Flow - Shared Platform Rough Mockups

## Purpose and Sources

This user-flow sketch is based on `intent-statement.md`, `scope-document.md`, and `intent-backlog.md`. It covers the approved Shared Platform UI path only: internal sign-in through `apps/auth`, then reference-data administration through `apps/reference-data`.

## Primary Flow - Sign In and Edit Reference Record

```text
Start
  v
Open apps/auth sign-in
  v
Continue with enterprise SSO
  v
Keycloak authenticates user
  v
apps/auth establishes session through BFF
  v
User lands in apps/reference-data
  v
Choose reference set from side navigation
  v
Search or filter records
  v
Select existing record or add record
  v
Edit fields and run validation
  v
Publish change
  v
reference-data-service saves record and emits reference-changed event
  v
Admin sees event and sync status
  v
End
```

## Decision Points

| Point | Branch | Outcome |
|-------|--------|---------|
| Authentication | Success | Continue to reference admin workspace. |
| Authentication | Failure | Show retry and Security / IT support path. |
| Authorization | Has role | Enable permitted admin actions. |
| Authorization | Missing role | Show access-denied state and request-access path. |
| Validation | Passes | Enable publish action. |
| Validation | Fails | Show field-level errors and preserve draft. |
| Event publication | Succeeds | Show event ID, correlation ID, schema version, status. |
| Event publication | Pending/fails | Show pending/failure state and operator escalation path. |

## Secondary Flow - Read-Only Reference Lookup

```text
Start
  v
Open apps/reference-data
  v
Search reference data
  v
Open result details
  v
Copy canonical ID or inspect event status
  v
End
```

This secondary flow supports users who need reference visibility but do not have edit permission. It also supports responsive tablet/mobile read-only use.

## Error Recovery Flow

```text
Validation error
  v
Inline field error shown in text
  v
User corrects value
  v
Run validation again
  v
Publish when valid
```

```text
Event publish failure
  v
Status panel shows failure reason
  v
User copies event or record ID
  v
Operator follows troubleshooting path
  v
Retry or reconcile through operations process
```

## Accessibility Flow Requirements

| Requirement | Flow impact |
|-------------|-------------|
| Keyboard-only operation | User can complete sign-in, navigation, search, edit, validate, and publish without a mouse. |
| Visible focus | Every link, button, field, tab, and menu item has a visible focus indicator. |
| Landmarks | Auth and admin pages expose header/nav/main/aside/footer as appropriate. |
| Error handling | Validation and auth errors are text-based and announced without relying on color alone. |
| Heading hierarchy | One `h1` per page, section headings in logical order. |
| Dynamic updates | Event status and validation summaries use polite live-region announcements. |

## Scope Guardrails

The user flow intentionally stops at provider-side reference and identity actions. It does not include pricing, booking, container movements, customer self-service identity, external feeds, multi-entity, or multi-currency flows.

## Open UX Follow-Ups

| Follow-up | Target stage |
|-----------|--------------|
| Define exact fields and validation copy for each of the nine reference sets. | Refined Mockups / Requirements Analysis |
| Decide whether `apps/auth` also includes permission-review screens. | Requirements Analysis |
| Define final freshness SLA display once the SLA is approved. | NFR Requirements / Refined Mockups |
## Design System Basis

The rough flow follows Enterprise Technical Environment v1.1 frontend standards and the `@erp/ui` atomic-design component library. No separate LinerCore brand system has been provided at this stage; visual branding can be refined later without changing the user flow.