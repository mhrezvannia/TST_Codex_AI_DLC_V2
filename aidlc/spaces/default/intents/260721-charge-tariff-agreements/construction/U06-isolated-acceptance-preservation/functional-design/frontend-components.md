# Frontend Components - U06 Browser Evidence Harness

## UI boundary and design-system application

U06 creates no production frontend component. It adds Playwright page objects,
fixtures, assertions, and evidence writers that observe the Charge-owned pages
from U01-U04 and the minimum Booking pricing region from U05. It does not edit
`packages/ui`, the shared shell, navigation, typography, palette, or another
domain page. Charge-specific design documentation remains exclusively in
`design-system/linercore/pages/charge-and-agreements.md`.

`ui-ux-pro-max`, `design-system/linercore/MASTER.md`, and
`design-system/linercore/SESSION-PROMPT.md` guide the evidence: dense operational
tables must stay readable, state/recovery must be explicit, keyboard/focus and
responsive behavior are blocking, and marketing/dashboard decoration is out of
scope. This unit does not reinterpret advisory guidance as permission to
redesign an owned surface.

## Test-component hierarchy

The browser harness is organized as test-only components:

- `WaveAAcceptanceFixture`
  - authenticates through the existing shell/session
  - asserts edge origin `http://127.0.0.1:18088`
  - allocates correlation/seed namespaces and evidence paths
- `ChargeAgreementsPageObject`
  - agreement list/new/detail/edit/history/lifecycle interactions
- `ChargeRatesPageObject`
  - rate list/new/detail and `?mode=edit` interactions
- `ManualPricingPageObject`
  - read-only OPEN evidence and permission-denied assertions
- `BookingPricingRegionObject`
  - requested-departure edit, Price/Reprice, current/prior selection,
    itemisation, manual/outage evidence, and confirmation guards
- `AccessibilityEvidenceCollector`
  - axe, keyboard order, dialog focus loop/restore, live regions, names
- `ResponsiveEvidenceCollector`
  - viewport/theme matrix, clipping/overflow/action visibility
- `BrowserEvidenceWriter`
  - screenshot/trace/network/console/assertion records and hashes

These objects expose behavior-oriented methods rather than DOM implementation
details. Stable roles, accessible names, headings, and domain identities are
preferred selectors; generated CSS classes and visual coordinates are forbidden
except for explicit bounding-box assertions.

## Page and route coverage

| Page object | Required routes |
| --- | --- |
| Agreements | `/charge-agreements`, `/charge-agreements/new`, `/charge-agreements/[agreementId]`, `/charge-agreements/[agreementId]/edit` |
| Rates | `/charge-agreements/rates`, `/charge-agreements/rates/new`, `/charge-agreements/rates/[rateId]`, same detail with `?mode=edit` |
| Manual evidence | `/charge-agreements/manual-pricing` |
| Booking consumer | existing `/booking/[id]` pricing region only |

Direct deep links and reloads must retain the base path, authentication, and
domain context. Edge regressions also probe shell `/`, `/auth`,
`/reference-data`, `/booking`, and compatible `/bookings` behavior without
claiming ownership of those pages.

## Representative state matrix

Every representative page family is exercised at widths 375, 768, 1024, and
1440 in both light and dark. The full functional state suite is not duplicated
at every width when the same component owns it, but each required state has at
least one screenshot/trace and all matrix cells run structural/action-visibility
assertions.

| Family | Required functional states |
| --- | --- |
| list/filter | loading, populated, empty, backend error, forbidden |
| create/edit | pristine, invalid fields with summary focus, reference loading/error, dirty navigation, optimistic conflict, denied |
| detail/lifecycle | Draft, Approved immutable, history, approval pending/success/conflict, dialog Escape/Tab/restore |
| manual evidence | OPEN result, no amount/total, empty, denied without disclosure |
| Booking pricing | first price, agreement result, tariff result, Reprice with current/prior history, legacy evidence, no-rate, ambiguity, outage, circuit-open, malformed, conflict, in-progress |

A matrix cell can be `PASS`, `BLOCKED`, or `FAIL`. DS-02 active-descendant/async
semantics and DS-03 ribbon suppression stay blocked until present in the
integrated W2-02 runtime. U06 does not hide the ribbon with Charge CSS or replace
the shared combobox. DS-01 may pass only through the permitted Charge-local
dialog wrapper and exact focus evidence.

## Commercial-value assertions

The Charge detail page must display the exact three linked approved rate-version
identities. Booking must display lines in provider order: BASE/OFR,
SURCHARGE/BAF, LOCAL/THC, with exact quantity, unit rate, line amount, currency,
source version, total, basis/reference, requested departure, and correlation.

The browser expected values come from the deterministic seed manifest, not from
copying the rendered response. Successor Reprice must make the new snapshot
current and retain the old one as Previous. Selecting history is display-only.
No-rate/manual/outage states must have no current total or new line table;
previous history may remain visible only when explicitly selected and labelled
Previous. Legacy entries say provenance is unavailable and never invent lines.

## Keyboard, focus, and announcements

Keyboard-only evidence covers navigation within the Charge module, settled
filters/selectors, every form field, create/save/cancel, approval, Price/Reprice,
history, and manual evidence. Focus is visible and follows DOM/business order.

Invalid submit focuses the error summary or first invalid control and links each
error. The lifecycle/dirty dialog traps Tab/Shift+Tab while open, Escape cancels
before commit, duplicate approval is disabled, and close restores the trigger or
stable detail heading. Async actions preserve operator context and announce
pending/success/error once through a polite live region. Denied states reveal no
commercial records and expose a safe recovery action.

## Responsive and theme assertions

At every required width and theme the harness asserts no horizontal page-level
overflow, no clipped focus ring or primary action, no overlap, readable status
contrast, and 44px coarse-pointer targets where required by the shared contract.
Dense tables may use a visibly labelled keyboard-scrollable overflow region;
columns/data cannot silently disappear. Theme changes do not alter semantic
status or business order.

Screenshots are paired with bounding-box/DOM assertions and axe results. A visual
artifact without executable assertions cannot pass FR-705.

## Network and security assertions

Playwright records requests and rejects browser calls to internal service ports.
BFF calls retain session/correlation/idempotency behavior. Tests attempt a
spoofed actor field and require it to be ignored/rejected while audit evidence
shows the session subject. Permission tests cover Rate/Agreement mutations and
manual-case evidence separately.

The browser portion is one part of the closed security matrix. Service-level
tests additionally remove the Booking-to-Charge identity, remove its pricing
permission, omit required secrets, and attempt a non-local bypass; each must
fail closed without mutation or record disclosure. These are blocking even
when browser permission tests pass.

No trace, screenshot, console log, or network body may retain a cookie, token,
secret, or prohibited customer/commercial payload. Evidence redaction runs
before hashing/finalization.

For the same browser-driven agreement, tariff, and manual scenarios, the harness
links safe Booking/Charge log hops and asserts before/after metric deltas for
pricing latency, terminal outcome, basis, manual fallback, and replay/conflict.
A missing delta, correlation break, unbounded identifier label, or redaction hit
blocks the scenario; a screenshot cannot substitute for observability evidence.

## Upstream trace

This harness observes FR-601-FR-606 and FR-705; NFR-004/NFR-006-NFR-007;
US-01-US-05, US-08-US-10, and US-12-US-15. It consumes C12-C15,
`refined-mockups/{mockups,interaction-spec,design-system-mapping,accessibility-checklist}.md`,
the U01-U05 Functional Designs, and BR-U06-002-BR-U06-009/BR-U06-017-BR-U06-027.
