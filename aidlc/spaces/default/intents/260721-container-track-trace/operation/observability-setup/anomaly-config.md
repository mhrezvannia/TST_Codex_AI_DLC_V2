# W2-04 Anomaly Detection Configuration

## Position and Upstream Trace

Anomaly candidates derive from `performance-design`, `security-design`,
`reliability-design`, `monitoring-design`, and `infrastructure-services`.

**Adaptive anomaly detection is DISABLED.** No stable production metric stream
or 2-4 week baseline exists, so a learned band would be noise presented as
science.

## Deterministic Acceptance Detectors

Use static, run-scoped detectors until trustworthy baselines exist:

| Detector | Expected invariant | Failure |
|---|---|---|
| Accepted latency | p95 <= 2 s; max <= 5 s | Block run |
| Propagation/recovery | CMM, Booking, and UI converge <= 30 s | Block run |
| Wrong-next/duplicate | Typed 409 and unchanged accepted state | Block run |
| Authorization | Exact decision/order/write-set matrix | Block run |
| Outbox/consumer fence | No stale worker completes after version change | Block run |
| Ten-delivery fixture | 9 receipts; separate duplicate; 2/5/2 dispositions | Block run |
| Manager isolation | Guard passes before and after; exact project identity | Block run |
| Evidence integrity | Complete immutable manifest and detector exits 0 | Block run |
| Telemetry completeness | Every exercised required signal produces data | Block observability claim |

## Future Adaptive Candidates

After baseline qualification, consider anomaly bands for:

- accepted capture p95 and traffic rate;
- CMM outbox oldest age and retry rate;
- Booking consumer lag and retry rate;
- Identity/Reference Data latency and unavailable rate;
- CMM-to-Booking/UI freshness;
- unauthorized denial frequency, with security review;
- resource saturation and database connection use.

Use a wide initial band, compare against static safety thresholds, and require
multi-window confirmation. Never train on known load tests, environmental
failures, or incomplete telemetry without labeling/exclusion.

## Data Quality Gates

An adaptive detector remains disabled if:

- the metric endpoint or scraper is unavailable;
- label cardinality is unbounded;
- fallback/stale images produced the series;
- deployment identity is missing;
- collection has gaps or clock semantics are inconsistent;
- the metric mixes accepted, rejected, synthetic, and health traffic;
- the target environment or retention window is undefined.

## Routing

Future anomalies create a review signal first, not automatic remediation.
Paging or rollback requires a separately approved alarm, owner, severity,
runbook, and corroborating user-impact signal.

