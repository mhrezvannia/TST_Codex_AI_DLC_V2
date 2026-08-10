# NFR Design Questions - U03 Booking Deny

## Question 1

How should an authenticated user without Booking permission be represented in the shell?

A. Render an in-shell access denied state with safe recovery actions.
B. Return a fake empty Booking list.
C. Hide the route from navigation and skip backend authorization.
D. Retry as `local-user`.
E. Redirect to a generic route-not-found page.
X. Other (please specify)

[Answer]: A

## Question 2

Where should deny authority live?

A. booking-service calls identity-service per request; shell displays the resulting denied state.
B. Shell client state decides whether access is denied.
C. Nginx route rules decide Booking authorization.
D. Browser local storage stores denied status.
E. Add a policy-admin UI in this unit.
X. Other (please specify)

[Answer]: A

## Question 3

What retry behavior is acceptable for the deny path?

A. No automatic authorization retry loop; manual safe navigation or request-access action only.
B. Poll identity-service until access is granted.
C. Retry with another subject.
D. Bypass authorization when identity-service is slow.
E. Convert deny evidence into the W1 live-proof waiver.
X. Other (please specify)

[Answer]: A

