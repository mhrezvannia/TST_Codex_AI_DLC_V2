# Performance Requirements - U01 Platform and Reference Route Foundation

## Source Alignment

These targets refine `requirements.md` NFR-001 for U01's route set, using this unit's `business-logic-model.md` (the canonical read pipeline and the three route workflows) and `business-rules.md` (its authorization, route/query, and provider-truth rules) as the shape of the work measured. `technology-stack.md` bounds what may be asserted about the runtime. Per the answered Q1, NFR-001's thresholds are the **binding** gate; the segment breakdown is non-binding guidance.

U01 is the walking skeleton, so its numbers carry an obligation the other units' do not: they are the **first** evidence that the shared shell, edge, session, and provider path can meet the target at all. A U01 miss is a platform-shape signal, not a Reference-domain one.

## Binding Targets (NFR-001, unchanged)

Under 10 concurrent warmed local users on the isolated acceptance host:

| Target | Threshold | Scope |
| --- | --- | --- |
| BFF list/detail response p95 | <= 1,000 ms | `/reference-data` set list; `/reference-data/[setCode]` record list; `/reference-data/[setCode]/[recordId]` detail |
| Route operational readiness p95 | <= 2,500 ms | Same three routes, to usable rendered state |

Evidence records host, fixture, warm-up, concurrency, samples, failures, and percentile method.

## Non-Binding Segment Budget

| Segment | Indicative share | Notes |
| --- | --- | --- |
| Edge routing, header clear/replace, asset resolution under the prefix | ~5-10% | New path in W4; a large share indicates a mount or base-path defect |
| Session resolution + shared shell render | ~15-20% | First real proof of the W2-02 shell's render cost |
| Identity authorization | ~10-15% | One current-request decision per read; no caching may recover it |
| Reference provider call | ~50-60% | `listSets`, `listRecords`, or `getRecord` |
| BFF adaptation and VM build | ~5-10% | Pure transformation |

U01 has no mutation path and no bounded option port, so its budget is the simplest of the four units — which is the point: it isolates platform cost from domain cost. The shell's share measured here is the baseline the other three inherit, so it is worth recording separately rather than folding into "render".

## What U01 Establishes for the Other Units

Because U01 is the first integrated route, its sample is the reference point for three costs the other units do not re-derive: the shared shell's render cost, the edge's per-request overhead under the canonical prefix, and one Identity decision's latency. If U02, U03, or U04 later miss the target, comparing against U01's recorded segments distinguishes a platform regression from a domain one. This is guidance, not a gate — no unit's acceptance depends on another's numbers.

## Explicit Non-Targets

No throughput, sustained-load, soak, stress, or capacity target. No production latency SLO, availability target, or cloud runtime characteristic. Per NFR-012 the acceptance host is the isolated local Compose topology.

## Verification

Evidence is produced at Build and Test and repeated at intent exit, feeding the NFR-007 blocking gate. The denied and Identity-outage paths are measured separately and must be faster than the allowed path — a denied path that is not faster indicates a provider call before the policy decision, a correctness defect surfaced by measurement. Per NFR-011, container startup or a single unmeasured request is never performance evidence.

## Review - Iteration 1

**Verdict: NOT-READY**

### Validation evidence

- Read the stage definition (`.codex/aidlc-common/stages/construction/nfr-requirements.md`), `requirements.md` (NFR-001..NFR-012, Provider Capability and Action Matrix), `unit-of-work.md`, `unit-of-work-story-map.md` (Requirement-to-Unit Ledger), `unit-of-work-dependency.md`'s consumer `bolt-plan.md`, each unit's `functional-design/business-logic-model.md` and `business-rules.md`, and `codekb/TST_Codex_W4-01/technology-stack.md`.
- Read all 20 stage artifacts (performance/security/scalability/reliability/tech-stack-decisions for U01-U04) and the single stage-group `nfr-requirements-questions.md` recorded identically in each unit directory.
- Fired `required-sections` and `upstream-coverage` via `bun .codex/tools/aidlc-sensor.ts fire <sensor> --stage nfr-requirements --output-path <file>` for all 20 artifacts.
  - `required-sections`: 20/20 pass (no failure record written for any file; each artifact carries well more than two H2 headings).
  - `upstream-coverage`: 16/20 pass. All four units' `security-requirements.md` **fail** — none of them contains the literal string `technology-stack` anywhere in prose, even though this stage's frontmatter declares `technology-stack` a consumed artifact (`conditional_on: brownfield`, and this project is brownfield). Confirmed independently by grep (`grep -rl technology-stack .../*/nfr-requirements/security-requirements.md` → 0 matches) and by the sensor's own pre-existing audit records at `.aidlc-sensors/nfr-requirements/upstream-coverage-{5b20753b,7ee1bdaa,9cf60993,a976de26}.md` (all `"pass": false`, `"unreferenced": ["technology-stack"]`), reproduced again on re-fire (`upstream-coverage-{a1b1a483,ce17bdc4,b37dffc8,8c4928eb}.md`).
