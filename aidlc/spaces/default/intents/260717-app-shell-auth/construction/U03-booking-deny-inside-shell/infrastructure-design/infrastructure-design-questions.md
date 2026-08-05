# Infrastructure Design Questions - U03 Booking Deny

## Question 1

What infrastructure should support the deny proof?

A. Reuse shell, Booking, booking-service, identity-service, and seed/catalog configuration from U01/U02.
B. Add a policy-admin UI.
C. Add a new authorization service.
D. Hide legacy routes in Nginx.
E. Return empty Booking data without backend authorization.
X. Other (please specify)

[Answer]: A

## Question 2

How should `local.reference.admin` be provisioned?

A. Preserve it as an authenticated local subject without Booking permissions.
B. Grant it temporary Booking read for proof convenience.
C. Replace it with `local-user`.
D. Remove it from seed/catalog.
E. Defer deny fixtures to U06.
X. Other (please specify)

[Answer]: A

## Question 3

What evidence proves U03?

A. Nginx-entered `/booking`, real subject, identity deny decision, shell denied UI, no Booking data/mutation, and correlation id.
B. Hidden navigation only.
C. Empty list only.
D. Direct app-port route only.
E. W1 waiver converted to PASS.
X. Other (please specify)

[Answer]: A

