# Scalability Design - U09 Local Seed Compose

## Scalability Goals

U09 scales across local and CI use by separating Compose profiles, seed packs, target services, dependency ordering, and smoke subsets. It is intentionally not a production bulk loader, multi-tenant seed model, or external feed import framework.

## Seed Pack Structure

Seed packs are versioned and committed. They can be target-service-specific for Keycloak imports, identity-service catalog data, and reference-data-service records. Each record uses stable platform ids or deterministic derivation rules plus natural business keys.

All nine MVP reference sets are represented: Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.

## Dependency Management

The loader orders Country before Port, Region before TradeLane, Keycloak realm before identity roles/users, and role catalog before role-permission links and user assignments. Missing parents fail dependent records unless explicitly optional.

Seed packs keep trade lanes, sites, and final role-permission mappings replaceable so upstream business decisions can change without redesign.

## Compose Profiles

The core profile contains only dependencies required for local functional smoke. Optional observability can be enabled separately so missing Grafana/Jaeger/ELK-style tooling does not block core seed and smoke behavior.

Nginx route separation preserves the browser/BFF shape used by apps.

## Smoke Subsets

`smokeTags` keep checks small and predictable for local and CI. They select representative identity, reference, authorization, and event/status records without scaling into broad data validation.

## Source Trace

This design implements constraints from `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
