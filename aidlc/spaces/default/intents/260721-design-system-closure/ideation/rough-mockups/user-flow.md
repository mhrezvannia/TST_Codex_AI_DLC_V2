# Booking Closure User Flow

This flow follows intent-statement.md, scope-document.md, and intent-backlog.md and preserves the existing Booking reference journey.

## Core Flow Diagram

```text
+------------------+
| Enter Booking    |
+------------------+
         |
         v
+------------------+
| Booking List     |
+------------------+
         |
         v
+------------------+
| Filter or Choose |
+------------------+
     /       \
    v         v
+--------+ +--------+
| Create | | Open   |
+--------+ +--------+
    |         |
    v         v
+------------------+
| Booking Detail   |
+------------------+
         |
         v
+------------------+
| Inspect Evidence |
+------------------+
```

Text fallback: enter Booking, use the list to filter and open an existing booking or begin creation, complete the form when creating, arrive at the canonical detail route, then inspect identity, status, lifecycle evidence, and permitted actions.

## Primary Flow

**Persona:** Booking desk or customer-service operator.

**Trigger:** Select Booking in the shared authenticated navigation.

1. List loading state resolves to results, empty, denied, degraded, or retry state.
2. Operator filters/searches and opens a record, or selects Create booking.
3. For create: complete labelled fields and reference lookups; resolve validation; submit once.
4. System announces pending and success/error without losing values.
5. Existing or newly created booking opens in the canonical detail route.
6. Operator scans identity/status, summary facts, lifecycle evidence, and available actions.

**Success outcome:** The operator completes or inspects the Booking task without leaving the shared shell, and every visible application primitive/state can be proven through @erp/ui and live evidence.

## Recovery Paths

- No filter match → retain query, show EmptyState, reset filters.
- Service unavailable → retain context, show retry; do not present a blank table or raw error.
- Validation failure → retain values, announce summary, focus first invalid field.
- Reference lookup failure → keep other form data and retry only the failed lookup.
- Submission failure → prevent duplicate creation, preserve inputs, allow safe retry.
- Permission denied/not found → show distinct state and canonical return path.
- Destructive/irreversible action → explicit Dialog with scope, safe Escape behavior, and trigger focus restoration.

## Information Architecture

- Global level: shared top bar and canonical module navigation.
- Module level: Booking route metadata and optional contextual journey ribbon.
- Page level: one h1, compact commands, task content, secondary evidence.
- Record level: identity and status first; summary and workflow second; technical audit details last and collapsed.

## Accessibility Flow

The keyboard path begins with skip-to-main, follows visible reading order, never enters a trap outside an active Dialog, and restores focus after overlays. Status changes use live regions; focus does not move unexpectedly after filtering; validation moves only when submission is blocked.
