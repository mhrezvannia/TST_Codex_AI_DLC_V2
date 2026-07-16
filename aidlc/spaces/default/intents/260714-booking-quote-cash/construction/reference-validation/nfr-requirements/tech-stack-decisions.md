# Tech Stack Decisions - U02 Reference Validation

## Selections

| Concern | Selection | Rationale |
|---|---|---|
| HTTP adapter | Spring 6.1 `RestTemplate` over Java 21 `JdkClientHttpRequestFactory`/`java.net.http.HttpClient` | Existing adapter API with pooled JDK transport and no new HTTP dependency. |
| Concurrency | Fixed executor of four validation calls per request; shared outbound cap ten | Complete lookups without unbounded fan-out. |
| State guard | Spring transaction + PostgreSQL expected revision/fingerprint | Prevent stale provider results across instances. |
| UI options | Next.js BFF + focused React combobox | Keeps identity/backend URL server-side and supports cancellation. |
| Tests | JUnit adapter/application tests + Vitest/Playwright | Covers provider matrix and visible states. |

## Constraints

No Booking-side reference replica, distributed transaction, generic cache, browser-direct provider client, Apache HTTP dependency, or new reactive framework is introduced. Connect timeout is 500 ms and request/read timeout 1.5 s inside the two-second command ceiling. Versions remain Java 21/Spring Boot 3.3.7 from `technology-stack.md`.

## Source Coverage

Decisions realize U02 `business-logic-model.md` and `business-rules.md`, satisfy `requirements.md`, and reuse `technology-stack.md`.
