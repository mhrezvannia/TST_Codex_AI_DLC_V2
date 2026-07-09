# Intent Backlog - Charge & Customer Agreement

## Prioritization Method

This backlog uses MoSCoW plus delivery sequencing. The goal is a walking skeleton first, then vertical slices that make the module locally functional and ready for Booking.

## Prioritized Proto-Units

| ID | Proto-unit | Priority | Rationale | Dependencies |
| --- | --- | --- | --- | --- |
| CA-01 | Service/app walking skeleton | Must | Proves new backend/UI/proxy/runtime path before deeper work. | Shared Platform host-runtime. |
| CA-02 | Agreement domain model and lifecycle rules | Must | Core business object; everything else depends on it. | CA-01. |
| CA-03 | Charge-term model and validation | Must | Defines commercial terms used by Booking. | CA-02, Shared Platform reference data. |
| CA-04 | Persistence and repository adapters | Must | Makes the module functional beyond in-memory/demo state. | CA-02, CA-03. |
| CA-05 | Agreement REST API and active lookup API | Must | Enables UI and future Booking integration. | CA-04. |
| CA-06 | Functional UI list/detail/create-edit workflow | Must | Addresses user's core complaint that current UI is view-only. | CA-05. |
| CA-07 | Approval/status actions and audit metadata | Must | Ensures Booking consumes approved terms only. | CA-05, CA-06. |
| CA-08 | Shared Platform reference-data integration | Must | Prevents duplicating customer/charge/currency/location/commodity/trade-lane data. | CA-05. |
| CA-09 | Seed/demo data and local runtime scripts | Should | Makes local verification repeatable. | CA-05, CA-08. |
| CA-10 | Contract docs and Booking handoff examples | Should | Reduces integration risk for the next module. | CA-05. |
| CA-11 | Event publication stubs/published language | Could | Prepares eventual event-driven integration. | CA-07. |
| CA-12 | Advanced pricing extensions | Won't now | Spot/index/carrier features are explicitly deferred. | Future roadmap. |

## Initial Construction Sequence

| Sequence | Proto-units | Confidence gained |
| --- | --- | --- |
| 1 | CA-01 | New module can run locally in this monorepo. |
| 2 | CA-02, CA-03 | Domain model supports agreements and charge terms. |
| 3 | CA-04, CA-05 | Backend is persistent and API-usable. |
| 4 | CA-06, CA-07 | UI is functional and lifecycle-aware. |
| 5 | CA-08, CA-09 | Shared Platform integration and local demo path work. |
| 6 | CA-10, CA-11 | Booking handoff and event-readiness are clear. |

## Dependency Map

```text
CA-01
  |
  v
CA-02 ---> CA-03
  |         |
  +----+----+
       v
     CA-04
       |
       v
     CA-05 ---> CA-06 ---> CA-07
       |                    |
       v                    v
     CA-08 --------------> CA-09
       |
       v
     CA-10 ---> CA-11
```

Text fallback: the walking skeleton enables domain work; domain and charge terms enable persistence; persistence enables APIs; APIs enable UI, approval, Shared Platform integration, local seed/runtime, and Booking handoff.

## Definition of Done for This Intent

1. Backend and UI are implemented for must-have proto-units.
2. Tests cover domain lifecycle, API/service behavior, UI workflows, and scripts/smoke checks.
3. The module runs locally with Shared Platform host-runtime services.
4. Active-agreement lookup is ready for Customer Booking.
5. Deferred capabilities are documented, not silently omitted.
