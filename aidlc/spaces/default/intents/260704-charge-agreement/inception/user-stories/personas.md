# Personas - Charge & Customer Agreement

## Primary Personas

### Priya, Pricing Analyst

| Attribute | Detail |
| --- | --- |
| Role | Internal commercial/pricing user. |
| Goal | Create and maintain accurate customer agreements and charge terms. |
| Pain points | Spreadsheet-driven rates are hard to validate, approve, and reuse in Booking. |
| Context | Works mainly on desktop in repeated operational workflows. |
| Priority | Primary. |

### Omar, Commercial Manager

| Attribute | Detail |
| --- | --- |
| Role | Approver/accountable commercial lead. |
| Goal | Approve only complete, valid customer agreements. |
| Pain points | Needs confidence that terms are valid before Booking uses them. |
| Context | Reviews agreement detail and status metadata. |
| Priority | Primary. |

### Bea, Booking User

| Attribute | Detail |
| --- | --- |
| Role | Future downstream consumer in Customer Booking. |
| Goal | Resolve active approved terms for a customer and shipment context. |
| Pain points | Placeholder or stale pricing terms break booking quality. |
| Context | Will consume the active lookup API in a later module. |
| Priority | Secondary for this module, primary for handoff readiness. |

## Supporting Personas

### Nina, Platform Operator

| Attribute | Detail |
| --- | --- |
| Role | Platform/local runtime operator. |
| Goal | Verify the module runs locally and reports blockers honestly. |
| Pain points | Docker/Compose issues can be confused with product failures. |
| Priority | Supporting. |

### Sam, QA Engineer

| Attribute | Detail |
| --- | --- |
| Role | Quality owner. |
| Goal | Validate lifecycle, UI, API, and active lookup with repeatable tests. |
| Pain points | Vague requirements produce untestable workflows. |
| Priority | Supporting. |

## Persona Relationships

Priya creates and edits agreements. Omar approves them. Bea later consumes approved terms through Booking. Nina and Sam verify the module is runnable, testable, and safe to integrate.
