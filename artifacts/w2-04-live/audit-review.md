# W2-04 manual audit review

Reviewed: 2026-08-02

## AI-DLC runtime-integrity audit

- Detector command: `bash .claude/skills/aidlc-audit/detectors.sh` — exit 0.
- Placeholder leads in the W2-04 services are test fixtures only. The deployed Booking and Container Movement services use JDBC repositories and real messaging configuration.
- Booking has a scheduled outbox relay at `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/BookingMessagingConfiguration.java:158`.
- Container Movement has a scheduled outbox relay at `services/container-movement-service/container/src/main/java/com/linercore/platform/containermovement/container/ContainerMovementMessagingConfiguration.java:159`.
- Container Movement state, idempotency, outbox, and audit writes share transactional command methods at `services/container-movement-service/application-service/src/main/java/com/linercore/platform/containermovement/applicationservice/ContainerMovementApplicationService.java:73`, `:113`, and `:153`.
- Behavioral runtime proof is recorded in `acceptance.json`: Booking confirmation produced a CMM journey, the movement sequence reached `RETURNED_EMPTY`, duplicate and out-of-sequence writes were rejected, and the terminal movement returned to the Booking projection.
- Structural contract-verifier leads were not treated as runtime proof; the live API evidence above is the acceptance authority.

Disposition: no release-blocking W2-04 runtime-integrity finding.

## ERP/domain-fidelity audit

- Detector command: `bash .claude/skills/erp-fidelity-audit/detectors.sh` — exit 0.
- The apparent routing/equipment flattening lead is a false positive. `BookingConfirmedEvent` models `routing` and `equipment` as lists and validates contiguous legs plus ISO 6346 equipment at `services/container-movement-service/application-service/src/main/java/com/linercore/platform/containermovement/applicationservice/event/BookingConfirmedEvent.java:8`.
- Wire names remain contract-aligned: `legSequence`, `loadUnLocode`, `dischargeUnLocode`, `voyageId`, `equipmentTypeCode`, `quantity`, and `equipmentId` are decoded at `BookingConfirmedEvent.java:76`.
- W2-04 movement state is first-class domain data rather than an attributes bag. The live evidence records DCSA-style classifier/move fields, UN/LOCODE locations, ISO 6346 container identity, dedupe identity, event time, received time, derived status, and empty indicator.
- The Booking detail UI is an actual dynamic route and the four-viewport browser matrix passed at 375/768/1024/1440 with no horizontal overflow and visible keyboard focus. Evidence is in `playwright/playwright-evidence.json`.

Disposition: no release-blocking W2-04 domain-fidelity finding.

## Scope boundary discovered during the audit

The audit initially confirmed that Charge Agreement event publication had no scheduled claimant even when enabled. That W2-03 defect was corrected in `ChargeAgreementMessagingConfiguration`; Wave A now explicitly enables the real Kafka-backed relay. W2-04 did not depend on this correction for its green result.
