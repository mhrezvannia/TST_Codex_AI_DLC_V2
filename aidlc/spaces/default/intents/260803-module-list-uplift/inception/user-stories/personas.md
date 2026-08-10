# Personas — W4-01 Module List-Detail Uplift

## Persona Set and Source Boundary

These personas translate the approved `requirements.md` into operational goals. They are grounded in `business-overview.md`, `component-inventory.md`, and `team-practices.md`; they do not create an Identity-administration persona, new business authority, or domain-local shell. Capability names and lifecycle truth remain provider-owned.

## P1 — Reference Data Administrator

| Attribute | Definition |
|---|---|
| Role | Steward of enterprise reference sets and records used by Booking, Charge, and Container Movement |
| Priority | Primary; first walking-skeleton persona |
| Goals | Find the correct set and record quickly; inspect readable attributes/history; create, validate, update, deactivate, or reactivate only when authorized and supported |
| Pain points | Current workbench is not shareable at stable list/detail routes; fallback data can obscure provider truth; coarse write permission does not prove every lifecycle action |
| Context | Uses dense operational tables on desktop and narrow layouts during support; often returns to a filtered set after inspecting a record |
| Access truth | Requires module read for navigation/detail; action-specific server ALLOW for each mutation; read-only state must remain useful |
| Success signal | A provider-backed record can be found, shared, refreshed, inspected, changed when permitted, and re-read without client-invented state |

## P2 — Pricing Analyst

| Attribute | Definition |
|---|---|
| Role | Maintains customer agreements, versions, rates, and lifecycle evidence |
| Priority | Primary; second domain sequence |
| Goals | Filter and open the exact Agreement; inspect summary, rates, D&D evidence where provider-backed, and status history; execute valid update/approve/successor/suspend/expire actions |
| Pain points | Overlapping legacy routes, BFF/provider query-key mismatch, dense version history, and risk of rewriting approved commercial truth |
| Context | Works mainly on desktop with high record density; needs correlation and version evidence during conflicts or rejected lifecycle actions |
| Access truth | Uses `charge-agreements:*` and supporting rate capabilities; every action also obeys provider lifecycle/version preconditions |
| Success signal | The exact Agreement and version truth are visible, actions persist only when legal, immutable history remains intact, and failures preserve work context |

## P3 — Charge Reader

| Attribute | Definition |
|---|---|
| Role | Commercial or operations stakeholder who consumes Agreement and pricing evidence without mutation authority |
| Priority | Secondary but mandatory permission variant |
| Goals | Find and inspect current commercial authority, rate/D&D evidence, status history, and OPEN manual-pricing evidence without accidental changes |
| Pain points | Mutation affordances create false expectations; technical payloads overwhelm primary workflow; manual-pricing evidence can be mistaken for a resolution queue |
| Context | Opens shared links from Booking or operational investigation and may use keyboard-only navigation |
| Access truth | Module read and relevant evidence read only; mutation commands are absent with a concise read-only explanation |
| Success signal | Receives the same provider truth as an analyst, no forbidden command is exposed, and manual-pricing evidence stays read-only |

## P4 — Container Operations User

| Attribute | Definition |
|---|---|
| Role | Tracks container journeys and records physical movement events |
| Priority | Primary; third domain sequence |
| Goals | Discover recent journeys, inspect one ordered timeline and linked Booking, capture the next legal GTOT/LOAD/DISC/GTIN event, and recover from duplicate or sequence rejection |
| Pain points | No current domain frontend; recent-list contract has no search/filter/page; event publication and Booking projection are asynchronous; degraded Reference/Identity dependencies can disable capture |
| Context | Uses desktop and tablet/mobile widths in operational settings; needs fast scanning, clear event labels, non-color status, and large touch targets |
| Access truth | Read required for list/detail; capture requires server ALLOW plus provider `captureEnabled=true`; disabled reason must remain truthful |
| Success signal | Journey truth and required next move are obvious; accepted capture persists; rejected capture never advances the timeline optimistically |

## P5 — Booking Operations User

| Attribute | Definition |
|---|---|
| Role | Owns Booking work and follows related pricing/journey evidence across bounded contexts |
| Priority | Supporting cross-module persona |
| Goals | Navigate from a Booking to the exact Journey when one exists; return safely; understand when a Journey is not yet created or a provider is unavailable |
| Pain points | Booking projection currently shows movement status but no stable Journey link; pricing snapshot exposes an Agreement version but not a safe parent Agreement ID |
| Context | Starts inside the canonical Booking detail and follows links without wanting to lose the Booking/list origin |
| Access truth | Target-module authorization remains independent; a denied target uses the shared denied state rather than leaking data |
| Success signal | Booking-to-Journey uses the verified provider lookup and canonical `journeyId`; unsafe or unresolvable Agreement/Journey links are never guessed |

## Relationships and Priority Ranking

1. **Reference Data Administrator** proves the shell/list/detail/action/evidence walking skeleton consumed by later domains.
2. **Pricing Analyst** reuses that grammar for the richest version and lifecycle surface.
3. **Container Operations User** completes the three-module uplift with async movement truth and a new domain frontend.
4. **Charge Reader** proves the capability-shaped read-only variant on the same Charge records.
5. **Booking Operations User** proves cross-module composition without moving data ownership into the shell or UI.

All five share the same authenticated LinerCore shell, tokens, responsive/accessibility baseline, safe failure grammar, and `@erp/ui` ownership. P2 and P3 may inspect the same Agreement with different commands; P4 and P5 traverse the existing Booking–Container Movement seam from opposite directions. Agreement-to-Booking and Booking-to-Agreement remain contract blockers, not persona assumptions.

## Inclusive Usage Needs

- Keyboard-only users must reach every supported control in logical order with visible focus and reliable focus restoration.
- Screen-reader users need one page heading, landmarks, labelled tables/regions, async announcements, field-linked errors, and readable code meanings.
- Low-vision and color-vision users need WCAG 2.1 AA contrast, zoom/reflow support, and status conveyed by text/icon as well as color.
- Touch users need at least 44 by 44 CSS-pixel targets and no hover-only information.
- Users on slow or degraded dependencies need explicit loading, stale/source timestamp, Retry, and disabled-action reasons without fabricated fallback truth.

## Upstream Traceability

- Requirements: `aidlc/spaces/default/intents/260803-module-list-uplift/inception/requirements-analysis/requirements.md`
- Business context: `aidlc/spaces/default/codekb/TST_Codex_W4-01/business-overview.md`
- Components and ownership: `aidlc/spaces/default/codekb/TST_Codex_W4-01/component-inventory.md`
- Delivery and engineering practices: `aidlc/spaces/default/intents/260803-module-list-uplift/inception/practices-discovery/team-practices.md`
