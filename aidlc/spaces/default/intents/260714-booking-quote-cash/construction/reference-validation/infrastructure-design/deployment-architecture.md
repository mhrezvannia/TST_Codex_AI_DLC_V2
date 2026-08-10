# Deployment Architecture - U02 Reference Validation

## Compose Request Path

The browser reaches nginx `8088` and `apps-booking`; the BFF reaches `booking-service:8085`; Booking alone reaches `reference-data-service:8083` over the isolated `linercore-local` bridge. Reference Data owns `linercore_reference_data` in PostgreSQL; Booking never reads that schema. No public Reference URL, browser-direct call, side database, or fallback dataset is introduced.

Booking and Reference Data remain independent Spring Boot containers. Reference health is not a Booking liveness dependency: Booking detail stays available during Reference outage, while validation returns typed unavailable/overload and preserves the prior aggregate. Readiness verifies configured client identity and URL but does not claim provider availability as local process health.

## Capacity and Shutdown

Booking owns one managed validation executor per instance: 10 non-daemon workers, queue 20, `AbortPolicy`, and fair outbound semaphore 10 with 25 ms acquisition. Each request submits at most four tasks at once, has a 2-second deadline, and uses one shared Java 21 HTTP transport with 500 ms connect and 1.5-second request timeout. Shutdown rejects new validations, waits 2 seconds, then interrupts queued work; late in-flight responses are discarded by request generation/fingerprint.

Compose runs one Booking and one Reference instance for acceptance. Scale-out is allowed only after aggregate outbound load is measured; each new Booking replica adds at most ten provider calls and ten DB connections. Nginx needs no sticky session because evaluate/apply state is persisted and fingerprint-guarded.

## Security and Environment

Booking supplies its service ID and Reference-specific environment token server-side. Reference maps the fixed `reference:read` role under `local`; invalid/missing tokens return 401/403 and non-local profiles fail until W2-01. Inputs remain bounded to 8 legs, 20 equipment, 45 lookups, page 50, and 256 KiB. Plaintext service traffic is limited to the approved isolated local network waiver.

## Source Coverage

Deployment implements `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U02 `business-logic-model.md`.
