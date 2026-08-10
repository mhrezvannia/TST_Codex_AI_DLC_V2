import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCommercialEnvelope } from "../tools/u06/commercial-observer.mjs";
import { expectedPrice } from "../tools/u06/live-gates.mjs";
import { readSignedCookie } from "../tools/u06/readiness-observer.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EDGE = "http://127.0.0.1:18088";
const PRICE = expectedPrice();
const BOOKING_INPUT = Object.freeze({
  customerId: "LOCAL-CARRIER",
  routing: [{ legSequence: 1, loadUnLocode: "USNYC", dischargeUnLocode: "NLRTM", voyageId: "LC001E" }],
  currency: "USD", cargoMode: "FCL_DRY", reefer: false, dangerousGoods: false,
});
const MANUAL_REASON = Object.freeze({
  NO_RATE: "NO_RATE",
  AMBIGUITY_AGREEMENT: "AMBIGUOUS_AGREEMENT_AUTHORITY",
  AMBIGUITY_BASE: "AMBIGUOUS_BASE_RATE",
  AMBIGUITY_SURCHARGE: "AMBIGUOUS_SURCHARGE_RATE",
  AMBIGUITY_LOCAL: "AMBIGUOUS_LOCAL_RATE",
});

export async function runCommercialObservation({ storageStatePath, output = "artifacts/u06/observations/commercial.json",
  now = () => new Date(), fetchImpl = fetch, execute = runWave }) {
  const cookie = readSignedCookie(root, storageStatePath, now());
  const token = now().toISOString().replace(/\D/g, "").slice(2, 14);
  const context = { cookie: `${cookie.name}=${cookie.value}`, token, fetchImpl, execute };
  seedAuthorities(context);

  const byId = new Map();
  byId.set("AGREEMENT_PRICE", await pricedScenario(context, "AGREEMENT_PRICE", "2026-08-01", "22G1", "AGREEMENT"));
  byId.set("TARIFF_FALLBACK", await pricedScenario(context, "TARIFF_FALLBACK", "2026-09-01", "22G1", "TARIFF"));
  byId.set("SUCCESSOR_REPRICE", await successorScenario(context));
  for (const id of Object.keys(MANUAL_REASON)) byId.set(id, await manualScenario(context, id));
  byId.set("RECONFIRM_NO_CHARGE", await reconfirmScenario(context));
  byId.set("OUTAGE_TIMEOUT", await outageScenario(context, "OUTAGE_TIMEOUT", "pause"));
  byId.set("OUTAGE_503", await outageScenario(context, "OUTAGE_503", "stop"));
  byId.set("OUTAGE_CIRCUIT", await circuitScenario(context));
  restartAndWait(context, "booking-service");
  byId.set("CHARGE_DISABLED", await outageScenario(context, "CHARGE_DISABLED", "stop"));

  const order = ["AGREEMENT_PRICE", "TARIFF_FALLBACK", "SUCCESSOR_REPRICE", "NO_RATE",
    "AMBIGUITY_AGREEMENT", "AMBIGUITY_BASE", "AMBIGUITY_SURCHARGE", "AMBIGUITY_LOCAL",
    "OUTAGE_TIMEOUT", "OUTAGE_503", "OUTAGE_CIRCUIT", "CHARGE_DISABLED", "RECONFIRM_NO_CHARGE"];
  const envelope = buildCommercialEnvelope(order.map((id) => byId.get(id)), now());
  const absolute = path.resolve(root, output); const allowed = path.resolve(root, "artifacts", "u06", "observations");
  if (absolute !== path.join(allowed, "commercial.json")) throw new Error("commercial observation output path rejected");
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify({ status: "PASS", scenarios: envelope.results.length })}\n`);
  return envelope;
}

async function pricedScenario(context, id, date, equipment, expectedBasis) {
  const requestedCorrelation = correlation(context, id); const httpEvidence = [];
  const booking = await createValidatedBooking(context, { id, date, equipment, correlationId: requestedCorrelation });
  const priced = await bookingCommand(context, booking.id, "price", {}, `${id}-price`, requestedCorrelation, httpEvidence);
  const correlationId = priced.correlationId;
  if (priced.status !== 200 || priced.body?.result?.outcome !== "PRICED") throw new Error(`${id} did not price`);
  const snapshot = priced.body.result.typedSnapshot;
  if (snapshot?.pricingBasis !== expectedBasis) throw new Error(`${id} pricing basis mismatch`);
  const price = priceFromSnapshot(snapshot);
  if (JSON.stringify(price) !== JSON.stringify(PRICE)) throw new Error(`${id} independent price mismatch`);
  const counts = evidenceCounts(context, correlationId);
  if (counts.chargeReceipts !== 1 || counts.bookingSnapshots !== 1) throw new Error(`${id} receipt/snapshot cardinality mismatch`);
  return commercial(id, correlationId, httpEvidence, counts, {
    price, receiptCount: counts.chargeReceipts, snapshotCount: counts.bookingSnapshots,
    pricingBasis: snapshot.pricingBasis, pricingRef: snapshot.pricingRef,
  });
}

async function successorScenario(context) {
  const id = "SUCCESSOR_REPRICE"; const requestedCorrelation = correlation(context, id); const httpEvidence = [];
  const booking = await createValidatedBooking(context, { id, date: "2026-10-01", equipment: "22G1", correlationId: requestedCorrelation });
  const first = await bookingCommand(context, booking.id, "price", {}, `${id}-first`, requestedCorrelation, []);
  if (first.status !== 200) throw new Error("successor prior price failed");
  const confirmed = await bookingCommand(context, booking.id, "confirm", {}, `${id}-confirm`, requestedCorrelation, []);
  if (confirmed.status !== 200) throw new Error("successor prior confirmation failed");
  const amended = await bookingCommand(context, booking.id, "amend", { attributes: { ...booking.attributes,
    requestedDepartureDate: "2026-10-02" } }, `${id}-amend`, requestedCorrelation, []);
  if (amended.status !== 200) {
    throw new Error(`successor amendment failed: status=${amended.status} body=${JSON.stringify(amended.body)}`);
  }
  const repriced = await bookingCommand(context, booking.id, "price", {}, `${id}-reprice`, requestedCorrelation, httpEvidence);
  const correlationId = repriced.correlationId;
  const snapshot = repriced.body?.result?.typedSnapshot; const price = priceFromSnapshot(snapshot);
  if (repriced.status !== 200 || snapshot?.agreementVersionId !== "u06-successor-v2"
    || JSON.stringify(price) !== JSON.stringify(PRICE) || repriced.body?.history?.prior?.length !== 1) {
    throw new Error(`successor reprice/history mismatch: status=${repriced.status}`
      + ` agreementVersionId=${snapshot?.agreementVersionId ?? "missing"}`
      + ` price=${JSON.stringify(price)} history=${JSON.stringify(repriced.body?.history ?? null)}`);
  }
  const counts = evidenceCounts(context, correlationId);
  return commercial(id, correlationId, httpEvidence, counts, { price, receiptCount: 1, snapshotCount: 1,
    historyCount: counts.bookingSnapshots, currentAgreementVersionId: snapshot.agreementVersionId });
}

async function manualScenario(context, id) {
  const requestedCorrelation = correlation(context, id); const httpEvidence = [];
  const config = manualConfig(id);
  const booking = await createValidatedBooking(context, { id, date: config.date, equipment: config.equipment, correlationId: requestedCorrelation });
  const result = await bookingCommand(context, booking.id, "price", {}, `${id}-price`, requestedCorrelation, httpEvidence);
  const correlationId = result.correlationId;
  const failure = result.body?.result?.failureEvidence;
  if (result.status !== 422 || result.body?.result?.outcome !== "MANUAL_PRICING_REQUIRED"
    || failure?.reasonCode !== MANUAL_REASON[id] || result.body?.result?.typedSnapshot != null) {
    throw new Error(`${id} manual terminal mismatch`);
  }
  const counts = evidenceCounts(context, correlationId);
  if (counts.chargeCases !== 1 || counts.bookingSnapshots !== 0) throw new Error(`${id} manual evidence cardinality mismatch`);
  return commercial(id, correlationId, httpEvidence, counts, { amountPresent: false, caseCount: counts.chargeCases,
    reasonCode: failure.reasonCode, manualCaseId: failure.manualCaseId });
}

async function reconfirmScenario(context) {
  const id = "RECONFIRM_NO_CHARGE"; const setupCorrelation = correlation(context, id);
  const booking = await createValidatedBooking(context, { id, date: "2026-09-01", equipment: "22G1", correlationId: setupCorrelation });
  const priced = await bookingCommand(context, booking.id, "price", {}, `${id}-price`, setupCorrelation, []);
  if (priced.status !== 200) throw new Error("reconfirm setup price failed");
  const confirmed = await bookingCommand(context, booking.id, "confirm", {}, `${id}-confirm`, setupCorrelation, []);
  if (confirmed.status !== 200) throw new Error("reconfirm setup confirmation failed");
  const amended = await bookingCommand(context, booking.id, "amend", { attributes: { ...booking.attributes, note: "u06-non-pricing" } },
    `${id}-amend`, setupCorrelation, []);
  if (amended.status !== 200) {
    throw new Error(`reconfirm setup amendment failed: status=${amended.status} body=${JSON.stringify(amended.body)}`);
  }
  const reconfirmCorrelation = `${setupCorrelation}-only`;
  const reconfirmHttp = [];
  const reconfirmed = await bookingCommand(context, booking.id, "reconfirm", {}, `${id}-reconfirm`, reconfirmCorrelation, reconfirmHttp);
  if (reconfirmed.status !== 200) throw new Error("reconfirm command failed");
  const correlationId = reconfirmed.correlationId;
  const counts = evidenceCounts(context, correlationId);
  return commercial(id, correlationId, reconfirmHttp, counts, { chargeCalls: counts.chargeReceipts,
    ownerLocalDbOwners: ["BOOKING"] });
}

async function outageScenario(context, id, fault) {
  const requestedCorrelation = correlation(context, id); const httpEvidence = [];
  const booking = await createValidatedBooking(context, { id, date: "2026-12-01", equipment: "45G1", correlationId: requestedCorrelation });
  let result;
  if (fault === "pause") {
    wave(context, ["pause", "charge-agreement-service"]);
    try { result = await bookingCommand(context, booking.id, "price", {}, `${id}-price`, requestedCorrelation, httpEvidence, 8_000); }
    finally {
      // A paused process retains accepted TCP work. Kill it before restart so
      // timed-out requests cannot drain later and fabricate Charge evidence.
      wave(context, ["kill", "charge-agreement-service"]);
      restartAndWait(context, "charge-agreement-service");
    }
  } else {
    wave(context, ["stop", "charge-agreement-service"]);
    try { result = await bookingCommand(context, booking.id, "price", {}, `${id}-price`, requestedCorrelation, httpEvidence, 8_000); }
    finally { restartAndWait(context, "charge-agreement-service"); }
  }
  if (![503, 504].includes(result.status) || result.body?.result?.typedSnapshot != null) throw new Error(`${id} outage mismatch`);
  const correlationId = result.correlationId;
  await delay(500);
  const counts = evidenceCounts(context, correlationId);
  if (counts.chargeCases !== 0 || counts.bookingSnapshots !== 0) {
    throw new Error(`${id} fabricated terminal evidence: status=${result.status}`
      + ` outcome=${result.body?.result?.outcome ?? result.body?.code ?? "missing"}`
      + ` counts=${JSON.stringify(counts)}`);
  }
  return commercial(id, correlationId, httpEvidence, counts, { amountPresent: false, chargeCaseCount: counts.chargeCases,
    faultMode: fault, bookingOutcome: result.body?.result?.outcome ?? result.body?.code });
}

async function circuitScenario(context) {
  const id = "OUTAGE_CIRCUIT"; const correlationId = correlation(context, id); const httpEvidence = [];
  const bookings = [];
  for (let index = 0; index < 6; index++) bookings.push(await createValidatedBooking(context, {
    id: `${id}-${index}`, date: "2026-12-02", equipment: "45G1",
    correlationId: index === 5 ? correlationId : `${correlationId}-prime-${index}`,
  }));
  wave(context, ["stop", "charge-agreement-service"]);
  let result;
  try {
    for (let index = 0; index < 5; index++) await bookingCommand(context, bookings[index].id, "price", {}, `${id}-prime-${index}`,
      `${correlationId}-prime-${index}`, [], 8_000);
    result = await bookingCommand(context, bookings[5].id, "price", {}, `${id}-price`, correlationId, httpEvidence, 8_000);
  } finally { restartAndWait(context, "charge-agreement-service"); }
  if (result.body?.result?.failureEvidence?.reasonCode !== "CIRCUIT_OPEN") throw new Error("circuit did not open");
  const effectiveCorrelation = result.correlationId;
  const counts = evidenceCounts(context, effectiveCorrelation);
  return commercial(id, effectiveCorrelation, httpEvidence, counts, { amountPresent: false, chargeCaseCount: counts.chargeCases,
    bookingOutcome: result.body.result.outcome, reasonCode: "CIRCUIT_OPEN" });
}

async function createValidatedBooking(context, { id, date, equipment, correlationId }) {
  const setupEvidence = [];
  const body = { ...BOOKING_INPUT,
    equipment: [{ equipmentTypeCode: equipment, quantity: 1, equipmentId: "MSCU6639870" }],
    attributes: { tradeLaneId: "trade-lane-na-eu", commodityCode: "GEN", requestedDepartureDate: date } };
  const created = await edgeCommand(context, "/api/bookings", body, `${id}-create`, correlationId, setupEvidence);
  if (created.status !== 201 || !created.body?.id) throw new Error(`${id} booking create failed`);
  const validated = await bookingCommand(context, created.body.id, "validate", {}, `${id}-validate`, correlationId, setupEvidence);
  if (validated.status !== 200 || validated.body?.status !== "VALIDATED") throw new Error(`${id} booking validate failed`);
  return validated.body;
}

function bookingCommand(context, bookingId, action, body, key, correlationId, evidence, timeoutMs) {
  return edgeCommand(context, `/api/bookings/${encodeURIComponent(bookingId)}/${action}`, body, key, correlationId, evidence, timeoutMs);
}

async function edgeCommand(context, pathname, body, key, correlationId, evidence, timeoutMs = 15_000) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await context.fetchImpl(`${EDGE}${pathname}`, { method: "POST", signal: controller.signal,
      headers: { cookie: context.cookie, origin: EDGE, "content-type": "application/json",
        "idempotency-key": `u06-${context.token}-${safe(key)}`, "x-correlation-id": correlationId }, body: JSON.stringify(body) });
  } finally { clearTimeout(timeout); }
  const text = await response.text(); let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = { unparsed: true }; }
  const responseCorrelationId = response.headers.get("x-correlation-id") ?? parsed?.correlationId ?? correlationId;
  evidence.push({ method: "POST", path: pathname, status: response.status, correlationId: responseCorrelationId });
  return { status: response.status, body: parsed, correlationId: responseCorrelationId };
}

function seedAuthorities(context) {
  psql(context, "linercore_pricing", "linercore_pricing", RATE_SEED_SQL);
  psql(context, "linercore_pricing", "linercore_pricing", agreementSql("u06-agreement", "u06-agreement-v1", "2026-08-01"));
  psql(context, "linercore_pricing", "linercore_pricing", successorSql());
  psql(context, "linercore_pricing", "linercore_pricing", agreementSql("u06-amb-a", "u06-amb-a-v1", "2026-11-01")
    + agreementSql("u06-amb-b", "u06-amb-b-v1", "2026-11-01"));
  for (const [category, date] of [["BASE", "2026-08-03"], ["SURCHARGE", "2026-08-04"], ["LOCAL", "2026-08-05"]]) {
    psql(context, "linercore_pricing", "linercore_pricing", ambiguityRateSql(context.token, category, date));
  }
}

function evidenceCounts(context, correlationId) {
  const q = sqlLiteral(correlationId);
  const charge = JSON.parse(psql(context, "linercore_pricing", "linercore_pricing",
    `SELECT json_build_object('receipts',COUNT(DISTINCT p.idempotency_key),'cases',COUNT(DISTINCT m.case_id))::text FROM pricing_requests p LEFT JOIN manual_pricing_cases m ON m.case_id=p.manual_case_id WHERE p.correlation_id=${q};`, true));
  const booking = JSON.parse(psql(context, "linercore_booking", "linercore_booking",
    `SELECT json_build_object('snapshots',COUNT(DISTINCT s.pricing_request_id),'receipts',COUNT(DISTINCT i.idempotency_key))::text FROM booking_idempotency i LEFT JOIN booking_pricing_snapshots s ON s.booking_id=i.booking_id AND s.correlation_id=${q} WHERE i.correlation_id=${q};`, true));
  return { chargeReceipts: Number(charge.receipts), chargeCases: Number(charge.cases),
    bookingSnapshots: Number(booking.snapshots), bookingReceipts: Number(booking.receipts) };
}

function commercial(id, correlationId, httpEvidence, counts, extra) {
  const ownerLocalDbOwners = extra.ownerLocalDbOwners ?? ["CHARGE", "BOOKING"];
  return { id, correlationId, httpCount: httpEvidence.length, ownerLocalDbOwners, ...extra,
    httpEvidence, databaseEvidence: ownerLocalDbOwners.map((owner) => ({ owner, correlationId,
      rowCount: owner === "CHARGE" ? counts.chargeReceipts + counts.chargeCases : counts.bookingReceipts + counts.bookingSnapshots,
      counts: owner === "CHARGE" ? { receipts: counts.chargeReceipts, cases: counts.chargeCases }
        : { receipts: counts.bookingReceipts, snapshots: counts.bookingSnapshots } })) };
}

function priceFromSnapshot(snapshot) {
  return { lines: (snapshot?.lines ?? []).map((line) => ({ category: line.rateCategory, code: line.chargeCode,
    unitRate: Number(line.unitRate).toFixed(2), versionId: line.sourceRateVersionId,
    quantity: line.quantity, amount: Number(line.amount).toFixed(2) })),
    total: Number(snapshot?.total).toFixed(2), currency: snapshot?.currency };
}

function manualConfig(id) {
  if (id === "NO_RATE") return { date: "2026-08-02", equipment: "42G1" };
  if (id === "AMBIGUITY_AGREEMENT") return { date: "2026-11-01", equipment: "22G1" };
  const dates = { AMBIGUITY_BASE: "2026-08-03", AMBIGUITY_SURCHARGE: "2026-08-04", AMBIGUITY_LOCAL: "2026-08-05" };
  return { date: dates[id], equipment: "42G1" };
}

function wave(context, args) {
  const result = context.execute(args);
  if (result.status !== 0) throw new Error(`Wave A command failed: ${args.join(" ")}: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function psql(context, user, database, sql, scalar = false) {
  const output = wave(context, ["exec", "-T", "postgres", "psql", "-U", user, "-X", "-v", "ON_ERROR_STOP=1",
    "-d", database, ...(scalar ? ["-At"] : []), "-c", sql]);
  return scalar ? output.trim().split(/\r?\n/).filter(Boolean).at(-1) : output;
}

