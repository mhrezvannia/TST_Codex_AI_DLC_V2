# Refined Mockups - W3-01 D&D Rules & Rates

**Binding input:** approved page-level design `docs/ui-ux-design/18-dnd-rules-and-rates.md`.

**Handoff:** produced under `docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md` as the binding Refined Mockups candidate for AI-DLC stage 2.5; awaiting the current Refined Mockups approval gate.

**Upstream inputs:** rough `wireframes.md`, rough `user-flow.md`, approved `stories.md`, approved `requirements.md`, and affirmed `team-practices.md`.

## Authority and scope

These mockups convert the reviewed design into implementation-binding page composition while leaving route spelling, identifiers, BFF/API shapes, provider contracts, and state ownership to Application Design. Requirements and stories override the provisional rough flow and the older page contract where those sources suggested progressive bands, a generic combined rule, separate rule/rate lifecycles, or an evaluation panel.

The owning domain is Charge Calculation and Customer Agreement. The UI runs inside the existing authenticated LinerCore shell, selects Charge Agreements in global navigation, uses no journey ribbon, and creates no shell, navigation, theme, typography, token, or shared-package changes.

## Route and task flow

Proposed logical routes are page-level design input, not final architecture decisions.

| Proposed surface | User task | Binding page behavior |
| --- | --- | --- |
| `/charge-agreements/dnd/terms` | Find and compare combined D&D terms | Server-backed search, filters, sort, count, pagination, stable record links |
| `/charge-agreements/dnd/terms/new` | Create a combined Draft | Fixed rule semantics, exact pricing basis, applicability, flat terms, validity, reason |
| `/charge-agreements/dnd/terms/[dndTermId]` | Inspect and govern one versioned aggregate | Readable facts, relationships, history, audit evidence, capability-aware actions |
| Draft edit state, final form decided in Application Design | Correct an existing Draft | Same field groups, values retained across validation/provider failures |
| Existing AgreementVersion detail, final route decided in Application Design | Inspect exact agreement-version relationships | One read-only `D&D terms` section in the existing detail content; no new tab and no inline editing |

```text
[Charge Agreements / D&D terms list]
              |
              +---- search/filter/sort/page ----> [Preserved URL state]
              |
              +---- Create ----------------------> [Combined Draft form]
              |                                      |
              |                                      +-- invalid/conflict --> [Values retained]
              |                                      |
              |                                      +-- Save Draft -------> [Draft detail]
              |
              +---- Open record -----------------> [Versioned detail]
                                                     |
                                                     +-- Draft --> [Edit Draft]
                                                     +-- Draft --> [Review and approve]
                                                     +-- Approved --> [Create successor form]
                                                                            |
                                                                            +-- invalid/conflict --> [Values retained]
                                                                            +-- Save Draft -------> [Successor Draft detail]
                                                     +-- Any readable version --> [History/evidence]
```

Text fallback: a Pricing Analyst enters the Charge Agreements module, finds or creates one combined D&D terms aggregate, saves a validated Draft, reviews exact terms before approval, and changes approved commercial terms only by creating a successor. The agreement relationship view links to the same immutable versions.

## Desktop - combined terms list at 1440 and 1024

```text
+--------------------------------------------------------------------------------------+
| Shared LinerCore shell                                      Charge Agreements active |
+--------------------------------------------------------------------------------------+
| Charge Agreements / D&D terms                              [Create D&D terms]        |
| Agreements | Rate entries | Manual pricing | D&D terms                              |
| Search [________] Type [All] Port [All] Lifecycle [All] Effective [All]              |
|                                                            [Apply] [Clear]           |
| 8 terms                                                     Sort [Updated]            |
+--------------------------------------------------------------------------------------+
| Terms / rule       Applicability       Basis/version   Terms       Lifecycle Effective|
| Import demurrage  NLRTM / POD / 40HC  AGR-442 / v7    5d/USD75   Approved  Effective |
| Import detention  NLRTM / POD / 40HC  AGR-442 / v7    3d/USD55   Draft     N/A       |
| Export detention  SGSIN / POL / 40HC  Tariff / t9     4d/USD60   Approved  Scheduled |
+--------------------------------------------------------------------------------------+
| Previous                         Page 1 of 1                                Next      |
+--------------------------------------------------------------------------------------+
```

