# Functional Design Questions - dnd-version-trigger-governance

The approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md` resolve the architecture and observable behavior. These questions confirm the remaining implementation-level posture without reopening U01 ownership.

## Q1. Lifecycle and overlap authority

Which lifecycle rule should govern Draft approval and successors?

A. Only Draft is mutable; approval is immutable and serialized under the full inclusive applicability-window key; change creates one linked successor Draft without editing the source
B. Allow Approved versions to be edited in place when no request currently references them
C. Detect overlap only in the browser
D. Use timestamp ordering without an approval lock
E. Permit multiple unlinked Draft successors per aggregate
X. Other (please specify)

[Answer]: A

## Q2. Fresh Standard-pricing enrichment failure

What happens after the existing Standard claim is owned but D&D trigger enrichment fails?

A. Record the failure, owner-fenced release only that `STANDARD_PRICING` claim before responding, and reclassify the winner if release loses the race; exact replays remain byte-identical and bypass enrichment
B. Complete a partial Standard result without D&D evidence
C. Leave every handled failure claim live until lease expiry
D. Release without namespace or owner-token qualification
E. Re-enrich stored replays using current D&D terms
X. Other (please specify)

[Answer]: A

## Ambiguity check

The selected answers must preserve U01 migrations/contracts/fixtures/signoff, immutable lifecycle history, metadata-only triggers and W2 success/replay/conflict/crash behavior.
