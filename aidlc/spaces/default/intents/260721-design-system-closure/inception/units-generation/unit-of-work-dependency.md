# Unit Dependency DAG — W2-02 Design-System Closure

## Topology Basis

The DAG is derived from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`, and retains full coverage of `requirements.md` and `stories.md`. Because the program defines one non-separable closure Unit, the Unit graph contains one dependency-free node. Previously merged intents are baseline inputs, not Units in this DAG.

## Machine-Readable Edge Block

```yaml
units:
  - name: booking-design-system-closure
    depends_on: []
```

## Prose DAG

```text
booking-design-system-closure
  direct Unit dependencies: none
```

The graph is acyclic by construction. It does not claim the Unit is internally unordered; it states only that no second Construction Unit must complete before this Unit can begin.

## Internal Prerequisite Relationships

These are checkpoints within the single Unit, not DAG nodes:

- Canonical Booking compositions require the applicable shared primitive/token boundary and enforcement rules.
- The real happy-path evidence requires the canonical shell presentation and preserved BFF/service seam.
- Controlled difficult-state evidence requires the running canonical route but may be authored/tested independently of production business data.
- Live acceptance requires a green pre-demo guard and wrapper-only `linercore-wave-a` operation.
- Audited closure requires completed durable evidence and a green final demo guard.
- Backlog closure requires both audits green and the W1 blocked/waived record unchanged.

## Integration Points

| Integration | Contract | Ownership constraint |
|---|---|---|
| Shell ↔ `@erp/ui` | Workspace package imports and CSS-variable tokens | Generic primitives only |
| Shell ↔ Booking BFF | Existing same-origin HTTP adapters | No app-to-app source import |
| BFF ↔ services | Existing HTTP/auth/correlation/idempotency/timeout contracts | No direct database access |
| Booking ↔ support services | Existing validation/pricing adapters | No presentation-driven contract change |
| Booking ↔ Kafka/downstream | Existing outbox/event choreography | No schema/ownership change |
| Harness ↔ runtime | Browser via canonical edge; wrapper-only Compose | Never target manager-demo project |
| Evidence ↔ audits/backlog | Requirement-indexed durable files | Close only on green |

## Parallel Development Opportunities

The one-node Unit DAG provides no parallel Unit fan-out. Within the Unit, work on generic primitive tests, lint-gate implementation, Playwright harness scaffolding, and evidence-manifest schema can proceed concurrently only when it does not create separate completion claims or violate shared-file ownership. Integration into the canonical Booking route and final live acceptance remain joint checkpoints.

This section identifies possible internal concurrency, not an implementation order or critical path. Delivery Planning owns economic sequencing.

## Deployment Relationship

`booking-design-system-closure` is embedded in existing workspace deployments and verified in an isolated local Compose stack. It creates no new deployable artifact, service, database, AWS stack, or production environment. The root acceptance harness is test/support code and is never imported by production components.
