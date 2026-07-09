# Delivery Planning Questions - LinerCore Enterprise

## Source Context

These questions consume `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`.

Graphify was used before delivery planning through `query`, `explain`, and `path`. The graph refresh command updated the code graph but reported that newly changed documents require assistant-side `/graphify --update` and a Gemini key for semantic extraction. Therefore the newly generated unit documents are used through focused file reads, not claimed as semantically graph-indexed.

## Q1 - Sequencing Heuristic

Which sequencing heuristic should drive the Bolt plan?

A. Walking-skeleton-first only.  
B. Risk-first only.  
C. Value-first only.  
D. Hybrid: walking-skeleton-first for Bolt 1, then risk-first/WSJF-style sequencing for the remaining Bolts. Recommended because team practice mandates a first enterprise skeleton and later work should reduce integration and greenfield risk.  
E. Strict topological order only.  
X. Other (please specify)

[Answer]: D

## Q2 - WSJF-Style Scoring

Should remaining Bolts after the walking skeleton use a lightweight WSJF-style score?

A. Yes: score = (business value 30 + time criticality 10 + risk reduction 40 + dependency unblocking 20) / job size. Recommended for enterprise risk reduction.  
B. Yes: value-heavy scoring, with business value weighted above risk reduction.  
C. Yes: risk-heavy scoring only.  
D. No scoring; use delivery lead judgment.  
E. No scoring; use the unit DAG levels only.  
X. Other (please specify)

[Answer]: A

## Q3 - Bolt Granularity

How should Units of Work be bundled into Bolts?

A. One unit per Bolt.  
B. Bundled related units where a deployable confidence hypothesis requires multiple units. Recommended, especially for the walking skeleton and integration flows.  
C. One giant Bolt for all enterprise scope.  
D. One Bolt per domain workstream only.  
E. One Bolt per end-to-end flow only.  
X. Other (please specify)

[Answer]: B

## Q4 - First Walking Skeleton Bolt

What should the first Construction Bolt prove?

A. Shared Platform only.  
B. Runtime and contract tooling only.  
C. A minimal enterprise vertical slice across local runtime, contract catalog, auth, reference data, active agreement/pricing readiness, booking creation/pricing/confirmation, `booking.confirmed`, CMM journey/status evidence, enterprise UI access, seed data, and correlation/health evidence. Recommended and required by team practice.  
D. Charge and Customer Agreement only.  
E. Booking only.  
X. Other (please specify)

[Answer]: C

## Q5 - Parallelism And Gates

How should Construction execution handle parallelism and gates?

A. Strictly sequential and gate every Bolt.  
B. First walking skeleton is gated; after its approval, use the standard AI-DLC autonomy ladder to choose gated or autonomous mode, with parallel batches allowed only where the DAG allows. Recommended.  
C. Fully autonomous immediately.  
D. Parallel all units regardless of dependencies.  
E. Gate only Operation-stage work.  
X. Other (please specify)

[Answer]: B

## Q6 - External Dependencies

Which external or gated dependencies should Delivery Planning track?

A. No remote runtime dependencies; use deterministic local adapters first, but track internal gates for named SMEs, DCSA/EDI expertise, contract council, runtime council, security approval, and local tool availability. Recommended.  
B. Production external schedule/capacity/movement providers are required before Construction.  
C. Public-cloud infrastructure is required before Construction.  
D. Skip dependency tracking until Operation.  
E. Treat all dependencies as blockers with no workaround.  
X. Other (please specify)

[Answer]: A

## Q7 - Mob Allocation Model

Which team allocation model should `team-allocation.md` use?

A. Use the Team Formation mobs: Platform Foundation, Charge/D&D, Booking Orchestration, CMM Movement, Enterprise UI, and Runtime/Operation. Recommended.  
B. One generic AI developer for all Bolts.  
C. One team per backend service only.  
D. External vendor teams for all modules.  
E. Named human staffing only; do not plan until names are known.  
X. Other (please specify)

[Answer]: A

## Recommended Answer Set

Recommended answers for confirmation: Q1 D, Q2 A, Q3 B, Q4 C, Q5 B, Q6 A, Q7 A.

Rationale: this preserves the mandated enterprise walking skeleton, respects the unit DAG, keeps Graphify/indexing caveats honest, and uses the approved Team Formation mobs while allowing the later AI-DLC autonomy ladder to decide post-skeleton gate behavior.