- The binding minimum controls are Search, Rule type, Port, Lifecycle, Effective state, Apply, Clear, Updated sort, and pagination. Search covers the stable D&D terms identity or exact pricing-basis reference; Rule type is All plus the three fixed types; Port uses canonical code/label options; Lifecycle is All, Draft, or Approved; Effective state is All, Scheduled, Effective, or Expired and applies only to Approved rows.
- Default sorting is most recently updated first with stable terms identity as the tie-breaker. Filter, sort, and pagination state is URL-backed and restored after a detail round-trip.
- Pricing-basis type/version, derived side, trade lane, equipment type, effective-on date, and agreement-link filters are deferred from W3-01. Application Design defines query parameter names and provider shapes for the binding controls but must not silently remove or add visible filters.
- Each identity is a named link; the row is not a click-only control.
- Each rule label exposes its fixed readable DCSA pair and qualifier in secondary content or the accessible name.
- Lifecycle and effective state are separate text meanings: Draft or Approved plus Scheduled, Effective, or Expired when applicable.
- Loading reserves header, filter, count, row, and pagination dimensions with shared Skeletons.
- True empty and filtered empty use different copy and recoveries.

## Desktop - combined Draft form at 1440 and 1024

```text
+--------------------------------------------------------------------------------------+
| New D&D terms                                                        Draft           |
| Fields marked Required. Values are retained after validation or service failure.    |
+-------------------------------------------+------------------------------------------+
| Fixed rule and pricing basis              | Applicability                            |
| Rule type* [Import demurrage        v]    | Side         POD (derived)               |
| Pair       DISC/LADEN -> GTOT/LADEN       | Port*       [NLRTM - Rotterdam      v]   |
| Basis*     [Agreement               v]    | Trade lane* [Asia-North Europe      v]   |
| Reference* [AGR-442 / version 7      v]   | Equipment*  [40HC                   v]   |
+-------------------------------------------+------------------------------------------+
| Terms, classification, and validity                                                   |
| Free days* [5]  Daily amount* [75.00]  USD / calendar day  Charge code* [code v]     |
| Effective from* [2026-08-04]   Effective to* [2026-12-31] (inclusive)                |
| Change reason* [_______________________________________________________________]      |
|                                                              [Cancel] [Save Draft]    |
+--------------------------------------------------------------------------------------+
```

- Rule type is limited to `IMPORT_DEMURRAGE`, `IMPORT_DETENTION`, and `EXPORT_DETENTION`.
- Movement pair, qualifiers, and POL/POD side are derived and read-only.
- Counting basis is fixed text: port-local calendar dates, weekends included, holidays included.
- Free days are a non-negative whole number; daily amount is non-negative scale-two money; MVP currency is USD.
- Reference-owned values use canonical comboboxes with code and readable label.
- Submit focuses a linked error summary when blocked and never clears the Draft.

## Desktop - combined detail and governance

```text
+--------------------------------------------------------------------------------------+
| < D&D terms  Import demurrage / NLRTM  [Approved] [Effective] v4 [Create successor] |
| DISC Discharge (Laden) -> GTOT Gate out (Laden) | POD | Europe/Amsterdam            |
+------------------------------------------------------+-------------------------------+
| Commercial terms                                     | Version evidence              |
| Free time          5 calendar days                  | Pricing basis  Agreement      |
| Daily rate         USD 75.00 / calendar day         | Reference      AGR-442        |
| Effective window   04 Aug 2026 - 31 Dec 2026        | Basis version  av-... / v7    |
| Weekends/holidays  Included / Included              | Terms version  ddt-... / v4   |
| Applicability                                       | [Open agreement v7]           |
| Port / side        NLRTM Rotterdam / POD            | [Show audit evidence]         |
| Trade lane         ASIA-NORTH-EUROPE                |                               |
| Equipment          40HC                              |                               |
+------------------------------------------------------+-------------------------------+
| Agreement relationships | Version history                                            |
+--------------------------------------------------------------------------------------+
```

