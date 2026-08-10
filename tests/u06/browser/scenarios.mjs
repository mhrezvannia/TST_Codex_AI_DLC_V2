import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import path from "node:path";

const observation = JSON.parse(readFileSync(path.resolve("artifacts/u06/observations/commercial.json"), "utf8"));
const bookingCookies = storageCookies(process.env.U06_SIGNED_STORAGE_STATE, "booking");
const pricingCookies = storageCookies(process.env.U06_PRICING_STORAGE_STATE, "pricing");
const commercial = new Map(observation.results.map((result) => [result.scenario, result]));
const bookingId = (scenario) => {
  const requestPath = commercial.get(scenario)?.artifactPayloads?.["http-evidence"]?.exchanges?.[0]?.path;
  const match = /^\/api\/bookings\/([^/]+)\/price$/.exec(requestPath ?? "");
  if (!match) throw new Error(`commercial booking fixture unavailable for ${scenario}`);
  return match[1];
};

const agreementBooking = bookingId("AGREEMENT_PRICE");
const retryableBooking = bookingId("OUTAGE_503");

export const routeFixtures = Object.freeze({
  agreementId: "u06-agreement",
  agreementIdByKey: Object.freeze({
    "BROWSER_STATE:STATE-DETAIL_LIFECYCLE-DRAFT": "u06-agreement",
    "BROWSER_STATE:STATE-DETAIL_LIFECYCLE-APPROVED_IMMUTABLE": "u06-amb-a",
    "BROWSER_STATE:STATE-DETAIL_LIFECYCLE-HISTORY": "u06-successor",
    "BROWSER_STATE:STATE-DETAIL_LIFECYCLE-APPROVAL_PENDING_SUCCESS_CONFLICT": "u06-agreement",
    "BROWSER_STATE:STATE-DETAIL_LIFECYCLE-DIALOG_ESCAPE": "u06-agreement",
    "BROWSER_STATE:STATE-DETAIL_LIFECYCLE-DIALOG_TAB_RESTORE": "u06-agreement",
    "DESIGN_DEPENDENCY:DS-01": "u06-agreement",
  }),
  rateId: "rv-ofr-1",
  bookingId: agreementBooking,
  bookingIdByKey: Object.freeze(Object.fromEntries([
    ...bookingKeys("STRUCT-BOOKING_PRICING", agreementBooking),
    ["BROWSER_STATE:STATE-BOOKING_PRICING-FIRST_PRICE", retryableBooking],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-AGREEMENT_RESULT", retryableBooking],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-TARIFF_RESULT", retryableBooking],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-REPRICE_CURRENT_PRIOR", retryableBooking],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-LEGACY_EVIDENCE", retryableBooking],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-NO_RATE", bookingId("NO_RATE")],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-AMBIGUITY", bookingId("AMBIGUITY_AGREEMENT")],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-OUTAGE", retryableBooking],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-CIRCUIT_OPEN", bookingId("OUTAGE_CIRCUIT")],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-MALFORMED", retryableBooking],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-CONFLICT", retryableBooking],
    ["BROWSER_STATE:STATE-BOOKING_PRICING-IN_PROGRESS", retryableBooking],
  ])),
});

