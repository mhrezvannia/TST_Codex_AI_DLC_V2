---
name: aidlc-audit
description: Audit an AI-DLC / Codex-generated implementation for the failure classes that pass tests and gates but leave the system non-functional at runtime — placeholder-as-production adapters, dead outboxes, existence-check gates masquerading as behavioral verification, and doc/code architecture drift. Use after any AI-DLC or Codex build cycle, before trusting a green status, or when "the output isn't good enough" but tests pass.
---

# AI-DLC / Codex Output Audit

AI-DLC and Codex reliably produce clean-looking scaffolding that compiles, passes unit tests, and turns quality gates green — while the advertised runtime capability does not actually exist. This skill exists to catch that specific gap. It was distilled from a real enterprise ERP audit (`docs/codex-review-findings.md`); read that file for a worked example.

**Core principle: distrust self-reported green.** Tests passing, gates green, and checkpoints all `[x]` are the symptoms, not the proof. Verify the highest-risk seam by hand: *does the thing the architecture claims actually happen at runtime?*

## When to run

- After any AI-DLC/Codex build or refinement cycle, before believing "done."
- When someone says "tests pass but the output isn't good enough."
- Before treating a contract, event, or integration as real.

## Procedure

Run the automated detectors first, then the manual seam checks. Report findings by severity with `file:line` evidence and a concrete failure scenario for each.

### Step 1 — Run the automated detectors

```bash
bash .claude/skills/aidlc-audit/detectors.sh
```

This flags: placeholder/no-op adapters wired outside local profiles, outbox `enqueue` calls with no matching relay, missing schedulers, existence-check "verification" scripts, and `@Transactional`-free state-change paths. Every hit is a *lead*, not a verdict — confirm each by reading the code.

### Step 2 — The seven conformance checks

For each, the pass condition is **behavioral**, not structural. "The file exists" never passes.

1. **Placeholder-as-production.** Search for `Placeholder*`, `Noop*`, `Stub*`, `Fake*`, `InMemory*` classes. For each: is it wired as the real bean/adapter in the deployed profile? Is there *any* non-placeholder implementation of that port? A no-op wired into prod with no real sibling is Critical.

2. **Behavioral gates, not existence gates.** Open every script the quality gates call "verify"/"validate"/"test." Does it *execute* the behavior it claims to check, or does it `includes()` / `existsSync()` / check a field is defined? An existence check labeled as verification is false confidence — flag it.

3. **Doc↔code architecture binding.** For every contract/event doc, find the code that implements it. Do they agree on transport (async event vs sync REST), ordering, and payload? Is there one executable test that goes red if code stops matching the contract? A contract with no test that can fail is prose.

4. **Outbox / event delivery is live.** For every `outbox.enqueue` (or equivalent), find the relay that drains it AND the scheduler/trigger that runs the relay. Trace one event end-to-end: does it actually leave the process and reach a broker/consumer? A write-only outbox is Critical.

5. **Module maturity parity.** Compare the first-built module against later ones. Later modules often have the *shape* (ports, mappers, enqueue calls) but not the *machinery* (relay, scheduler, real adapter). Audit for behavioral parity, not structural parity.

6. **Transactional integrity of state-change paths.** For each command that writes state + enqueues an event + calls another service: is the DB write + outbox atomic? Are outbound network calls kept out of the request path? Un-retried post-commit side effects cause silent cross-service inconsistency.

7. **Definition-of-done = observed on real runtime.** Was the canonical runtime (Compose/k8s/etc.) ever run end-to-end successfully? If the only unchecked box is "live E2E," that box is exactly where checks 1–6 fail. Green unit tests against stubs certify the scaffold, not the system.

### Step 3 — Report

Produce (or update) a findings doc modeled on `docs/codex-review-findings.md`:
- Severity-ranked findings (🔴 Critical / 🟠 High / 🟡 Medium), each with `file:line`, a concrete failure scenario, and a fix.
- A "what's genuinely good" section — be fair; AI-DLC output is usually well-structured, and saying so keeps the critical findings credible.
- A systemic root-cause → prevention section, so the same class of defect is designed out of the next run.

## What "good" looks like vs. what to distrust

| Signal | Trust? |
| --- | --- |
| Clean layering, real domain models, tests pass | Yes — but it says nothing about integration |
| Gate is green | No — read what the gate actually asserts |
| Outbox row marked PUBLISHED | No — confirm a broker actually received it |
| "It works" backed by unit tests over stubs | No — require one real end-to-end observation |
| Contract doc + Avro schema + fixture all present | No — require an executable conformance test |
