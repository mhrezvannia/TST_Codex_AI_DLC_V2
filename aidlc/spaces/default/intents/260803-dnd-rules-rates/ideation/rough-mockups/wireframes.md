# Rough Wireframes - W3-01 D&D Rules & Rates

**Inputs:** [intent statement](../intent-capture/intent-statement.md), [scope document](../scope-definition/scope-document.md), and [intent backlog](../scope-definition/intent-backlog.md)

## LinerCore direction

These are low-fidelity workbench concepts, not implementation visuals. They stay inside the existing authenticated Charge Agreements route and shared shell. The UI/UX Pro Max dashboard recommendation is accepted only for data density, filtering, row highlighting and accessibility; its marketing gateway, CTA, remote-font and replacement-palette recommendations are rejected under the LinerCore master contract.

## Screen 1: D&D rules and rates workspace

```text
+--------------------------------------------------------------------------------+
| Shared LinerCore shell: Breadcrumbs / Charge Agreements / D&D Rules & Rates   |
+---------------------+----------------------------------------------------------+
| Filters             | D&D Rules & Rates                     [Create rule]     |
| Agreement [_____v]  | Search [________________________]  Status [All v]       |
| Port      [_____v]  +----------------------------------------------------------+
| Type      [All  v]  | Rule / agreement    Type     Calendar  Status  Version  |
| Status    [All  v]  | DEM-IMPORT-01       Demurrage  NLRTM    Active  4        |
| [Clear filters]     | DET-EXPORT-02       Detention  USLAX    Draft   2        |
|                     | DET-EXPORT-03       Export det. SGSIN    Active  1        |
|                     +----------------------------------------------------------+
|                     | Result count / pagination / loading, empty and error   |
+---------------------+----------------------------------------------------------+
```

Accessibility: `h1` is “D&D Rules & Rates”; landmarks are shared `header`, `nav`, `main`, and table region. Keyboard entry reaches filters, then create action, then sortable table; table scroll is intentional below its minimum width.

## Screen 2: versioned rule and rate detail

```text
+--------------------------------------------------------------------------------+
| < Back  DEM-IMPORT-01  [Active]  Agreement AGR-442 / v7  Rate RTE-889 / v4    |
|                                                     [Create successor]         |
+--------------------------------------------------------------------------------+
| Tabs: [Terms & rate] [Applicability] [Evidence]                               |
+---------------------------------------+----------------------------------------+
| Terms                                 | Version evidence                       |
| D&D type      [Demurrage v]           | Agreement version  AGR-442 / v7        |
| Port            [Rotterdam  v]        | Rate version       RTE-889 / v4        |
| Equipment       [40HC        v]       | Qualifier match    Import / Dry         |
| Free days       [ 5 ]                 | Last validation    timestamp / actor    |
| Currency        [EUR         v]       | [Open audit details]                   |
+---------------------------------------+----------------------------------------+
| Draft: Save / Cancel. Active: immutable; Create successor is the edit path.    |
+--------------------------------------------------------------------------------+
```

Accessibility: `h1` is the rule identifier; `main` contains a labelled tablist and form. Every field retains a visible label and error association; tabs support arrows and Enter/Space, actions retain visible focus, and the audit disclosure is keyboard-operable.

## Screen 3: flat rate and port-local date basis

```text
+--------------------------------------------------------------------------------+
| DEM-IMPORT-01 / v4   Tabs: [Terms & rate] | Applicability | Evidence          |
+---------------------------------------+----------------------------------------+
| Rate terms                            | Calendar basis                         |
| Free days       5                     | Port       Rotterdam                   |
| Flat daily rate EUR 75                | Time zone  Europe/Amsterdam            |
| Charge code     DEM                   | Weekends   Included                     |
| Currency        EUR                   | Holidays   Included                     |
+---------------------------------------+----------------------------------------+
| Validation: non-negative terms; approved versions are immutable               |
+--------------------------------------------------------------------------------+
```

Accessibility: `h2` headings label rate and applicability sections inside `main`. Validation summary links to invalid controls; calendar basis is readable text and never colour alone.

## Deferred concept: calculation preview

The earlier side-panel preview is removed from mandatory W3-01 scope. The Charge UI maintains rules/rates and version/audit evidence; direct API and live acceptance prove evaluation. A future preview requires a separately approved user need.

## Responsive and state rules

- At 375px, filters become a disclosed panel and the table uses horizontal scroll with a sticky identity column; primary actions remain visible.
- At 768px and above, filters and table retain the compact operational layout; detail uses a two-column composition only when its content fits.
- At 1024px and 1440px, maintain stable table columns and show the detail evidence section without duplicating the shell.
- Every route state has stable-size skeleton, meaningful empty state, retryable service error, permission-denied state, validation-blocked state and success feedback. Motion respects reduced-motion preferences.
