# Component Methods - Shared Platform Local Functionality

## Context

This public-interface design consumes `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. Method signatures are high-level contracts for implementation units, not detailed business-rule designs.

## TypeScript BFF and UI Interfaces

### Auth Session

```ts
type SessionSummary = {
  isAuthenticated: boolean;
  subject: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  correlationId: string;
  authMode?: "keycloak" | "local-bypass";
};

function safeSessionSummary(request: Request): SessionSummary;
function isAuthBypassEnabled(): boolean;
function createLocalSession(subjectId: string): AuthSession;
```

Errors:

- Missing session returns `isAuthenticated: false`, not an exception.
- Non-local bypass in future profiles must fail configuration validation before startup.

### Reference Data BFF Client

```ts
type BffContext = {
  session: SessionSummary;
  correlationId: string;
  baseUrls: {
    identityService: string;
    referenceDataService: string;
  };
};

async function getReferenceDataPermissions(ctx: BffContext): Promise<PermissionState>;
async function listReferenceSets(ctx: BffContext): Promise<ReferenceSetDescriptor[]>;
async function listReferenceRecords(ctx: BffContext, query: ReferenceRecordQuery): Promise<ReferencePageView>;
async function getReferenceRecord(ctx: BffContext, set: string, id: string): Promise<ReferenceRecordView>;
async function createReferenceRecord(ctx: BffContext, command: ReferenceMutationDraft): Promise<ReferenceMutationResult>;
async function updateReferenceRecord(ctx: BffContext, set: string, id: string, version: number, command: ReferenceMutationDraft): Promise<ReferenceMutationResult>;
async function deactivateReferenceRecord(ctx: BffContext, set: string, id: string, reason: string): Promise<ReferenceMutationResult>;
async function getReferenceRecordHistory(ctx: BffContext, set: string, id: string): Promise<ReferenceChangeView[]>;
async function getPublicationStatuses(ctx: BffContext, query: PublicationStatusQuery): Promise<PublicationStatusView[]>;
```

Error handling:

- `401`: no valid session.
- `403`: authorization denial from identity-service or reference-data-service.
- `409`: stale version conflict.
- `422`: backend validation failure mapped to field errors.
- `503`: dependency unavailable with correlation id.

### Workbench UI Components

```ts
function PermissionBanner(props: PermissionBannerProps): JSX.Element;
function ReferenceSetNavigator(props: ReferenceSetNavigatorProps): JSX.Element;
function RecordsTable(props: RecordsTableProps): JSX.Element;
function MutationDrawer(props: MutationDrawerProps): JSX.Element;
function DeactivateDialog(props: DeactivateDialogProps): JSX.Element;
function PublicationStatusPanel(props: PublicationStatusPanelProps): JSX.Element;
function ReadinessPanel(props: ReadinessPanelProps): JSX.Element;
```

Interaction expectations:

- Components receive permission and status state explicitly.
- Components do not fetch Java services directly.
- All mutation components expose loading, validation-error, stale-version, service-error, and success states.

## Java Service Interfaces

### Identity Application Service

```java
AuthorizationDecision authorize(AuthorizationRequest request);
EffectivePermissionsView effectivePermissions(String tokenReference);
AuthorizationDecision assignRole(AssignRoleCommand command);
List<Role> roleCatalog();
HealthDocument health();
```

Error handling:

- Unknown subject returns deny for `authorize`.
- Unknown subject throws for `effectivePermissions` and should be mapped by the controller/BFF to an authentication error.
- Stale assignment returns an authorization denial result with reason code.

### Reference Data Application Service

```java
ReferencePage list(ReferenceSet set, boolean includeInactive, int page, int size);
ReferenceRecord detail(ReferenceSet set, ReferenceId id);
ReferenceRecord create(ReferenceMutationCommand command);
ReferenceRecord update(ReferenceId id, long expectedVersion, ReferenceMutationCommand command);
ReferenceRecord deactivate(ReferenceSet set, ReferenceId id, String reason, String actorSubjectId, String correlationId);
ValidationResult validateOnly(ReferenceMutationCommand command);
List<ReferenceChange> history(ReferenceSet set, ReferenceId id);
List<EventPublicationStatusView> outboxStatuses(OutboxStatusQuery query);
List<OutboxEvent> claimOutboxBatch(String workerId, int batchSize);
PublishBatchResult publishOutboxBatch(String workerId, int batchSize);
HealthDocument health();
```

Error handling:

- `SecurityException` maps to `403` with correlation id.
- `IllegalArgumentException` from validation maps to `422` with field/detail payload where possible.
- stale reference version maps to `409`.
- missing record maps to `404`.
- publisher unavailable maps to retryable publication state, not mutation failure after commit.

## Persistence Ports

```java
interface ReferenceRepository {
  Optional<ReferenceRecord> findById(ReferenceSet set, ReferenceId id);
  List<ReferenceRecord> findBySet(ReferenceSet set, boolean includeInactive);
  ReferenceRecord save(ReferenceRecord record);
  void rejectDuplicateActiveCode(ReferenceSet set, ReferenceCode code);
}

interface ReferenceChangeRepository {
  void append(ReferenceChange change);
  List<ReferenceChange> findByRecord(ReferenceSet set, ReferenceId id);
}

interface OutboxRepository {
  void enqueue(OutboxEvent event);
  List<OutboxEvent> claimAvailable(String workerId, Instant now, int batchSize);
  OutboxEvent save(OutboxEvent event);
  List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query);
}
```

Implementation requirement:

- In-memory adapters remain for tests.
- Local runtime adapters persist to PostgreSQL so restart does not erase reference, authorization, or outbox state.

## Event and Contract Interfaces

```java
interface SchemaRegistryPort {
  void ensureRegistered(String eventType, String schemaVersion);
}

interface ReferenceEventPublisherPort {
  BrokerMetadata publish(ReferenceEventEnvelope envelope, ReferenceEventPayload payload);
}
```

```ts
async function validateOpenApiProvider(baseUrl: string): Promise<ContractCheckResult>;
async function validateAvroCompatibility(schemaDir: string): Promise<ContractCheckResult>;
async function readContractCatalog(): Promise<ContractCatalogView>;
```

Error handling:

- Schema Registry unavailable produces retryable outbox status.
- incompatible schema produces failed contract evidence and should block readiness.

## Seed Interfaces

```ts
function validateSeedPack(pack: unknown): SeedValidationResult;
function buildSeedRunSummary(pack: SeedPack, existingFingerprints?: Map<string, string>, correlationId?: string): SeedRunSummary;
async function applySeedPack(pack: SeedPack, clients: SeedApplyClients): Promise<SeedRunSummary>;
async function waitForHealth(checks: HealthCheck[], options?: WaitOptions): Promise<void>;
```

Apply behavior:

- Role/user data uses Keycloak/admin or identity-service APIs.
- Reference records use reference-data-service APIs.
- Re-run is idempotent through natural-key lookup and fingerprints.

## Review

Verdict: READY

Inline fallback review finds the method contracts aligned with `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. The interfaces name the current app and service boundaries and keep detailed rules for later Functional Design.