- Draft actions are `Edit Draft` and `Review and approve` when granted.
- Approved versions expose `Create successor` and never expose Edit or Save.
- Approval opens the shared Dialog naming the exact version, applicability, inclusive window, flat terms, basis link, reason, overlap result, and immutability consequence. The current Dialog provides an accessible title, focus containment, Escape, and trigger restoration but no `aria-describedby` seam; programmatic description evidence remains BLOCKED for the UI-platform owner, with no Charge-local Dialog fork.
- History distinguishes selected, current, predecessor, and successor versions using text, not color alone.
- Audit evidence is collapsed technical evidence secondary to business facts.

### Create successor interaction

`Create successor` opens the same combined Draft form in a visibly named `New successor to <terms identity> / v<source version>` mode. The form shows a read-only predecessor link and never edits, relabels, or replaces the Approved source.

- Copied from the source: fixed rule type, derived movement pair and side, exact pricing-basis type/reference/version, port, trade lane, equipment type, free days, daily amount, currency, charge code, and fixed calendar-day basis.
- Cleared for explicit entry: effective-from, effective-to, and change reason. No successor window is inferred from the predecessor.
- Editable in the successor Draft: pricing-basis type/reference/version, port, trade lane, equipment type, free days, daily amount, charge code, inclusive effective window, and change reason. Rule type, derived movement/side, currency, calendar basis, predecessor identity, and source history remain read-only.
- Save validates the same Draft rules and exact overlap key as creation. Validation, provider, overlap, and optimistic-version conflicts keep the copied and entered values, retain the predecessor link, name the conflicting version/window when authorised, and offer only correction, reload/review, or opening the conflict.
- Success creates a distinct Draft, lands on that Draft's stable detail, focuses its heading or persistent success status, announces the new Draft version once, and shows explicit `Predecessor` and `Successor Draft` links in history. Approval remains a separate later command.

## Desktop - agreement relationship

```text
+--------------------------------------------------------------------------------------+
| Agreement AGR-442 / version 7 / D&D terms                                            |
| Rule type           Port / scope              Terms             Lifecycle/Effective  |
| Import demurrage    NLRTM / POD / 40HC        5d / USD75/day    Approved / Effective  |
| Import detention    NLRTM / POD / 40HC        3d / USD55/day    Approved / Effective  |
| Export detention    SGSIN / POL / 40HC        4d / USD60/day    Approved / Scheduled  |
| Relationship evidence is read-only; agreement approval actions remain unchanged.     |
+--------------------------------------------------------------------------------------+
```

This is one binding `D&D terms` section in the existing AgreementVersion detail content, placed after the agreement's primary commercial facts and before secondary technical evidence. It is not an in-route tab. It shows the selected exact AgreementVersion and exact D&D term versions, and it does not edit terms inline or create a second approval path.

- Loading reserves the section heading and rows with shared Skeletons while leaving already-known agreement facts readable.
- Empty shows `No D&D terms are linked to this agreement version`; it offers no create shortcut because creation belongs to the D&D terms route.
- Error uses section-safe semantic markup plus a warning/error `StatusStrip` and Retry `Button`, names that D&D relationships could not be loaded, and preserves known agreement facts. The route-level `FailureState` is not used inside the section because it emits an `h1`.
- Denied uses the existing no-disclosure presentation within the section and exposes no D&D count, identity, terms, state, or link. The user remains on the authorised agreement detail.

## Mobile - 390 and 375

### List record

