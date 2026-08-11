# Security Design - U02 Reference Data Operational Completion

## Source Alignment

This design realizes the SEC-U02 requirements in `security-requirements.md` using the create, update, conflict, and recovery workflows in `business-logic-model.md`, within the stack in `tech-stack-decisions.md`. Per Q1, non-applicable catalogue patterns are recorded; per Q2, only the resilience that exists is designed.

U02 inherits U01's edge, session, and safe-return boundary unchanged. What it adds is the intent's **first mutation surface**, so its distinctive security design is command authorization, schema allow-listing, and concurrency integrity.

**Consumed inputs.** `security-requirements.md` supplies the numbered requirements this design realizes; `business-logic-model.md` supplies the request pipeline and boundaries they apply to; `tech-stack-decisions.md` fixes the validator and framework behaviour the controls depend on; `performance-requirements.md` shares the fail-closed ordering (its measurable form is that denied paths are faster); `scalability-requirements.md` supplies the cardinality bounds enforced at the adapters; and `reliability-requirements.md` supplies the outcome semantics that determine what a failed control may expose.

## Command Authorization Design

```
submit
  -> BFF: re-authorize the EXACT command capability for THIS request
       (reference-data:create or reference-data:update — never inherited
        from the page-level read decision)
       |- denied      -> retain draft, remove the command, concise reason
       |- unavailable -> retryable 503, ZERO provider calls
       `- allowed     -> strict body parse -> V1 catalog validation -> provider
```

Three properties make this design rather than convention:

1. **Read, create, and update are three decisions**, not one. A page that rendered because the subject can read carries no authority to write, and the design never accumulates a capability set for a later request to consult.
2. **Every retry re-authorizes and re-validates.** A retry is a new command, not a replay of a prior permission.
3. **Read-only presentation removes commands rather than disabling them.** A disabled control in the DOM is a hint about the policy model; absence is not.

## Schema Allow-List Design

The V1 catalog is the security boundary for attribute input, and it is deliberately **two implementations held to one fixture** rather than one shared implementation:

- The BFF's `ReferenceFormCatalogV1` derives the form and rejects unknown keys before dispatch.
- The provider's `ReferenceFieldCatalogV1` rejects unknown keys before its existing domain validation.
- One executable producer/consumer fixture proves they are equivalent; drift is a build-time failure that blocks release.

This matters because nothing in the stack enforces equivalence across a TypeScript BFF and a Java validator — the parity is a test, not a type. And beneath both, the provider persists `Map<String,String>`, which accepts any key: the catalogs are the *only* thing preventing unbounded attribute keys from reaching storage.

**Strict, not stripping.** Zod's default object behaviour strips unknown keys, which would satisfy "the key never reaches the provider" while silently violating "the request is rejected" — hiding a client sending fields it should not. Schemas are explicitly strict and the tests assert rejection rather than absence.

No raw JSON or free-form attribute editor exists at any surface. A record carrying an uncatalogued persisted key stays readable but is not editable, with a precise reason — so no value is silently dropped by an edit that could not represent it.

## Concurrency Integrity Design

Three mechanisms, each closing a specific failure:

| Mechanism | Closes |
| --- | --- |
| Update carries the exact provider version read with the draft | Lost update — the current source's hard-coded `version=1` is precisely the defect that would defeat this, which is why it is named as a required correction rather than assumed absent |
| Create allocates a BFF-generated UUID before dispatch and uses the provider's PUT-by-ID `version=0` seam | Duplicate create under uncertainty — the attempt has one identity, so an exact-ID re-read distinguishes "already created" from "never created" |
| Version mismatch produces explicit reconciliation, never a silent overwrite, merge, or resubmit | Silent data loss under concurrent edit |

Browser update can never reach the zero-version create-with-ID behaviour: that path exists only in the BFF's create adapter, so an update request cannot create a record.

## Data Exposure Design

Safe actionable text plus correlation or provider reference in the primary surface; raw payload, schema, and transport evidence collapsed and access-appropriate. An `accepted-unconfirmed` outcome never renders submitted draft values as provider truth — it names the stable record identity and offers a re-read, because presenting unconfirmed input as persisted state is the exact failure the disposition exists to prevent.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Encryption-at-rest design | U02 adds no persistence; Reference owns its storage | U02 non-responsibilities |
| Secrets-management redesign | No new secret introduced | `components.md` ownership map |
| New compliance / data-classification framework | Explicitly excluded | NFR-008 |
| Zero-trust network segmentation | No network topology change | NFR-012 |
| Repository-wide SAST / SBOM / provenance | Only the W4-touched path is claimed | NFR-008 |
| Session or token redesign | Platform-owned; U02 consumes it | `components.md` |
| Pessimistic locking / record checkout | Optimistic concurrency with explicit reconciliation is the approved model; locking would add a lock lifecycle the provider does not expose | `component-methods.md`; U02 functional design |
| Field-level encryption / masking | No classified field is introduced; Reference values are operational reference data | `requirements.md` Data & Standards Alignment |
| Audit-log redesign | Provider owns change history and outbox evidence | U02 non-responsibilities |

## Threat Model Realization

The three threats in `security-requirements.md` map to the mechanisms above: lost update via stale version is closed by exact-version propagation plus explicit reconciliation; duplicate create under uncertainty is closed by the pre-dispatch attempt ID and exact-ID recovery; unvalidated attribute injection is closed by the two-sided V1 catalog with fixture parity. Each addresses a defect that exists in current source, which is why they are corrections rather than hardening.

## Verification

Contract tests assert per-command policy with a provider spy, catalog fixture parity, strict-schema rejection with the 422/400, exact-version propagation (explicitly asserting the absence of the hard-coded value), stable-ID create through the PUT-by-ID seam, and every result-to-HTTP mapping. Concurrency tests prove a stale version cannot overwrite and a create retry cannot duplicate. Live Compose checks cover denied deep links, read-only presentation, and absence of a data flash. Per NFR-011 a detector that only prints leads is not a passing gate.
