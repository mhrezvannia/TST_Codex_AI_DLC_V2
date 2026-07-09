# Security Requirements - U05

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

All endpoints validate input, call authorization through U03 with the exact permission string below, echo/generate correlation IDs, and normalize errors without leaking stack traces.

## Endpoint Permissions

| API behavior | Required permission |
| --- | --- |
| List/search agreements | `charge-agreement/agreement:list` |
| Read agreement detail, terms, activity, or active lookup | `charge-agreement/agreement:read` |
| Create draft agreement | `charge-agreement/agreement:create` |
| Update header, validity window, parties, or charge lines | `charge-agreement/agreement:update` |
| Update rate terms | `charge-agreement/rate-term:update` |
| Submit for approval | `charge-agreement/agreement:submit` |
| Withdraw submitted agreement | `charge-agreement/agreement:withdraw` |
| Approve agreement | `charge-agreement/agreement:approve` |
| Reject agreement | `charge-agreement/agreement:reject` |
| Activate agreement | `charge-agreement/agreement:activate` |
| Expire agreement | `charge-agreement/agreement:expire` |
| Read audit/activity history | `charge-agreement/audit:read` |
| Read customer, charge, currency, location, commodity, and lane reference data | `shared-platform/reference-data:read` |

## Threat Notes

Status action endpoints must not rely on UI disablement alone; backend enforces state transitions.
