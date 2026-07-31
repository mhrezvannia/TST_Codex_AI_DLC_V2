# Component Methods — W2-02 Design-System Closure

## Design Basis and Conventions

These public interfaces implement `requirements.md` and `stories.md` while preserving `architecture.md`, `component-inventory.md`, and `team-practices.md`. Existing signatures are retained where identified by the code graph. Proposed helper names describe testable seams and may be adjusted during Functional Design without changing ownership or behavior.

TypeScript uses explicit inputs/results and preserves existing Next.js App Router conventions. Expected operational failures return normalized result/state objects or existing HTTP responses; programming errors remain test failures. No method below authorizes new backend rules or storage.

## C1 — Shared UI Foundation Interfaces

```ts
type AsyncState = "loading" | "empty" | "error" | "denied" |
  "populated" | "pending" | "success" | "degraded";

type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";
```

- Existing primitives retain their published React prop interfaces.
- Any new generic state prop must accept accessible name/message, action callback where applicable, busy/live-region semantics, and standard `className`/DOM forwarding without Booking fields.
- Theme/token APIs remain CSS-variable/package exports; applications do not call a runtime palette factory.

## C2 — Authenticated Shell Frame

Existing conceptual interface:

```ts
function ShellFrame(props: {
  activePath: "home" | "booking";
  breadcrumbs: string[];
  children: React.ReactNode;
  session: SessionSummary;
}): React.ReactElement;
```

Closure-compatible extension, only if required by existing route metadata:

```ts
type WorkflowContext = {
  module: "booking";
  stage?: "create" | "validate" | "price" | "confirm" | "detail";
};
```

Errors in session/authorization continue through existing shell behavior. Booking must not instantiate ShellFrame inside routed content.

## C3 — Canonical Booking Route Compositions

Proposed domain component interfaces:

```ts
function BookingListView(props: {
  result: ShellBookingLoad;
  query: BookingListQuery;
}): React.ReactElement;

function BookingCreateForm(): React.ReactElement;

function BookingDetailView(props: {
  result: ShellBookingDetailLoad;
}): React.ReactElement;

function BookingLifecycleActions(props: {
  bookingId: string;
  status: ShellBookingStatus;
  validation: ValidationSnapshot;
}): React.ReactElement;
```

Purposes:

- `BookingListView`: maps loading/populated/empty/error/denied/degraded result states to shared primitives without changing filter/query semantics.
- `BookingCreateForm`: preserves existing field mapping, lookup, idempotent submission, validation, value retention, and canonical navigation; shared presentation only.
- `BookingDetailView`: composes identity, status, facts, lifecycle, secondary audit disclosure, and section-level recovery.
- `BookingLifecycleActions`: invokes existing same-origin validate/price/confirm handlers, prevents duplicate commands, and exposes accessible pending/error/success state.

Component failures must present a named recoverable state; raw exceptions, silent catch, blank output, and detached fallback pages are not public behavior.

## C4 — Shell Booking Client and Route Adapters

Existing graph-confirmed interfaces:

```ts
async function loadShellBookings(
  query: URLSearchParams,
  cookieHeader: string,
  correlationId: string
): Promise<ShellBookingLoad>;

async function loadShellBooking(
  bookingId: string,
  cookieHeader: string,
  correlationId: string
): Promise<ShellBookingDetailLoad>;

async function forwardToBookingBff(
  request: Request,
  path: string,
  method: "GET" | "POST"
): Promise<Response>;
```

- Preserve cookies/session and correlation ID.
- Preserve cache policy and normalized non-OK payloads.
- Do not import Booking app implementation or service repositories.
- Abort/timeout/error behavior remains consistent with existing BFF contracts.

## C5 — Booking BFF Adapter

Existing graph-confirmed interface:

```ts
async function proxyBooking(
  request: Request,
  path: string,
  method: "GET" | "POST"
): Promise<Response>;
```