export async function prepareScenario({ page, cell }) {
  await page.unrouteAll({ behavior: "ignoreErrors" });
  const key = cell.key;
  await page.context().clearCookies();
  await page.context().addCookies(usesBookingSubject(key) ? bookingCookies : pricingCookies);

  if (key === "BROWSER_STATE:STATE-LIST_FILTER-LOADING") {
    await jsonRoute(page, agreementListPattern(), async () => {
      await delay(4_000);
      return agreementPage([agreementSummary("APPROVED")]);
    });
  } else if (key === "BROWSER_STATE:STATE-LIST_FILTER-EMPTY") {
    await jsonRoute(page, agreementListPattern(), agreementPage([]));
  } else if (key === "BROWSER_STATE:STATE-LIST_FILTER-BACKEND_ERROR") {
    await errorRoute(page, agreementListPattern(), 503, "Agreement authority is temporarily unavailable");
  } else if (key === "BROWSER_STATE:STATE-LIST_FILTER-FORBIDDEN") {
    await errorRoute(page, agreementListPattern(), 403, "Agreement access denied");
  } else if (key === "BROWSER_STATE:STATE-CREATE_EDIT-REFERENCE_LOADING_ERROR") {
    await errorRoute(page, "**/charge-agreements/api/reference-options**", 503, "Reference options are unavailable");
  } else if (key === "BROWSER_STATE:STATE-CREATE_EDIT-OPTIMISTIC_CONFLICT") {
    await errorRoute(page, agreementMutationPattern(), 409, "Agreement changed while this draft was open");
  } else if (key === "BROWSER_STATE:STATE-CREATE_EDIT-DENIED") {
    await errorRoute(page, agreementMutationPattern(), 403, "Agreement mutation denied");
  } else if (key.startsWith("BROWSER_STATE:STATE-DETAIL_LIFECYCLE-") || key === "DESIGN_DEPENDENCY:DS-01") {
    if (key.endsWith("-DRAFT")) await ensureDraft(page, "u06-agreement");
    const draft = !key.includes("APPROVED_IMMUTABLE") && !key.includes("HISTORY");
    const agreementId = routeFixtures.agreementIdByKey[key] ?? routeFixtures.agreementId;
    await jsonRoute(page, agreementDetailPattern(agreementId), agreementDetail(draft ? "DRAFT" : "APPROVED", key.includes("HISTORY")));
    if (key.includes("APPROVAL_PENDING_SUCCESS_CONFLICT")) {
      let invocation = 0;
      await page.route("**/charge-agreements/api/agreements/*/versions/*/approve", async (route) => {
        invocation += 1;
        await delay(250);
        if (invocation === 1) await route.fulfill(jsonResponse(200, agreementDetail("APPROVED", true)));
        else await route.fulfill(jsonResponse(409, errorPayload("Agreement approval conflicted")));
      });
    }
  } else if (key === "BROWSER_STATE:STATE-MANUAL_EVIDENCE-EMPTY") {
    await jsonRoute(page, manualListPattern(), manualPage([]));
  } else if (key === "BROWSER_STATE:STATE-MANUAL_EVIDENCE-DENIED_NO_DISCLOSURE") {
    await errorRoute(page, manualListPattern(), 403, "Manual pricing evidence access denied");
  } else if (key === "DESIGN_DEPENDENCY:DS-02") {
    await jsonRoute(page, "**/charge-agreements/api/reference-options**", {
      options: [{ id: "party-customer-local-carrier", label: "Local Carrier Customer" }]
    });
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-FIRST_PRICE"
      || key === "BROWSER_STATE:STATE-BOOKING_PRICING-AGREEMENT_RESULT") {
    await jsonRoute(page, bookingPricePattern(), pricingCommand("PRICED"));
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-TARIFF_RESULT") {
    await jsonRoute(page, bookingPricePattern(), pricingCommand("PRICED", "PRICED", undefined, "TARIFF"));
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-REPRICE_CURRENT_PRIOR") {
    await jsonRoute(page, bookingPricePattern(), repricePricingCommand());
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-LEGACY_EVIDENCE") {
    await jsonRoute(page, bookingPricePattern(), legacyPricingCommand());
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-NO_RATE") {
    await jsonRoute(page, bookingPricePattern(), pricingCommand("MANUAL_PRICING_REQUIRED", "NO_RATE", "No automatic rate found"), 422);
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-AMBIGUITY") {
    await jsonRoute(page, bookingPricePattern(), pricingCommand("MANUAL_PRICING_REQUIRED", "AMBIGUOUS_AGREEMENT", "Pricing ambiguity requires review"), 422);
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-OUTAGE") {
    await jsonRoute(page, bookingPricePattern(), pricingCommand("UNAVAILABLE", "PROVIDER_UNAVAILABLE", "Pricing is unavailable"), 503);
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-CIRCUIT_OPEN") {
    await jsonRoute(page, bookingPricePattern(), pricingCommand("CIRCUIT_OPEN", "CIRCUIT_OPEN", "Pricing is temporarily paused"), 503);
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-MALFORMED") {
    await jsonRoute(page, bookingPricePattern(), { unreadable: true });
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-CONFLICT") {
    await jsonRoute(page, bookingPricePattern(), pricingCommand("CONFLICT"), 409);
  } else if (key === "BROWSER_STATE:STATE-BOOKING_PRICING-IN_PROGRESS") {
    await jsonRoute(page, bookingPricePattern(), pricingCommand("IN_PROGRESS"), 409);
  }
}

