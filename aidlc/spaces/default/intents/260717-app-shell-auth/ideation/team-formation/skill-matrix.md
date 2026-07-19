# Skill Matrix - W2-01 App Shell and Auth

## Source Context

This matrix consumes `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`. It maps required skills to roles without inventing named staff.

## Required Skills

| Skill | Needed For | Coverage Role | Gap/Risk |
|---|---|---|---|
| Next.js App Router and shell composition | U01, U03, U04 | UI contributor / Platform driver | Must preserve existing Booking routes while mounting them. |
| OIDC/Keycloak and session handling | U01, U03 | Platform driver / Security reviewer | Must reuse `apps/auth`; no custom auth. |
| BFF and HttpOnly-cookie security | U01, U02 | Platform driver / Security reviewer | Must keep tokens out of browser JavaScript. |
| identity-service authorization | U02, U03 | Platform driver / Booking contributor | Must use real subject and denied path. |
| Booking BFF/backend | U02, U04 | Booking contributor/reviewer | Static `local-user` seam is a high-risk target. |
| Local Compose and Nginx | U01, U04 | Platform driver / Quality reviewer | Acceptance must run through real edge topology. |
| UI accessibility and state handling | U03, U04 | UI contributor / Quality reviewer | Basic denied/loading/error states expected. |
| Audit and fidelity tooling | U04 | Quality/release reviewer | Detector 6d and `aidlc-audit` are completion gates. |

## Skill Gaps

Known gaps:

- Named human availability is unknown.
- Scope owner for actual W2-02 primitive reuse is not named.
- Security reviewer availability is not named.

Mitigations:

- Treat W2-02 as contributor/reviewer, not owner of W2-01 delivery.
- Confirm security and Booking reviewer assignments before Construction.
- Keep U02 early so subject-propagation risk is exposed before UI polish.

## Onboarding Checklist

- Read W2-01 source statement and Context Pack.
- Read scope document and intent backlog.
- Review current auth/session and Booking BFF/backend subject seams.
- Review W1 waiver evidence and do not rewrite it as a pass.
- Confirm branch `intent/W2-01-app-shell-and-auth` is based on `integ/main-reconciled` at `5dd6481`.