- Verified concrete factual claims against the live repository rather than trusting the prose: U02's claim that `apps/reference-data/lib/service-clients.ts` hard-codes `?version=1` on every PUT (`mutateReferenceRecord`, line 226) — confirmed; U02's claim that the same function accepts an unvalidated body (`body: unknown`, no schema) — confirmed. U03's claim that a replay key is derived server-side from a bounded client request ID — confirmed at `apps/charge-agreements/lib/bff/replay-key.ts` (`deriveReplayKey`), wired through `proxy-charge.ts`, and that all agreement lifecycle commands (create/update/approve/successor/suspend/expire) use `idempotencyMode: "FORWARD_DERIVED"` in `policies.ts` while GET-only manual-case policies correctly use `"NONE"` — confirmed, claim is accurate. U04's claim that both `KafkaBookingConfirmedListener` and `KafkaContainerMovementStatusListener` run at `setConcurrency(3)` with no configured error handler, retry template, or DLQ — confirmed in `ContainerMovementMessagingConfiguration.java` and `BookingMessagingConfiguration.java` (both only build a bare `ConcurrentKafkaListenerContainerFactory`). `tech-stack-decisions.md` version numbers (Next.js 15.5.21, React 18.3.1, TypeScript 5.7.2, Java 21, Spring Boot 3.3.7, Zod 3.24.1, Confluent 7.7.1, Avro 1.11.4) match `technology-stack.md` exactly in all four units, and all four explicitly preserve the "Evidence limitations" disclaimer (PostgreSQL/Kafka broker/Node/Yarn/browser versions not asserted) rather than inventing values.
- Confirmed U04's scalability- and reliability-requirements.md both preserve the hard completion condition verbatim: "U04 and W4-01 remain not done until the owners supply verified controls or approve a bounded replacement" — this has not been softened into a mere note.
- Confirmed no artifact invents a production SLO/availability/cloud-runtime claim; NFR-012's Compose-only boundary and `technology-stack.md`'s "no cloud runtime inference" rule are respected everywhere sampled.

### Blocking findings

1. **The stage-group question-collection rationale is not legitimate, and the underlying Bolt sequence it rests on has been bypassed.** `nfr-requirements-questions.md` invokes `stage-protocol.md` §"Within-Bolt Question Collection" to justify one shared answered-questions file for all four units. That protocol licenses cross-unit question grouping only *within a single Bolt containing multiple Units* ("For each Unit in the Bolt... questions are grouped by stage"). The approved `bolt-plan.md`, however, is unambiguous that every Bolt in this project contains **exactly one** Unit ("One Bolt is one pass through Construction stages 3.1-3.7 and contains one approved Unit") and that Bolts are strictly sequential and separately gated ("Only one module Bolt is active at a time"; "B01 is the separately gated walking skeleton. No later Bolt enters implementation until B01 is approved"; gate table: "B01 approval... Stop; repair or revise before B02", "B03 acceptance... Stop before CMM implementation"). Because no Bolt in this plan ever spans more than one Unit, there is no legitimate "within-Bolt, cross-unit" question-collection scenario for this protocol clause to apply to — the citation is a misapplication used to justify skipping three units' worth of per-unit questioning. More materially, `aidlc-state.md` shows `functional-design` and `nfr-requirements` tracked as single collapsed checkboxes covering all four units at once ("Per unit: [TBD]"), with no record anywhere of a B01 approval gate, a manager-demo guard, or the required `aidlc-audit`/`erp-fidelity-audit` evidence that `bolt-plan.md` makes a precondition for B02 (and therefore for B03/B04) ever starting. Construction has produced functional-design and NFR-requirements artifacts for U02, U03, and U04 with no evidence B01 was ever approved, directly contradicting the plan's own gate table ("Do not start B01" / "Stop; repair or revise before B02" / "Stop before CMM implementation"). This is a process-integrity defect, not a documentation nit: it removes the human checkpoints the team specifically approved to let Reference-first live evidence inform whether Charge and CMM engineering effort should proceed at all.
2. **`upstream-coverage` fails on a quarter of the artifact set (4 of 20), and it is a real content gap, not a sensor false positive.** All four `security-requirements.md` files omit `technology-stack.md` entirely, even though every other artifact in the same units correctly cites it (e.g., to bound Vitest/Next.js/Spring version risk or to invoke the "no cloud runtime inference" rule). Security is exactly the category where the brownfield scan's version/compatibility evidence matters most (e.g., Zod's strip-vs-reject behavior for SEC-U02-07's V1 attribute allow-list, or the Next.js 15 App Router assumptions behind SEC-U04-11's internal-service-inaccessibility claim), so the omission is not cosmetic. Add an explicit `technology-stack.md` citation to each unit's `security-requirements.md` (or correct the frontmatter if the intent is for security requirements to be genuinely stack-agnostic) and re-fire the sensor.

Content quality note (non-blocking): the individual NFR targets, falsification criteria, and factual claims sampled above are accurate, unit-scoped, and consistent with NFR-001..NFR-012 and the Provider Capability and Action Matrix; none read as unfalsifiable aspiration. The two findings above are process/traceability defects in how this stage was run, not defects in the substantive engineering content of the 20 artifacts.
