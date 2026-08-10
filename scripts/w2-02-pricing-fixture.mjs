import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

export const W2_02_CHARGE_URL = "http://127.0.0.1:18084";
export const W2_02_PRICING_AGREEMENT_NUMBER = "W2-02-LIVE-NA-EU-GEN";

async function checkedJson(response, operation) {
  const body = await response.text();
  if (!response.ok) throw new Error(`${operation} failed with HTTP ${response.status}: ${body}`);
  return JSON.parse(body);
}

export async function ensureW202PricingFixture({
  chargeURL = W2_02_CHARGE_URL,
  correlationId = randomUUID(),
  fetchImpl = fetch
} = {}) {
  if (chargeURL !== W2_02_CHARGE_URL) throw new Error(`W2-02 pricing fixture requires ${W2_02_CHARGE_URL}`);
  const search = new URL(`${chargeURL}/api/charge-agreements`);
  search.searchParams.set("customerId", "party-customer-local-carrier");
  search.searchParams.set("tradeLaneId", "NA-EU");
  search.searchParams.set("commodityId", "GEN");
  search.searchParams.set("includeInactive", "true");
  const headers = { "X-Correlation-Id": correlationId };
  const searched = await checkedJson(await fetchImpl(search, { headers }), "search W2-02 pricing fixture");
  const existing = searched.items?.find((item) => item.agreementNumber === W2_02_PRICING_AGREEMENT_NUMBER);
  let agreement = existing
    ? await checkedJson(await fetchImpl(`${chargeURL}/api/charge-agreements/${existing.id}?actor=w2-02-live`, { headers }), "read W2-02 pricing fixture")
    : await checkedJson(await fetchImpl(`${chargeURL}/api/charge-agreements`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementNumber: W2_02_PRICING_AGREEMENT_NUMBER,
          customerId: "party-customer-local-carrier",
          tradeLaneId: "NA-EU",
          commodityId: "GEN",
          validFrom: "2020-01-01",
          validTo: "2099-12-31",
          terms: [],
          actorSubjectId: "w2-02-live",
          reason: "W2-02 live acceptance fixture"
        })
      }), "create W2-02 pricing fixture");

  if (agreement.status === "DRAFT" && agreement.terms.length === 0) {
    agreement = await checkedJson(await fetchImpl(`${chargeURL}/api/charge-agreements/${agreement.id}?version=${agreement.version}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        agreementNumber: W2_02_PRICING_AGREEMENT_NUMBER,
        customerId: "party-customer-local-carrier",
        tradeLaneId: "NA-EU",
        commodityId: "GEN",
        validFrom: "2020-01-01",
        validTo: "2099-12-31",
        terms: [{
          id: "w2-02-ocean-freight",
          chargeCodeId: "charge-code-ofr",
          basis: "TEU",
          amount: 1000,
          currencyId: "currency-usd",
          validFrom: "2020-01-01",
          validTo: "2099-12-31",
          notes: "W2-02 deterministic live rate"
        }],
        actorSubjectId: "w2-02-live",
        reason: "Add deterministic W2-02 live rate"
      })
    }), "add W2-02 pricing fixture term");
  }
  if (agreement.status === "DRAFT") {
    agreement = await checkedJson(await fetchImpl(`${chargeURL}/api/charge-agreements/${agreement.id}/approve?version=${agreement.version}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ actorSubjectId: "w2-02-live", reason: "Approve W2-02 live acceptance rate" })
    }), "approve W2-02 pricing fixture");
  }
  if (agreement.status !== "APPROVED") {
    throw new Error(`W2-02 pricing fixture ${agreement.id} is ${agreement.status}, expected APPROVED`);
  }
  return {
    name: "approved-charge-agreement",
    status: "PASS",
    agreementId: agreement.id,
    agreementNumber: W2_02_PRICING_AGREEMENT_NUMBER,
    source: existing ? "reused" : "created"
  };
}

async function main() {
  if (!process.argv.includes("--json")) throw new Error("Usage: node scripts/w2-02-pricing-fixture.mjs --json");
  process.stdout.write(`${JSON.stringify(await ensureW202PricingFixture())}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