function runWave(args) {
  return spawnSync(process.execPath, ["scripts/wave-a-compose.mjs", ...args], { cwd: root, encoding: "utf8", timeout: 120_000,
    windowsHide: true, env: process.env });
}

function restartAndWait(context, service) {
  wave(context, ["restart", service]);
  wave(context, ["up", "-d", "--no-deps", "--wait", service]);
}

function correlation(context, id) { return `u06-${context.token}-${id.toLowerCase().replaceAll("_", "-")}`; }
function safe(value) { return value.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 80); }
function sqlLiteral(value) {
  if (!/^[A-Za-z0-9._:-]{1,128}$/.test(value)) throw new Error("unsafe SQL fixture value");
  return `'${value.replaceAll("'", "''")}'`;
}
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function agreementSql(agreementId, versionId, date, sourceVersionId = null) {
  const versionNo = sourceVersionId ? 2 : 1;
  return `
INSERT INTO charge_agreements(id,agreement_number,customer_id,trade_lane_id,commodity_id,valid_from,valid_to,status,version,created_by,created_at,snapshot,authority_model)
VALUES ('${agreementId}','${agreementId}','party-customer-local-carrier','trade-lane-na-eu',NULL,'${date}','${date}','DRAFT',${versionNo},'u06',CURRENT_TIMESTAMP,'{}','W2_VERSIONED');
INSERT INTO charge_agreement_versions(agreement_version_id,agreement_id,version_no,authority_model,w2_authority_eligible,customer_id,trade_lane_id,origin_location_id,destination_location_id,equipment_type_id,commodity_id,valid_from,valid_to,lifecycle,legacy_status,row_version,source_version_id,created_by,created_at,correlation_id,snapshot)
VALUES ('${versionId}','${agreementId}',${versionNo},'W2_VERSIONED',TRUE,'party-customer-local-carrier','trade-lane-na-eu','location-usnyc','location-nlrot','equipment-type-22g1',NULL,'${date}','${date}','DRAFT',NULL,0,${sourceVersionId ? `'${sourceVersionId}'` : "NULL"},'u06',CURRENT_TIMESTAMP,'u06-seed','{}');
INSERT INTO charge_agreement_rate_links(agreement_version_id,rate_category,rate_version_id,linked_by,linked_at,correlation_id) VALUES
('${versionId}','BASE','rv-ofr-1','u06',CURRENT_TIMESTAMP,'u06-seed'),('${versionId}','SURCHARGE','rv-baf-1','u06',CURRENT_TIMESTAMP,'u06-seed'),('${versionId}','LOCAL','rv-thc-1','u06',CURRENT_TIMESTAMP,'u06-seed');
UPDATE charge_agreement_versions SET lifecycle='APPROVED',row_version=1,approved_by='u06',approved_at=CURRENT_TIMESTAMP WHERE agreement_version_id='${versionId}';
`;
}

