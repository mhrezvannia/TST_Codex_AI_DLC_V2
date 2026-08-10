# Unit Dependency DAG - W1-01 Booking Quote-to-Cash

## Dependency Semantics

An edge `A depends on B` means A cannot meet its live Definition of Done without B's persisted user outcome and frozen seam. The DAG follows the story prerequisites from `stories.md` and records no extra coordination edge. It describes topology only and does not select an economic implementation order.

## Machine-Readable Edges

```yaml
units:
  - name: booking-draft-skeleton
    depends_on: []
  - name: reference-validation
    depends_on: [booking-draft-skeleton]
  - name: agreement-pricing
    depends_on: [reference-validation]
  - name: confirm-to-cmm-journey
    depends_on: [agreement-pricing]
  - name: returned-status-detail
    depends_on: [confirm-to-cmm-journey]
  - name: replay-restart-safety
    depends_on: [returned-status-detail]
  - name: live-release-acceptance
    depends_on: [replay-restart-safety]
```

## Prose Edge Register

| Unit | Direct dependency | Hard reason |
|---|---|---|
| `booking-draft-skeleton` | None | Establishes the persisted Booking and stable route required by every user action. |
| `reference-validation` | `booking-draft-skeleton` | Validates and transitions an existing persisted draft. |
| `agreement-pricing` | `reference-validation` | Pricing is allowed only for a live-reference-valid booking. |
| `confirm-to-cmm-journey` | `agreement-pricing` | Confirmation requires a persisted successful immutable pricing snapshot. |
| `returned-status-detail` | `confirm-to-cmm-journey` | Requires the opened CMM journey and its atomically enqueued status event. |
| `replay-restart-safety` | `returned-status-detail` | Exercises duplicate/stale/restart behavior across the completed two-hop business path. |
| `live-release-acceptance` | `replay-restart-safety` | Accepts the complete journey only after its persistence and idempotency behavior is proven. |

## Integration Points

| Unit | Real seam | Owned executable contract/evidence |
|---|---|---|
| `reference-validation` | Booking -> Reference Data HTTP | Active/inactive/unavailable runtime observations |
| `agreement-pricing` | Booking -> Charge HTTP | Pricing OpenAPI, Pact/provider fixture, example/catalog, real itemized/manual outcomes |
| `confirm-to-cmm-journey` | Booking -> Kafka/SR -> CMM | Canonical `booking.confirmed`, exact key/record, receipt/journey/status-outbox DB state |
| `returned-status-detail` | CMM -> Kafka/SR -> Booking/UI | Canonical `containermovement.status`, exact key/record, ordered projection and rendered status |
| `replay-restart-safety` | DLT/replay plus service restarts | Preserved event identity, one business effect, migration/restart evidence |
| `live-release-acceptance` | Full runtime and quality/audit boundary | Indexed repeatable release evidence |

## Parallel Development Opportunities

The seven user outcomes have strict business prerequisites, so the minimal DAG has one valid topological chain. This is not artificial serialization: `requirements.md` and `stories.md` prohibit validation before draft persistence, pricing before validation, confirmation before pricing, returned status before journey opening, and release acceptance before replay/restart proof. Internal file preparation may overlap, but no later unit can satisfy its live DoD early.

## Cycle Verification

Each of the seven units is declared exactly once, every dependency resolves to the immediately preceding user outcome, no self-edge exists, and traversal terminates at `booking-draft-skeleton`; the graph is acyclic.

## Source Coverage

The DAG uses component boundaries from `components.md`, ports from `component-methods.md`, deployable/runtime seams from `services.md`, inward dependency rules from `component-dependency.md`, and governance from `decisions.md`. Hard edges are justified by `requirements.md` and the explicit story prerequisites in `stories.md`.
