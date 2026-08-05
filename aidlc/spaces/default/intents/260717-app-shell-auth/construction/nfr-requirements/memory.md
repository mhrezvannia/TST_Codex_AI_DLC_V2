# Memory - NFR Requirements

## Interpretations

- 2026-07-18T00:00:00Z - The U01 NFR targets are local-runtime acceptance targets, not enterprise production SLOs; W2-01 explicitly targets Compose/Nginx/Keycloak and no cloud deployment.
- 2026-07-18T00:00:00Z - Security NFRs are the dominant U01 category because the walking skeleton exists to prove session-derived actor propagation and eliminate protected-path `local-user` fallback.
- 2026-07-18T00:00:00Z - U02 NFRs add identity authorization, deterministic seed integrity, idempotent create behavior, and created-detail retrieval to the U01 security baseline.
- 2026-07-18T00:00:00Z - U03 NFRs emphasize deny evidence quality and accessible in-shell failure states; authenticated denial is distinct from anonymous redirect.
- 2026-07-18T00:00:00Z - U04 NFRs require concrete sign-out/cookie semantics and stale-call evidence, matching the functional-design remediation.
- 2026-07-18T00:00:00Z - U05 NFRs define compatibility and preservation evidence as measurable route and diff-review outcomes, not broad reimplementation or prior-intent completion claims.
- 2026-07-18T00:00:00Z - U06 NFRs make the evidence package itself the quality target: required files, command result fields, blocker schema, real-subject sign-out evidence, and no false PASS.

## Deviations

- 2026-07-18T00:00:00Z - Numeric performance targets are pragmatic local proof thresholds rather than contractual production SLAs because no production traffic model was supplied.

## Tradeoffs

- 2026-07-18T00:00:00Z - U01 keeps scalability requirements modest: preserve stateless shell/BFF design and avoid caching/new infrastructure until the basic actor path is proven.

## Open questions

- 2026-07-18T00:00:00Z - Later Operation stages should decide whether these local proof targets become baseline production SLOs or remain only Construction acceptance thresholds.
