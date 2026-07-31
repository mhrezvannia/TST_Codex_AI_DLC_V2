# Security Requirements - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

These controls specialize U01 `business-logic-model.md` and
`business-rules.md`, implement `requirements.md` NFR-05/06 and AC-08, and reuse
the Identity, Spring, PostgreSQL, Kafka/Avro, and Next.js seams recorded in
`technology-stack.md`. No new authentication system or public API is created.

## Authentication and Authorization

- Every protected list/detail/booking lookup requires a verified authenticated
  subject and fresh application-use-case evaluation of
  `container-movement:read`.
- Capture independently requires fresh
  `container-movement:capture-movement`; UI state, query/body actor, or a prior
  GET capability never authorizes POST.
- Missing/invalid authentication fails before protected repository access.
  Denial and Identity unavailability fail closed; no authorization cache is
  introduced in non-local profiles.
- Equipment Control receives read/capture and Customer Service read only through
  authoritative catalog assignments. Direct Customer Service capture returns
  exact 403 `CMM_AUTHORIZATION_DENIED` and one complete denial audit.
- Kafka consumers use service identity/least privilege and accept only the
  registered logical event on the approved physical topic.

## Data Protection and Input Integrity

Booking/equipment/location/journey identifiers are internal operational data;
authenticated subject and audit associations are confidential operational
evidence. Tokens, secrets, raw broker payloads, provider URLs, SQL errors, and
stack traces never enter UI, evidence bundles, or business audit fields.

All REST inputs have type/length/enum/time validation; ISO 6346, UN/LOCODE, ACT,
LADEN/EMPTY, correlation, and idempotency values become typed objects before
mutation. JDBC is parameterized. Avro payloads must validate against the
registered BACKWARD-compatible schema before production/consumption. Existing
encrypted transport/volume/platform secret handling is inherited; U01 makes no
unsupported algorithm, key-rotation, residency, or retention claim.

## Threat and Control Matrix

| Threat | Required control | Evidence |
| --- | --- | --- |
| spoofed actor/body fallback | verified subject context only; ignore actor body/query authority | controller/application tests and direct probe |
| read-only elevation to capture | application-layer exact permission on every POST | 403 + denial audit + unchanged hashes |
| replay/tampering | schema validation, fingerprint/idempotency uniqueness, typed validation | contract/serde and 10-contender proof |
| protected-data disclosure | authorize before repository lookup; redacted errors | denied/Identity-down response assertions |
| denial of service / exhaustion | bounded identifier/payload sizes, paginated/bounded reads, dependency timeouts, bounded relay batch, 10-contender no-exhaustion proof | validation tests, timeout probes, contender resource/error evidence |
| repudiation | actor/action/target/time/correlation/outcome audit | correlated DB evidence |
| injection/unsafe payload | parameterized SQL, strict enums/identifiers/time, no raw rendering | unit/integration/security tests |
| transport poison/incompatible schema | Schema Registry validation and durable failure evidence | provider/consumer contract tests |

## Compliance and Evidence Boundaries

No PCI, HIPAA, GDPR, production SOC 2, or data-residency scope is inferred from
this internal container journey slice. Existing organizational retention and
access policies remain authoritative. Exit evidence proves least privilege,
redaction, audit completeness, no false PASS/waiver conversion, and preservation
of historical W1 BLOCKED/waiver meaning.

The DoS control is deliberately local and bounded: it creates no production
rate-limit, availability, autoscaling, certification, or volumetric-attack claim.
