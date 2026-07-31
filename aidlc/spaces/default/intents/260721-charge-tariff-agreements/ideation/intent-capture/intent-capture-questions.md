# Intent Capture Questions — W2-03 Charge Tariffs & Agreements

## Q1. Business problem

Which business problem is the primary reason for this intent?

- A. Charge cannot yet act as the real pricing authority because tariff, surcharge, and local-charge data do not drive booking prices (recommended)
- B. Pricing analysts mainly need a better agreement administration interface
- C. Booking mainly needs faster pricing responses
- X. Other (please specify)
- `[Answer]:` A — Real authority (Recommended)

## Q2. Primary customers

Whose outcome should lead the slice when priorities conflict?

- A. Pricing analysts and Booking operators together: analysts own rates and Booking consumes the resulting evidence (recommended)
- B. Pricing analysts first; Booking consumption can follow later
- C. Booking operators first; Charge maintenance can remain technical
- X. Other (please specify)
- `[Answer]:` A — Analysts + Booking (Recommended)

## Q3. Success evidence

What is the minimum acceptable observed success signal?

- A. On the isolated live stack, maintain the three rate categories, approve a versioned agreement, price and reprice a Booking with an itemised breakdown, and observe the no-rate manual path (recommended)
- B. Charge APIs and persistence work; UI and Booking evidence can follow
- C. The Charge UI works; Booking consumption can use fixtures
- X. Other (please specify)
- `[Answer]:` A — Full live slice (Recommended)

## Q4. Initiative trigger

What is the dominant trigger for doing this now?

- A. W2-03 is the next unblocked Charge-owned Wave A slice and closes the measured hardcoded-pricing gap before W3-01 (recommended)
- B. A production incident or urgent defect
- C. A regulatory deadline
- X. Other (please specify)
- `[Answer]:` A — Wave A gap (Recommended)

## Q5. No-rate boundary

For this vertical slice, which manual-pricing behavior is mandatory?

- A. A booking with no matching approved agreement or tariff enters `MANUAL_PRICING_REQUIRED`; outage/timeout degradation remains contract-preserved but is not the focal demo (recommended)
- B. Demonstrate no-rate plus timeout, 503, and circuit-open fallbacks in the live acceptance
- C. Return `NO_RATE` only and leave Booking state unchanged
- X. Other (please specify)
- `[Answer]:` A — No-rate focal (Recommended)

## Q6. Repricing and version evidence

What must changing a rate prove?

- A. A newly effective approved version changes a subsequent Booking quote while the earlier stored pricing snapshot remains immutable and attributable (recommended)
- B. Editing an approved agreement in place may change existing Booking snapshots
- C. Only the Charge preview needs to reflect the new value
- X. Other (please specify)
- `[Answer]:` A — Immutable snapshots (Recommended)
