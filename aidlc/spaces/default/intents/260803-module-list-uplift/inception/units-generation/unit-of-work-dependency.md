# Unit of Work Dependency - W4-01 Module List-Detail Uplift

## Source Alignment

This topology is derived from approved `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`, together with the approved answers in `units-generation-questions.md`. It mirrors the Application Design rule that presentation consumes shared platform contracts, BFFs consume public provider ports, and services own their data. It models W4 implementation dependencies only; W2-02 and other provider contract exits remain external blockers rather than fictitious W4 units.

## Machine-Readable Dependency DAG

```yaml
units:
  - name: platform-reference-route-foundation
    depends_on: []
  - name: reference-data-operational-completion
    depends_on: [platform-reference-route-foundation]
  - name: charge-agreements-operational-uplift
    depends_on: []
  - name: container-journeys-booking-uplift
    depends_on: []
```

The block declares every unit exactly once, uses direct dependencies only, contains no self-reference, and is acyclic.

## Directed Edges and Rationale

| Dependent unit | Depends on | Contract produced by prerequisite | Why this is a real dependency |
| --- | --- | --- | --- |
| U02 `reference-data-operational-completion` | U01 `platform-reference-route-foundation` | Executable Reference canonical route/base path, provider-backed set/record read, current-request authorization, typed read/invalid-query outcome, safe list return, and direct-refresh contract | Reference depth extends the same Reference route/BFF/state boundary rather than recreating it |

U01, U03, and U04 are roots. Charge and CMM consume W2-02's published platform contract directly and do not depend on Reference implementation. Their domain source, provider, persistence, and deployable responsibilities do not require one another. A preferred human delivery sequence is intentionally absent.

## External Blocking Dependencies

| External dependency | Owner | Consuming units | Exit evidence |
| --- | --- | --- | --- |
| Released shared `PlatformShell`, route registry, tokens, session/auth and required `@erp/ui` primitives | W2-02 platform owner | U01-U04 | Published package/API, consumer integration tests, one landmark/nav tree at all prefixes |
| Exact current-request capabilities, including CMM read/capture | Identity owner | U01-U04 | Registration/policy/deny/spoof/outage contract tests |
| Provider-backed Reference history and persisted freshness metadata | Reference owner | U02 | Detail/history and outage fixtures with source/time |
| Agreement/rate Draft or pending filters and bounded pagination | Charge owner | U03 | Independent provider/BFF contract tests per Approval Queue segment |
| Provider-backed D&D fields when absent | Charge/D&D owner | U03 | Exact field mapping and live fixture; otherwise truthful unavailable state |
| CMM v2 media, assertion verification, `timelineV1`, and capture outcome mapping | CMM owner | U04 | Producer/consumer compatibility and security/idempotency contract tests |
| Listener poison handling, bounded retry, DLQ/replay ownership | Booking/CMM/platform owners | U04 and intent exit | Executable operator contract and live evidence, or an explicitly approved bounded change |

External blockers never permit a local shell/theme/shared-component fork, browser authority, client lifecycle simulation, new shared database, or new Kafka topic.

## Integration Points Between Units

| Producer/authority | Consumer | Interface | Failure rule |
| --- | --- | --- | --- |
| W2-02 platform contract | U01-U04 domain apps | Shared `PlatformShellProps`, route registry, session/config and edge/base-path rules | Missing contract blocks each consumer independently; no local substitute |
| Approved Application Design contracts | U01-U04 BFF/pages | `ReadResult<T>`, `MutationResult<T>`, invalid-query transport, safe return/origin policy | Each unit implements its owned adapter; reject unknown/duplicate keys before provider and preserve typed outcomes |
| Reference service | U03 Charge BFF | Bounded active option query/result/port over service REST | Denied/unavailable/cardinality remain distinct; no app import/client merge |
| Reference service | U04 CMM BFF | Active location service REST | Raw authorized IDs may render; capture is disabled if active validation is unavailable |
| CMM service | U04 CMM app and shell Booking adapter | V2 Journey/timeline/capture/by-Booking HTTP contracts | Browser never supplies actor/trust headers or computes lifecycle/timeline |
| Booking and CMM services | U04 UI | Existing Kafka/outbox/consumer evidence | Persisted, published, delivered, and Booking-applied are separate outcomes |

## Parallel Development Opportunities

U01, U03, and U04 form an initial antichain because they have no W4 dependency edges. After U01, U02 becomes eligible; U02, U03, and U04 then remain mutually independent. Shared package, edge, Identity, Compose, live-browser, and audit changes still require coordinated integration and a serialized final acceptance reservation.

This section identifies valid topology only. It does not recommend that concurrency, select a critical path, or determine which unit should ship first; Stage 2.8 Delivery Planning owns those economic choices.

## Acyclicity and Boundary Verification

- Nodes: 4; direct edges: 1; roots: 3 (`platform-reference-route-foundation`, `charge-agreements-operational-uplift`, `container-journeys-booking-uplift`).
- U01 reaches only U02; U03 and U04 remain independent roots; no cycle exists.
- Every dependency points from a consumer to a prerequisite contract.
- No domain frontend imports another domain frontend, and no unit writes another service's database.
- The Booking/CMM Kafka runtime choreography remains a documented runtime cycle inside U04, not a unit-DAG or source-code cycle.

## Topology Review Checklist

- [x] Every declared unit appears exactly once in the YAML block.
- [x] Every `depends_on` value names a declared unit.
- [x] No self-dependency or cycle exists.
- [x] Only real implementation prerequisites are edges.
- [x] Parallel opportunity is described without selecting an implementation order.
- [x] External blockers have owners and evidence exits.
- [x] Shared shell, tokens, and `@erp/ui` ownership remain with W2-02.
