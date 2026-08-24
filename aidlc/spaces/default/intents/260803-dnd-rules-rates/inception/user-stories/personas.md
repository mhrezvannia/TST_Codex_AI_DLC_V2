# Personas - W3-01 D&D Rules & Rates

**Inputs:** [requirements.md](../requirements-analysis/requirements.md), [business-overview.md](../../../codekb/TST_Codex_W3-01/business-overview.md), [component-inventory.md](../../../codekb/TST_Codex_W3-01/component-inventory.md), and [team-practices.md](../practices-discovery/team-practices.md)

## Primary and only story persona: Pricing Analyst

**Role and context:** An authorised Charge-domain operator responsible for maintaining commercially correct D&D terms within approved agreement/tariff authority. They work repeatedly in the authenticated LinerCore Charge workspace and are accountable for revenue-protection correctness and attributable operational evidence.

**Goals:**

- Define the three approved rule types with correct DCSA pair/qualifiers and deterministic applicability.
- Maintain flat daily rates/free time without changing approved historical versions.
- Know why activation or evaluation is blocked and which pricing/version evidence applies.
- Rely on deterministic zero/non-zero calculations, safe replay and traceable outcomes.

**Pain points:** ambiguous overlapping terms, silent basis changes, mutable history, unclear timezone/day boundaries, duplicate charges, collapsed errors and validation that loses entered work.

## Contextual stakeholders and systems

Commercial supervisors/auditors may consume existing operational audit evidence, but W3-01 adds no new read-only persona, permission or evidence-retrieval journey. Charge and Booking are collaborating systems, not personas: Charge owns rules/provider; Booking's trigger is W3-02. Container Movement owns movement facts and has no W3-01 coupling.

## Priority

Pricing Analyst is the sole human persona and mutation actor for all four stories. Authorization, contract and release-review evidence remains acceptance/verification scope, not an invented user persona.