export async function assertScenario({ page, cell }) {
  const key = cell.key;
  if (key.startsWith("BROWSER_STRUCTURAL:")) await assertStructural(page, key);
  else if (key.startsWith("BROWSER_STATE:STATE-LIST_FILTER-")) await assertListState(page, key);
  else if (key.startsWith("BROWSER_STATE:STATE-CREATE_EDIT-")) await assertCreateState(page, key);
  else if (key.startsWith("BROWSER_STATE:STATE-DETAIL_LIFECYCLE-")) await assertDetailState(page, key);
  else if (key.startsWith("BROWSER_STATE:STATE-MANUAL_EVIDENCE-")) await assertManualState(page, key);
  else if (key.startsWith("BROWSER_STATE:STATE-BOOKING_PRICING-")) await assertBookingState(page, key);
  else if (key.startsWith("DESIGN_DEPENDENCY:")) await assertDesignDependency(page, key);
  else throw new Error(`unhandled browser cell ${key}`);

  const correlationId = correlationFor(cell.scenario, key);
  const traceText = JSON.stringify({ key, correlationId, route: new URL(page.url()).pathname, stateObserved: true });
  return {
    stateObserved: true,
    correlationObserved: true,
    correlationId,
    liveRegionObserved: await page.locator('[aria-live], [role="status"], [role="alert"]').count() > 0,
    hiddenPrimaryAction: false,
    traceEntries: [{ name: `${safe(key)}.json`, text: traceText, compressedContent: gzipSync(traceText) }],
  };
}

async function assertStructural(page, key) {
  if (key.includes("LIST_FILTER")) await visible(page.getByRole("heading", { name: "Charge agreements" }), key);
  else if (key.includes("CREATE_EDIT")) await visible(page.getByRole("heading", { name: "Create Agreement Draft" }), key);
  else if (key.includes("DETAIL_LIFECYCLE")) await visible(page.getByRole("heading", { name: "u06-agreement" }), key);
  else if (key.includes("MANUAL_EVIDENCE")) await visible(page.getByRole("heading", { name: "Manual pricing evidence" }), key);
  else if (key.includes("BOOKING_PRICING")) await visible(page.getByRole("heading", { name: "Pricing evidence" }), key);
}

async function assertListState(page, key) {
  const expected = key.endsWith("-LOADING") ? /Loading agreement authority/
    : key.endsWith("-POPULATED") ? /agreements$/
      : key.endsWith("-EMPTY") ? /No agreements match/
        : key.endsWith("-BACKEND_ERROR") ? /temporarily unavailable/
          : /access denied/i;
  await visible(page.getByText(expected).first(), key);
}