function successorSql() {
  const first = agreementSql("u06-successor", "u06-successor-v1", "2026-10-01");
  return first + `
INSERT INTO charge_agreement_versions(agreement_version_id,agreement_id,version_no,authority_model,w2_authority_eligible,customer_id,trade_lane_id,origin_location_id,destination_location_id,equipment_type_id,commodity_id,valid_from,valid_to,lifecycle,legacy_status,row_version,source_version_id,created_by,created_at,correlation_id,snapshot)
VALUES ('u06-successor-v2','u06-successor',2,'W2_VERSIONED',TRUE,'party-customer-local-carrier','trade-lane-na-eu','location-usnyc','location-nlrot','equipment-type-22g1',NULL,'2026-10-02','2026-10-02','DRAFT',NULL,0,'u06-successor-v1','u06',CURRENT_TIMESTAMP,'u06-seed','{}');
INSERT INTO charge_agreement_rate_links(agreement_version_id,rate_category,rate_version_id,linked_by,linked_at,correlation_id) VALUES
('u06-successor-v2','BASE','rv-ofr-1','u06',CURRENT_TIMESTAMP,'u06-seed'),('u06-successor-v2','SURCHARGE','rv-baf-1','u06',CURRENT_TIMESTAMP,'u06-seed'),('u06-successor-v2','LOCAL','rv-thc-1','u06',CURRENT_TIMESTAMP,'u06-seed');
UPDATE charge_agreement_versions SET lifecycle='APPROVED',row_version=1,approved_by='u06',approved_at=CURRENT_TIMESTAMP WHERE agreement_version_id='u06-successor-v2';
UPDATE charge_agreements SET version=2 WHERE id='u06-successor';
`;
}

