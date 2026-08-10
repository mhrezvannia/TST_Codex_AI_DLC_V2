# Frontend Components — U03 Agreement Authority

## UI Boundary and Routes

U03 owns only these existing Charge routes beneath the U02 `/charge-agreements` base path:

| Route | U03 contract |
|---|---|
| `/charge-agreements` | Agreement list/module entry with URL-driven filters and paging |
| `/charge-agreements/new` | Create one complete W2 Draft with three exact links |
| `/charge-agreements/[agreementId]` | Stable identity, selected version, exact links, lifecycle, history, activity |
| `/charge-agreements/[agreementId]/edit` | Edit the sole Draft only |

`?version=<agreementVersionId>` owns detail history selection; list filters own `customerId`, `tradeLaneId`, `lifecycle`, `validOn`, and one-based `page`. U03 does not add routes, shell navigation, module sidebars, typography, palette, global CSS, or `packages/ui` exports. Rate and manual pages remain U01/U04.

## Component Hierarchy

```text
AgreementListPage (server)
  ChargeDomainHeader + existing module-local links
  AgreementFilterBar (URL form)
  AgreementResultsRegion
    AgreementTable / AgreementCompactRecords
    Pagination

AgreementCreatePage (server shell)
  AgreementForm (minimal client interaction island)
    AgreementIdentityFields
    AgreementMatchFields
    AgreementValidityFields
    ExactRateLinkSelectors (BASE, SURCHARGE, LOCAL)
    ErrorSummary + DirtyStateGuard + CommandBar

AgreementDetailPage (server)
  AgreementIdentitySummary + LifecycleBadge + CapabilityActions
  AgreementApplicability
  ExactRateLinksTable
  VersionHistory
  AuditDisclosure
  AgreementLifecycleDialog (Charge-local client composition)

AgreementEditPage (server authorization/load)
  AgreementForm initialized from exact Draft
```

Server Components perform session/capability checks and initial BFF reads. Client components are limited to form state, async reference/rate option loading, dirty-state protection, announcements, and Charge-local dialog focus management. RTK is absent from the workspace and is not introduced; authoritative commercial state is reloaded from server/BFF responses after mutation.

## Agreement List Page

- One `h1` names Agreements; module-local Agreements/Rate entries/Manual pricing links reuse the Charge header and never become global navigation.
- The filter form has persistent labels and submits to canonical URL state. Result count and filter changes are a labelled polite live region.
- Desktop/tablet table columns are agreement number, customer, lane, equipment, selected version/status, validity, and Approved authority. A Draft successor row visibly shows both `Draft vN` and `Approved vN-1` when present.
- At 375 px the table is either a labelled horizontal-scroll region or compact records using the same data/order; primary detail links remain keyboard reachable. No page-level horizontal scroll occurs.
- Empty-without-filters explains that no agreements exist and offers Create only with capability. Empty-with-filters offers Clear filters. Read-only users receive identical results with mutation affordances absent and explanatory text.
- Loading uses stable table/header skeletons; service failure uses the U02 error/retry contract without fabricated sample rows.

## Agreement Create and Edit Pages

- The grouped form collects immutable agreement number on create, customer/lane/origin/destination/equipment, inclusive dates, exact BASE/OFR, SURCHARGE/BAF, LOCAL/THC RateVersion links, and reason where required.
- Selectors display readable labels plus exact version ID, category/code, applicability, unit rate/currency, and effective window. They query only Approved candidates compatible with current match/window. Selection remains an input convenience; the service revalidates every ID.
- Any match/window change invalidates incompatible selected links visibly and prevents submit until all three compatible options are reselected. A single exact RateVersion cannot fill two rows.
- Validate on blur and on submit. The error summary receives focus after failed submit and links to persistent field labels/errors. Entered values and safe selections survive 400/409/422/503.
- Submit disables exactly once and reads `Creating...` or `Saving...`; a polite status confirms success. Create navigates to the committed stable detail with exact `?version=`. Edit is available only for the exact Draft and includes expected row version.
- Dirty-state protection covers internal route changes and browser unload. Cancel returns through a sanitized list/detail context. No autosave, partial server Draft, bulk edit, copied master-data authority, or hidden actor field exists.
- DS-02 remains explicit: until the shared Combobox's active-option/async contract is integrated and proved, U03 surrounds it with labelled loading/error status and mounts it only after options settle, but does not claim full combobox accessibility PASS.

## Agreement Detail and History Page

- Identity summary leads with agreement number, stable ID, selected immutable version ID/number, lifecycle text/icon, validity, and exact permitted actions.
- Applicability shows customer, lane, origin, destination, and equipment labels with stable IDs available as provenance; legacy commodity appears only in a clearly labelled LEGACY history view.
- Exact rate links are three deterministic rows BASE/OFR, SURCHARGE/BAF, LOCAL/THC showing exact source RateVersion, applicability, effective coverage, unit rate/basis/currency, and link provenance. Later Rate successors never replace these values.
- Version history is a real link list/table ordered newest W2 first and LEGACY last. Selecting a version updates `?version=` and preserves safe return/filter context. Approved/Suspended/Expired commercial fields remain read-only.
- Activity is collapsed by default, keyboard operable, and ordered chronologically with action, subject-safe identifier, timestamp, reason, correlation, and resulting row version. Long IDs wrap/break without hiding text.
- Actions are exact: Edit for Draft+update; Approve for Draft+approve; Create successor for Approved+successor when no Draft; Suspend/Expire for Approved with their capabilities. Unsupported/denied actions are absent, not disabled bait.
- A missing protected Agreement/version authorizes first, then uses the U02 safe not-found pattern. Denied views disclose no customer, links, history, or existence.