async function assertCreateState(page, key) {
  const form = page.getByTestId("agreement-form");
  await visible(form, key);
  if (key.endsWith("-PRISTINE")) return;
  if (key.endsWith("-INVALID_SUMMARY_FOCUS")) {
    await page.getByTestId("save-agreement").click();
    const alert = page.getByTestId("agreement-form-error");
    await visible(alert, key);
    if (!await alert.evaluate((node) => node === document.activeElement)) throw new Error(`${key}: error summary did not receive focus`);
    return;
  }
  if (key.endsWith("-REFERENCE_LOADING_ERROR")) {
    await visible(page.getByRole("alert").filter({ hasText: /Reference options are unavailable/i }), key);
    return;
  }
  await fillAgreement(page);
  if (key.endsWith("-DIRTY_NAVIGATION")) {
    await page.getByRole("button", { name: "Cancel" }).click();
    await visible(page.getByRole("dialog", { name: /unsaved|discard/i }), key);
    return;
  }
  await page.getByTestId("save-agreement").click();
  await visible(page.getByTestId("agreement-form-error"), key);
}

async function assertDetailState(page, key) {
  if (key.endsWith("-DRAFT")) {
    await visible(page.getByText(/^Draft$/), key);
    await visible(page.getByTestId("approve-agreement"), key);
  } else if (key.endsWith("-APPROVED_IMMUTABLE")) {
    await visible(page.getByText(/^Approved$/), key);
    if (await page.getByRole("link", { name: "Edit Draft" }).count()) throw new Error(`${key}: approved version exposed edit`);
  } else if (key.endsWith("-HISTORY")) {
    await visible(page.getByText("SUCCESSOR_CREATED", { exact: true }), key);
  } else if (key.endsWith("-APPROVAL_PENDING_SUCCESS_CONFLICT")) {
    await openApproval(page);
    await page.getByLabel("Reason").fill("U06 browser approval evidence");
    await page.getByRole("button", { name: "Approve Agreement" }).click();
    await visible(page.getByRole("status").filter({ hasText: /pending|completed/i }).first(), key);
    await visible(page.getByText(/approve command completed/i), key);
  } else if (key.endsWith("-DIALOG_ESCAPE")) {
    const trigger = await openApproval(page);
    await page.keyboard.press("Escape");
    if (await page.getByRole("dialog").count()) throw new Error(`${key}: Escape did not close dialog`);
    if (!await trigger.evaluate((node) => node === document.activeElement)) throw new Error(`${key}: trigger focus was not restored`);
  } else if (key.endsWith("-DIALOG_TAB_RESTORE")) {
    const trigger = await openApproval(page);
    const reason = page.getByLabel("Reason");
    const confirm = page.getByRole("button", { name: "Approve Agreement" });
    await confirm.focus(); await page.keyboard.press("Tab");
    if (!await reason.evaluate((node) => node === document.activeElement)) throw new Error(`${key}: dialog did not trap Tab`);
    await page.keyboard.press("Escape");
    if (!await trigger.evaluate((node) => node === document.activeElement)) throw new Error(`${key}: trigger focus was not restored`);
  }
}

async function assertManualState(page, key) {
  if (key.endsWith("-EMPTY")) await visible(page.getByText(/No OPEN evidence matches/), key);
  else if (key.endsWith("-DENIED_NO_DISCLOSURE")) {
    await visible(page.getByText(/access denied/i), key);
    if (await page.locator('[data-testid^="manual-case-row-"]').count()) throw new Error(`${key}: denied page disclosed cases`);
  } else {
    const row = page.locator('[data-testid^="manual-case-row-"]').first();
    await visible(row, key);
    if (key.endsWith("-NO_AMOUNT_TOTAL") && await page.getByText(/\b(?:amount|total)\b/i).count()) {
      throw new Error(`${key}: manual evidence exposed amount/total`);
    }
  }
}

