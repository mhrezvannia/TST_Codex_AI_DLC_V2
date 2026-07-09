# Code Generation Plan - UOW-09 Contract Provider and Message Verification

## Scope

Add contract verification that covers OpenAPI provider paths, Avro message schemas, fixture/catalog integrity, and optional live service checks.

## Steps

- [x] Step 1: Keep existing contract catalog validation as the base check. Traceability: FR-028.
- [x] Step 2: Add provider OpenAPI route coverage checks for identity-service and reference-data-service. Traceability: FR-028.
- [x] Step 3: Add Avro record checks for every required reference-data changed event. Traceability: FR-029.
- [x] Step 4: Add optional `--live` provider checks for running Identity and Reference Data services. Traceability: NFR-004.
- [x] Step 5: Write live verification evidence when services are unavailable. Traceability: NFR-004.
- [x] Step 6: Add Node tests for offline and live-failure verification behavior. Traceability: NFR-003.

## Review

READY with runtime caveat: offline contract verification passes; live provider verification waits on running services.
