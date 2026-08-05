# Infrastructure Design Questions - U01 Walking Skeleton

## Question 1

What runtime topology should U01 use for shell/auth/Booking proof?

A. Extend the existing local Docker Compose and Nginx topology with an `apps-shell` service.
B. Add AWS hosting and managed load balancing.
C. Replace Nginx with a new API gateway.
D. Run direct app-port proof only.
E. Defer runtime routing until final acceptance.
X. Other (please specify)

[Answer]: A

## Question 2

How should shell routes reach auth and Booking?

A. Browser enters through Nginx; `/` and `/booking*` route to `apps-shell`; shell reuses `apps-auth` and `apps-booking`/booking-service over the Compose network.
B. Browser calls `apps-booking` directly.
C. Shell owns a new auth provider.
D. Booking service calls shell for auth state.
E. Use hardcoded `local-user` for local proof.
X. Other (please specify)

[Answer]: A

## Question 3

What infrastructure evidence is enough for U01?

A. Compose/Nginx readiness, shell route timing, auth redirect/return, Booking read correlation, and blocker records when runtime cannot start.
B. Screenshot-only evidence.
C. Unit tests without live Compose.
D. Cloud deployment logs.
E. W1 waiver converted to PASS.
X. Other (please specify)

[Answer]: A

