# Scope Definition Questions - W2-04 Container Journey and Track-Trace

These questions refine `intent-statement.md` within the approved conditions in
`feasibility-assessment.md` and `constraint-register.md`.

## Q1. Minimum valuable scope

What is the minimum release that delivers the intent's value?

- A. The complete thin journey: confirmed booking, expected moves, legal/rejected actual moves, status publication, Booking projection, both UI views, and live evidence (recommended)
- B. Backend movement capture without Booking or UI proof
- C. Timeline mockups without broker/database proof
- X. Other (please specify)
- `[Answer]:` A. Complete thin journey (Recommended)

## Q2. Must-have boundary

How should the stated Definition of Done be prioritized?

- A. Treat every stated vertical-slice and evidence condition as Must; classify only explicitly deferred capabilities as Won't Have (recommended)
- B. Make duplicate/sequence rejection optional
- C. Make Playwright and audit evidence optional
- X. Other (please specify)
- `[Answer]:` A. Every stated vertical-slice and evidence condition is Must (Recommended)

## Q3. Sequencing preference

Which delivery heuristic should order the proto-backlog?

- A. Risk-first walking skeleton within dependency order: prove real seams and state integrity early, then deepen the lifecycle and final experience (recommended)
- B. Finish all backend layers before any UI or Booking proof
- C. Polish the UI before validating event contracts
- X. Other (please specify)
- `[Answer]:` A. Risk-first walking skeleton within dependency order (Recommended)

## Q4. Scope exclusions

How should requests for EDI, public DCSA APIs, multi-leg routing, fleet/depot/M&R, or shared-shell changes be handled?

- A. Record as Won't Have for W2-04 and route to the owning later intent (recommended)
- B. Add them when convenient without changing scope
- C. Replace this slice with a broad container platform program
- X. Other (please specify)
- `[Answer]:` A. Record as Won't Have and route to owning intents (Recommended)

## Q5. Deadline and dependency posture

What schedule commitment should Scope Definition make?

- A. No invented date; preserve all exit gates and make W2-02 merge plus serialized acceptance explicit dependencies (recommended)
- B. Promise completion before W2-02 merges
- C. Meet a fixed date by converting missing live proof into a waiver
- X. Other (please specify)
- `[Answer]:` A. No invented date; preserve gates and dependencies (Recommended)
