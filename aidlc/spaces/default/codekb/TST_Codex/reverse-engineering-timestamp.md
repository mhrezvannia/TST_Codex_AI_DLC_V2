# Reverse Engineering Timestamp - TST_Codex

## Freshness Marker

Reverse engineering refreshed on: 2026-07-09

Repository: `D:\TST_Codex`

AI-DLC intent: `aidlc/spaces/default/intents/260708-linercore-enterprise`

AI-DLC stage: `inception/reverse-engineering`

Engine-resolved codekb path: `aidlc/spaces/default/codekb/TST_Codex/`

Git commit: `86e2105`

Repo set: single-repo/unrecorded active intent repo set.

## Scan Method

Primary indexed layer:

- Graphify graph at `graphify-out/graph.json`.
- Commands used included `graphify query`, `graphify explain`, and `graphify path`.

Secondary indexed layer:

- codebase-memory MCP was requested, but no MCP resources were exposed in this session.

Focused reads:

- root `package.json`;
- `compose.yaml`;
- `services/pom.xml`;
- selected app/package manifests;
- contract catalog and contract directories;
- route/controller scans;
- infrastructure inventory;
- test and workflow scans.

## Delegation Caveat

The stage requested subagent mode with `aidlc-developer-agent` and `aidlc-architect-agent`. The developer subagent failed before execution because the configured `openai.gpt-5.5` model is not supported for the current Codex account. Reverse engineering was completed inline and this degradation is recorded in the stage memory and codekb artifacts.

## Scope of Analysis

Included:

- `services/identity-service`
- `services/reference-data-service`
- `services/charge-agreement-service`
- `apps/auth`
- `apps/reference-data`
- `apps/charge-agreements`
- `packages/*`
- `contracts/*`
- `infrastructure/*`
- `scripts/*`
- `compose.yaml`
- enterprise contract documents

Not found as implemented services:

- Booking service
- Container Movement Management service
- pricing provider service/API
- D&D calculation engine

## Staleness Triggers

Rerun reverse engineering when:

- services/apps/packages are added or removed;
- Booking/CMM/pricing/D&D implementation begins;
- Compose profiles change;
- contract artifacts are generated or frozen;
- Graphify graph is updated after major code changes;
- codebase-memory MCP becomes available and can add a secondary indexed perspective.
