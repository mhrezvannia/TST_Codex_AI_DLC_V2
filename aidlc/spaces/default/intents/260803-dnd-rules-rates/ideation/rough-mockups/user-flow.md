# User Flow - W3-01 D&D Rules & Rates

**Inputs:** [intent statement](../intent-capture/intent-statement.md), [scope document](../scope-definition/scope-document.md), and [intent backlog](../scope-definition/intent-backlog.md)

## Happy path

```text
[Charge Agreements / D&D Rules & Rates]
                |
                v
[Filter or search rules] --> [No results? Show empty state and clear filters]
                |
                v
[Open active rule or Create rule]
                |
                v
[Enter terms and qualifiers]
                |
                v
[Define progressive bands + port-local calendar]
                |
                v
[Validate draft] -- validation error --> [Keep inputs, focus summary/field]
                |
                v
[Save/activate allowed version]
                |
                v
[Preview calculation] --> [Explanation: source versions, days, bands, amount]
                |
                v
[Copy evidence or return to list]
```

Text fallback: a Pricing Analyst enters the existing Charge Agreements workspace, finds or creates a D&D rule, supplies qualifiers, bands and calendar, corrects any validation errors without losing work, saves the permitted version, and opens an explanation that identifies every source term and calculation step.

## Guardrails and exception paths

| Trigger | Operator experience | Product boundary |
| --- | --- | --- |
| No applicable rate/agreement | Explain why no result is available and identify the missing criteria. | No invented fallback price. |
| Calendar missing/unsupported | Block or return a declared fallback reason, with provenance visible. | Do not silently use UTC. |
| Overlapping/gapped bands | Inline error plus summary; save is blocked. | No ambiguous calculation. |
| Existing approved version | Create a successor rather than edit historical terms. | Preserve W2-03/version attribution. |
| Provider unavailable | Stable error/retry state and retained draft/input. | No direct Booking persistence access. |

## Information architecture

1. Charge Agreements module route.
2. D&D Rules & Rates list with filter/search and permission-aware create action.
3. Versioned rule detail with Terms, Progressive bands, Calendar and Evidence tabs.
4. Calculation explanation as a contextual evidence panel, not a separate dashboard.

## Accessibility flow requirements

The keyboard path follows visual reading order: skip link, shared navigation, page heading, filters, table, row action, detail tabs, form fields, validation summary, primary action, and explanation trigger. All statuses pair text with semantic styling; dialogs and disclosures have explicit focus management and live updates are announced appropriately.

