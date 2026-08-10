# User Stories - W1-01 Booking Quote-to-Cash

## US-W1-001 - Create and Reopen the Thin Booking

**Story:** As a customer-service booking agent, I want to create one route/equipment booking and reopen it at a stable URL, so that I can continue the commercial workflow without re-entering shipment data.

**Priority:** Must Have

**Requirements:** FR-W1-001; NFR-W1-008

**Acceptance criteria:**

- Given active customer, port, voyage, and equipment choices, when I submit one leg, quantity one, and a valid ISO 6346 equipment ID, then a persisted draft is created and the browser navigates to `/bookings/{bookingId}`.
- Given that draft, when I refresh or return from `/bookings`, then the same route, voyage, equipment, and status render without fallback/demo data.
- Given missing/invalid form input, when I attempt submission, then focus and an accessible field-level message identify the problem without layout overlap.

**Dependencies:** W0-02 seed data and Booking-local BFF/API routes.

**INVEST:** Valuable and testable as a persisted UI/API increment; small because it stops before validation/pricing; negotiable presentation within approved route and accessibility constraints.

## US-W1-002 - Validate Live Business References

**Story:** As a customer-service booking agent, I want the booking checked against live reference data, so that inactive or mistyped customer, port, voyage, and equipment references cannot reach pricing or confirmation.

**Priority:** Must Have

**Requirements:** FR-W1-002; NFR-W1-006, NFR-W1-007

**Acceptance criteria:**

- Given a draft containing active seeded references, when I validate, then Booking records a validated state and enables the next pricing action.
- Given one unknown or inactive reference, when I validate, then the booking remains unvalidated, the exact failed field is shown, and price/confirm actions remain unavailable.
- Given Reference Data is unavailable, when I validate, then the UI shows a retryable unavailable state and Booking does not silently accept cached/demo values.

**Dependencies:** US-W1-001; live Reference Data service.

**INVEST:** Independently testable with controlled reference provider states; focused on validation outcome rather than pricing implementation.

## US-W1-003 - Obtain a Trustworthy Quote or Manual Outcome

**Story:** As a customer-service booking agent, I want an itemized agreement quote or an explicit manual-pricing outcome, so that I never confirm against guessed, stale, or partial charges.

**Priority:** Must Have

**Requirements:** FR-W1-003, FR-W1-004; NFR-W1-001, NFR-W1-006, NFR-W1-007

**Acceptance criteria:**

- Given a validated booking and approved matching agreement, when I price it, then Booking calls `POST /pricing-requests` once per idempotency key and detail shows the persisted itemized USD result, `pricingBasis`, and `pricingRef`.
- Given no matching rate, when pricing returns `NO_RATE`, then the booking enters manual pricing, explains the reason, stores no guessed amount, and cannot confirm.
- Given timeout/503, when pricing runs, then Booking performs at most one safe retry; after failure or circuit-open it enters manual pricing and preserves the correlation ID.
- Given warmed local services, when repeated valid quotes are measured, then p99 is at most 800 ms.

**Dependencies:** US-W1-002; Charge provider contract and approved agreement fixture.

**INVEST:** Delivers a complete commercial decision including failure value; testable through provider fixtures and live Charge; no D&D or tariff-depth scope.

## US-W1-004 - Confirm and Open the CMM Journey

**Story:** As a customer-service booking agent, I want confirmation to open the downstream journey through the real event backbone, so that I know operations received the commercially valid booking without a hidden synchronous dependency.

**Priority:** Must Have; first Construction walking-skeleton story

**Requirements:** FR-W1-005, FR-W1-006, FR-W1-007, FR-W1-008, FR-W1-011, FR-W1-013; NFR-W1-003, NFR-W1-004, NFR-W1-005, NFR-W1-006

**Acceptance criteria:**

- Given a validated booking with a successful quote, when I confirm, then Booking atomically commits confirmation plus one outbox event and returns without calling CMM over HTTP.
- Given the relay, when `booking.confirmed` is published, then the real topic contains a Schema Registry-valid enterprise record with exact envelope, `routing[]`, and `equipment[]` fields and key `bookingId`.
- Given CMM consumes the record, when no journey exists, then it transactionally creates one journey for the equipment assignment and records the envelope ID/revision.
- Given the journey opens, then CMM enqueues and publishes one contract-valid `containermovement.status` record with the `bookingRef + containerRef` key.

**Dependencies:** US-W1-003; W0-01 shared messaging; canonical contracts.

**INVEST:** A thin but complete risk-first business slice; independently demonstrable with one seeded booking; excludes broader movement capture and presentation polish.

## US-W1-005 - See Returned Journey Status on Booking Detail

**Story:** As a customer-service booking agent, I want the returned CMM status visible on Booking detail, so that I can verify the handoff and answer the customer without opening another module.

**Priority:** Must Have

**Requirements:** FR-W1-009, FR-W1-010; NFR-W1-002, NFR-W1-006, NFR-W1-008, NFR-W1-010

**Acceptance criteria:**

