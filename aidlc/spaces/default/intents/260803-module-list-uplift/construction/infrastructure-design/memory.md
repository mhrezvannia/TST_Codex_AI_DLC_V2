# Stage Memory - Infrastructure Design (3.4)

## Interpretations

- 2026-08-11T09:00:00Z — Read the stage's AWS/cloud catalogue (serverless, multi-region, CDN, auto-scaling, blue-green and canary, feature flags, vault, replication, environment ladders) as inapplicable by approved constraint rather than by oversight. NFR-012 confines acceptance to the isolated local Compose project and `technology-stack.md` states static evidence does not justify a public-cloud runtime claim. The lead agent for this stage is the AWS platform persona, which makes the temptation to produce cloud architecture strongest here — and the constraint against it no weaker.
- 2026-08-11T09:00:00Z — Did NOT re-ask the pattern-catalogue treatment question. It was decided at NFR Design and is now a persisted project correction; re-asking a settled practice is the failure the NFR Requirements learning warns against.
- 2026-08-11T09:00:00Z — Read `shared-infrastructure.md`'s CONDITIONAL marker ("produce when multiple units share infrastructure resources") as satisfied. The units share the Compose project, the edge, the session, the shell package, the Reference provider, and the Kafka topics — omitting the artifact would have hidden the intent's only genuine cross-unit coupling.

## Deviations

- 2026-08-11T09:00:00Z — Wrote a substantive "Consumed inputs" paragraph into every artifact from the start, naming each of the eight declared consumes. This stage has the largest consumes list so far, and the last two stages both failed `upstream-coverage` on exactly this; applying the correction proactively rather than after a reviewer finds it.

## Tradeoffs

- 2026-08-11T09:00:00Z — Scoped `cicd-pipeline.md` to infrastructure-facing gate requirements and handed pipeline authoring to stage 3.7 by name. Costs some duplication risk if 3.7 re-derives the gate list; avoids two artifacts owning the same pipeline definition and disagreeing.

## Open questions

- 2026-08-11T09:00:00Z — The dedicated CMM assertion key must exist in the Compose topology and in CI without being committed. Confirm with platform ownership how existing service credentials are provisioned in this project before Code Generation, rather than inventing a mechanism here.

## Deviations (post-review)

- 2026-08-11T09:40:00Z — The reviewer found five factual defects, all the same root cause: I described **approved target design as existing infrastructure**. Verified each against source before correcting. (1) The eleven-header clear list and shared include do not exist — `infrastructure/nginx/default.conf` sets four headers per location and clears none. (2) `apps/reference-data/next.config.mjs` sets no `basePath`; the edge strips the prefix via trailing-slash `proxy_pass`. Charge *does* set it correctly. (3) `apps-reference-data` has no `healthcheck:` block although the `/api/health` route exists. (4) The four Charge 308 redirects are not built — `app/agreements/[agreementId]/` and `.../new/` are live duplicate pages. (5) The assertion-key provisioning mechanism was recorded as "open" when `compose.yaml` shows a uniform `${VAR:-local_default}` pattern for every credential including the Charge assertion key, and `REFERENCE_DATA_CMM_TOKEN` already exists.
- 2026-08-11T09:40:00Z — The correction changed the substance, not just the wording: because the header policy, `basePath`, and healthcheck are genuinely absent, U01, U02, and U03 **do** have infrastructure deltas, where I had claimed "None." Each artifact now separates verified current state from required change. A design that describes its target as its present state tells Code Generation there is nothing to build.

## Open questions (post-review)

- 2026-08-11T09:40:00Z — Reference's `basePath` migration changes how the edge routes it (prefix-preserving instead of prefix-stripping). Confirm with platform whether that can land independently of the header-include change or whether both must ship together, since both touch the same locations.
