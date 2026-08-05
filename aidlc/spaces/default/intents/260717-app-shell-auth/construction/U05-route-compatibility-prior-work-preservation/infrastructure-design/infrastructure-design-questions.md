# Infrastructure Design Questions - U05 Route Compatibility and Preservation

## Question 1

Where should `/bookings*` compatibility routing live?

A. Nginx forwards `/bookings*` to `apps-shell`; shell-owned Next.js routes issue fixed canonical redirects.
B. Nginx redirects every `/bookings*` path directly.
C. Booking service resolves legacy routes.
D. A route database stores legacy mappings.
E. Direct app-port routes remain canonical.
X. Other (please specify)

[Answer]: A

## Question 2

How should route edge cases be handled?

A. Use the NFR allowlist: list query params only, no create/detail query params, decode once/re-encode, and shell 404 for malformed detail ids.
B. Preserve all query strings.
C. Treat `/bookings/new` as a dynamic id.
D. Forward malformed ids to booking-service.
E. Accept external redirect targets.
X. Other (please specify)

[Answer]: A

## Question 3

How should preservation evidence be produced?

A. Evidence-time diff/path review with W2-01-specific reasons and targeted verification for W0-01, W0-02, W1-01, and W2-02 touches.
B. Runtime preservation service.
C. Broad unrelated refactor.
D. W1 waiver rewritten as PASS.
E. Skip when routes work.
X. Other (please specify)

[Answer]: A

