# Feasibility Questions — W3-04 Booking Request Completeness

## Established technical and organizational context

- Integrations are fixed by the approved `intent-statement.md`: shared-shell/BFF, Booking domain and PostgreSQL persistence, live Reference Data OHS, synchronous Charge pricing, Kafka/Avro `booking.confirmed`, Keycloak/identity authorization, and self-hosted observability.
- The platform is on-premises. `docs/enterprise-technical-environment.md` explicitly declares no public cloud, no AWS accounts/services/regions, Docker Compose orchestration, Terraform + Ansible IaC, and separate dev/staging/prod hosts/networks/projects.
- The team stack is Java/Spring Boot/Maven for services and TypeScript/Next.js/yarn for the frontend, with PostgreSQL 15+, Kafka, Confluent Schema Registry, Nginx, Vault, Prometheus/Grafana, ELK, Jaeger, and OpenTelemetry.
- Booking is the Driver; Shared Platform and Charge are contributors/reviewers through contracts. W0-02, W1-01, W2-02, and W2-03 are closed, and no known dependency blocks W3-04.

## Pending feasibility decisions

1. What delivery envelope should feasibility assume?
   - A. Retain `feature` scope at Standard depth, approximately five vertical units, with no invented monetary or calendar constraint; protect the live observed Definition of Done and escalate any requested scope/date tradeoff (recommended)
   - B. Treat a fixed date as dominant and reduce the slice if needed
   - C. Treat a fixed budget as dominant and reduce the slice if needed
   - X. Other
   - `[Answer]: A — Protect the approved vertical slice and live DoD.`

2. What infrastructure-change posture should W3-04 use?
   - A. Reuse the existing on-premises services and deployment topology; add no public-cloud dependency or new infrastructure service for this feature (recommended)
   - B. A new self-hosted infrastructure service is acceptable if it simplifies the feature
   - C. A new public-cloud dependency is acceptable
   - X. Other
   - `[Answer]: A — Reuse the existing on-premises topology.`

3. What migration and rollout posture should govern existing bookings?
   - A. Additive/backward-compatible schema and contracts, safe authoritative upcast or explicit incompleteness, rolling-compatible deployment, and no destructive downtime (recommended)
   - B. Use a maintenance window for a one-time breaking migration
   - C. Run an extended dual-write/dual-read migration
   - X. Other
   - `[Answer]: A — Additive, rolling-compatible rollout.`

4. What compliance classification should feasibility apply to the new fields?
   - A. Treat party/customer references and customer reference as Confidential and PII-linked; minimize snapshots/logs and audit access. Apply the existing OWASP/CIS baseline; do not infer PCI/HIPAA, and keep GDPR/FMC geographic applicability at the unresolved program-footprint level (recommended)
   - B. Assume full GDPR territorial applicability now and add W3-04-specific residency/retention scope
   - C. Treat all new booking fields as Internal with no PII impact
   - X. Other
   - `[Answer]: A — Confidential/PII-linked baseline under existing controls; geographic regimes remain program-level.`

5. What organizational-blocker assumption should be recorded?
   - A. No known change freeze or competing-priority blocker; record this as an assumption and revalidate in Delivery Planning (recommended)
   - B. A change freeze applies
   - C. A competing Wave 3 priority constrains Booking-team capacity
   - X. Other
   - `[Answer]: A — No known blocker; revalidate in Delivery Planning.`

6. What feasibility decision threshold should be used?
   - A. Conditional GO: field dictionary frozen before Application Design, exact contracts remain compatible, reference/schedule authority is proven, legacy migration is tested, and live/audit gates remain mandatory (recommended)
   - B. Unconditional GO based on the existing prototype path
   - C. NO-GO until all future Booking breadth is designed
   - X. Other
   - `[Answer]: A — Conditional GO.`

## Ambiguity and contradiction analysis

- All `[Answer]:` tags are resolved; no feasibility decision remains open.
- Inputs reviewed: `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md`.
- The AWS-platform question resolves to N/A rather than an AWS design: the binding enterprise environment is on-premises and explicitly has no public-cloud accounts, regions, or services.
- The current Booking persistence model stores a versioned JSON snapshot plus relational projections. This supports an additive snapshot-version migration, but the legacy codec currently assumes quantity `1` and a physical `equipmentId`; it must be updated to preserve or explicitly mark incomplete records.
- Reference Data currently models carrier voyage number, origin/destination, scheduled departure, and scheduled arrival as typed voyage facts. Cargo cutoff and documentation deadline are not present in that typed projection, so the full schedule decision creates a real Shared Platform contribution and contract-proof condition rather than a Booking-local default.
- The current Booking domain and both create forms require `equipmentId` and quantity `1`. That is a known brownfield gap, not evidence against feasibility; W3-04 exists to replace the invariant additively while keeping later physical assignment valid.
- The conditional-GO posture is consistent with the market findings: external products validate complete booking data as table stakes, while `build-vs-buy.md` recommends extending the existing core rather than introducing a new platform.
