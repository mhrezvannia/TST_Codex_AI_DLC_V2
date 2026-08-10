# Functional Design Questions — U03 Agreement Authority

## Interaction Mode

One three-question batch was presented with a 60-second auto-resolution window. No answer was returned, so the explicitly recommended defaults below are applied. They are recorded as design decisions, not represented as user-entered answers.

## Batch 1 — Draft completeness, successors, and overlap

1. When must a new W2 agreement Draft contain its exact OFR, BAF, and POL THC links?
   - A. At creation; create/update is atomic and every saved W2 Draft has exactly three Approved compatible links. **(Recommended and selected by timeout)**
   - B. Before approval; header-only or partially linked Drafts may persist.
   - `[Answer]: No user response; A applied.`
2. Which version may seed a new agreement successor Draft?
   - A. Approved only; the successor copies one exact Approved version and its links while leaving the source unchanged. **(Recommended and selected by timeout)**
   - B. Any terminal version, including Suspended or Expired.
   - `[Answer]: No user response; A applied.`
3. How should approval handle a successor whose window overlaps an existing Approved authority?
   - A. Reject overlap; the existing authority must first be suspended/expired or windows made non-overlapping. Approval performs no hidden lifecycle transition. **(Recommended and selected by timeout)**
   - B. Atomically replace/retire the prior authority as an approval side effect.
   - `[Answer]: No user response; A applied.`

## Binding Contract Resolutions

- A stable Agreement owns immutable-numbered W2 AgreementVersions plus dual-read LEGACY history. At most one W2 Draft exists per stable Agreement.
- A saved W2 Draft is complete: customer, lane, origin, destination, equipment, inclusive validity, and exactly one linked Approved RateVersion for BASE/OFR, SURCHARGE/BAF, and LOCAL/POL THC.
- Successor creation accepts an exact Approved source only, locks the stable header while allocating `max(version_no)+1`, copies its commercial fields and links, and creates a new Draft/version identity. It never mutates the source.
- Approval rejects every inclusive-window overlap against another W2 Approved authority with the same customer/lane/origin/destination/equipment key, including an Approved source on the same stable Agreement. Suspension or expiry is an explicit separate command.
- Suspended and Expired are terminal for this slice. There is no resume, reapprove, delete, manual replacement, hidden retirement, or automatic clock transition.
- The stable `agreement_number` is immutable after creation. It is a human-readable identity but is not promoted to a new database uniqueness authority; `agreement_id` remains canonical.
- New W2 agreements do not capture commodity. V3 makes only the V1 compatibility header's `commodity_id` nullable; legacy commodity remains readable and never participates in W2 match, overlap, approval, or pricing resolution.
- All service commands use exact resource `charge-agreements` with action `create`, `update`, `approve`, `create-successor`, `suspend`, or `expire`; reads use `read`. Browser actor values are rejected and the U02 BFF supplies the signed subject.
- Shared administration paths use explicit media negotiation: default `application/json` preserves the LEGACY DTO/query contract, while `application/vnd.linercore.charge-agreement-v2+json` selects the new administrative contract. The latter dual-reads LEGACY as explicitly noneligible history but restricts every command/candidate to W2. The BFF always requests vendor media; no adapter falls through to another media dialect.
- V3 adds a stable-header `authority_model` discriminator. Legacy readers select LEGACY only and W2 readers select W2_VERSIONED only, so write-once V1 projection columns cannot surface as W2 authority.
- Existing five lifecycle event types remain. A backward-compatible Avro 1.1.0 adds nullable version identity/number, model, source, and lifecycle action; command state/activity/outbox insert share one Charge database transaction.

## Mandatory Ambiguity Scan

- **Stable versus version identity:** all command and response shapes name `agreementId` and `agreementVersionId` separately; row-version concurrency never substitutes for either identity.
- **Version versus optimistic version:** `versionNo` is immutable commercial history ordering; `rowVersion` is mutable optimistic concurrency and is called `expectedVersion` only at the HTTP boundary for preserved compatibility.
- **Lifecycle immutability:** Approved commercial fields, links, and frozen snapshot never change. Suspend/expire changes only lifecycle/row version and appends activity/outbox evidence.
- **Reference authority:** typed Reference Data validates customer, trade lane, locations, and equipment. The Charge Rate repository validates exact linked rate identities/category/status/window/applicability; no browser label or copied snapshot becomes authority.
- **Current/list selection:** no wall clock chooses a version. The detail default is the sole Draft when present, otherwise greatest W2 `versionNo`, otherwise the deterministic LEGACY backfill. `validOn` affects filtering only when supplied.
- **Existing API paths:** new version-aware create/update/approve/successor routes are additive. Published `/{id}/suspend` and `/{id}/expire` paths are retained with an exact `agreementVersionId`, expected row version, and reason; actor input is removed.
- **Audit/event atomicity:** state, links, append-only activity, and outbox row commit together. A failed command emits none of them.
- **Out-of-scope states:** no partial Draft, rate picker authority cache, bulk edit, agreement deletion, reactivation, manual pricing entry, shared UI change, or Booking redesign is introduced.