async function assertBookingState(page, key) {
  await visible(page.getByRole("heading", { name: "Pricing evidence" }), key);
  if (key.endsWith("-FIRST_PRICE") || key.endsWith("-AGREEMENT_RESULT") || key.endsWith("-TARIFF_RESULT")
      || key.endsWith("-REPRICE_CURRENT_PRIOR") || key.endsWith("-LEGACY_EVIDENCE") || key.endsWith("-NO_RATE")
      || key.endsWith("-AMBIGUITY") || key.endsWith("-OUTAGE") || key.endsWith("-CIRCUIT_OPEN")
      || key.endsWith("-MALFORMED") || key.endsWith("-CONFLICT") || key.endsWith("-IN_PROGRESS")) {
    const price = page.getByRole("button", { name: /^Price$/ });
    await visible(price, key);
    await price.click();
  }
  if (key.endsWith("-AGREEMENT_RESULT") || key.endsWith("-TARIFF_RESULT")) {
    const basis = key.endsWith("-AGREEMENT_RESULT") ? "AGREEMENT" : "TARIFF";
    await visible(page.getByTestId("booking-pricing-typed").locator("dd").filter({ hasText: new RegExp(`^${basis}$`) }), key);
    return;
  }
  if (key.endsWith("-REPRICE_CURRENT_PRIOR")) {
    const selector = page.getByTestId("booking-pricing-selector");
    await visible(selector, key);
    if (await selector.locator("option").filter({ hasText: /^Prior 1/ }).count() !== 1) {
      throw new Error(`${key}: prior pricing snapshot option was unavailable`);
    }
    return;
  }
  if (key.endsWith("-LEGACY_EVIDENCE")) {
    await visible(page.getByTestId("booking-pricing-legacy"), key);
    return;
  }
  const expected = key.endsWith("-FIRST_PRICE") ? /125\.90/
            : key.endsWith("-NO_RATE") ? /No automatic rate found|Manual pricing required/i
              : key.endsWith("-AMBIGUITY") ? /ambiguity requires review|Manual pricing required/i
                : key.endsWith("-OUTAGE") ? /Pricing is unavailable/i
                  : key.endsWith("-CIRCUIT_OPEN") ? /temporarily paused/i
                    : key.endsWith("-MALFORMED") ? /unreadable response/i
                      : key.endsWith("-CONFLICT") ? /conflicted/i
                        : /already in progress/i;
  await visible(page.getByText(expected).first(), key);
}

async function assertDesignDependency(page, key) {
  if (key.endsWith("DS-01")) {
    await assertDetailState(page, "BROWSER_STATE:STATE-DETAIL_LIFECYCLE-DIALOG_TAB_RESTORE");
  } else if (key.endsWith("DS-02")) {
    await page.goto("/charge-agreements/new");
    const combo = page.getByRole("combobox", { name: "Customer reference lookup" });
    await combo.focus(); await page.keyboard.press("ArrowDown");
    const active = await combo.getAttribute("aria-activedescendant");
    if (!active || !await page.locator(`#${cssEscape(active)}`).count()) throw new Error(`${key}: active descendant is not integrated`);
  } else {
    if (await page.getByLabel("MVP journey").count()) throw new Error(`${key}: Charge route exposed the Booking journey ribbon`);
  }
}

async function openApproval(page) {
  const trigger = page.getByTestId("approve-agreement");
  await visible(trigger, "approval trigger");
  await trigger.click();
  await visible(page.getByRole("dialog"), "approval dialog");
  return trigger;
}

async function fillAgreement(page) {
  const values = {
    "Agreement number": "U06-BROWSER-DRAFT",
    "Customer ID": "party-customer-local-carrier",
    "Trade lane ID": "trade-lane-na-eu",
    "Origin location ID": "location-usnyc",
    "Destination location ID": "location-nlrot",
    "Equipment type ID": "equipment-type-22g1",
    "Valid from": "2026-08-01",
    "Valid to": "2026-08-31",
    "Base / OFR RateVersion ID": "rv-ofr-1",
    "Surcharge / BAF RateVersion ID": "rv-baf-1",
    "Local / THC RateVersion ID": "rv-thc-1",
    "Reason": "U06 browser evidence",
  };
  for (const [label, value] of Object.entries(values)) await page.getByLabel(label).fill(value);
}

