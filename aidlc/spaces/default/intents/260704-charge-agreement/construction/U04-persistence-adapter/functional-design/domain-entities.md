# Domain Entities - U04 Persistence Adapter

## Tables

| Table | Key fields |
| --- | --- |
| `charge_agreements` | `id`, `agreement_number`, `customer_id`, `trade_lane_id`, `commodity_id`, `valid_from`, `valid_to`, `status`, `version`, `created_by`, `created_at`, `updated_by`, `updated_at` |
| `charge_agreement_terms` | `id`, `agreement_id`, `charge_code_id`, `basis`, `currency_id`, `amount`, `valid_from`, `valid_to`, `notes` |
| `charge_agreement_activity` | `id`, `agreement_id`, `action`, `actor`, `occurred_at`, `reason` |

## Indexes

| Index | Purpose |
| --- | --- |
| Customer/status/validity | Search and active lookup. |
| Trade lane/customer/date | Active lookup by lane. |
| Agreement ID foreign keys | Detail rehydration. |

## Mapping

Persistence entities stay inside the dataaccess adapter. The application layer only receives domain aggregates and application result DTOs.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.