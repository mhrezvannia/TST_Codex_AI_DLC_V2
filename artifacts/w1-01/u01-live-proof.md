# W1-01 U01 Live Proof

Date: 2026-07-16

## Runtime

- PostgreSQL 15: healthy, host `127.0.0.1:55432` to container `5432`.
- Kafka and Schema Registry: healthy.
- Booking service: healthy at `http://127.0.0.1:8085/actuator/health`.
- Booking app: healthy at `http://127.0.0.1:3001/bookings`.

## Observed Workflow

- Direct service create produced booking `576461fc-ba57-454c-964d-1ebcbaf410d3`, revision 1, status `DRAFT`, route `USNYC-NLRTM`, and equipment `MSCU6639870`.
- Same idempotency key and payload returned the same booking ID. The same key with a changed customer returned HTTP 409.
- Database observation after that command: one matching booking, one receipt, and one audit row.
- BFF/Docker secured create produced booking `5ebb0b2e-b387-4a8d-a09e-15daf29632a2`. Missing Origin returned HTTP 403; the same-origin command succeeded and its detail page returned HTTP 200 with the booking number.
- `/bookings?search=CUST-W1-SECURED&status=DRAFT` rendered the persisted record from the Compose-managed app.
- Review-fix proof produced booking `036cfe3a-5efa-42e8-b733-38bf355abf8e`; a mismatched service/actor pair returned HTTP 401, the filtered list carried a `returnTo` link, and detail preserved the filtered back state.
- Iteration-2 closure: an invalid BFF create returned HTTP 400 with `code` `BOOKING_VALIDATION` and `fields` containing the exact contract path `routing[0].dischargeUnLocode` (correlation `885b2ebd-076d-4675-ac18-b433badddfb1`).
- A post-fix valid create/read produced booking `d0b33ea0-b0d3-4f12-9701-8e7a559363a9`, status `DRAFT`, customer `CUST-W1-U01-FINAL`, and route `USNYC-NLRTM`.

## Migration and Restart

- V1 is byte-identical to `db/booking-schema.sql`; both SHA-256 values are `2B94AF954745FC54C0323D1B6F950CA18B13B1B263D04E1F8D2E1040A3136443`.
- Empty schema applied V1 and V2, exact legacy schema baselined at V1 then applied V2, and partial schema failed before Flyway mutation.
- A second migration run left history unchanged.
- Booking service restart preserved the booking count and history values `1:2109642810` and `2:1020950145`.

## Automated Checks

- Maven reactor: 54 tests executed, zero failures/errors, one unrelated opt-in live test skipped. The default command executed all three PostgreSQL migration tests.
- Frontend: eight Vitest tests across helpers and the create-form component, typecheck, ESLint, and Next production build green.
- Compose descriptor and `git diff --check`: green.
- `aidlc-audit` and `erp-fidelity-audit` detector scripts: exit 0; U01 leads triaged with no production blocker.

## Environment Notes

- The standard Next Docker build could not fetch dependencies because Docker-to-registry.yarnpkg.com timed out. The host dependency cache built the production app successfully; that `.next` output was used in the local live image without changing the Dockerfile.
- The in-app browser surface was unavailable in the resumed session, so visual screenshot evidence is deferred; the live route and canonical content were verified over HTTP.
