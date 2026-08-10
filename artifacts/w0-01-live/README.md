# W0-01 Live Proof Evidence

Run date: 2026-07-13
Branch: `intent/W0-01-platform-eventing`
Base commit: `d5144ea56b2fd16875402e561332e4c6973be210`

## Result

PASS. A real Reference Data mutation and Booking confirmation traversed PostgreSQL
outboxes, the scheduled shared relay, Confluent Schema Registry, and Kafka.

- Reference correlation: `corr-w0-reference-live`
- Booking correlation: `corr-w0-booking-live`
- Confirmed booking: `6cfe26b7-d6ac-45a8-8d8d-d53cbddcf3df`
- Reference outbox: one proof row, `PUBLISHED`
- Booking outbox: one proof row, `PUBLISHED`
- CMM outbox: one row, `PUBLISHED`
- CMM journey: booking revision 1, `PLANNED`
- Permanent relay failures in the final run: zero
- Maven reactor: 38 modules, `BUILD SUCCESS`
- `aidlc-audit`: exit 0
- `erp-fidelity-audit`: exit 0

Schema Registry subjects observed include:

- `referencedata.events-value`
- `referencedata.currency.changed-value`
- `booking.events-value`
- `booking.confirmed-value`
- `containermovement.events-value`
- `containermovement.status-value`

## Files

- `assertions.json`: decisive machine-readable acceptance checks.
- `reference-events.jsonl`: Avro-decoded `referencedata.events` output.
- `booking-events.jsonl`: Avro-decoded `booking.events` output.
- `reference-outbox.txt`: designated Reference Data outbox row.
- `booking-outbox.txt`: designated Booking outbox row.
- `cmm-booking-journey.txt`: downstream CMM journey created by confirmation.
- `schema-subjects.json`: subjects returned by the real Schema Registry.
- `compose-ps.txt`: live container status at capture time.
- `reference-responses.json`: proof mutation and prerequisite fixture IDs.
- `booking-responses.json`: create, validate, price, and confirm responses.
- `service-logs.txt`: Reference Data and CMM runtime logs.
- `booking-logs.txt`: Booking runtime log.
- `aidlc-audit.txt`: detector output, exit recorded above.
- `erp-fidelity-audit.txt`: detector output, exit recorded above.
