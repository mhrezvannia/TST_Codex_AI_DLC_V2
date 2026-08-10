# NFR Requirements Questions - U01 Walking Skeleton

## Source Context

This questions file consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`. U01 proves protected shell entry, existing auth/Keycloak login, one Booking read, real actor propagation, and correlation evidence.

## Questions and Answers

1. What performance target is appropriate for the local walking skeleton?
   - A. Local Compose/Nginx proof targets: protected shell route and Booking read complete within 3 seconds p95 under a single-user evidence run, excluding first container cold start.
   - B. Production-scale public SLOs.
   - C. No measurable target.
   - X. Other (please specify)
   - `[Answer]:` A - no production traffic model was supplied, and U01 acceptance is local runtime proof.

2. What is the primary U01 security target?
   - A. Raw tokens stay server-side and Booking read carries a session-derived non-`local-user` actor or fails closed.
   - B. Accept `local-user` during local proof.
   - C. Shell-only username display with no backend actor evidence.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-03, FR-05, NFR-01, NFR-02, and NFR-03.

3. What scalability posture applies?
   - A. Preserve stateless shell/BFF behavior and do not add stateful client stores or new infrastructure in U01.
   - B. Add distributed caching.
   - C. Add cloud autoscaling.
   - X. Other (please specify)
   - `[Answer]:` A - W2-01 targets local Compose and no cloud.

4. What reliability behavior closes U01?
   - A. Auth/session absence redirects or fails closed; Booking-service failure renders recoverable error with correlation id; Docker blockers are recorded honestly.
   - B. Fake empty Booking list on failure.
   - C. Unit tests replace live proof.
   - X. Other (please specify)
   - `[Answer]:` A - required by U01 functional design and W2-01 acceptance.

## Ambiguity Analysis

No blocking ambiguity remains. Targets are local Construction thresholds and may be hardened in later Operation stages.
