# Deployment Architecture - U02 Reference Data Operational Completion

## Source Alignment

Per the answered Q1, this describes the **real** `linercore-wave-a` Compose topology as U02's deployment architecture, not a cloud target.

**Consumed inputs.** `logical-components.md` supplies the component inventory including the build-time catalog components; `services.md` supplies the deployable and ownership map; `components.md` supplies the edge mount and shell composition rules; `security-design.md` supplies the edge header policy and internal-call boundary; `performance-design.md` supplies the base-path and command-path properties; `scalability-design.md` confirms one instance with no scaling surface; `reliability-design.md` supplies the target-scoped failure expectation and the build-time failure domain; and `business-logic-model.md` supplies the routes and commands served.

## U02's Infrastructure Delta

U02 adds no container, image, service, network, volume, port, or secret of its own. It **inherits U01's three edge and Compose deltas** (the shared header-policy include, the Reference `basePath` change, and the missing `apps-reference-data` healthcheck) — all verified absent in the current `infrastructure/nginx/default.conf`, `apps/reference-data/next.config.mjs`, and `compose.yaml`, and all owned by U01 plus platform rather than duplicated here.

U02's own addition is **build-time, not runtime**: the `ReferenceFormCatalogV1` / `ReferenceFieldCatalogV1` pair and their producer/consumer fixture.

It does add one **build-time** artifact pair — the `ReferenceFormCatalogV1` (BFF) and `ReferenceFieldCatalogV1` (provider) catalogs with their producer/consumer fixture. These ship as code, not as infrastructure, but they have an infrastructure consequence worth stating here: they place a failure domain in the **build** rather than in a request, which is why no runtime schema endpoint or shared schema service needs provisioning.

## Compute Model

Containers on the single Docker Compose project, unchanged from U01: no serverless, orchestrator, VM fleet, multi-region, or environment ladder; one instance of each service.

## Network Topology

Unchanged from U01. The Reference app reaches the Reference service and Identity over the internal Compose network; those calls bypass the public edge and set their own trust headers.

```
[ Nginx edge ] /reference-data* -> apps/reference-data   <-- U02 (same mount as U01)
       |
       v (internal network only)
[ reference-data-service ] -> [ Reference PostgreSQL ]
[ identity-service ]       -> [ Identity PostgreSQL ]
```

## Edge Configuration

Inherited from U01 in every respect, **including U01's two edge deltas that are not yet built**: the shared header-policy include (current config clears no headers and sets four) and the `basePath` change (current config has no `basePath`; the edge strips the prefix via trailing-slash `proxy_pass`).

U02's new child routes (`/[setCode]/new`, `/[setCode]/[recordId]/edit`) are served by the same mount and require no *additional* edge change. That is worth confirming rather than assuming: under the current prefix-stripping proxy a route-prefix mismatch surfaces as a 404 at the edge rather than as an app error, and the `basePath` migration changes exactly this behaviour — so U02's child routes must be re-verified after U01's delta lands, not only before.

## Storage

U02 provisions no storage. The Reference service owns its PostgreSQL database and volume. U02 adds no draft database, no session store, and no cache — the create attempt ID is a provider record identity, not a stored idempotency record, so there is nothing to persist on U02's side.

## Health and Readiness

Unchanged from U01, including its gap: the `/api/health` route exists in source, but `apps-reference-data` declares no `healthcheck:` block in `compose.yaml`, so the route is not wired to a container check. U01's delta #3 closes it; U02 adds nothing here.

## Deliberately Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| AWS target architecture | Local acceptance claims only | `services.md`, NFR-012 |
| Serverless / managed compute | Verified stack is containers on Compose | `technology-stack.md` |
| Multi-region / multi-AZ | Single local host | NFR-012 |
| Environment ladder and promotion | One acceptance environment | NFR-012 |
| Auto-scaling / replicas | One instance; no scaling surface | `scalability-design.md` |
| Terraform / CDK / CloudFormation | No cloud resource to declare | `services.md` |
| CDN / edge caching | No public hosting; caching forbidden | NFR-012; Application Design |
| Load balancer / service mesh | One instance per service | `services.md` |
| Blue-green / canary | No second environment | NFR-012 |
| Runtime schema service | Deliberately removed in favour of build-time catalogs | U02 functional design |

The last row is U02-specific: an earlier design would have required provisioning and operating a runtime field-schema endpoint. Removing it eliminated an infrastructure component, a per-request round trip, and a runtime failure mode at once.

## Verification

Direct load and refresh of every U02 route **including the new child routes** under the prefix, asset resolution, denied deep links without data flash, target-scoped failure, and container health behaviour — all on the running Compose project. Per NFR-011, container startup alone is not acceptance.
