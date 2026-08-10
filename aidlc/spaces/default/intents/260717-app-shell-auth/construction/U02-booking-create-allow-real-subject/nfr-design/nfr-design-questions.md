# NFR Design Questions - U02 Booking Create Allow

## Question 1

How should U02 handle identity-service authorization latency during Booking create?

A. Use the existing bounded synchronous call and fail closed on timeout.
B. Add a local authorization cache.
C. Queue the create command and authorize asynchronously.
D. Retry as a fallback subject.
E. Defer authorization handling to a later unit.
X. Other (please specify)

[Answer]: A

## Question 2

Where should the create actor and authorization state live?

A. Derive actor from the server-side shell/session path per request; keep authorization state in identity-service.
B. Store actor and authorization state in browser local storage.
C. Store authorization state in shell process memory.
D. Trust an actor supplied by browser form state.
E. Add a new authorization service for Booking create.
X. Other (please specify)

[Answer]: A

## Question 3

What should U02 do when create succeeds but detail cannot be loaded at `/booking/[id]`?

A. Treat U02 acceptance as failed and record the failure with correlation id.
B. Claim create PASS and ignore detail retrieval.
C. Show a fake detail page from submitted form state.
D. Reload all Booking lists until detail appears.
E. Convert the result to the W1 live-proof waiver.
X. Other (please specify)

[Answer]: A