function ambiguityRateSql(token, ambiguous, date) {
  const rows = [];
  const values = { BASE: ["OFR", "charge-code-ofr", "100.25"], SURCHARGE: ["BAF", "charge-code-baf", "20.10"], LOCAL: ["THC", "charge-code-thc", "5.55"] };
  for (const category of ["BASE", "SURCHARGE", "LOCAL"]) {
    const count = category === ambiguous ? 2 : 1;
    for (let index = 1; index <= count; index++) {
      const stem = `u06-${token}-${date.slice(-2)}-${category.toLowerCase()}-${index}`;
      const [code, codeId, rate] = values[category]; const destination = category === "LOCAL" ? "NULL" : "'location-nlrot'";
      rows.push(`INSERT INTO charge_rates(rate_id,category,charge_code_id,charge_code,next_version_no,stable_row_version,created_by,created_at,correlation_id) VALUES ('${stem}','${category}','${codeId}','${code}',2,0,'u06',CURRENT_TIMESTAMP,'u06-seed');`);
      rows.push(`INSERT INTO charge_rate_versions(version_id,rate_id,version_no,lifecycle,basis,currency_id,currency_code,unit_rate,effective_from,effective_to,origin_location_id,destination_location_id,equipment_type_id,row_version,created_by,created_at,approved_by,approved_at,correlation_id) VALUES ('${stem}-v1','${stem}',1,'APPROVED','PER_CONTAINER','currency-usd','USD',${rate},'${date}','${date}','location-usnyc',${destination},'equipment-type-42g1',1,'u06',CURRENT_TIMESTAMP,'u06',CURRENT_TIMESTAMP,'u06-seed');`);
    }
  }
  return rows.join("\n");
}

