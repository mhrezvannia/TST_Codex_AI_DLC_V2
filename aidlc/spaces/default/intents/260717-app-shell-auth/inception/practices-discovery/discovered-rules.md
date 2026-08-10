# Practices Discovery - Discovered Rules

## Mandated

ALWAYS keep W2-01 constrained to shell/auth plus Booking mount unless a later approved scope change says otherwise.
ALWAYS preserve W1-01 live-proof evidence as blocked or waived unless a new observed live run proves otherwise.
ALWAYS use the existing auth app, Keycloak/OIDC, and identity-service authorization seams before adding new identity mechanisms.
ALWAYS prove mounted Booking calls carry the authenticated subject through BFF and backend evidence.
ALWAYS run W2-01 acceptance through local Compose and Nginx with Keycloak available.
ALWAYS keep W2-02 design-system foundation and W4-01 broad module migration out of W2-01 implementation scope.

## Forbidden

NEVER accept a mounted Booking path that still sends or falls back to `local-user` in production-like flows.
NEVER treat static local auth bypass behavior as acceptable outside explicit local/test profiles.
NEVER introduce a micro-frontend host, public-cloud deployment path, or third-party portal product for W2-01 without an approved scope change.
NEVER rewrite prior merged W0-01, W0-02, W1-01, or W2-02 work to make the shell slice easier.
NEVER claim completion from shell chrome, screenshots, unit tests, or container startup without real subject audit evidence and audit gates.
