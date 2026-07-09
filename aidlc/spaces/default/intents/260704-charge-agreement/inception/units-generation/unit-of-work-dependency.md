# Unit of Work Dependency Map - Charge & Customer Agreement

## Dependency DAG

```text
U01
 |
 v
U02
 |
 v
U03
 | \
 |  v
 | U10
 v
U04
 |
 v
U05
 | \
 |  v
 | U09
 v
U06
 |
 v
U07
 |
 v
U08
```

Text fallback: the walking skeleton enables domain, domain enables application service, application service enables persistence/API/event seam, API enables UI and Booking handoff, UI enables Shared Platform integration, and runtime evidence follows runnable functionality.

## Dependency Table

| Unit | Depends on | Reason |
| --- | --- | --- |
| U01 | none | Establishes module shell. |
| U02 | U01 | Needs service/module scaffold. |
| U03 | U02 | Use cases orchestrate domain model. |
| U04 | U03 | Repository ports are defined by application layer. |
| U05 | U03, U04 | API exposes persistent use cases. |
| U06 | U05 | UI needs BFF/backend API shape. |
| U07 | U05, U06 | Integration appears in API/UI selectors. |
| U08 | U05, U06, U07 | Runtime checks need runnable backend/UI/integration. |
| U09 | U05 | Booking handoff depends on active lookup endpoint. |
| U10 | U03 | Event seam depends on application lifecycle events. |

## Parallelization Notes

U09 and U10 can run after U05/U03 respectively without blocking UI work. U08 should remain late because it should verify real runnable behavior.
