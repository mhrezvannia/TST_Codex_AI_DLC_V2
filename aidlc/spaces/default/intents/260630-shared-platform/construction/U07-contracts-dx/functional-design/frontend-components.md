# Frontend Components - U07 Published Contracts and Developer Experience

## Source Trace

This U07 frontend impact design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U07 provides read-only contract/developer views for `apps/reference-data`. U06 owns the surrounding app shell and BFF mechanics; U07 defines the contract catalog view models and UI behavior.

## Contract View Routes

| Route | Purpose |
|---|---|
| `/contracts` | Contract catalog overview. |
| `/contracts/apis` | OpenAPI contract list for `reference-data-service` and `identity-service`. |
| `/contracts/apis/[contractId]` | API operation list, version, examples, and compatibility status. |
| `/contracts/events` | Avro event contract list for nine reference-change event types. |
| `/contracts/events/[contractId]` | Event envelope, payload fields, examples, schema version, compatibility status. |
| `/contracts/findings` | Review and compatibility findings safe for display. |

These views are read-only and must not create downstream runtime screens.

## Component Hierarchy

```text
ContractCatalogPage
  -> ContractStatusSummary
  -> ContractTabs
       -> ApiContractsTab
            -> ContractList
            -> ApiContractDetail
            -> OperationTable
            -> ExamplePanel
       -> EventContractsTab
            -> EventContractList
            -> EventEnvelopePanel
            -> EventPayloadPanel
            -> ExamplePanel
       -> CompatibilityTab
            -> CompatibilityStatusTable
            -> FindingList
       -> ExamplesTab
            -> ExampleBrowser
```

## Core Components

| Component | Responsibility | State/props |
|---|---|---|
| `ContractCatalogPage` | Page frame for contract/developer experience. | ContractViewModel, permission/read state. |
| `ContractStatusSummary` | Aggregate status across API/event contracts. | Compatible, incompatible, failed, unknown counts. |
| `ContractTabs` | Accessible tablist for OpenAPI, Avro events, compatibility, examples. | Active tab, tab labels. |
| `ContractList` | Contract list with owner, version, status, updated date. | APIContract or EventContract summaries. |
| `ApiContractDetail` | API contract details and operation index. | APIContract, operations, examples. |
| `OperationTable` | OpenAPI operations and methods/paths. | Operation rows, status, examples. |
| `EventEnvelopePanel` | Common envelope fields and explanation. | Envelope field descriptors. |
| `EventPayloadPanel` | Entity-specific Avro payload field table. | Payload fields, schema version. |
| `CompatibilityStatusTable` | Diff/schema/message-pact/provider status evidence. | CompatibilityCheckResult rows. |
| `FindingList` | Review and compatibility findings. | Findings, severity, status. |
| `ExamplePanel` | Request/response or event payload examples. | Example payload, copy action, validation status. |

## Interaction Rules

FBR-U07-001: Contract views are read-only.

FBR-U07-002: Compatibility statuses must use text labels and accessible names, not color alone.

FBR-U07-003: Code and JSON examples must provide copy actions with accessible labels.

FBR-U07-004: Tabs must follow accessible tablist/tabpanel behavior or a native equivalent.

FBR-U07-005: Contract views must distinguish API contracts, event contracts, examples, compatibility status, and findings.

FBR-U07-006: Any future downstream module reference must be labeled as a future consumer, not as implemented runtime scope.

## BFF Read Models

| BFF model | Purpose |
|---|---|
| `ContractCatalogSummaryResponse` | Catalog version and aggregate status. |
| `ApiContractListResponse` | API contract list. |
| `ApiContractDetailResponse` | One OpenAPI contract, operations, examples, status. |
| `EventContractListResponse` | Event contract list. |
| `EventContractDetailResponse` | One Avro contract, envelope, payload, examples, status. |
| `CompatibilityFindingResponse` | Findings and check evidence safe for display. |

BFF handlers may read static generated contract artifacts or a local catalog index. They must not call downstream runtime services.

## Accessibility Requirements

- Each contract view has one h1 and logical h2/h3 hierarchy.
- Contract tables use captions and column headers.
- Compatibility statuses are text based.
- Copy buttons expose explicit accessible names.
- Code examples remain readable at 200 percent zoom and have text alternatives for long payload explanations.
- Findings can be filtered without losing keyboard focus.

## Non-Goals

- No editing of contract source artifacts through the UI.
- No downstream runtime dashboards.
- No replacement for source-controlled contract files.
- No hidden compatibility failures; unknown and failed statuses remain visible.