## Lifecycle Dialogs

Approval is a focused confirmation showing agreement/version identities, match key, validity, the three exact linked RateVersions, line count three, required reason, and the explicit consequence that commercial fields/links become immutable. It does not promise automatic replacement; overlap can return conflict.

Suspend and Expire confirmations identify the exact Approved version, require a reason, and explain exclusion from new pricing while historical attribution remains. There is no delete/resume/reapprove control.

All lifecycle dialogs use the existing shared Dialog inside a Charge-local wrapper permitted by DS-01: store trigger, focus the dialog heading, scope Tab/Shift+Tab while open, allow Escape only while no command is pending, restore focus to the trigger on close, disable duplicate submission, announce success/error, and preserve reason on recoverable failure. No shared component is modified and DS-01 remains pending until browser evidence proves the wrapper.

## BFF and Page Integration

- Pages require signed session and relevant U02 capability before BFF lookup. The BFF strips actor/service/capability fields and injects the session-derived subject/correlation contract.
- `listAgreements`, `getAgreement`, `createAgreement`, `updateAgreementDraft`, `approveAgreement`, `createAgreementSuccessor`, `suspendAgreement`, and `expireAgreement` use compile-time U02 route policies and normalized errors.
- Every Agreement BFF request sets `Accept: application/vnd.linercore.charge-agreement-v2+json`; mutations also set that exact `Content-Type`. It never calls the default-media legacy adapter, `/active-lookup`, or guesses a contract from response fields.
- Form schemas reject unknown authority fields, invalid IDs/dates/version values, missing links, and overlong reason before forwarding. Service validation remains decisive.
- Mutations carry exact `agreementVersionId`, expected row version, reason, and optional valid U02 client request token. The UI never claims replay safety because U03 has no persisted admin-command receipt.
- 409 stale response keeps the form/dialog, focuses a conflict alert, and offers Reload latest. 422 maps safe field errors. 503 preserves entered state and offers Retry only when the command outcome is known not committed; uncertain outcomes reload detail before another mutation.
- Contract tests assert media headers and reject mixed legacy/W2 payloads. A LEGACY record reached through the vendor-media UI renders an explicitly LEGACY, noneligible, read-only history view with no W2 links/actions; it never falls back to the default-media DTO or becomes authority.

## State, Accessibility, and Responsive Contract

Every route covers skeleton, empty, populated, service error/retry, denied/read-only, validation, command pending, success, conflict, long content, and light/dark behavior. Status never relies on color. One `h1` and ordered section headings, table captions/headers, persistent form labels, associated hints/errors, visible focus, 44 px actions, and polite/alert regions follow MASTER and the Charge page record.

- 1440/1024: main content plus compact evidence rail only where it avoids nested cards.
- 768: evidence/history moves below primary content or into accessible disclosure; forms use two columns only when labels remain readable.
- 375: commands wrap, forms are one column, exact-link rows become compact records or labelled overflow, and identity/action remains early in reading order.
- Animations are nonessential 150–300 ms color/opacity feedback and respect reduced motion. No hover scale/layout shift, sticky obstruction, image, chart, hero, carousel, marketing CTA, remote font, or decorative effect is introduced.

## Test and Evidence Hooks

Stable `data-testid`/accessible-name hooks cover list filters/count/rows, create/edit fields, three link selectors, error summary, dirty warning, version selector, link rows, lifecycle triggers/dialogs/status, activity disclosure, and read-only/denied states. Component tests cover field association, invalidation, pending/duplicate suppression, focus/error links, and dialog trap/restore. Playwright/U06 must exercise direct URL/reload/back-forward, real create/edit/approve/successor/suspend or expire history, 409 recovery, keyboard-only completion, light/dark, and 375/768/1024/1440. DS-01/DS-02/DS-03 cells remain blocked until observed; no design prose upgrades them to PASS.

## Skill Influence and Rejected Suggestions

`ui-ux-pro-max` was invoked for the agreement list, create, detail/history/lifecycle, edit, approval dialog, and Next.js App Router. Adopted guidance is stable responsive table handling, blur/inline validation plus focused error summary, persistent labels, URL deep links, visible focus, pending/success feedback, duplicate prevention, reduced motion, Server Components by default, and minimal client islands.

Rejected as conflicting with LinerCore/W2-03 are Enterprise Gateway hero/industry/role sections, logo/certificate carousels, Contact Sales CTAs, new navy/gold palette, Lexend/Source Sans imports, badge/metric animations, bulk edit, imagery, new navigation, and a generic Server Action replacement for the established authenticated BFF. Existing tokens, typography, shell, routes, and API/BFF boundary remain authoritative.

## Upstream Coverage

This UI design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus `MASTER.md`, `SESSION-PROMPT.md`, and the Charge page override. It implements U03's agreement list/create/detail/edit/history/lifecycle journeys and US-13/US-14 support without modifying shared ownership or claiming pending U06 live/Playwright evidence.
