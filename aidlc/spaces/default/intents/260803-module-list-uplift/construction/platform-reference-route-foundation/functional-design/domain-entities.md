# Domain Entities and Boundary Models - U01 Platform/Reference Route Foundation

## Source Alignment

This model refines U01 `unit-of-work.md`, its `unit-of-work-story-map.md` assignments, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. Reference service/domain persistence remains authoritative; U01 adds presentation/BFF boundary models only.

## Authority Model

U01 creates no business aggregate, database table, cache, session store or cross-domain generic entity. The existing Reference service owns sets, records, versions/history and persistence. Identity owns policy decisions. W2-02 owns shell/session presentation contracts. The Reference app owns route queries, view-model translation and page state.

## Boundary Model Catalog

| Model | Key attributes | Owner | Lifecycle |
| --- | --- | --- | --- |
| Authenticated request context | subject, capabilities/session evidence, correlation | Platform/BFF | Per request; never browser-authored |
| Shell route registration | module, prefix, label, order, read capability, upstream | W2-02 platform | Versioned configuration |
| Reference set row VM | `setCode`, label, optional description | Reference BFF | Derived per authorized read |
| Reference record row VM | stable id, optional code, display name, status, version | Reference BFF | Derived per authorized page read |
| Reference record detail VM | row identity plus set, labelled attributes, ordered history | Reference BFF | Derived per authorized detail read |
| Reference record query | set, includeInactive, page, size, optional safe context | Reference route/BFF | Validated immutable request value |
| Safe return context | canonical relative `returnTo`, optional focus | Platform navigation policy | Accepted/normalized or replaced by fallback |
| Read result | ok, invalid-query, not-found, denied, stale, unavailable | BFF contract | One terminal read disposition |
| Route view state | loading, empty/populated, denied, not-found, stale, unavailable, invalid | Reference page | Derived exhaustively from read result |

## Relationships

- One shell route registration identifies the Reference module prefix and capability but owns no domain data.
- One set row links to a record-list query by exact `setCode`.
- One record row links to detail by exact set and record identifiers.
- One detail view contains labelled attributes and ordered provider history; it is not a persistence aggregate.
- A safe return context may accompany detail navigation and is validated independently from the record identity.
- A read result contains either authorized value or a typed non-value disposition; denied never coexists with provider value.

## Invariants

1. `setCode` and `recordId` are provider-stable route identities; display labels never become identifiers.
2. Browser page is one-based and size is 25/50/100; BFF conversion to provider-zero-based is the only indexing translation; provider order is preserved.
3. View models contain only approved readable fields; raw payload is not primary state.
4. Stale values require owning-source/time metadata and current authorization.
5. Safe return never changes target record identity or authorizes access.
6. UI view state is derived, not persisted or shared across apps.
7. No app-to-app model import or cross-service SQL is allowed.

## State Transitions

Request state moves from unresolved to session-resolved and then to a policy branch. ALLOW continues to validation and provider read. DENY terminates as `denied`; Identity outage terminates as retryable `unavailable`/HTTP 503 with a safe reference and **zero provider calls**. Only the ALLOW+valid branch reaches the Reference provider and then one terminal `ReadResult`. Page state moves from stable-size loading representation to exactly one terminal view. Retry starts a new current-request pipeline; it does not mutate the previous result into success. Navigation to detail/list creates a new server read from URL identity.

## Validation Boundaries

The edge validates public trust headers; the root layout validates session; Identity owns capability decisions; the route parser owns path/query/safe-return syntax; the BFF owns provider request mapping and view-model translation; the Reference service owns domain existence/history truth. Each boundary fails without borrowing authority from the next. A failed or unavailable Identity boundary cannot fall through to query validation or provider invocation.

## Deferred Models

Create/update inputs and `MutationResult<T>` exist in Application Design but are not active U01 entities. U02 activates their validation, version-conflict and form lifecycles. Cross-module signed origin and CMM/Booking models belong to U04.

## Verification Mapping

Model tests prove parsing, normalization and exhaustive result/view mapping. Policy-boundary tests assert DENY and Identity outage both make zero Reference provider calls; the outage result is retryable `unavailable`/HTTP 503 with safe reference, error announcement/main-summary focus and Retry. Contract tests prove provider request/response translation for the ALLOW branch only. Architecture tests prove no new persistence/cache/app import. Live evidence proves stable IDs, direct refresh, authorized provider truth and safe return behavior.
