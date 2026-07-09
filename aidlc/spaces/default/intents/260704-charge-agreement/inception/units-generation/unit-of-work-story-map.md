# Unit of Work Story Map - Charge & Customer Agreement

## Story Coverage

| Story | Covered by units |
| --- | --- |
| US-1 Search Agreements | U05, U06, U08 |
| US-2 Create Draft Agreement | U02, U03, U04, U05, U06 |
| US-3 Maintain Charge Terms | U02, U03, U04, U05, U06 |
| US-4 Approve Agreement | U02, U03, U05, U06 |
| US-5 Suspend or Expire Agreement | U02, U03, U05, U06 |
| US-6 Resolve Active Terms for Booking | U03, U05, U09 |
| US-7 Use Shared Platform Reference Data | U07 |
| US-8 Verify Local Runtime | U08 |

## Requirement Coverage

| Requirement group | Covered by units |
| --- | --- |
| FR-1 Agreement Lifecycle | U02, U03, U05, U06 |
| FR-2 Charge Terms | U02, U03, U04, U05, U06 |
| FR-3 UI Workflows | U06 |
| FR-4 Active Lookup | U03, U05, U09 |
| FR-5 Shared Platform Integration | U07 |
| FR-6 Local Runtime and Evidence | U08 |
| NFR-1 Domain purity | U02 |
| NFR-2 Correlation IDs | U03, U05, U06 |
| NFR-3 List/search performance | U05 |
| NFR-4 Accessibility | U06 |
| NFR-5 Auditability | U02, U03, U04 |
| NFR-6 Honest readiness | U08 |

## MVP Boundary

MVP completion requires U01 through U09. U10 is event-readiness and can be implemented as a seam if Kafka remains unavailable, but event hardening is not required before Booking starts.
