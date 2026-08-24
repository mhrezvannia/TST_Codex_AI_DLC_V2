# Stage Memory - NFR Requirements (3.2)

## Interpretations

- 2026-08-10T22:25:00Z — Ran the question protocol once for the whole stage group rather than once per unit. The original justification cited `stage-protocol.md` §"Within-Bolt Question Collection"; the reviewer showed that citation was wrong and it has been withdrawn from the questions files — `bolt-plan.md` puts exactly one Unit in each Bolt, so a clause about grouping questions across Units within one Bolt never applied. The real reason is narrower and is a judgment call, not an entitlement: the four Units share one verified stack, one Compose acceptance boundary, and one approved NFR-001..NFR-012 target set, so four separate files would have been four identical files presenting no additional decision. Recording the answered file per Unit preserves traceability.
- 2026-08-10T22:25:00Z — Treated `requirements.md`'s NFR table as already-decided input rather than a topic to re-ask. Construction questions are exceptional per the protocol's depth guidance, and re-asking settled targets would have invited answers that contradict an approved artifact.
- 2026-08-10T22:25:00Z — Read `technology-stack.md`'s "Evidence limitations" section as binding on what the NFR artifacts may assert: versions recorded as "Manifest-defined" or "not retained in scan" are cited as unresolved rather than filled in with a plausible number.

## Deviations

- 2026-08-10T22:25:00Z — The engine's declared input path for the brownfield scan (`aidlc/spaces/default/codekb/W4-01/technology-stack.md`) does not resolve; the real file is under `codekb/TST_Codex_W4-01/`. This is stale data, not an engine defect: `aidlc-state.md` records the project root as `D:\TST_Codex_W4-01`, so the codekb was written before this workspace moved, and `codekbRepoName`'s basename fallback now derives a different name. Read the real file and recorded the mismatch rather than treating a required-false input as absent.

- 2026-08-10T23:05:00Z — Followed the engine's stage-major per-Unit sequencing rather than the approved bolt-plan's Bolt-major sequencing, because the engine owns routing and emitted one `gate: false` directive per Unit. The reviewer identified the consequence: `bolt-plan.md` requires B01 (U01) to complete stages 3.1-3.7 and be approved — with manager-demo guard and both audits — before B02 begins, but the engine ran all four Units through 3.1, then all four through 3.2, with one gate per stage. I should have raised this at Functional Design when the engine first handed me U03 ahead of U01, rather than only after a reviewer found it. Escalated to the human at this stage's gate; not resolvable by editing an artifact.

## Tradeoffs

- 2026-08-10T22:25:00Z — Chose a non-binding per-unit latency breakdown under the binding NFR-001 totals rather than new per-unit thresholds. Costs some ambiguity about what "fails" at segment level; avoids creating a second, competing acceptance gate that could contradict the approved one.

## Open questions

- 2026-08-10T22:25:00Z — PostgreSQL, Kafka broker, Node.js, Yarn, and browser-runtime versions were not retained in the developer scan. They are cited as unresolved in every `tech-stack-decisions.md`; confirm them from the running Compose stack at Build and Test rather than inferring them here.