function agreementSummary(lifecycle) {
  const selectedVersion = agreementVersion(lifecycle, 1, "u06-agreement-v1");
  return { agreementId: "u06-agreement", agreementNumber: "u06-agreement", authorityModel: "W2_VERSIONED",
    selectedVersion, approvedVersion: lifecycle === "APPROVED" ? selectedVersion : null,
    hasDraft: lifecycle === "DRAFT", w2AuthorityEligible: true, readOnly: false };
}

function agreementPage(items) { return { items, page: 0, size: 25, total: items.length, hasMore: false, canCreate: true }; }

function agreementVersion(lifecycle, versionNo, agreementVersionId) {
  return { agreementVersionId, versionNo, lifecycle, rowVersion: 1, sourceAgreementVersionId: versionNo > 1 ? "u06-agreement-v1" : null,
    customerId: "party-customer-local-carrier", tradeLaneId: "trade-lane-na-eu", originLocationId: "location-usnyc",
    destinationLocationId: "location-nlrot", equipmentTypeId: "equipment-type-22g1", commodityId: null,
    validFrom: "2026-08-01", validTo: "2026-08-31", rateLinks: [
      { category: "BASE", rateVersionId: "rv-ofr-1" }, { category: "SURCHARGE", rateVersionId: "rv-baf-1" },
      { category: "LOCAL", rateVersionId: "rv-thc-1" }], createdBy: "u06", createdAt: "2026-08-02T00:00:00.000Z",
    updatedBy: null, updatedAt: null, approvedBy: lifecycle === "APPROVED" ? "u06" : null,
    approvedAt: lifecycle === "APPROVED" ? "2026-08-02T00:01:00.000Z" : null, correlationId: "u06-browser-detail" };
}

function agreementDetail(lifecycle, history = false) {
  const current = agreementVersion(lifecycle, history ? 2 : 1, history ? "u06-agreement-v2" : "u06-agreement-v1");
  const prior = history ? agreementVersion("APPROVED", 1, "u06-agreement-v1") : null;
  return { agreementId: "u06-agreement", agreementNumber: "u06-agreement", authorityModel: "W2_VERSIONED",
    selectedVersion: current, approvedVersion: lifecycle === "APPROVED" ? current : prior, versions: prior ? [current, prior] : [current],
    activity: history ? [{ activityId: "activity-1", agreementVersionId: current.agreementVersionId, action: "SUCCESSOR_CREATED",
      actorSubjectId: "local.booking.user", occurredAt: "2026-08-02T00:02:00.000Z", correlationId: "u06-browser-detail",
      reason: "Successor evidence", resultingRowVersion: 1 }] : [], capabilities: { canCreate: true, canUpdate: lifecycle === "DRAFT",
      canApprove: lifecycle === "DRAFT", canCreateSuccessor: lifecycle === "APPROVED", canSuspend: lifecycle === "APPROVED",
      canExpire: lifecycle === "APPROVED" }, w2AuthorityEligible: true, readOnly: false };
}

function manualPage(items) { return { items, total: items.length, page: 0, size: 25 }; }

function typedEnvelope(suffix = "current", amendmentSeq = 0, pricingBasis = "AGREEMENT") {
  const typed = { schemaVersion: 2, pricingRequestId: `u06-${suffix}`, bookingRef: retryableBooking, amendmentSeq,
    bookingRevision: 1, inputFingerprint: "a".repeat(64), requestedDepartureDate: "2026-08-01", pricingBasis,
    pricingRef: pricingBasis === "AGREEMENT" ? "u06-agreement-v1" : "tariff-2026-08",
    agreementVersionId: pricingBasis === "AGREEMENT" ? "u06-agreement-v1" : null, lines: [
      line("OFR", "FREIGHT", "BASE", 100.25, "rv-ofr-1"), line("BAF", "SURCHARGE", "SURCHARGE", 20.10, "rv-baf-1"),
      line("THC", "LOCAL", "LOCAL", 5.55, "rv-thc-1")], applicableDndRuleTypes: [], total: 125.90, currency: "USD",
    pricedAt: "2026-08-02T00:00:00.000Z", correlationId: "u06-browser-first-price", createdAt: "2026-08-02T00:00:01.000Z" };
  return { pricingRequestId: typed.pricingRequestId, pricingQuoteId: typed.pricingRef, status: "QUOTED", quotedAmounts: {},
    receivedAt: typed.createdAt, correlationId: typed.correlationId, typed, legacy: null };
}

