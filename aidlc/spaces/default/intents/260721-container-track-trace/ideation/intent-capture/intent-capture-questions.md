# Intent Capture Questions — W2-04 Container Journey & Track-Trace

## Q1. Primary business outcome

Which outcome is the primary reason to deliver this intent now?

- A. End-to-end DCSA journey — give equipment-control operations one trustworthy journey from confirmed booking through returned-empty (recommended)
- B. CMM screens only — improve only the Container Movement operator screens
- C. Booking visibility only — improve only Booking's customer-service status visibility
- X. Other (please specify)
- `[Answer]:` A. End-to-end DCSA journey (Recommended)

## Q2. Primary beneficiary

Who is the primary user whose repeated work should shape the thin slice?

- A. Equipment-control clerk — captures and reviews operational movements (recommended)
- B. Customer-service agent — views Booking progression
- C. Platform operator — monitors Kafka and Schema Registry
- X. Other (please specify)
- `[Answer]:` A. Equipment-control clerk (Recommended)

## Q3. Success evidence

What evidence is decisive for business success at intent close?

- A. Live vertical proof — one live confirmed booking opens a journey, valid moves progress it, Booking reflects them, and invalid duplicate/out-of-sequence moves are visibly rejected (recommended)
- B. Tests only — unit and integration tests are green without a live run
- C. Fixture timeline — the Container Movement timeline renders representative fixture data
- X. Other (please specify)
- `[Answer]:` A. Live vertical proof (Recommended)

## Q4. Initiative trigger

What best describes the trigger for this work?

- A. Close DCSA gap — close the documented code-fidelity gap while extending the already-live W1 booking-to-journey seam (recommended)
- B. Replace CMM service — replace the existing Container Movement service wholesale
- C. Launch EDI ingestion — ingest terminal and depot messages now
- X. Other (please specify)
- `[Answer]:` A. Close DCSA gap (Recommended)

## Q5. Decision and sign-off ownership

Which stakeholder arrangement should govern acceptance and contract changes?

- A. CMM-led joint sign-off — CMM owns end-to-end delivery; Booking co-signs contract/consumer changes; UI and integration owners gate shared-shell synchronization and isolated acceptance (recommended)
- B. CMM unilateral — CMM may change Booking and shared UI contracts without co-signers
- C. Booking-owned — Booking owns the whole intent because it consumes the final status
- X. Other (please specify)
- `[Answer]:` A. CMM-led joint sign-off (Recommended)
