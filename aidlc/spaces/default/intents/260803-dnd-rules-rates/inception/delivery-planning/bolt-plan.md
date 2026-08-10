# Bolt Plan - W3-01 D&D Rules and Rates

## Source alignment and planning rules

This plan consumes the approved `requirements.md`, `stories.md`, Refined `mockups.md`, Application Design `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and affirmed `team-practices.md`.

The approved topology permits exactly one Unit order:

```text
B01 / U01 -> B02 / U02 -> B03 / U03 -> B04 / U04
```

Each Bolt is one pass through the in-scope Construction stages for exactly one vertical Unit. B01 remains the solo, separately gated walking skeleton. The engine, not this plan, controls stage routing and approval gates. Repository-safe workstreams may overlap inside one Bolt, but protected migration and contract files have one owner and the guarded isolated Compose reservation is serialized. Work uses a short-lived intent branch/worktree from `main` and the affirmed squash-merge posture.

## Ordered Bolt sequence

| Order | Bolt | Included Unit | Size | Entry condition | Exit evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | B01 `author-price-skeleton` | U01 `dnd-author-price-walking-skeleton` | XL | W2-02 `PlatformShell` prerequisite is merged for integrated UI proof; isolated Compose slot is reserved | `construction/build-and-test/unit-evidence/dnd-author-price-walking-skeleton.md` plus signed compatibility manifest |
| 2 | B02 `version-trigger-governance` | U02 `dnd-version-trigger-governance` | XL | B01 approved and merged; W2-02 `Dialog` description seam is merged; U01 fixtures/signoff are consumable | `construction/build-and-test/unit-evidence/dnd-version-trigger-governance.md` |
| 3 | B03 `exact-historical-calculation` | U03 `dnd-exact-historical-calculation` | L | B02 approved and merged; preserved version/trigger evidence is available | `construction/build-and-test/unit-evidence/dnd-exact-historical-calculation.md` plus p99 measurement record |
| 4 | B04 `safe-attempts-evidence` | U04 `dnd-safe-attempts-evidence` | XL | B03 approved and merged; exact success and historical behavior are stable | `construction/build-and-test/unit-evidence/dnd-safe-attempts-evidence.md` |

No Bolt may begin integrated work against an unmerged predecessor. Focused test evidence is necessary but never substitutes for the live running-stack observation.

## B01 - Author and price walking skeleton

**Walking skeleton:** Yes. Solo and separately gated.

**Included Unit:** U01 `dnd-author-price-walking-skeleton` only.

**Definition of Done:** On the running guarded isolated stack, an authorised analyst creates and approves one representative term in `/charge-agreements/dnd/terms`; the persisted version is returned after service restart; direct authenticated D&D requests produce observed zero and non-zero port-local lines using that exact version; health remains green. The migration upgrade, W2-03 regression fixtures, generated Charge/Booking fixtures and bilateral owner signoff are green and attributable to this Bolt.

**Confidence hypothesis:** Shipping B01 proves that the approved Charge-owned architecture works end to end across Reference Data timezone authority, additive `pricing.v1`, upgrade-safe Charge persistence, exact provider calculation, Charge BFF, and the shared LinerCore UI without replacing W2-03 contracts or creating a new service.

**Expected demo:** Create and approve one import-demurrage term through the authenticated UI, restart Charge, retrieve the immutable version, then post exact zero and non-zero direct provider requests and correlate the UI, API, database, source-version and fixture evidence.

**Intra-Bolt convergence:** Lock the one migration/contract ownership seam; establish Reference Data and Charge domain/persistence; generate and sign fixtures; connect the provider and minimum UI; run focused checks; reserve Compose and capture the named live observation.

## B02 - Version and trigger governance

**Walking skeleton:** No.

**Included Unit:** U02 `dnd-version-trigger-governance` only.

**Definition of Done:** On the running stack, an authorised analyst approves a successor and sees immutable predecessor/successor and AgreementVersion relationships; a fresh `/pricing-requests` response carries the successor's metadata-only trigger while replay of the older receipt remains byte-identical; persisted history remains after restart.

**Confidence hypothesis:** Shipping B02 proves that lifecycle, overlap, successor and trigger enrichment extend the B01 foundation without mutating historical versions, exposing commercial terms in trigger metadata, changing W2 replay bytes, or re-owning U01's schema/contract/signoff.

**Expected demo:** Create and approve all required lifecycle states, create a successor, inspect history and the AgreementVersion relationship, compare fresh successor trigger metadata with a byte-identical older replay, and show restart persistence.

## B03 - Exact historical calculation

**Walking skeleton:** No.

**Included Unit:** U03 `dnd-exact-historical-calculation` only.

**Definition of Done:** On the running stack, direct Agreement and Tariff requests covering old/successor and UTC/local-boundary cases return the exact expected versions, days and amounts without reselection; the authorised detail/evidence composition renders the same source/timezone facts after restart.

**Confidence hypothesis:** Shipping B03 proves that preserved Agreement and Tariff evidence, not current authority, controls deterministic port-local zero and non-zero calculation across historical and successor snapshots.

**Expected demo:** Exercise same-day, within-free-time, USD 375, UTC/local-midnight, Agreement, Tariff, old and successor cases; show matching source/timezone facts in the authorised composition after restart and capture the bounded warm-local latency sample.

## B04 - Safe attempts and evidence

**Walking skeleton:** No.

**Included Unit:** U04 `dnd-safe-attempts-evidence` only.

**Definition of Done:** On the running stack, the exact malformed/auth/forbidden/no-rate/validation/conflict/in-progress/replay/unavailable matrix is observed; authorised attempt/correlation lookup returns disposition-specific evidence including null terms ids, denied UI/API reveals no count, and database evidence confirms no failed or duplicate calculation.

**Confidence hypothesis:** Shipping B04 proves that every provider disposition fails closed, preserves exact status precedence, fences ownership, emits bounded attributable evidence, and never creates a guessed, partial or duplicate charge.

**Expected demo:** Run the signed error/idempotency/concurrency matrix, query evidence by attempt/correlation and unresolved identities, demonstrate no-disclosure denial, and show database assertions for zero failed/duplicate results.

## Integrated intent exit after B04

The four Bolt DoDs do not complete W3-01 by themselves. Before live acceptance, the integrated guarded stack must produce `verification/w3-01-live-acceptance.md` with the effective Compose project/edge URL/build, the 375/768/1024/1440 light/dark Playwright matrix, accepted or revised p99 decision, consolidated changed-line coverage, required security-scanner execution or approved policy resolution, U01 signed-fixture and U02 runtime-regression verification, and green `aidlc-audit` plus `erp-fidelity-audit`. This is an intent exit gate, not a fifth Bolt.
