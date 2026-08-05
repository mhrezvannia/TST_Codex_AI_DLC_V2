# Unit-to-Story Map - W1-01 Booking Quote-to-Cash

## Coverage Matrix

| Story | Primary vertical unit | Supporting outcomes carried forward | Requirement coverage |
|---|---|---|---|
| US-W1-001 Create and reopen | `booking-draft-skeleton` | None | FR-W1-001; NFR-W1-008 |
| US-W1-002 Validate references | `reference-validation` | Persisted stable draft | FR-W1-002; NFR-W1-006, NFR-W1-007 |
| US-W1-003 Trustworthy quote/manual | `agreement-pricing` | Validated Booking | FR-W1-003, FR-W1-004; NFR-W1-001, NFR-W1-006, NFR-W1-007 |
| US-W1-004 Confirm and open journey | `confirm-to-cmm-journey` | Immutable quote and stable detail | FR-W1-005-FR-W1-008, FR-W1-011, FR-W1-013; NFR-W1-003-NFR-W1-006 |
| US-W1-005 See returned status | `returned-status-detail` | Confirmed Booking and opened CMM journey | FR-W1-009, FR-W1-010; NFR-W1-002, NFR-W1-006, NFR-W1-008, NFR-W1-010 |
| US-W1-006 Replay/restart safety | `replay-restart-safety` | Complete two-hop path and persisted UI state | FR-W1-012; NFR-W1-003-NFR-W1-005 |
| US-W1-007 Accept live release | `live-release-acceptance` | All six prior observed outcomes | FR-W1-013, FR-W1-014; NFR-W1-001, NFR-W1-002, NFR-W1-009, NFR-W1-010 |

## Story Work Within Each Unit

### `booking-draft-skeleton`

US-W1-001 crosses UI, BFF, API, domain, migration/persistence, restart, and stable detail rendering. Its live observation is the walking skeleton for all later slices.

### `reference-validation`

US-W1-002 extends the real draft path through Reference Data and back into persisted/UI command state, including inactive and unavailable failures.

### `agreement-pricing`

US-W1-003 owns the executable pricing contract and extends the real UI path through Booking and Charge persistence to either a complete immutable quote or explicit manual outcome.

### `confirm-to-cmm-journey`

US-W1-004 owns the canonical confirmation contract and extends the priced UI path through Booking's atomic outbox, real Kafka/SR, and CMM's receipt/journey/status-outbox transaction.

### `returned-status-detail`

US-W1-005 owns the canonical status contract and extends the opened journey through CMM publication, real Kafka/SR, Booking's ordered projection/API, and visible detail state.

### `replay-restart-safety`

US-W1-006 exercises the complete two-hop path under duplicate, stale, out-of-order, rollback, DLT replay, migration, and restart conditions, ending at the stable Booking UI and databases.

### `live-release-acceptance`

US-W1-007 drives all preceding outcomes continuously and adds blocking quality, exact record/database inspection, performance samples, accessible browser evidence, and both intent audits.

## Cross-Cutting Contract and File Ownership

- `agreement-pricing` owns pricing OpenAPI/Pact/example/catalog sections and Charge migration files.
- `confirm-to-cmm-journey` owns `booking.confirmed` schema/resources/serde/catalog sections and CMM migration files.
- `returned-status-detail` owns `containermovement.status` schema/resources/serde/catalog sections.
- `booking-draft-skeleton` owns the single Booking V1/V2 migration chain used by all Booking slices; later units own behavior and tests, not competing migration files.
- Catalog/AsyncAPI files are touched in DAG order, preserving prior slice entries; no parallel unit co-owns the same section.

## Coverage Verification

- Every story US-W1-001 through US-W1-007 has exactly one primary vertical unit.
- Every unit owns one user/reviewer outcome observable on the running stack.
- All FR-W1-001 through FR-W1-014 and NFR-W1-001 through NFR-W1-010 appear in the matrix or the unit live DoD.
- No contract, backend, frontend, migration, or evidence layer is accepted as a standalone unit.

## Source Coverage

The map carries component ownership from `components.md`, application interfaces from `component-methods.md`, runtime boundaries from `services.md`, dependency constraints from `component-dependency.md`, and governance from `decisions.md`. Requirement IDs come from `requirements.md`; story names, criteria, and prerequisites come from `stories.md`.
