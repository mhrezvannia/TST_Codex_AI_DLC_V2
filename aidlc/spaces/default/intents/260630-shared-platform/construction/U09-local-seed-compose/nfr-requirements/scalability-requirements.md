# Scalability Requirements - U09 Local Seed Compose

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines versioned seed packs, target services, dependencies, smoke tags, ordered loading, and Compose profiles. `business-rules.md` requires deterministic keys, idempotent reruns, all nine reference sets, replaceable role-permission defaults, and health-gated runtime dependencies. `requirements.md` fixes local reproducibility and deterministic seed data for tests/frontend/smoke.

## Scaling Model

U09 scales by separating seed packs, target services, and Compose profiles. It is designed for repeatable local/CI environments, not production bulk loading.

## Structural Requirements

| Area | Requirement |
|---|---|
| Seed packs | Versioned, committed, target-service-specific where useful. |
| Identifiers | Stable platform ids or deterministic derivation rules. |
| Dependencies | Country before Port, Region before TradeLane, Keycloak realm before identity roles/users. |
| Profiles | Core profile separate from optional observability. |
| Smoke subsets | `smokeTags` keep checks small and predictable. |

## Growth Assumptions

- All nine reference sets are included.
- Exact trade lanes and sites remain configurable.
- Final role-permission mappings remain replaceable.
- Seed volume is intentionally small for local/CI reproducibility.

## Non-Goals

- No production data-volume scaling.
- No external feed import scaling.
- No multi-tenant or multi-carrier seed model.