The method continues to derive subject/session, validate commands and body size, create/propagate correlation and idempotency metadata, enforce timeout/abort, call the configured Booking service URL, and map safe responses. It must not acquire UI responsibilities.

Standalone presentation retirement interface, if redirect is chosen instead of route deletion:

```ts
type BookingRedirectDecision = {
  destination: URL;
  status: 308;
};

function canonicalBookingRedirect(
  request: Request,
  canonicalShellOrigin: URL
): BookingRedirectDecision | null;
```

The caller supplies a trusted configured shell origin or an origin resolved from validated
forwarded host/protocol data; it is never copied from an unvalidated request header.
`null` is mandatory for `/api/**` and any non-presentation path so BFF routes can never
be redirected. Presentation mapping is limited to `/bookings`, `/bookings/new`, and
`/bookings/{bookingId}`. List redirects preserve only `page`, `pageSize`, `sort`,
`direction`, `status`, and `q`; detail redirects preserve only `created=1`;
create redirects preserve no query. Invalid/missing detail identity falls back to
`/booking`. The result uses permanent redirect semantics and must resolve to the
canonical shell origin without exposing the internal standalone port or copying
`returnTo`, absolute URLs, credentials, fragments, or unknown query keys.

## C7 — Presentation Anti-Drift Gate

Proposed verification interfaces:

```ts
type PresentationViolation = {
  file: string;
  rule: "hardcoded-color" | "local-style-system" | "undeclared-workspace-import";
  line?: number;
  detail: string;
};

function scanApplicationPresentation(root: string): PresentationViolation[];

async function runNegativeProbe(
  probe: "hardcoded-color" | "local-style-system"
): Promise<{ rejected: boolean; exitCode: number; output: string }>;
```

- Scan is read-only.
- Negative probe uses a reversible temporary fixture or guaranteed restoration and proves non-zero rejection.
- Exceptions identify shared-package ownership or an explicit semantic/test record; they are not path-wide suppressions.

## C8 — Live Acceptance Harness

Proposed test/support interfaces:

```ts
type UiEvidenceContext = {
  baseURL: string;
  commit: string;
  composeProject: "linercore-wave-a";
  viewport: { width: 375 | 768 | 1024 | 1440; height: number };
  theme: "light" | "dark";
  state: string;
};

async function assertDemoGuard(phase: "before" | "after"): Promise<void>;
async function startWaveA(): Promise<void>;
async function stopWaveA(): Promise<void>;
async function authenticateOperator(page: Page): Promise<void>;
async function runCanonicalBookingJourney(page: Page): Promise<string>;
async function arrangeBookingUiState(page: Page, state: string): Promise<void>;
async function captureUiEvidence(page: Page, context: UiEvidenceContext): Promise<void>;
async function writeEvidenceManifest(): Promise<void>;
```

Rules:

- `startWaveA`/`stopWaveA` call only `scripts/wave-a-compose.mjs`; no raw Compose project substitution.
- `assertDemoGuard` is mandatory before stack mutation and after acceptance/cleanup.
- `runCanonicalBookingJourney` uses the live backend for create → validate → price → confirm → detail.
- `arrangeBookingUiState` may use documented request interception or controlled service conditions on the running route, never a detached page.
- Every thrown assertion leaves failure artifacts and prevents audit/backlog closure.

## Error Handling Summary

| Boundary | Expected failure handling | Forbidden handling |
|---|---|---|
| UI primitive/composition | Explicit loading/empty/error/denied/degraded presentation | blank render, raw stack, color-only message |
| Shell adapter | Normalized typed result or HTTP response | direct service/database fallback |
| Booking BFF | Existing safe status/payload with correlation | auth bypass, unbounded body, lost idempotency |
| Service | Existing domain/API/event behavior | presentation-specific business branch |
| Anti-drift gate | Non-zero with file/rule evidence | warning-only closure |
| Acceptance harness | Preserve trace/screenshot/log and fail hard | swallowed process exit or waiver substitution |
