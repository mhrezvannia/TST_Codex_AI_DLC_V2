# Scalability Requirements — booking-design-system-closure

## Basis and Scope

The closure workflow in `business-logic-model.md`, invariants in `business-rules.md`, NFR-002/NFR-009 in `requirements.md`, and brownfield topology in `technology-stack.md` introduce no backend scaling change. Scalability is therefore bounded presentation behavior and preservation of existing service/container characteristics, not a new capacity forecast.

## Bounded Presentation Requirements

| ID | Dimension | Target and gate |
|---|---|---|
| SCALE-001 | List page data | Preserve server-side pagination and the existing accepted page size of 25; render at most one response page in the table DOM. |
| SCALE-002 | Viewport range | Required routes/states remain operable at 375, 768, 1024, and 1440 CSS pixels without page-level horizontal overflow. |
| SCALE-003 | Theme/state growth | Adding both themes and required state variants must not duplicate route trees, shells, navigation, or token systems. |
| SCALE-004 | Component ownership | Generic growth occurs only through `packages/ui`; Booking compositions remain in the canonical shell route and never create an app-to-app dependency. |
| SCALE-005 | Acceptance data | Each Playwright case owns or identifies its test data and does not rely on execution order or an ever-growing shared fixture. |
| SCALE-006 | Evidence growth | Manifest entries use stable run/case paths and reference artifacts; failures are retained without overwriting the original result. |
| SCALE-007 | Command pressure | One command in flight per UI instance bounds accidental duplicate create/validate/price/confirm traffic. |

## Existing Runtime Preservation

- Existing Next.js apps and Java services keep their current Compose lifecycle, health checks, databases, Kafka, and service-owned scaling characteristics.
- The shell continues same-origin forwarding through the Booking BFF; it does not add a client fan-out path.
- Existing service pagination, timeouts, request limits, connection/storage behavior, and asynchronous event delivery remain authoritative.
- No UI virtualization, caching layer, global client store, queue, replica, shard, or new service is justified by this closure.

## Capacity Evidence

Acceptance records the returned list size, rendered row count, route/state, browser errors, and command duplication assertions. The evidence proves bounded behavior at the accepted page size only. It does not claim behavior at an untested production population, request rate, or data volume.

If live proof returns more than 25 list records in one response, renders more than one page into the DOM, or requires page-level overflow, the gate fails and the current pagination/adapter behavior is diagnosed before closure.

## Growth and Trigger Policy

No current-user count, peak RPS, data-growth rate, cost envelope, or production utilization baseline is supplied. Accordingly:

- no 6/12-month capacity target is set;
- no CPU/memory/queue-depth autoscaling trigger is introduced;
- no load/stress/soak result is claimed;
- no cloud or production infrastructure work is authorized.

A future observed capacity problem requires its own measured baseline and approved vertical intent. W2-02 may record the observation but may not expand into speculative performance engineering.

## Degradation Priority

When an existing dependency cannot serve a capability, the UI keeps the shared shell and any reliable Booking data, disables only unsafe/unavailable commands, exposes a named degraded/error state, and offers a bounded retry. It never sheds authentication, authorization, safe-error mapping, or data integrity to preserve apparent availability.

