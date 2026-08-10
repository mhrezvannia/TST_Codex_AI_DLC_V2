# Reverse Engineering Freshness Record

## Snapshot Identity

| Field | Recorded value |
|---|---|
| Reverse engineering performed (UTC) | `2026-07-21T13:52:23Z` |
| Repository | `TST_Codex_W2-04` |
| Branch | `intent/W2-04-container-journey-track-trace` |
| HEAD | `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f` |
| Required integration ancestor | `c96b5b3` |
| Ancestor check | `git merge-base --is-ancestor c96b5b3 HEAD` exited `0` |
| Active intent | `260721-container-track-trace` |
| Analysis mode | Static source, contract, configuration, retained-evidence, Graphify, and codebase-memory inspection |

## Scope of Analysis

The pass covered the Java/Maven services and shared messaging library; TypeScript/Yarn apps and packages; Avro, AsyncAPI, OpenAPI, and Pact contract directories; CMM and Booking persistence/configuration; Compose/runtime/Nginx/shell delivery seams; test/CI tooling; design-system ownership constraints; and retained W1 acceptance records relevant to the W2-04 dependency baseline.

The W2-04 focus was the existing bidirectional flow from Booking confirmation into CMM and status publication back into Booking, including journey/expected-movement semantics, REST capture, idempotency, ordering, outbox/receipt persistence, Booking projection, frontend availability, and rejection observability. EDI ingestion, public DCSA APIs, multi-leg/transshipment, fleet registry, depot stock, and M&R were excluded.

## Analysis Limitations

- Graphify was used first, but the checked-in graph had no reliable traversable Booking-CMM path and returned isolated/noisy concept matches. It served as a locator only.
- Codebase-memory and exact source/contract inspection were used to verify routes, symbols, mappers, persistence, and call seams. Common-name call traces were not accepted without qualified-source confirmation.
- No build, test, runtime, Compose, browser, broker, Schema Registry, or database command was executed during this reverse-engineering pass.
- Runtime claims are therefore source/configuration observations or explicitly attributed retained evidence, not fresh W2-04 acceptance proof.

## Dirty-Tree Caveat

The snapshot was not clean: `git status --short` reported 13 entries during capture. Modified entries included codebase-memory indexes, compiled AI-DLC graph data, and the intent registry; untracked entries included the active intent record, this codekb directory, the CMM page record, Graphify learning/query outputs, and a local launcher workaround. Consequently, HEAD identifies the baseline commit but does not fully identify the working-tree analysis state. The final delivery evidence must record its own branch, commit, dirty status, and artifact hashes after synchronization and implementation.

## Historical W1 Evidence Classification

The following records are separate and must never be collapsed into one result:

1. `artifacts/w1-01-live/codegen-live-blocked-image-pull/index.md` records `Status: BLOCKED`.
2. `artifacts/w1-01-live/w1-test-acceptance-waiver-20260717/acceptance-waiver.md` is an explicit test-project integration waiver. It does not rewrite the blocked live record and is not a real PASS.
3. `artifacts/w1-01-live/w1-real-pass-20260720-verified/index.md` records a separate later `Status: PASSED` run. It adds chronology but does not alter either prior record; it also does not supply complete branch/dirty-tree provenance for this W2-04 snapshot.

## Freshness Rule

This code knowledge base is fresh only for the branch, commit, and dirty working-tree caveat above. Rerun reverse engineering after synchronization with W2-02/integration, after material CMM/Booking contract or persistence changes, or whenever HEAD/working-tree state differs before final visual and live acceptance.
