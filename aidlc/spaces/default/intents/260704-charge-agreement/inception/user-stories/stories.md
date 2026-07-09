# User Stories - Charge & Customer Agreement

## Story Map

| Story | Persona | Priority | Requirements |
| --- | --- | --- | --- |
| US-1 | Priya | Must | FR-3.1 |
| US-2 | Priya | Must | FR-1.1, FR-3.3 |
| US-3 | Priya | Must | FR-2.1 to FR-2.5 |
| US-4 | Omar | Must | FR-1.3, FR-1.4, NFR-5 |
| US-5 | Priya/Omar | Must | FR-1.5, FR-1.6 |
| US-6 | Bea | Must | FR-4.1 to FR-4.4 |
| US-7 | Priya | Must | FR-5.1, FR-5.3 |
| US-8 | Nina/Sam | Should | FR-6.1 to FR-6.3 |

## US-1 Search Agreements

As Priya, I want to search and filter customer agreements, so that I can quickly find the agreement I need to review or edit.

Priority: Must Have

Acceptance criteria:

```gherkin
Given agreements exist with different customers, statuses, trade lanes, and validity dates
When I filter by customer, status, trade lane, or valid-on date
Then the agreement list shows only matching agreements
And the list includes agreement number, customer, status, valid from, valid to, and an open action
```

INVEST: Independent, valuable, testable, small enough for list/search implementation.

## US-2 Create Draft Agreement

As Priya, I want to create a draft customer agreement, so that commercial terms can be prepared before approval.

Priority: Must Have

Acceptance criteria:

```gherkin
Given I am allowed to manage charge agreements
When I enter customer, agreement number, validity dates, trade lane, and commodity
And I save the agreement
Then the system persists a Draft agreement
And the detail page shows the saved header values and version metadata
```

INVEST: Independent first vertical slice after skeleton; valuable and testable.

## US-3 Maintain Charge Terms

As Priya, I want to add and edit charge terms on a draft agreement, so that the agreement contains structured commercial terms for Booking.

Priority: Must Have

Acceptance criteria:

```gherkin
Given a Draft agreement exists
When I add a charge term with charge code, basis, currency, amount, validity, and notes
Then the term is saved with the agreement
And missing charge code, missing currency, invalid amount, or out-of-range validity is rejected
And the form preserves my entered values after validation errors
```

INVEST: Directly maps to charge-term requirements and UI validation.

## US-4 Approve Agreement

As Omar, I want to approve a complete draft agreement, so that only valid commercial terms become available to Booking.

Priority: Must Have

Acceptance criteria:

```gherkin
Given a Draft agreement has at least one valid charge term
When I approve the agreement
Then the agreement status becomes Approved
And approvedBy and approvedAt are recorded
And the agreement can be returned by active lookup
```

Negative criteria:

```gherkin
Given a Draft agreement has no valid charge terms
When I try to approve it
Then approval is rejected
And the agreement remains Draft
```

INVEST: Testable lifecycle transition with clear value.

## US-5 Suspend or Expire Agreement

As Omar, I want to suspend or expire an approved agreement, so that Booking does not use terms that are no longer valid.

Priority: Must Have

Acceptance criteria:

```gherkin
Given an Approved agreement exists
When I suspend or expire it
Then the status changes to Suspended or Expired
And actor/timestamp metadata is recorded
And active lookup no longer returns that agreement
```

INVEST: Small status-management slice.

## US-6 Resolve Active Terms for Booking

As Bea, I want Booking to resolve active approved agreement terms by customer and shipment context, so that bookings can use authoritative commercial terms.

Priority: Must Have

Acceptance criteria:

```gherkin
Given an Approved agreement matches customer, trade lane or origin/destination, commodity, and effective date
When active lookup is requested for that context
Then the API returns the matching agreement and charge terms
```

No-match criteria:

```gherkin
Given no Approved active agreement matches the requested context
When active lookup is requested
Then the API returns a deterministic no-match response
And it does not return a server error
```

INVEST: Downstream integration story for the next module.

## US-7 Use Shared Platform Reference Data

As Priya, I want agreement fields to use Shared Platform reference data, so that customer, charge, currency, location, commodity, and lane values stay consistent.

Priority: Must Have

Acceptance criteria:

```gherkin
Given Shared Platform reference-data service is available
When I create or edit an agreement
Then selectable/reference-backed fields use Shared Platform IDs
And the Charge Agreement module does not create or mutate reference records itself
```

Fallback criteria:

```gherkin
Given the reference-data service is unavailable
When I open the agreement editor
Then the UI shows a non-destructive error
And it does not lose draft agreement input
```

INVEST: Integration-focused and testable.

## US-8 Verify Local Runtime

As Nina or Sam, I want local runtime and test evidence for Charge Agreement, so that the module is not considered complete from static artifacts alone.

Priority: Should Have

Acceptance criteria:

```gherkin
Given the Shared Platform host-runtime services are running
When I start the Charge Agreement backend and UI
Then documented health/UI/API endpoints respond
And smoke/readiness evidence includes at least one agreement lifecycle or lookup check
```

Evidence criteria:

```gherkin
Given Docker, Keycloak, Kafka, or Schema Registry are unavailable
When readiness is reported
Then those blockers are reported separately from host-runtime success
```

INVEST: Quality and operations story supporting completion evidence.

## Deferred Stories

| Story | Reason |
| --- | --- |
| Spot-rate fallback | Deferred until after Booking works. |
| Index-linked agreement terms | Advanced pricing feature outside first slice. |
| Invoice settlement | Finance workflow outside this module. |
| Carrier direct connectivity | External integration outside local MVP. |