```text
+--------------------------------------+
| Shared shell mobile header           |
| Charge Agreements / D&D terms        |
| D&D terms                [Create]     |
| [Hide filters]                        |
| Search [______] Type [All] Port [All] |
| Lifecycle [Approved]                  |
| Effective [Effective] [Apply] [Clear] |
| 8 terms                               |
+--------------------------------------+
| Import demurrage                    |
| Approved / Effective                |
| DISC/LADEN -> GTOT/LADEN             |
| NLRTM / POD / 40HC                   |
| Agreement AGR-442 / v7               |
| 5 days / USD 75.00/calendar day      |
| Terms v4                   [Open]     |
+--------------------------------------+
| Previous | Page 1 of 1 | Next         |
+--------------------------------------+
```

### Draft form

```text
+--------------------------------------+
| New D&D terms                        |
| Error summary (only when needed)     |
| Rule type*                           |
| [Import demurrage                v]  |
| Pair  DISC/LADEN -> GTOT/LADEN       |
| Pricing basis* [Agreement        v]  |
| Exact version*  [AGR-442 / v7    v]  |
| Side             POD (derived)       |
| Port*            [NLRTM          v]  |
| Trade lane*      [Asia-N Europe  v]  |
| Equipment*       [40HC           v]  |
| Free days*       [5]                 |
| Daily amount*    [75.00]             |
| USD / calendar day                   |
| Charge code*     [code + label   v]  |
| Effective from* [2026-08-04]         |
| Effective to*   [2026-12-31]         |
| Change reason*  [................]    |
| [Cancel]              [Save Draft]   |
+--------------------------------------+
```

### Detail

```text
+--------------------------------------+
| Import demurrage / NLRTM             |
| Approved / Effective / v4            |
| [Create successor]                   |
| DISC/LADEN -> GTOT/LADEN             |
| POD / Europe/Amsterdam               |
| Free time       5 calendar days      |
| Daily rate      USD 75.00/day        |
| Window          04 Aug - 31 Dec      |
| Agreement       AGR-442 / v7 [Open]  |
| [Version history]                    |
| [Show audit evidence]                |
+--------------------------------------+
```

Mobile uses one continuous reading order. Filters expand in flow; no new Drawer is required. Tables become labelled record items except where a version-comparison table uses a named inner overflow region. No sticky overlay hides content and there is no page-level horizontal scroll.

## Designed state variants

| State | Mockup treatment | Recovery and preservation |
| --- | --- | --- |
| Loading | Stable shared Skeleton matching final geometry | Wait; no spinner-only blank page |
| True empty | `No D&D terms yet` and permitted Create action | Create; do not show filter recovery |
| Filtered empty | `No results match these filters` plus active filters | Clear or edit filters; preserve URL state |
| Read-only | Mutation commands absent; concise capability status | Continue reading |
| Unauthenticated | Shared session-expired flow | Re-authenticate; retain only safe local context |
| Forbidden | Shared denied state with no commercial disclosure | Return to a permitted module |
| Not found | Named missing/stale record | Back to preserved list |
| Draft validation | Error summary plus field errors | Correct fields; preserve all values |
| Reference provider error | Stable affected control/section status | Retry source; never invent options |
| Save or approval pending | Stable pending label and one in-flight command | Wait; duplicate blocked |
| Success | Persistent detail/status plus concise announcement | Continue; toast is supplementary |
| Version conflict | ConflictStrip naming expected/current version | Review or Reload; preserve Draft |
| Overlap | Exact matching key and conflicting window | Open conflict or revise window |
| Approved history | Read-only terms and source links | Create successor only |
| Partial/degraded evidence | Known facts remain with affected section named | Retry affected section; evidence stays BLOCKED |

Evaluation outcomes such as zero amount, `NO_RATE`, idempotent replay, conflict, in-progress, validation, and unavailable are not new simulation screens. When visible through the existing authorised audit boundary, they follow the outcome-specific evidence contract in the approved design.

## Responsive contract

