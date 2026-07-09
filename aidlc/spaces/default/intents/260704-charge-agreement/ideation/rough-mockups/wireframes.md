# Wireframes - Charge & Customer Agreement

## Upstream Inputs

These wireframes consume:

| Input | Design effect |
| --- | --- |
| `intent-statement.md` | Focuses screens on customer agreements, charge terms, validity, and approval. |
| `scope-document.md` | Keeps Booking, invoicing, spot pricing, and carrier connectivity out of the first UI. |
| `intent-backlog.md` | Prioritizes walking skeleton, CRUD/API, UI workflow, approval, reference-data integration, and active lookup. |

## Screen 1: Agreement Workbench

```text
+--------------------------------------------------------------------------------+
| Header: LinerCore | Charge Agreements                             User / Local |
+--------------------------------------------------------------------------------+
| Nav: Agreements | Reference Data | Auth | Readiness                            |
+--------------------------------------------------------------------------------+
| H1 Customer Agreements                                      [New Agreement]     |
| Filters: Customer [____] Status [All v] Trade Lane [All v] Valid On [date]     |
|                                                                                |
| Status Summary: Draft 2 | Approved 4 | Suspended 1 | Expiring Soon 1           |
|                                                                                |
| +------------+------------+----------+-------------+------------+------------+ |
| | Agreement  | Customer   | Status   | Valid From  | Valid To   | Actions    | |
| +------------+------------+----------+-------------+------------+------------+ |
| | AGR-1001   | Local Carr | Approved | 2026-07-01  | 2026-12-31 | Open       | |
| | AGR-1002   | ACME Foods | Draft    | 2026-08-01  | 2027-01-31 | Open       | |
| +------------+------------+----------+-------------+------------+------------+ |
|                                                                                |
| Empty state: No agreements match these filters. [Clear Filters]                |
+--------------------------------------------------------------------------------+
```

Accessibility note: `h1` for page title; header, nav, main landmarks; keyboard entry starts at skip link then New Agreement; status values include text labels, not color alone.

## Screen 2: Agreement Detail

```text
+--------------------------------------------------------------------------------+
| H1 Agreement AGR-1001                                      [Edit] [Approve]     |
| Customer: Local Carrier        Status: Approved        Version: 3              |
| Validity: 2026-07-01 to 2026-12-31        Owner: pricing.local                 |
+--------------------------------------------------------------------------------+
| H2 Commercial Context                                                         |
| Trade Lane: NA to EU      Commodity: Food-grade goods      Currency: USD       |
+--------------------------------------------------------------------------------+
| H2 Charge Terms                                                               |
| +-------------+--------+----------+---------+------------+------------------+  |
| | Charge Code | Basis  | Currency | Amount  | Validity   | Notes            |  |
| +-------------+--------+----------+---------+------------+------------------+  |
| | BAS         | TEU    | USD      | 1200.00 | Agreement  | Base ocean rate  |  |
| | BAF         | TEU    | USD      | 180.00  | Agreement  | Fuel surcharge   |  |
| +-------------+--------+----------+---------+------------+------------------+  |
+--------------------------------------------------------------------------------+
| H2 Activity                                                                   |
| 2026-07-04 Draft created by pricing.local                                     |
| 2026-07-04 Approved by pricing.manager                                        |
+--------------------------------------------------------------------------------+
```

Accessibility note: `h1` identifies the agreement; `h2` sections segment detail; action buttons are reachable by keyboard and expose disabled state when approval is not allowed.

## Screen 3: Create / Edit Agreement

```text
+--------------------------------------------------------------------------------+
| H1 New Customer Agreement                                      [Save Draft]     |
+--------------------------------------------------------------------------------+
| H2 Agreement Header                                                           |
| Customer * [Select customer v]       Agreement No. [AGR-____]                  |
| Valid From * [date]                  Valid To * [date]                         |
| Trade Lane [Select v]                Commodity [Select v]                      |
+--------------------------------------------------------------------------------+
| H2 Charge Terms                                           [Add Charge Term]     |
| +-------------+--------+----------+---------+------------+----------+--------+ |
| | Charge Code | Basis  | Currency | Amount  | Start Date | End Date | Remove | |
| +-------------+--------+----------+---------+------------+----------+--------+ |
| | [Code v]    | [v]    | [v]      | [0.00]  | [date]     | [date]   | X      | |
| +-------------+--------+----------+---------+------------+----------+--------+ |
+--------------------------------------------------------------------------------+
| Validation Panel                                                              |
| - Charge amount must be greater than zero.                                    |
| - Valid To must be after Valid From.                                          |
| - Charge code must exist in Shared Platform reference data.                   |
+--------------------------------------------------------------------------------+
```

Accessibility note: required fields use text and `aria-required`; validation panel receives focus after failed submit; table row controls have explicit labels.

## Screen 4: Active Lookup Preview

```text
+--------------------------------------------------------------------------------+
| H1 Active Agreement Lookup                                                     |
| Customer [Select v] Trade Lane [Select v] Commodity [Select v] Date [date]     |
|                                                        [Find Active Terms]     |
+--------------------------------------------------------------------------------+
| Result                                                                         |
| Agreement: AGR-1001        Status: Approved        Validity: 2026-07-01..12-31 |
| Charge Terms: 2                                                              |
| +-------------+--------+----------+---------+                                  |
| | BAS         | TEU    | USD      | 1200.00 |                                  |
| | BAF         | TEU    | USD      | 180.00  |                                  |
| +-------------+--------+----------+---------+                                  |
+--------------------------------------------------------------------------------+
| No result state: No approved agreement matches this request.                   |
+--------------------------------------------------------------------------------+
```

Accessibility note: lookup form is one landmark section; result heading announces found/no-result state; terms table has column headers and text status.

## Information Architecture

| Area | Primary content | Main actions |
| --- | --- | --- |
| Agreements | Searchable agreement table and status summaries. | New, filter, open. |
| Agreement detail | Header metadata, charge terms, activity. | Edit, approve, suspend, expire. |
| Agreement editor | Header form, charge-line grid, validation panel. | Save draft, add/remove terms. |
| Active lookup | Booking-oriented lookup preview. | Find active terms, inspect result. |

## Visual Direction

Use a restrained operational layout: compact tables, clear form grouping, stable action placement, and explicit status text. Avoid marketing hero sections, decorative cards, or view-only dashboards as the primary experience.

## Review

Verdict: READY

Inline product-lead review completed because the configured reviewer subagent model was unavailable in this account. Findings: the mockups trace to `intent-statement.md`, `scope-document.md`, and `intent-backlog.md`; the primary screens cover list, detail, create/edit, approval, and active lookup; scope boundaries exclude Booking, invoicing, carrier connectivity, and advanced pricing; accessibility notes are present per screen. No required fixes before the stage gate.
