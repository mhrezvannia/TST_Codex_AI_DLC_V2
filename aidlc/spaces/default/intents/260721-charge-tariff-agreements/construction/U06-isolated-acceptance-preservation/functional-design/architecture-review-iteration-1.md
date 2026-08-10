# Architecture Review - U06 Functional Design - Iteration 1

## Verdict

**NOT-READY**

Manager 8088 protection, exclusive `linercore-wave-a` wrapper use,
migration/restore posture, W1 waiver honesty, commercial scenarios, Playwright
ownership, audit posture, and the no-product/no-shared-UI boundary are sound.
The following blockers must be corrected before U06 is ready.

## Findings

### High - performance may measure receipt replay

The performance design does not require a fresh pricing identity for every
measured sample or prove that a sample was not replayed. Reusing
`bookingRef:pricingAmendmentSeq` could measure a terminal receipt lookup while
being labelled known-rate/no-rate pricing.

Required correction: isolate warm-up and measured namespaces; give each
measured request a unique valid Booking reference/sequence/key; assert a
distinct terminal receipt and `replayed=false`; retain pricing request and
hashed request identity in each sample. No-rate samples must prove their own
single deduplicated case. A duplicate/replay fails the set.

### High - prior-wave preservation set is open-ended

The phrase “validators compatible with the isolated stack” permits silently
omitting one of the five requirements in FR-702.

Required correction: define the closed set W0-01, W0-02, W1-01, W2-01,
W2-02 and require exactly one preservation result per ID. Unsupported or
unavailable validation is BLOCKED, never omitted. Keep the original W1 waiver
separate from a new regression result.

### High - security and observability lack closure records

Browser denial/spoofing is present, but missing service credentials,
non-local bypass/secret fail-closed behavior, and NFR-009 metric deltas are not
modelled as blocking evidence.

Required correction: add a closed security matrix for allowed/denied/spoofed
human behavior and missing service identity/permission/secret/non-local bypass;
add safe correlated logs, metric before/after deltas for latency, terminal
outcome, basis, manual fallback and replay/conflict, plus redaction results.
Reference both from scenarios/manifest and block on absence.

### Medium - technical PASS and human approval conflict

The manifest status is described both as derived technical acceptance and as
requiring later user approval.

Required correction: define manifest PASSED as observed technical acceptance
only. It makes the intent eligible for, but does not satisfy, the later AI-DLC
human release gate.

## Iteration outcome

A second architecture review is required after the four corrections. This
iteration remains permanently NOT-READY and is not rewritten into a pass.
