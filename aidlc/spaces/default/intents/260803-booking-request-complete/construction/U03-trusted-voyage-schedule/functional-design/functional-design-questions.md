# U03 Trusted Voyage Schedule - Functional Design Questions

## Context and Authority

These questions apply only to `U03-trusted-voyage-schedule`. They consume the approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, U01/U02 Functional Design, and the binding Refined Mockups artifacts.

U03 owns the separation of requested POL-local departure from provider-derived schedule, route-compatible voyage selection, the five confirmation-grade schedule facts, provenance/variance, and truthful partial/stale/inactive/incompatible/unavailable recovery. It extends the U01 selected-voyage snapshot and U02 complete request. U04 still owns persisted post-save correction, U05 owns current-revision validation authority, and U08 owns final action precedence.

## Questions

### Q1. What is the exact canonical representation for the five timezone-aware provider schedule facts?

- A. Accept each provider milestone as strict RFC 3339 offset date-time, parse it to an instant for ordering, and persist both the canonical offset-aware text and instant-equivalent value with voyage source/version; never discard the provider offset or replace it with server/browser local time (recommended)
- B. Convert every milestone to UTC `Z` and discard its supplied offset
- C. Store local date/time text without an offset and infer timezone during display
- X. Other (please specify)

[Answer]: A - accept strict RFC 3339 offset date-times, parse to instants for ordering, and preserve canonical offset-aware text plus instant-equivalent value and voyage provenance.

### Q2. How is requested-date versus carrier-ETD variance calculated?

- A. Resolve the POL IANA timezone from the accepted location authority, convert the ETD instant to that zone, compare its local calendar date with `requestedDepartureDate`, and report the signed calendar-day difference with no pass/fail tolerance (recommended)
- B. Compare the requested date with the UTC ETD date
- C. Treat any non-zero difference as an invalid voyage
- X. Other (please specify)

[Answer]: A - resolve the POL IANA timezone, compare the ETD's POL-local calendar date with the requested departure date, and report signed calendar-day variance without a tolerance.

### Q3. Which temporal ordering rules make a provider schedule confirmation-grade?

- A. Require `ETD < ETA`, `cargoCutoff < ETD`, and `documentationDeadline < ETD`; do not invent an ordering between the two pre-ETD deadlines, and reject equality as temporally inconsistent (recommended)
- B. Also require documentation deadline before cargo cutoff even though the approved requirements do not say so
- C. Accept equal milestone instants and treat them as warnings
- X. Other (please specify)

[Answer]: A - require ETD before ETA and both cargo cutoff and documentation deadline before ETD; equality is invalid and no ordering between the two deadlines is invented.

### Q4. What may U03 persist when voyage identity is verified but schedule authority is degraded?

- A. If ID/version/active state/route are verified, persist the selected voyage snapshot with every returned schedule fact and explicit nulls plus stable incompleteness reasons for missing/temporally invalid facts; a stale, inactive, route-mismatched, or unverifiable new selection is not newly accepted as canonical, while any previously accepted snapshot remains readable and the form input is preserved (recommended)
- B. Persist every browser-selected voyage and defer all checks to U05
- C. Reject all partial schedules so no draft can be saved
- X. Other (please specify)

[Answer]: A - persist verified route-compatible active voyage identity with returned facts, explicit nulls, and incompleteness reasons; do not newly accept stale, inactive, mismatched, or unverifiable selections, while preserving prior snapshots and form input.

### Q5. May option/schedule refresh mutate an already persisted Booking revision?

- A. No. Passive load/Refresh returns a live candidate/status view only; it never overwrites the persisted selected-voyage snapshot. A new accepted snapshot is committed only by explicit create or U04 correction, and U05 validation evidence is stored separately against the exact revision/fingerprint (recommended)
- B. Yes. Any successful page refresh silently updates the current Booking snapshot
- C. Update only timestamps automatically but leave other schedule facts unchanged
- X. Other (please specify)

[Answer]: A - passive load or Refresh never mutates the persisted Booking revision; only explicit create or U04 correction commits a new snapshot, and U05 validation remains separately revision-bound.

## Ambiguity Check

All five `[Answer]:` tags are complete, mutually consistent, and confirmed for artifact generation. The answers preserve requested-date authority, exact timezone/provenance, draft recovery without guessed facts, revision immutability, and the U04/U05 ownership boundaries.
