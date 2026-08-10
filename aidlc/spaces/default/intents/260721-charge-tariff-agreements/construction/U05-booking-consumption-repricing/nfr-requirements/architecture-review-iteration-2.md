# Architecture Review - U05 NFR Requirements - Iteration 2

## Verdict

**NOT-READY**

The Resilience4j finding is closed by explicitly introducing only
`resilience4j-retry` and `resilience4j-circuitbreaker` 2.2.0 in the Booking
application-service module, with compatibility, convergence, license,
vulnerability, and deterministic-clock evidence. One High recovery finding
remains at the permitted review limit.

## Remaining finding

### High - permanent changed-key fencing deadlocks a revision-only amendment

Every amendment advances general revision, while a non-pricing amendment
correctly preserves pricing sequence/fingerprint and therefore the derived key.
Marking every `BOOKING_CHANGED` key permanently non-reclaimable would require a
“new” key that cannot exist without violating the non-pricing amendment rule.

The required correction is cause-sensitive: pricing-marker change retires the
old key and requires the new sequence; revision-only change either completes
after marker revalidation or permits explicit same-key higher-fence recovery
while preserving newer non-pricing state.

## Lead consistency check after review limit

The owning artifacts now apply that exact split without claiming a third review:

- pricing sequence/fingerprint change stores NULL due and requires the new key;
- revision-only change stores immediate due, permits explicit same-key higher-
  fence recovery, uses Charge terminal replay, revalidates unchanged pricing
  markers, and preserves the newer non-pricing aggregate state;
- both initial races return 409 `BOOKING_CHANGED` with no append, and both
  subtypes run at least 20 rounds.

This resolves the identified logical deadlock. The independent iteration-two
verdict remains permanently **NOT-READY**; no third READY review is asserted.
