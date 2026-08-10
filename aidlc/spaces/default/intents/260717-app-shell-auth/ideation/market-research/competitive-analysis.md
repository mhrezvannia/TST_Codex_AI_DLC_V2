# Competitive Analysis - W2-01 App Shell and Auth

## Source Context

This analysis consumes `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`. The W2-01 competitor set is the class of enterprise logistics/ERP/TMS platforms whose users expect one secured operating console, not the full product breadth of those platforms.

## Competitive Categories

| Category | Examples | Relevant Strength | W2-01 Implication |
|---|---|---|---|
| Enterprise ERP launchpad platforms | SAP Fiori launchpad | Role-based app access and SSO expectations are mature. | LinerCore needs a shell with protected routes and user context before broader UI polish matters. |
| Transportation management suites | Oracle Transportation Management | SSO, users, roles, and transportation workflows are packaged capabilities. | W2-01 should prove identity and authorization through the actual Booking journey. |
| Logistics execution platforms | CargoWise | Integrated operational platform positioning. | Disconnected workbench islands undercut perceived maturity. |
| Internal custom carrier ERP | LinerCore target | Can bind exactly to carrier workflows, local Compose, Keycloak, identity-service, and Booking contracts. | Build is justified because the shell is an integration surface across existing code, not a generic product page. |

## Strengths and Weaknesses

SAP/Oracle/CargoWise strengths:

- Mature one-entry-point mental model.
- Enterprise authentication and role support are expected rather than optional.
- Established user training and operational workflows reduce adoption friction.

Tradeoffs versus LinerCore:

- Buying a full platform would not preserve the practice codebase, W0/W1/W2 evidence, local Compose topology, or domain-specific integration work.
- Generic launchpad products do not remove the need to propagate real LinerCore session subjects through Booking BFF/backend authorization.
- Micro-frontend or portal products could add operational complexity before the simple monorepo shell path has been proven.

## Differentiation Strategy

W2-01 should differentiate by being smaller and more truthful:

- Prove one shell with one mounted Booking module instead of promising broad migration.
- Reuse the existing auth app and Booking surfaces rather than rebuild.
- Make the real subject visible in backend/audit evidence.
- Keep the W1 live-proof waiver explicit; no competitor-style positioning language should hide runtime blockers.

## Risks

- **Scope inflation:** treating "one shell" as permission to migrate every module. Mitigation: defer broad module migration to W4-01.
- **Security theater:** rendering a user menu while BFF/backend still send static subjects. Mitigation: hard DoD includes detector 6d and backend audit subject evidence.
- **Design-system overlap:** rebuilding W2-02 primitives inside W2-01. Mitigation: consume what exists and keep shell primitives minimal.
- **Stale graph context:** Graphify output is useful but stale. Mitigation: source-verify with codebase-memory MCP and source snippets before implementation.

## Sources

- SAP Help Portal, Fiori launchpad transportation roles: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/58d9db9751554bbeac5cb7943f789b2d.html
- Oracle Transportation Management SSO and users/roles: https://docs.oracle.com/en/cloud/saas/transportation/26b/otmcg/single-sign-on-sso.html
- CargoWise product site: https://www.cargowise.com/
- W2-01 intent statement: `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`
