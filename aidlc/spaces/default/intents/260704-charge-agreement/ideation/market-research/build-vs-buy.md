# Build vs Buy - Charge & Customer Agreement

## Source Context

This assessment consumes `intent-statement.md` and the current Shared Platform completion state. External rate-management products validate the capability area, but the immediate objective is completing LinerCore's internal MVP path.

Sources consulted:

| Source | Relevant signal |
| --- | --- |
| CargoWise Rates and Contracts: https://www.cargowise.com/solutions/cargowise-forwarding/cargowise-rates-and-contracts/ | Mature rates/contracts module with search, comparison, and automated application. |
| Descartes Global Price Management: https://www.descartes.com/solutions/broker-and-forwarder-enterprise-systems/global-price-management | Productized freight-rate management for quote accuracy and margin management. |
| Freightgate Contract Rate Management: https://freightgate.net/logistics/contract-rate-management/ | Dedicated contract-rate management for ocean contracts, surcharges, and multimodal agreements. |
| Freightos Rate, Book & Manage: https://www.freightos.com/enterprise/rate-book-manage/ | Combined rate access, booking, and management workflows. |

## Options

| Option | Benefits | Costs / risks | Fit |
| --- | --- | --- | --- |
| Build internal module now | Preserves LinerCore domain ownership, integrates cleanly with Shared Platform and Booking, supports local MVP evidence. | Requires implementing domain/API/UI/tests. | Best first step. |
| Buy full RMS/TMS module now | Mature rate features and possible carrier network/connectivity. | Heavy integration burden, may duplicate or bypass LinerCore domain model, slows MVP learning. | Poor first step. |
| Partner/integrate later | Keeps optional path open for spot rates, benchmarks, carrier connectivity, public tariffs. | Not enough to prove local business module now. | Good future option. |
| Spreadsheet/manual process | Quick demo data entry. | Weak lifecycle, no reliable downstream Booking integration, poor auditability. | Not acceptable beyond temporary seed data. |

## Recommendation

Build the Charge & Customer Agreement module now as an internal LinerCore bounded context.

The module should include:

| Area | Build now |
| --- | --- |
| Agreement lifecycle | Draft, approved, suspended, expired. |
| Charge terms | Structured charge lines with charge code, currency, amount, basis, validity, and trade-lane/commodity context. |
| Shared Platform consumption | Use existing reference data and identity/local bypass conventions. |
| Booking contract | Expose an active-agreement lookup API for the next module. |
| Functional UI | List, detail, create/edit, and approve flows. |
| Test evidence | Unit, service/API, UI, smoke, and readiness checks. |

## Partner / Buy Seams to Preserve

| Future seam | Why preserve it |
| --- | --- |
| External rate source import | Later modules may ingest carrier/customer rate files or third-party rate feeds. |
| Spot-rate provider | Booking may later need spot quote fallback when no agreement is active. |
| Index-linked pricing | Some agreements may eventually reference benchmark indices, floors, or ceilings. |
| Invoice/revenue integration | Approved charge terms should become a later input to finance workflows. |

## Decision

Proceed with a build-first approach for MVP completion. Avoid buying a full external RMS before LinerCore has proven its internal agreement lifecycle and Booking integration. Keep APIs and domain terms clean enough that a future external rate-management partner can feed or augment agreement terms without replacing the module.