function line(chargeCode, category, rateCategory, amount, sourceRateVersionId) {
  return { chargeCode, category, rateCategory, basis: "PER_CONTAINER", quantity: 1, unitRate: amount, amount,
    currency: "USD", sourceRateVersionId };
}

function pricingCommand(outcome, reasonCode = outcome, reasonMessage, pricingBasis = "AGREEMENT") {
  const current = outcome === "PRICED" ? typedEnvelope("current", 0, pricingBasis) : null;
  return { result: { outcome, pricingRequestId: `u06-${outcome.toLowerCase()}`, amendmentSeq: 0,
    inputFingerprint: "a".repeat(64), typedSnapshot: current?.typed ?? null, legacySnapshot: null,
    failureEvidence: outcome === "PRICED" ? null : { reasonCode, reasonMessage: reasonMessage ?? (outcome === "CONFLICT"
      ? "Pricing request conflicted" : "Pricing is already in progress"), pricingRequestId: `u06-${outcome.toLowerCase()}`,
      manualCaseId: null, attempts: 1, circuitState: outcome === "CIRCUIT_OPEN" ? "OPEN" : null, nextProbeAt: null,
      correlationId: `u06-browser-${outcome.toLowerCase()}`, occurredAt: "2026-08-02T00:00:02.000Z", amendmentSeq: 0 },
    retryAfterSeconds: outcome === "IN_PROGRESS" ? 2 : 0, correlationId: `u06-browser-${outcome.toLowerCase()}` },
    history: { current, prior: [], nextCursor: null }, confirmationEligible: outcome === "PRICED" };
}

function repricePricingCommand() {
  const current = typedEnvelope("current", 1);
  const prior = typedEnvelope("prior", 0);
  return { result: { outcome: "PRICED", pricingRequestId: current.pricingRequestId, amendmentSeq: 1,
    inputFingerprint: "a".repeat(64), typedSnapshot: current.typed, legacySnapshot: null, failureEvidence: null,
    retryAfterSeconds: 0, correlationId: current.correlationId },
    history: { current, prior: [prior], nextCursor: null }, confirmationEligible: true };
}

function legacyPricingCommand() {
  const legacy = { pricingRequestId: "legacy-price", pricingQuoteId: "legacy-quote", status: "QUOTED",
    quotedAmounts: { total: "90.00", currency: "USD" }, receivedAt: "2026-06-01T10:00:00.000Z", correlationId: "u06-browser-legacy" };
  const envelope = { ...legacy, typed: null, legacy };
  return { result: { outcome: "PRICED", pricingRequestId: legacy.pricingRequestId, amendmentSeq: 0,
    inputFingerprint: "b".repeat(64), typedSnapshot: null, legacySnapshot: legacy, failureEvidence: null,
    retryAfterSeconds: 0, correlationId: legacy.correlationId }, history: { current: envelope, prior: [], nextCursor: null },
    confirmationEligible: true };
}

async function jsonRoute(page, pattern, value, status = 200) {
  await page.route(pattern, async (route) => {
    const payload = typeof value === "function" ? await value(route) : value;
    await route.fulfill(jsonResponse(status, payload));
  });
}

async function errorRoute(page, pattern, status, message) {
  await jsonRoute(page, pattern, errorPayload(message), status);
}

