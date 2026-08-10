# Infrastructure Design Questions - U02 Booking Create Allow

## Question 1

What infrastructure should support Booking create authorization?

A. Reuse existing booking-service and identity-service over Compose DNS with bounded service configuration.
B. Add a new authorization service.
C. Add a cache for authorization decisions.
D. Move Booking create state into shell.
E. Defer authorization infrastructure to U06.
X. Other (please specify)

[Answer]: A

## Question 2

How should local allow fixtures be provisioned?

A. Extend existing seed/catalog flow with Booking permissions and `local.booking.user`, while preserving `local.reference.admin` deny fixture.
B. Add a role-admin UI.
C. Hardcode allow in the BFF.
D. Use `local-user` for all local creates.
E. Skip fixture evidence.
X. Other (please specify)

[Answer]: A

## Question 3

What infrastructure evidence proves U02?

A. Nginx-entered `/booking/new`, identity authorization allow, created id, `/booking/[id]` retrieval, actor/correlation, and blocker records when needed.
B. Direct app-port create only.
C. Unit tests without live identity.
D. Screenshot-only create form.
E. W1 waiver converted to PASS.
X. Other (please specify)

[Answer]: A

