# U03 Agreement authority

## Scope

U03 adds versioned Agreement administration without changing the preserved
legacy API, U01 Rate authority, or U02 browser security boundary. A stable
`agreementId` owns immutable numbered versions. `agreementVersionId` identifies
the exact commercial snapshot; `rowVersion` is used only for optimistic
concurrency.

W2 versions contain exactly three distinct RateVersion links: base/OFR,
surcharge/BAF, and local/THC. Approved commercial fields and links are
immutable. LEGACY records remain visible, read-only, and ineligible for W2
authority until a separately governed adoption workflow exists.

## HTTP and browser contract

Default media on `/api/charge-agreements` remains legacy 1.0.0. W2
administration requires
`application/vnd.linercore.charge-agreement-v2+json` on both `Accept` and
command `Content-Type` headers.

The browser calls only same-origin routes below `/charge-agreements/api`.
Those routes derive identity and permissions from the signed session, reject
browser-supplied authority fields/headers, issue the short-lived U02 subject
assertion, and forward to fixed service paths. Approval carries both stable and
version identity in:

`/api/charge-agreements/{agreementId}/versions/{agreementVersionId}/approve`

Create, edit, successor, approve, suspend, and expire preserve typed
400/409/422/503 errors and correlation IDs. A 409 is reconciled by reloading
detail/activity before the operator retries.

## Lifecycle and concurrency

The W2 lifecycle is Draft → Approved → Suspended or Expired. A successor is a
new Draft derived from an immutable source version. PostgreSQL advisory
locking and optimistic row versions enforce:

- at most one Draft per stable Agreement;
- one winner for overlapping approval authority;
- one terminal winner for concurrent suspend/expire;
- no activity or outbox side effect for a losing mutation.

Every successful mutation writes the version state, activity, and one pending
outbox record in the same transaction.

## Events

Created, updated, approved, suspended, and expired events keep their original
Avro 1.0.0 fields. W2 fields are additive nullable/defaulted fields, so old
consumers can continue reading while new consumers receive stable/version
identity, lifecycle, correlation, links, and provenance.

## Configuration

The service uses the existing pricing PostgreSQL datasource and single Hikari
pool. Relevant local variables are:

- `CHARGE_BFF_ASSERTION_SECRET`, `CHARGE_BFF_ASSERTION_KID`, and
  `CHARGE_BFF_ASSERTION_REPLAY_CAPACITY`;
- `CHARGE_IDENTITY_SERVICE_ID` / `CHARGE_IDENTITY_SERVICE_TOKEN`;
- `CHARGE_REFERENCE_SERVICE_ID` / `CHARGE_REFERENCE_SERVICE_TOKEN`;
- `CHARGE_AGREEMENT_EVENTS_TOPIC`;
- the existing relay enablement, worker, batch, and fixed-delay variables.

Wave A remains the `linercore-wave-a` project behind loopback nginx port 18088.
U03 must never target the demo manager project or port 8088.

## Rollback and forward repair

The checked-in U01 V1/V2/V3 Flyway files are immutable. U03 does not add or
edit a migration. If a prepared database lacks the required W2 schema or the
safe outbox ownership classifier, deployment stops and requires an
owner-approved forward migration. Application rollback is eligible only while
the preserved legacy API and old event fields remain compatible and no
database repair is pending.

The old relay remains unchanged because PostgreSQL 15 cannot safely classify
malformed text payloads as JSONB without the prepared forward-migration seam.
Bounded dual-relay ownership must not be enabled by configuration alone.

## Evidence and limitations

Source evidence:

- Charge Vitest, typecheck, lint, and production build;
- Maven domain/application/container/data-access/messaging tests where the
  environment permits them;
- OpenAPI/Avro validation and provider checks;
- U02 security/route preservation and U03 preservation tests;
- deterministic performance-contract tests.

`scripts/u03-agreement-performance.mjs` rejects synthetic evidence and records
a blocked result when measured isolated-stack input is absent.
`scripts/u03-agreement-preservation.mjs --evidence ...` separates passing
source checks from blocked V1/V3 upgrade/restart and rollback evidence.

Docker/Testcontainers, the live Playwright viewport/WCAG matrix, DS-01/02/03,
measured performance, broker publication, and final U06 audits remain pending
until executed on the isolated integrated stack.