- Given a contract-valid `containermovement.status` event, when Booking consumes it, then the status projection and dedupe marker commit atomically with the originating correlation ID.
- Given confirmation is still propagating, when I view detail, then a non-blocking pending state is visible and refresh/polling does not shift the layout.
- Given the return event arrives, when detail refreshes, then canonical move/classifier/derived status and location information render within p95 5 seconds from confirm response.
- Given Booking or CMM is unavailable, then the stable detail route retains booking data and presents an explicit recoverable status error.

**Dependencies:** US-W1-004; Booking status consumer/projection.

**INVEST:** Separates user-visible completion from event production while remaining end-to-end testable; presentation uses the approved W2-02 visual language only.

## US-W1-006 - Prove Replay and Restart Safety

**Story:** As an intent release reviewer, I want duplicate, stale, out-of-order, rollback, and restart scenarios to preserve one business outcome, so that at-least-once delivery cannot corrupt bookings or journeys.

**Priority:** Must Have

**Requirements:** FR-W1-012; NFR-W1-003, NFR-W1-004, NFR-W1-005

**Acceptance criteria:**

- Given duplicate `booking.confirmed` delivery and an older revision, when CMM consumes them, then one journey remains and only the highest revision applies.
- Given duplicate/late status events, when Booking consumes them, then one projection effect remains and stale business state does not replace newer state.
- Given an injected failure between state and outbox/inbox writes, when the transaction rolls back, then no partial business/outbox/dedupe state remains.
- Given a successful round trip, when Booking and CMM restart and Kafka redelivers, then persisted state remains queryable and no duplicate logical records appear.

**Dependencies:** US-W1-004 and US-W1-005; controllable integration/replay fixtures.

**INVEST:** Independently testable through replay/restart scenarios and directly protects user trust; no unrelated availability engineering.

## US-W1-007 - Accept the Live Vertical Release

**Story:** As an intent release reviewer, I want one repeatable command/runbook to prove contracts, quality, latency, broker messages, databases, UI state, and audits, so that W1 merges only when the user journey works for real.

**Priority:** Must Have

**Requirements:** FR-W1-013, FR-W1-014; NFR-W1-001, NFR-W1-002, NFR-W1-009, NFR-W1-010

**Acceptance criteria:**

- Given the W1 branch, when blocking quality runs, then Maven, Booking frontend test/typecheck, Booking/CMM domain purity, contracts, seeds, and coverage at least 80 percent are green.
- Given Compose with PostgreSQL host port 55432, when the live journey runs, then evidence captures pricing latency, exact `booking.confirmed` and `containermovement.status` records, one CMM journey, one Booking status projection, and the rendered detail state.
- Given service restart and replay, when the proof reruns, then idempotency evidence remains green and no local-noop message is accepted as broker proof.
- Given final evidence, when `aidlc-audit` and `erp-fidelity-audit` run, then both are green and every evidence path is indexed under `artifacts/` before merge to `integ/main-reconciled`.

**Dependencies:** US-W1-001 through US-W1-006.

**INVEST:** Testable as the release acceptance story and valuable as merge protection; implementation details remain negotiable but observed outputs are fixed.

## Story Relationships and Priority Summary

All seven stories are Must Have because the approved intent defines the whole quote-to-cash spine as the minimum release. The critical path is US-W1-001 → US-W1-002 → US-W1-003 → US-W1-004 → US-W1-005 → US-W1-007. US-W1-006 starts once the event consumers exist and must close before US-W1-007. Delivery Planning may split implementation units beneath these stories but may not defer a story outside W1.

## Upstream Sources

Stories trace to `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. Persona and planning decisions are recorded in `personas.md` and `user-stories-questions.md`.

## Review

Verdict: READY

- Customer value is clear: the primary customer-service agent gets a persisted quote-to-cash booking workflow, and the release reviewer protects that same outcome with live evidence rather than proxy checks.
- INVEST quality is sufficient for engineering: stories are small vertical increments with explicit dependencies; the unavoidable event-spine coupling is called out in US-W1-004 through US-W1-007 rather than hidden.
- Acceptance criteria are testable: each story uses concrete Given/When/Then outcomes, includes success and failure paths, and names observable states such as validated, manual pricing, pending propagation, dedupe, restart, and audit evidence.
- Scope discipline holds: broader tariff depth, movement capture, synchronous CMM calls, demo data, and presentation polish are excluded or constrained to the approved W1 spine.
- Requirement traceability is present at story level with FR/NFR references, but this review could only confirm the presence and consistency of traces from the allowed artifacts, not validate each requirement ID against `requirements.md`.
- Personas are adequate and not over-modeled: customer-service booking agent owns user value, intent release reviewer owns evidence, and technical systems remain collaborators rather than invented human actors.
- Dependencies are actionable: the critical path and story-level prerequisites give delivery planning enough order-of-work guidance, with US-W1-006 correctly dependent on event consumers and US-W1-007 dependent on all prior stories.
- Engineering and QA can proceed: the stories identify contracts, endpoints, topics, routes, latency thresholds, idempotency cases, UI states, and evidence expectations with enough specificity for implementation and test design.