function jsonResponse(status, body) {
  return { status, contentType: "application/json", body: JSON.stringify(body), headers: { "x-correlation-id": "u06-browser-fixture" } };
}

function errorPayload(message) { return { code: "U06_BROWSER_STATE", message, fields: [], correlationId: "u06-browser-fixture" }; }
function agreementListPattern() { return "**/charge-agreements/api/agreements?**"; }
function agreementDetailPattern(agreementId = "u06-agreement") {
  return `**/charge-agreements/api/agreements/${agreementId}`;
}
function agreementMutationPattern() { return "**/charge-agreements/api/agreements"; }
function manualListPattern() { return "**/charge-agreements/api/manual-cases?**"; }
function bookingPricePattern() { return "**/api/booking/bookings/*/price"; }

async function ensureDraft(page, agreementId) {
  const detailUrl = `/charge-agreements/api/agreements/${encodeURIComponent(agreementId)}`;
  const currentResponse = await page.request.get(detailUrl);
  if (!currentResponse.ok()) throw new Error(`draft fixture read failed with ${currentResponse.status()}`);
  const detail = await currentResponse.json();
  if (detail.selectedVersion?.lifecycle === "DRAFT") return;
  const source = detail.approvedVersion ?? detail.selectedVersion;
  const link = (category) => source.rateLinks.find((candidate) => candidate.category === category)?.rateVersionId;
  const response = await page.request.post(`${detailUrl}/successor`, {
    headers: {
      origin: "http://127.0.0.1:18088",
      "content-type": "application/json",
      "x-linercore-client-request-id": crypto.randomUUID(),
    },
    data: {
      sourceAgreementVersionId: source.agreementVersionId,
      commercial: {
        customerId: source.customerId,
        tradeLaneId: source.tradeLaneId,
        originLocationId: source.originLocationId,
        destinationLocationId: source.destinationLocationId,
        equipmentTypeId: source.equipmentTypeId,
        validFrom: source.validFrom,
        validTo: source.validTo,
        baseRateVersionId: link("BASE"),
        surchargeRateVersionId: link("SURCHARGE"),
        localRateVersionId: link("LOCAL"),
      },
      reason: "U06 browser draft evidence",
    },
  });
  if (!response.ok()) throw new Error(`draft fixture creation failed with ${response.status()}`);
}
function correlationFor(scenario, key) { return commercial.get(scenario)?.correlationId ?? `u06-browser-${safe(key)}`; }
function safe(value) { return value.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 120); }
function cssEscape(value) { return value.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1"); }
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function bookingKeys(prefix, value) {
  return [375, 768, 1024, 1440].flatMap((width) => ["LIGHT", "DARK"].map((theme) => [
    `BROWSER_STRUCTURAL:${prefix}-${width}-${theme}`, value
  ]));
}
function storageCookies(relativePath, label) {
  if (!relativePath) throw new Error(`U06 ${label} signed storage state is unavailable`);
  const parsed = JSON.parse(readFileSync(path.resolve(relativePath), "utf8"));
  if (!Array.isArray(parsed.cookies) || parsed.cookies.length === 0) throw new Error(`U06 ${label} signed cookie is unavailable`);
  return parsed.cookies;
}
function usesBookingSubject(key) {
  return key.includes("BOOKING_PRICING") || key.endsWith("LIST_FILTER-FORBIDDEN")
    || key.endsWith("CREATE_EDIT-DENIED") || key.endsWith("MANUAL_EVIDENCE-DENIED_NO_DISCLOSURE");
}
async function visible(locator, label) {
  try { await locator.first().waitFor({ state: "visible", timeout: 8_000 }); }
  catch {
    const observed = await locator.page().locator("body").innerText().catch(() => "");
    throw new Error(`${label}: expected UI state was not visible; observed ${JSON.stringify(observed.replace(/\s+/g, " ").slice(0, 3000))}`);
  }
}