const RATE_SEED_SQL = `
INSERT INTO charge_rates(rate_id,category,charge_code_id,charge_code,next_version_no,stable_row_version,created_by,created_at,correlation_id) VALUES
('rate-ofr-1','BASE','charge-code-ofr','OFR',2,0,'u06',CURRENT_TIMESTAMP,'u06-seed'),
('rate-baf-1','SURCHARGE','charge-code-baf','BAF',2,0,'u06',CURRENT_TIMESTAMP,'u06-seed'),
('rate-thc-1','LOCAL','charge-code-thc','THC',2,0,'u06',CURRENT_TIMESTAMP,'u06-seed');
INSERT INTO charge_rate_versions(version_id,rate_id,version_no,lifecycle,basis,currency_id,currency_code,unit_rate,effective_from,effective_to,origin_location_id,destination_location_id,equipment_type_id,row_version,created_by,created_at,approved_by,approved_at,correlation_id) VALUES
('rv-ofr-1','rate-ofr-1',1,'APPROVED','PER_CONTAINER','currency-usd','USD',100.25,'2026-01-01','2026-12-31','location-usnyc','location-nlrot','equipment-type-22g1',1,'u06',CURRENT_TIMESTAMP,'u06',CURRENT_TIMESTAMP,'u06-seed'),
('rv-baf-1','rate-baf-1',1,'APPROVED','PER_CONTAINER','currency-usd','USD',20.10,'2026-01-01','2026-12-31','location-usnyc','location-nlrot','equipment-type-22g1',1,'u06',CURRENT_TIMESTAMP,'u06',CURRENT_TIMESTAMP,'u06-seed'),
('rv-thc-1','rate-thc-1',1,'APPROVED','PER_CONTAINER','currency-usd','USD',5.55,'2026-01-01','2026-12-31','location-usnyc',NULL,'equipment-type-22g1',1,'u06',CURRENT_TIMESTAMP,'u06',CURRENT_TIMESTAMP,'u06-seed');
`;

function valueAfter(argv, flag) { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runCommercialObservation({ storageStatePath: valueAfter(process.argv, "--storage-state") });
}
