# NFR Design Questions - U04 Sign-Out and Session Expiry Guard

## Question 1

Which sign-out mechanism should shell use?

A. Post to existing `/api/auth/sign-out` and rely on the auth-owned cookie/Keycloak logout behavior.
B. Clear React client state only.
C. Add a parallel shell logout endpoint.
D. Delete browser storage and skip auth route.
E. Defer sign-out to final acceptance.
X. Other (please specify)

[Answer]: A

## Question 2

Where should stale Booking calls fail after sign-out?

A. In Booking BFF actor resolution before `serviceHeaders` and backend fetch.
B. In booking-service after receiving `local-user`.
C. In shell client state only.
D. In Nginx routing.
E. By retrying as an anonymous user.
X. Other (please specify)

[Answer]: A

## Question 3

What evidence proves U04 is safe?

A. Sign-out timing, cookie clear, protected-route reauth, stale-call early return, and no backend `local-user` request.
B. A screenshot of a signed-out page only.
C. W1 live-proof waiver marked PASS.
D. A direct app-port request without Nginx.
E. A manual claim that the browser looks logged out.
X. Other (please specify)

[Answer]: A

