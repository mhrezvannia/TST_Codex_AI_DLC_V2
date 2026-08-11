# Security Requirements - U02 Reference Data Operational Completion

## Source Alignment

These requirements scope `requirements.md` NFR-004, FR-012, FR-016, and FR-020 to U02, restating them as falsifiable statements. Trust boundaries come from this unit's `business-logic-model.md` (the read pipeline, the create and update workflows) and `business-rules.md` (BR2-001 through BR2-005 authorization and trust, BR2-020 through BR2-025 form and validation, BR2-050 through BR2-054 navigation). Per the answered Q4, no new compliance regime is introduced; NFR-008 bounds the gate to the W4-touched `u02-security` path.

U02 inherits U01's edge, session, and safe-return boundary and does not re-establish it. What U02 adds is a **mutation** surface, so its distinctive security content is command authorization, input allow-listing, and concurrency integrity.

## Stack-Derived Security Constraints

`technology-stack.md` bears directly on U02's input-safety requirements, because the allow-list is only as strong as the validator's configured behaviour:

- **Zod 3.24.1 strip-versus-reject.** SEC-U02-07 requires unknown attribute keys to be *rejected*, not silently dropped. Zod's default object behaviour strips unknown keys rather than erroring, which would satisfy "the key does not reach the provider" while silently violating "the request is rejected" — and would hide a client sending fields it should not. The schemas backing SEC-U02-07 and SEC-U02-12 must therefore be strict, and a test must assert rejection rather than absence.
- **Java 21 / Spring Boot 3.3.7 provider validation.** SEC-U02-08's producer/consumer fixture spans a TypeScript BFF and a Java validator. Nothing in the stack enforces their equivalence at build time, which is exactly why the executable fixture exists — the parity is a test, not a type.
- **PostgreSQL `Map<String,String>` attribute persistence.** The provider's existing attribute shape accepts any string key, so the catalogs are the only thing preventing unbounded keys from persisting; there is no schema-level backstop beneath them.

Per the same file's **Evidence limitations**, the PostgreSQL version was not retained in the developer scan, and Spring-managed transitive versions were not exhaustively resolved. No security property here rests on a specific version of either; the optimistic-concurrency requirement in SEC-U02-13 is verified behaviourally against the running provider.

## Command Authorization Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U02-01 | Read, create, and update are distinct capabilities; a page-level read decision is never command authority. | A read-capable subject completing a create or update. |
| SEC-U02-02 | Every command re-authorizes its own exact capability at submit time, and again on every retry. | A retry succeeding after the capability was revoked. |
| SEC-U02-03 | DENY and Identity outage terminate before any Reference provider access, on read and command paths alike. | A provider spy recording a call on either path. |
| SEC-U02-04 | Identity outage maps to retryable `unavailable`/503 with zero provider calls; it is distinguishable from DENY. | An outage rendering as a denial, or a denial offering automatic retry. |
| SEC-U02-05 | A read-only subject sees provider truth with create and update commands absent — not disabled. | A disabled mutation control present in the DOM for an unauthorized subject. |
| SEC-U02-06 | No authorization decision is cached, stored with a draft, or reused as future authority. | A draft carrying an ALLOW that survives a capability change. |

## Input and Schema Safety

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U02-07 | Only V1-catalogued attributes are accepted; unknown attribute keys are rejected at both the BFF and the provider before persistence. | An arbitrary key surviving to storage. |
| SEC-U02-08 | The BFF and provider catalogs are held to one executable producer/consumer fixture; drift fails closed and blocks release. | A BFF-accepted field the provider silently ignores, or vice versa. |
| SEC-U02-09 | No raw JSON or free-form attribute editor is exposed. | Any surface accepting an unbounded attribute map. |
| SEC-U02-10 | A record containing an uncatalogued persisted key remains readable but is not editable, with a precise reason. | An edit that silently drops the uncatalogued value. |
| SEC-U02-11 | Base-field normalization is bounded exactly: code trimmed 2-32, display name trimmed 2-120, reason trimmed 0-240. | An over-length or untrimmed value reaching the provider. |
| SEC-U02-12 | Duplicate, unknown, malformed, or overlong query keys return `invalid-query` before provider access. | A provider call for a malformed query. |

## Concurrency and Integrity

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U02-13 | Update carries the exact provider version read with the draft; constants, latest-version substitution, and client-generated versions are rejected. | The current hard-coded `version=1` behaviour surviving, or any browser-supplied version being honoured. |
| SEC-U02-14 | The create attempt ID is BFF-generated before dispatch; the browser never supplies a record identity. | A browser-supplied ID becoming the provider record ID. |
| SEC-U02-15 | Browser update can never reach the provider's zero-version create-with-ID behaviour. | An update request creating a record. |
| SEC-U02-16 | A version mismatch never results in a silent overwrite, automatic merge, or automatic resubmit. | Any of the three occurring without explicit user reconciliation. |
| SEC-U02-17 | Browser-supplied actor, capability, service credential, correlation authority, and status are ignored or rejected. | Any of them changing server behaviour. |

## Data-Exposure Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U02-18 | User-facing failures expose only safe actionable text plus correlation or provider reference. | Raw payload, schema, or transport detail in the primary workflow surface. |
| SEC-U02-19 | Technical evidence stays in a collapsed, access-appropriate disclosure. | Technical detail expanded by default or shown to an unauthorized viewer. |
| SEC-U02-20 | An `accepted-unconfirmed` outcome never renders submitted draft values as provider truth. | Draft values presented as persisted state. |

## Threats This Unit Introduces

- **Lost update via stale version.** U02 is the first unit with concurrent-edit exposure. The exact-version requirement (SEC-U02-13) plus explicit reconciliation (SEC-U02-16) is the mitigation; the current source's hard-coded `version=1` is precisely the defect that would defeat it, which is why it is called out as a required correction rather than assumed absent.
- **Duplicate create under uncertainty.** A create whose outcome is unknown could be resubmitted into a second record. The BFF-generated attempt ID (SEC-U02-14) makes the retry target one identity, so an exact-ID re-read distinguishes "already created" from "never created" and a retry cannot duplicate.
- **Unvalidated attribute injection.** The current BFF accepts an arbitrary string map while the provider validates only set-specific rules. The V1 catalog on both sides (SEC-U02-07, SEC-U02-08) closes that gap; without it, unknown keys persist silently.

## Verification

Contract tests cover per-command policy, the provider-call prohibition, catalog fixture parity, unknown-key rejection, exact-version propagation, stable-ID create, and every result-to-HTTP mapping. Route and component tests cover duplicate-submit prevention and draft retention. Live Compose checks cover denied deep links, read-only presentation, and no data flash. Per NFR-011 a detector that only prints leads is not a passing gate; per NFR-008 only the W4-touched security path is claimed.
