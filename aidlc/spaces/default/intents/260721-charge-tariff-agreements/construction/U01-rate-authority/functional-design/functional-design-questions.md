# Functional Design Questions — U01 Rate Authority

## Interaction Mode

Use the prior approved concise-batch interaction style. Recommended answers are architectural continuations, not new scope.

## Batch 1 — Domain lifecycle, conflicts, and migration ownership

### Q1. How many editable Draft versions may one stable Rate have?

- A. At most one Draft per stable Rate; a successor may be created only from an Approved version and is rejected while another Draft exists. **(Recommended)**
- B. Permit multiple parallel Draft versions and select one during approval.
- C. Permit multiple Drafts but automatically supersede older Drafts.
- X. Other.

[Answer]: A — At most one Draft per stable Rate; create a successor only from Approved and reject it while another Draft exists. (Recommended continuation applied after the response window returned no alternative.)

### Q2. How should approval overlap and concurrent-winner conflicts be classified?

- A. Return HTTP 409 `RATE_AUTHORITY_CONFLICT` for an Approved-window overlap or a competing approval winner; reserve 422 for invalid fields, references, lifecycle, or incomplete applicability. **(Recommended)**
- B. Return 422 for a pre-existing overlap and 409 only for a race detected after optimistic locking.
- C. Return 422 for every approval refusal.
- X. Other.

[Answer]: A — Return 409 `RATE_AUTHORITY_CONFLICT` for overlap or a competing approval winner; reserve 422 for invalid data, references, lifecycle, or applicability. (Recommended continuation applied after the response window returned no alternative; iteration-1 review reconciled the previously inconsistent upstream `component-methods.md` row to this canonical matrix.)

### Q3. What is U01's behavioral responsibility for its owned V3/V4 migration files?

- A. U01 authors and migration-tests the full V1-V4 chain, but exposes only V2 rate behavior; V3/V4 structures remain prepared and unused until U03/U04 implement their domain behavior. **(Recommended)**
- B. U01 also exposes provisional agreement and pricing behavior for V3/V4.
- C. Defer writing V3/V4 until downstream units despite U01 file ownership.
- X. Other.

[Answer]: A — U01 authors and migration-tests V1-V4 but exposes only V2 rate behavior; V3/V4 remain prepared until U03/U04 activate them. (Recommended continuation applied after the response window returned no alternative.)

## Batch 2 — Applicability, business date, and authorization

### Q4. How should destination be handled for `LOCAL` / POL THC rates?

- A. Omit it in UI/read models and reject a non-null destination at the API/domain boundary; persist `NULL` and exclude it from the normalized approval key. **(Recommended)**
- B. Accept and persist it but ignore it during matching.
- C. Accept it only as display metadata.
- X. Other.

[Answer]: A — Omit destination from LOCAL UI/read models, reject non-null API input, persist `NULL`, and exclude it from the approval key.

### Q5. How should Scheduled/Effective/Expired presentation choose its evaluation date?

- A. List/detail queries accept optional ISO `asOf`; default to the server's UTC calendar date and return the evaluated date in the response. Pricing remains strictly tied to `requestedDepartureDate`. **(Recommended)**
- B. Require `asOf` on every administrative query.
- C. Persist a mutable effective status instead of deriving it.
- X. Other.

[Answer]: A — Accept optional ISO `asOf`, default to server UTC date, and echo the evaluated date; pricing still uses only `requestedDepartureDate`.

### Q6. How should U01 enforce human permissions?

- A. Reuse the existing Charge `AuthorizationPort` with explicit read/create/update/approve/successor actions; BFF derives subject/capabilities from the signed session and never accepts browser actor authority. **(Recommended)**
- B. Add a Rate-specific authorization service.
- C. Trust the BFF and omit service-side authorization.
- X. Other.

[Answer]: A — Reuse the existing Charge `AuthorizationPort` shape, with signed-session actor/capabilities at the BFF and service-side action enforcement. Iteration-1 review made the concrete mapping resource `charge-rates` with actions `read`, `create`, `update`, `approve`, and `create-successor`, backed by a fail-closed Rate-specific adapter rather than the permissive baseline bean.

## Batch 3 — UI workflow and observable scenarios

### Q7. Which edit and approval interaction should the rate pages use?

- A. Full-page Draft edit at `/charge-agreements/rates/[rateId]?mode=edit`; approval uses a focused confirmation dialog with a Charge-local Tab-trap/trigger-restore wrapper around the existing shared Dialog. **(Recommended)**
- B. Inline table editing and inline approval.
- C. Separate `/edit` route and no confirmation dialog.
- X. Other.

[Answer]: A — Use full-page `?mode=edit` and a focused approval confirmation dialog with a Charge-local Tab-trap/trigger-restore wrapper.

### Q8. What stable list contract should preserve filter and pagination context?

- A. URL parameters `q`, `category`, `lifecycle`, `asOf`, `originId`, `destinationId`, `equipmentTypeId`, `page`, and `size`, with deterministic `updatedAt DESC, rateId ASC`; row links preserve the return query. **(Recommended)**
- B. Client-only filters without URL persistence.
- C. Server filters but no deterministic secondary sort or return context.
- X. Other.

[Answer]: A — Use named URL filters, deterministic `updatedAt DESC, rateId ASC`, and preserved return-query context.

## Mandatory Ambiguity Scan

- Business logic: approval uniqueness, successor creation, and derived lifecycle date are covered by Q1, Q2, and Q5.
- Workflows and frontend: routed list/create/detail/edit plus approval focus behavior are covered by Q7 and Q8.
- Domain/data: category applicability, null destination, immutable versions, and V1-V4 migration ownership are covered by Q3 and Q4.
- Validation/errors/integration: 409 versus 422 semantics, reference validation, and existing authorization/BFF seams are covered by Q2 and Q6.
- Scenarios: Draft create/edit, approval, overlap/concurrency, successor, boundary dates, denied/read-only, loading/empty/error, and responsive/a11y states are required by upstream stories and need no further scope choice.

No unresolved question may broaden U01 into agreement behavior, pricing-provider behavior, shared-shell/UI redesign, or release acceptance.
