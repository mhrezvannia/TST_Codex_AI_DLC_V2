# Infrastructure Design Questions - U04 Sign-Out and Session Expiry Guard

## Question 1

What infrastructure should own sign-out?

A. Existing `apps-auth` sign-out route and Keycloak logout, invoked from shell.
B. A new shell logout provider.
C. Browser-only storage clearing.
D. Nginx cookie rewriting.
E. Booking BFF logout endpoint.
X. Other (please specify)

[Answer]: A

## Question 2

Where should stale Booking calls after sign-out stop?

A. In Booking BFF actor resolution before `serviceHeaders` and backend fetch.
B. In booking-service after receiving `local-user`.
C. In Nginx.
D. In browser global session state only.
E. In a new shared session cache.
X. Other (please specify)

[Answer]: A

## Question 3

What evidence is required?

A. Sign-out route/redirect, `lc_session` clear, protected-route reauth, BFF early return, backend no-`local-user`, and correlation ids.
B. Signed-out screenshot only.
C. Direct app-port proof only.
D. Unit tests without cookie evidence.
E. W1 waiver converted to PASS.
X. Other (please specify)

[Answer]: A

