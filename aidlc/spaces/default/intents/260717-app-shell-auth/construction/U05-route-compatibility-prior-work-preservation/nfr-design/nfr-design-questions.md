# NFR Design Questions - U05 Route Compatibility and Preservation

## Question 1

How should `/bookings*` compatibility be implemented?

A. Use fixed deterministic mappings to canonical `/booking*` shell routes.
B. Look up route targets from the database.
C. Load Booking data on both old and canonical routes.
D. Route old URLs to standalone Booking outside shell.
E. Defer compatibility to final acceptance.
X. Other (please specify)

[Answer]: A

## Question 2

How should prior-work preservation be proven?

A. Use scoped diff/path review, W2-01-specific touch reasons, and targeted verification for touched prior-work files.
B. Run unrelated broad refactors and rely on full-suite tests.
C. Ignore prior-work files if the UI looks correct.
D. Rewrite W1 waiver as PASS once W2-01 routes work.
E. Move preservation checks into runtime code paths.
X. Other (please specify)

[Answer]: A

## Question 3

What security behavior must legacy `/bookings*` routes preserve?

A. The same protected shell auth/session checks and actor propagation as canonical `/booking*`.
B. Open redirect support for arbitrary return URLs.
C. Legacy routes can bypass Booking actor propagation.
D. Legacy routes can use `local-user` for compatibility.
E. Legacy routes can return an empty list without authorization.
X. Other (please specify)

[Answer]: A

