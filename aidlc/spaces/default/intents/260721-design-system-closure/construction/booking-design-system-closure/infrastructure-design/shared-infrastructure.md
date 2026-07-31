# Shared Infrastructure — booking-design-system-closure

## Design Inputs

This record applies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md` to the existing shared boundaries in `components.md`, `services.md`, and `business-logic-model.md`. It records shared ownership even though there is one closure Unit and no new shared resource.

## Existing Shared Resources

| Resource | Consumers | Owner/boundary |
|---|---|---|
| nginx edge | Browser-facing Phase 1 routes | Existing platform; W2-02 verifies Booking route only |
| authenticated shell/Keycloak session | Canonical modules and BFF calls | Existing shell/identity; no second auth |
| `@erp/ui` tokens/primitives | Workspace applications | W2-02 owns generic package changes |
| Reference Data/pricing services | Booking and existing modules | Service owners; stable IDs/contracts |
| Kafka/Schema Registry | Existing service producers/consumers | Platform messaging/schema owners |
| Docker engine/Compose definitions | Local stacks | Project names/ports isolate lifecycles |

## Wave A Isolation

`scripts/wave-a-compose.mjs` fixes `--project-name linercore-wave-a` and loads `infrastructure/env/wave-a.env.example`. The isolated network name, image tag, volumes, and host ports are distinct from the manager demo. Evidence records effective config before start.

No command may override the project name to `linercore-shared-platform`, use port 8088 as acceptance, or run unscoped Compose teardown.

## Protected Manager Runtime

The manager demo is an external protected runtime, not a service consumed by acceptance. Before each guard, the harness asserts and records effective `DEMO_COMPOSE_PROJECT=linercore-shared-platform`, `DEMO_EDGE_URL=http://127.0.0.1:8088`, and `DEMO_IMAGE_TAG=demo-20260721`; environment overrides cannot silently retarget the proof. `npm run demo:guard` is nevertheless a mandatory pre/post closure dependency that observes:

- expected project containers/services;
- locked demo image identities;
- health plus Booking/Reference/Charge route reachability at `http://127.0.0.1:8088`.

Acceptance never starts/stops/rebuilds/reconfigures that project. A guard failure stops or fails closure and is retained.

## Cross-Unit and Parallel Safety

There is one W2-02 Unit and one active implementation driver for overlapping shared files/runtime. Other Wave A intents own disjoint domain pages and may consume the shared master/package only through the program merge protocol. They do not mutate this worktree’s isolated stack concurrently.

Safe overlap is read-only analysis or disjoint evidence scaffolding. Live acceptance is serialized on `linercore-wave-a`.

## Ownership and Change Control

- Generic presentation changes: W2-02/`packages/ui`.
- Booking canonical presentation: W2-02 shell Booking routes.
- BFF and service contracts: preserved existing owners; only traced compatibility corrections.
- Design-system master: W2-02.
- Manager demo: protected, never a W2-02 mutation target.
- Evidence/audits/backlog: W2-02 closure record after hard gates.

## Non-Resources

No shared database, cache, queue, network, DNS, certificate, secret store, cloud account, monitoring platform, artifact registry, CI runner, staging, or production environment is created. Existing shared resources do not imply authority to redesign them.
