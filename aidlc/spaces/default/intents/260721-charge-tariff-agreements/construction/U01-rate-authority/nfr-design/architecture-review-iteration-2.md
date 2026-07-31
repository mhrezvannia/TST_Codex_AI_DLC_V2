# Architecture Review - U01 NFR Design - Iteration 2

## Verdict

**NOT-READY**

No Critical findings. One High finding remains after the final permitted review
iteration.

## High finding

The 20-permit Reference design cannot guarantee the healthy ten-client workload:
ten commands may each launch five checks, so 50 calls contend for 20 permits and
the 100 ms permit bound can reject healthy work. The design must use a feasible
fan-out/capacity model and show mathematically that healthy calls meet the 750 ms
command target while preserving the two-second failure ceiling.

## Closed findings and advisories

The single service-side authorization decision, exact adapter bounds, explicit
W1 blocked/waived preservation, two-pool approval distribution, manager 8088
isolation, topology/UI ownership, and recovery/evidence boundaries are closed.
One stale overlap sentence must also stop implying that a generic database
constraint encodes the inclusive Approved-window rule.

## Lead consistency check after review limit

The reviewer limit is exhausted, so this section is not a third review and does
not replace the NOT-READY verdict above. The lead correction raises the global
Reference permit bound to 50, caps each command at five concurrent checks, and
defines a healthy fan-out budget of 300 ms. At ten concurrent commands, the
maximum fan-out is `10 x 5 = 50`, so all healthy calls receive a permit without
queue rejection. Each healthy provider call completes within 250 ms and the
remaining 50 ms covers projection/cancellation bookkeeping. Together with a
100 ms Identity budget, 250 ms transaction/JDBC budget, and 100 ms combined
boundary/serialization allowance, the command fits the 750 ms target. Higher
bursts remain bounded by the 50 permits, 100 ms permit wait, and two-second
failure deadline. The overlap wording is corrected to make the locked query,
not a generic constraint, decisive.
