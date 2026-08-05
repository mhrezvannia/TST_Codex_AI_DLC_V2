# Logical Components - U03 Authorized Degraded Journey Access

## Inputs and Component Inventory

This inventory bridges U03 `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

| Component | Owner | Boundary |
|---|---|---|
| Identity adapter/AuthorizationPort | Shared dependency | Fresh subject/resource/action decision |
| Reference Data adapter | Shared dependency | Fresh validation or typed unavailable outcome |
| CMM authorized use cases | CMM | Authorization-first list/detail/booking/capture |
| CMM repositories/read model | CMM | Lookup only after read ALLOW; persisted last-known facts |
| CMM REST/DTO mapper | CMM | Safe 200/403/503/404 unions and correlation |
| Container Movement pages | CMM-owned UI | Freshness/capability hint, disabled capture, Retry |
| Acceptance controller | Test infrastructure | Ten-row isolation, timing, demo/8088 guard |

No cache, migration, new provider, shared-shell or `packages/ui` redesign,
EDI/public DCSA API, fleet/depot/M&R, or Booking-to-CMM synchronous query is
introduced. W1 remains BLOCKED/waived.

