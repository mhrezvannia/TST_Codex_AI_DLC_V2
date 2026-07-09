# Market Trends - Charge & Customer Agreement

## Source Context

This report consumes `intent-statement.md` and focuses on market signals that affect the Charge & Customer Agreement module.

Sources consulted:

| Source | Relevant signal |
| --- | --- |
| CargoWise Rates and Contracts: https://www.cargowise.com/solutions/cargowise-forwarding/cargowise-rates-and-contracts/ | Search, comparison, automated cost/revenue calculations, direct carrier connections. |
| Descartes Digital Rate Management: https://www.descartes.com/solutions/broker-and-forwarder-enterprise-systems/digital-rate-management | Online quoting, booking, tracking, and margin focus for logistics service providers. |
| Freightos Rate, Book & Manage: https://www.freightos.com/enterprise/rate-book-manage/ | Combined rate, booking, and management workflow across transport modes. |
| Freightos Terminal: https://www.freightos.com/enterprise/terminal/ | Index-linked contracts and benchmark-driven pricing are emerging advanced patterns. |

## Trend Summary

| Trend | Signal | Impact on LinerCore |
| --- | --- | --- |
| Rate data is moving from spreadsheets into searchable systems | Vendors emphasize live/searchable databases and centralized contract/rate management. | LinerCore should not ship a view-only or static-data agreement module. |
| Contract rates and spot rates increasingly coexist | Freight platforms market both spot and contract rate workflows. | MVP should handle contract/agreement terms; spot rates can be a future extension. |
| Quote and booking integration is expected | Leading products connect pricing to quote, booking, and shipment execution. | Active-agreement lookup must be a first-class API for the upcoming Booking module. |
| Margin and charge governance matter | Market messaging emphasizes accurate quoting, margin protection, and reduced manual effort. | Charge lines need structured amount, basis, currency, validity, and approval status, not free text only. |
| Benchmark/index-linked pricing is emerging | Benchmark-linked contracts are positioned as a way to reduce renegotiation friction. | Keep the domain model extensible, but defer index-linked pricing until after the MVP journey works. |

## Table-Stakes Expectations

The first module should include:

| Capability | Reason |
| --- | --- |
| Searchable agreement list | Users expect to find agreements quickly by customer/status/date. |
| Agreement detail and edit flow | View-only screens would not solve the business problem. |
| Charge term structure | Charge code, currency, amount, basis, route/trade-lane context, and validity must be explicit. |
| Approval lifecycle | Booking should consume approved terms, not draft commercial work. |
| Active lookup API | Booking needs deterministic agreement resolution at booking time. |

## Deferred Differentiators

These are real market capabilities but should wait until after the core LinerCore journey works:

| Capability | Defer because |
| --- | --- |
| Carrier direct connectivity | Requires external integrations and commercial agreements outside local MVP scope. |
| Spot-rate marketplace | Useful later, but contract/agreement terms are enough to unblock Booking. |
| Index-linked contracts | Advanced pricing construct that would complicate first-slice domain modeling. |
| Invoice dispute automation | Belongs to later finance/revenue workflows. |
| Full public tariff database | Not necessary for internal MVP agreement management. |

## Product Implication

The market confirms that charge/agreement management is not optional for a logistics product, but the MVP should be intentionally narrow. Build the internal agreement lifecycle and approved active-term lookup now; design extension points for more advanced rate-management integrations later.
