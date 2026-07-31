# Technology Stack Decisions - U02 Charge Domain Routing and BFF

## Brownfield decision

U02 extends the observed Wave A edge and Charge application; it does not create
a gateway product or redesign the shared shell. Versions remain governed by the
workspace lock and existing container images. No opportunistic upgrade is
authorized.

| Concern | Selected technology/approach | Constraint |
| --- | --- | --- |
| Charge web/BFF | package ranges Next.js `^15.1.3`, React `^18.3.1`, TypeScript `^5.7.2`; lock resolves Next 15.5.19 and TypeScript 5.9.3 | `basePath` exactly `/charge-agreements`; server route handlers/pages own session boundary |
| validation | Zod range `^3.24.1`, lock-resolved 3.25.76, plus workspace TypeScript conventions | exact schemas, bounded fields, no untyped body spreading |
| authentication | existing `@erp/auth` signed `lc_session`, permission parser, and `safeReturnUrl` | no client cookie decode or browser authority |
| forwarding | Node built-in `fetch`, `AbortController`, bounded stream/JSON normalizer | fixed route policy, `cache: no-store`, 2500 ms deadline; no generic proxy library |
| edge | existing nginx 1.27 configuration | exact 308 plus `^~` path-preserving proxy; existing routes unchanged |
| runtime | existing Compose via `scripts/wave-a-compose.mjs` | project `linercore-wave-a`, host 18088; manager 8088 never targeted |
| UI | existing `@erp/ui`, LinerCore tokens and Charge-local route states | no `packages/ui`, shared shell/nav/type/palette change; DS-02/DS-03 remain dependencies |
| client state | URL/query/form-local React state | RTK is absent and is not introduced; no Redux/TanStack/Zustand |
| tests | Vitest range `^2.1.8` (lock-resolved 2.1.9), Next handler/component tests, Playwright 1.61.1, nginx/Compose probes | checked-in deterministic BFF load/evidence driver; U06 owns live acceptance |
| telemetry | existing structured correlation/log and runtime metrics conventions | bounded dimensions; no new observability platform |

## Significant decisions

### Compile-time policy registry

Every route selects a literal policy for method, capability, fixed backend path,
media, body mode, timeout, response limit, and replay mode. This is preferred to
a generic reverse-proxy handler because the browser cannot select authority,
destination, or media. Adding a route requires code and its policy-matrix test.

### Native bounded forwarding

Use the platform fetch/abort primitives and a small Charge-local bounded JSON
normalizer. A new gateway SDK, cache, retry framework, or BFF database would
expand scope and complicate failure authority. Default JSON and U03's exact
vendor media are policy constants.

### Stateless, no global client store

Session-derived request context exists only for one request. URL/query/form-local
state implements route restoration. RTK is not available in the baseline and
is unnecessary; introducing it would not improve server authorization or
durable command safety.

### Existing edge topology

Nginx remains the only public mount and retains `${NGINX_HOST_PORT:-8088}`;
isolated acceptance supplies 18088. No new service, network, volume, public
backend port, cloud resource, or service-to-service protocol is selected.

## Quality and trace

Implementation must pass workspace build/lint/type/unit tests, route-policy and
security matrices, deterministic overhead evidence, base-path/deep-link/assets
tests, changed-code >=80% line coverage, dependency/secret/redaction scans, and
`git diff --check`. U06 remains responsible for protected 8088 demo guards,
isolated live Compose, Playwright, `aidlc-audit`, and `erp-fidelity-audit`.

These decisions implement U02 BFF-001 through BFF-020 and the routing/security
parts of US-13/US-14 without widening W2-03 or upgrading the explicit W1 waiver.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and the discovered `technology-stack.md`; it fixes only the
minimum brownfield technologies required by their selected U02 seams.