| Width | Binding composition |
| --- | --- |
| 375 and 390 | Shared mobile shell, record items, one-column form, in-flow filters, evidence after primary task, wrapped commands |
| 768 | Two-column filters only where labels fit; named inner table overflow; evidence below content or in accessible disclosure |
| 1024 | Compact table; main detail plus narrow evidence/action rail; primary action remains visible without overlay |
| 1440 | Full compact columns and evidence rail with controlled line length; no oversized cards |

Every width must tolerate long identifiers and labels, three-digit free days, large scale-two money, localized dates, zero/one/many relationships, long validation messages, 200% zoom, reduced motion, light theme, and dark theme.

## Traceability

| Mockup surface | Requirements and stories |
| --- | --- |
| Combined list and stable links | FR-09, NFR-06, US-01 AC4, US-02 AC4, AC-10 |
| Fixed rule and flat-term Draft | FR-01, FR-02, FR-05, FR-09, US-01 AC1-AC4, AC-01, AC-02 |
| Approval and immutable successor | FR-03, FR-10, FR-12, US-02 AC1-AC4, AC-08, AC-10 |
| Exact pricing-basis and agreement links | FR-04, FR-10, US-02, US-03 AC1 and AC4, AC-07, AC-08 |
| Outcome-specific audit evidence | FR-06, FR-07, FR-08, FR-12, US-04, AC-03-AC-09 |
| No evaluation UI | FR-09 and the approved design decision; API/contract/live evidence retains US-03 and US-04 |

## Unresolved questions for Application Design

1. Final route spelling, stable identifier, edit-state URL, and legacy alias policy.
2. Combined administration view models, server-backed query/sort/pagination, concurrency token, and exact error envelopes.
3. AgreementVersion versus tariff-composite search and readable linkage labels.
4. Canonical port-timezone and charge-code provider fields, missing-data meanings, and capability mapping.
5. Integrated visual, keyboard, responsive, and accessibility evidence remains BLOCKED until W3-01 routes exist on the isolated stack.

## Prior review history

The following findings are retained as historical evidence from the earlier stage run. Their corrections are present in the current candidate; they are not the verdict for this rerun. The mandatory product-lead review appends a fresh `## Review` section after validating this candidate.

### Iteration 1

**Verdict: NOT-READY**

The artifact set is complete and consistently preserves the approved combined Draft/successor lifecycle, deferred evaluation UI, Charge-domain ownership, shared-shell boundary, `@erp/ui`/LinerCore reuse, non-color status meaning, and responsive/accessibility requirements. The following corrections are required before approval:

1. **Specify the successor interaction.** `Create successor` is exposed as the only way to change approved terms, but no mockup or interaction contract defines what the command opens, which values are copied, which fields may change, how predecessor/successor identity is shown, what concurrency/overlap failures preserve, or where success lands. Add a testable successor flow, reusing the combined Draft form where appropriate, without adding a second lifecycle.
2. **Make the minimum list/filter scope binding.** The mockup shows Search, Type, Port, State, sort, count, and pagination, while `interaction-spec.md` enumerates a much larger query vocabulary and says Application Design will choose the supported subset. That leaves developers and QA unable to distinguish required controls from deferred or unsupported filters. Declare the minimum W3-01 controls and meanings, and explicitly defer the rest; Application Design may still choose parameter names and provider shapes.
3. **Choose the agreement-relationship presentation.** `D&D section or in-route tab` is a visible interaction alternative, not only route spelling. Select one binding page composition and its empty/loading/error/denied behavior while leaving the final URL and identifiers to Application Design.

### Iteration 2

**Verdict: NOT-READY**

Iteration 2 resolves the original successor flow, binding query scope, and agreement-section findings: successor values and failure preservation are substantially specified, required versus deferred query controls are named, and the AgreementVersion detail now owns one read-only section with loading, empty, error/retry, and denied behavior. Traceability, deferred evaluation UI, Charge-domain ownership, shared LinerCore shell, `@erp/ui` reuse, accessibility, and responsive boundaries remain coherent.

