# Unit of Work Dependency DAG - Shared Platform Local Functionality

## Context

This dependency DAG consumes `components`, `component-methods`, `services`, `component-dependency`, `decisions`, `requirements`, and `stories`. It is topology only. Delivery Planning chooses the economic Bolt sequence and walking-skeleton grouping later.

## Machine-Readable DAG

```yaml
units:
  - name: UOW-01-local-runtime-packaging
    depends_on: []
  - name: UOW-02-auth-session-keycloak
    depends_on: [UOW-01-local-runtime-packaging]
  - name: UOW-03-identity-authorization
    depends_on: [UOW-01-local-runtime-packaging]
  - name: UOW-04-reference-data-service-core
    depends_on: [UOW-01-local-runtime-packaging, UOW-03-identity-authorization]
  - name: UOW-05-reference-data-bff-clients
    depends_on: [UOW-02-auth-session-keycloak, UOW-03-identity-authorization, UOW-04-reference-data-service-core]
  - name: UOW-06-reference-data-workbench-write-ux
    depends_on: [UOW-05-reference-data-bff-clients]
  - name: UOW-07-outbox-publication-status
    depends_on: [UOW-04-reference-data-service-core]
  - name: UOW-08-seed-apply-live-apis
    depends_on: [UOW-02-auth-session-keycloak, UOW-03-identity-authorization, UOW-04-reference-data-service-core]
  - name: UOW-09-contract-provider-message-verification
    depends_on: [UOW-04-reference-data-service-core, UOW-07-outbox-publication-status]
  - name: UOW-10-local-readiness-smoke-quality
    depends_on: [UOW-01-local-runtime-packaging, UOW-02-auth-session-keycloak, UOW-03-identity-authorization, UOW-04-reference-data-service-core, UOW-05-reference-data-bff-clients, UOW-06-reference-data-workbench-write-ux, UOW-07-outbox-publication-status, UOW-08-seed-apply-live-apis, UOW-09-contract-provider-message-verification]
  - name: UOW-11-auth-bypass-non-local-guard
    depends_on: [UOW-02-auth-session-keycloak]
```

## Prose Dependencies

| Unit | Direct dependencies | Why |
| --- | --- | --- |
| UOW-01 | none | Toolchain/build profile checks are foundational and do not depend on application behavior. |
| UOW-02 | UOW-01 | Auth local flow needs runnable app/backing-service path. |
| UOW-03 | UOW-01 | Identity service needs runnable backend profile and persistence/runtime checks. |
| UOW-04 | UOW-01, UOW-03 | Reference-data mutation enforcement depends on identity authorization and runtime profile. |
| UOW-05 | UOW-02, UOW-03, UOW-04 | BFF clients need session, permission, and reference-data service targets. |
| UOW-06 | UOW-05 | UI write interactions need working BFF state and error contracts. |
| UOW-07 | UOW-04 | Outbox publication attaches to persisted reference-data mutations. |
| UOW-08 | UOW-02, UOW-03, UOW-04 | Seed apply needs auth/identity/reference-data live APIs. |
| UOW-09 | UOW-04, UOW-07 | Provider/message verification needs running reference-data service and event publication/status. |
| UOW-10 | UOW-01 through UOW-09 except UOW-11 | Full readiness summarizes runtime, auth, data, UI, events, seed, and contracts. |
| UOW-11 | UOW-02 | Bypass guard depends on auth bypass/session behavior existing. |

## Parallel Development Opportunities

These are topology facts only, not implementation-order recommendations:

- After UOW-01, UOW-02 and UOW-03 have no dependency between each other.
- After UOW-04, UOW-07 can progress independently of UOW-05/UOW-06.
- UOW-08 depends on live API surfaces but not on UOW-06 UI implementation.
- UOW-11 depends on UOW-02 but not on Reference Data service internals.

## Integration Points

| Edge | Integration point |
| --- | --- |
| UOW-02 -> UOW-05 | Auth session summary, cookie/session context, local bypass label. |
| UOW-03 -> UOW-04 | `AuthorizationClientPort` and `/internal/identity/authorize`. |
| UOW-03 -> UOW-05 | BFF permission lookup through identity-service. |
| UOW-04 -> UOW-05 | Reference Data service OpenAPI endpoints and error payloads. |
| UOW-05 -> UOW-06 | BFF JSON contracts for lists, detail, mutations, history, publication. |
| UOW-04 -> UOW-07 | Outbox repository and publish/status service methods. |
| UOW-02/UOW-03/UOW-04 -> UOW-08 | Live APIs for users, roles, and reference records. |
| UOW-04/UOW-07 -> UOW-09 | Running provider behavior, Avro/message status. |
| UOW-01 through UOW-09 -> UOW-10 | Readiness and quality evidence inputs. |

## Cycle Check

The DAG is intended to be acyclic:

- UOW-01 has no dependencies.
- Every other dependency points from a higher-numbered capability to a lower-numbered prerequisite or an independent prerequisite.
- No unit depends on itself.
- No downstream module unit is declared.

## Review

Verdict: READY

Inline fallback review finds the DAG aligned with `components`, `component-methods`, `services`, `component-dependency`, `decisions`, `requirements`, and `stories`. It describes dependencies only and intentionally avoids build-order recommendations.

