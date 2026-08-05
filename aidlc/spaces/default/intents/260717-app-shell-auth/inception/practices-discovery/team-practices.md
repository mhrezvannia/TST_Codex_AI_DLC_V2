# Practices Discovery - Team Practices

## Way of Working

W2-01 uses the existing short-lived intent branch `intent/W2-01-app-shell-and-auth` from `integ/main-reconciled` and keeps one Platform+UI driver accountable for the full shell/auth/Booking vertical slice. Contributors work through owned seams rather than broad cross-module rewrites.

## Walking Skeleton

The first W2-01 Construction slice should prove the protected shell entry and session handoff before any shell chrome expansion. The risk-first path is login through Keycloak/auth, shell landing, and one Booking call that cannot fall back to `local-user`.

## Testing Posture

Tests are written alongside code and must include targeted coverage for session-derived actor propagation, denied authorization, sign-out/session clearing, and detector 6d hardcoded-auth evidence. Unit and integration tests are necessary but insufficient; live Compose proof through Nginx and Keycloak remains the exit gate.

## Deployment

W2-01 acceptance targets the local/on-prem Docker Compose topology with Nginx, Keycloak, identity-service, Booking service, and shell/auth app. Public-cloud deployment is not a release condition for this intent.

## Code Style

Frontend work stays in strict TypeScript/Next.js/Yarn workspace patterns and reuses shared packages where practical. Backend changes preserve service ownership and Java/Spring boundaries; local auth bypass code must be explicit, logged, and fail closed outside local profiles.
