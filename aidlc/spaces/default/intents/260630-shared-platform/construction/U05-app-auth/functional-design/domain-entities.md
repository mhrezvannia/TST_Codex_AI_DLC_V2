# Domain Entities - U05 Auth Frontend App and BFF

## Source Trace

These U05 entities derive from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## AuthSession

Purpose: Server-managed application session for an authenticated internal carrier user.

Attributes:

| Attribute | Description |
|---|---|
| `sessionId` | App session identifier or encrypted session reference. |
| `subjectId` | Stable internal subject id. |
| `displayName` | Safe display name. |
| `email` | Internal email where permitted. |
| `roles` | Safe platform role summaries. |
| `permissions` | Optional safe permission summaries. |
| `issuedAt` | Session creation timestamp. |
| `expiresAt` | Session expiration timestamp. |
| `policyVersion` | Authorization policy version used for summary. |

Rules:

- Raw token values are not exposed to browser JavaScript.
- Stored only through approved BFF/session mechanism.

## OidcTransaction

Purpose: Transient server-side sign-in state.

Attributes:

| Attribute | Description |
|---|---|
| `state` | CSRF/session correlation value. |
| `nonce` | OIDC replay-protection value. |
| `pkceVerifier` | PKCE verifier stored server-side or in protected transient cookie. |
| `returnUrl` | Validated internal return URL. |
| `createdAt` | Transaction timestamp. |

Lifecycle:

```text
created -> redirected -> callback-valid -> consumed
created -> expired
created -> callback-invalid -> cleared
```

## SessionSummary

Purpose: Browser-safe session projection.

Attributes:

| Attribute | Description |
|---|---|
| `isAuthenticated` | Boolean session state. |
| `subjectId` | Stable support identifier. |
| `displayName` | Display name. |
| `email` | Internal email where allowed. |
| `roles` | Safe role labels/codes. |
| `permissions` | Optional safe permission summaries. |
| `correlationId` | Support trace id. |

## AccessDeniedContext

Purpose: Safe denied-state view model.

Attributes:

| Attribute | Description |
|---|---|
| `resource` | Requested app/resource label. |
| `action` | Requested operation where known. |
| `reasonCode` | Safe machine-readable denial reason. |
| `message` | User-readable message. |
| `correlationId` | Support trace id. |
| `requestAccessAllowed` | Whether request-access action is shown. |

## RequestAccessSubmission

Purpose: User request for access after successful authentication but insufficient authorization.

Attributes:

| Attribute | Description |
|---|---|
| `submissionId` | Stable request identifier if persisted/routed. |
| `subjectId` | Requesting user. |
| `displayName` | Safe user display name. |
| `email` | Internal email where allowed. |
| `requestedResource` | Resource/app/workflow requested. |
| `requestedAction` | Action requested where known. |
| `message` | User-supplied explanation. |
| `submittedAt` | Timestamp. |
| `correlationId` | Support trace id. |

Rules:

- Submission does not grant access.
- Full approval workflow is out of U05 MVP.

## AuthError

Purpose: Safe application error for auth flows.

Attributes:

| Attribute | Description |
|---|---|
| `code` | Machine-readable error code. |
| `message` | Safe display message. |
| `retryable` | Whether user can retry. |
| `correlationId` | Support trace id. |
| `occurredAt` | Timestamp. |

## Entity Interaction Pattern

```text
Sign-in starts
  creates OidcTransaction

Callback validates OidcTransaction
  creates AuthSession
  projects SessionSummary

Authorization denial
  creates AccessDeniedContext
  may create RequestAccessSubmission

Auth failures
  create AuthError
```

## Excluded Entities

U05 does not model Keycloak user storage, password credentials, customer identity, full role administration, reference-data aggregates, or downstream module entities.