Two contradictions still prevent a testable handoff:

1. **Classify pricing-basis type in successor mode.** It is listed as copied, but it appears in neither the editable list nor the read-only list. State explicitly whether Agreement versus Tariff can change; QA must not infer this business rule from omission.
2. **Align the list mockups with the binding state contract.** The desktop filter still shows one `State` control and the desktop/mobile rows show `Effective` or `Scheduled` without `Approved`, while the binding prose requires separate Lifecycle and Effective-state controls and separate text meanings. Update the visual mockups to show both filters and render Approved plus Scheduled/Effective/Expired for approved rows; Draft remains a lifecycle value without an approved effective-state label.

## Review

**Verdict: NOT-READY**

The current artifacts correctly preserve the approved combined Draft/Approved/successor lifecycle, Charge ownership, exact three rule types and flat terms, deferred evaluation UI, provisional route/API boundary, requirements/story traceability, non-color state meanings, and 390/768/1024/1440 responsive and WCAG behavior. No marketing composition, progressive bands, generic combined type, invented evaluation action, local theme, or authorised shell/package change remains in the designed workflow.

Required corrections:

1. **Correct false `@erp/ui` suitability claims.** Current source shows `PartialDataNotice` hardcodes `Some booking details are unavailable`, `FailureState` always emits an `h1` and therefore cannot serve the scoped AgreementVersion D&D section, and `StatusBadge` has no semantic tone mappings for Approved/Scheduled/Effective/Expired. The shared `Dialog` also exposes a labelled title but no described-by seam for the checklist's labelled description requirement. Map the Charge compositions to suitable existing generic primitives such as `StatusStrip`/`Badge` and section-safe markup, or record explicit UI-platform dependencies and mark the affected mapping rows `BLOCKED`. Do not edit or fork `packages/ui` in W3-01.
2. **Record the known shell conformance dependency, not only pending live proof.** Current `PlatformShell` derives the active module from title text, has no shared skip-link/main-content seam, and its rail omits Container Movement and does not follow the binding sidebar order. The master forbids title inference and gives shell/navigation ownership to the UI platform. Add these source-known blockers to the design-system mapping and implementation handoff, keep shell acceptance `BLOCKED`, and prohibit a Charge-local workaround.

Until those mappings and dependencies are explicit, Application Design cannot implement the approved experience without either violating accessibility/domain vocabulary or making an unauthorised shared-platform decision.

## Review

**Verdict: READY**

The final iteration resolves the source-mapping and shell-governance findings without expanding W3-01 scope:

- Booking-specific `PartialDataNotice` is excluded; D&D degraded states use generic `StatusStrip` with Charge-owned copy.
- Scoped AgreementVersion failures use section-safe markup, `StatusStrip`, and `Button`; route-level `FailureState` is explicitly prohibited in that section because it emits an `h1`.
- D&D lifecycle/effective states use `Badge` with an explicit supported tone and always-visible text; `StatusBadge` fallback is not claimed suitable.
- Shared `Dialog` title, focus containment, Escape, and trigger restoration are source-observed, while its missing programmatic description seam remains explicitly `BLOCKED` for the UI-platform owner with no local fork.
- `PlatformShell` title inference, missing shared skip/main seam, missing Container Movement entry, and noncanonical rail order are recorded as UI-platform blockers with no Charge-local workaround. The source-observed `journeyStage=null` seam remains the valid no-ribbon contract.

The artifacts remain traceable to the approved requirements and stories, preserve the combined Draft/Approved/successor lifecycle and deferred evaluation UI, specify non-color states and recovery, cover 390/768/1024/1440 behavior and WCAG requirements, and use honest `PASS`/`BLOCKED`/`NOT APPLICABLE` evidence language. Refined Mockups is ready for approval and Application Design; integrated shell, Dialog-description, provider, responsive, and accessibility proof stays blocked until its named downstream owner and live environment resolve it.
