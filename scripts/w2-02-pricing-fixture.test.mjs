import assert from "node:assert/strict";
import test from "node:test";
import { ensureW202PricingFixture, W2_02_PRICING_AGREEMENT_NUMBER } from "./w2-02-pricing-fixture.mjs";

const json = (value, status = 200) => Response.json(value, { status });

test("creates, rates, and approves the deterministic W2-02 pricing agreement", async () => {
  const calls = [];
  const responses = [
    json({ items: [] }),
    json({ id: "agreement-1", version: 1, status: "DRAFT", terms: [] }, 201),
    json({ id: "agreement-1", version: 2, status: "DRAFT", terms: [{ id: "w2-02-ocean-freight" }] }),
    json({ id: "agreement-1", version: 3, status: "APPROVED", terms: [{ id: "w2-02-ocean-freight" }] })
  ];
  const fetchImpl = async (input, init = {}) => {
    calls.push({ url: String(input), method: init.method ?? "GET", body: init.body ? JSON.parse(init.body) : null });
    return responses.shift();
  };

  const result = await ensureW202PricingFixture({ correlationId: "corr-fixture", fetchImpl });

  assert.deepEqual(result, {
    name: "approved-charge-agreement",
    status: "PASS",
    agreementId: "agreement-1",
    agreementNumber: W2_02_PRICING_AGREEMENT_NUMBER,
    source: "created"
  });
  assert.deepEqual(calls.map(({ method }) => method), ["GET", "POST", "PUT", "POST"]);
  assert.equal(calls[1].body.tradeLaneId, "NA-EU");
  assert.equal(calls[2].body.terms[0].chargeCodeId, "charge-code-ofr");
  assert.equal(calls[2].body.terms[0].basis, "TEU");
});

test("reuses an already approved deterministic pricing agreement without mutation", async () => {
  const calls = [];
  const responses = [
    json({ items: [{ id: "agreement-2", agreementNumber: W2_02_PRICING_AGREEMENT_NUMBER }] }),
    json({ id: "agreement-2", version: 4, status: "APPROVED", terms: [{ id: "rate-1" }] })
  ];
  const result = await ensureW202PricingFixture({
    correlationId: "corr-reuse",
    fetchImpl: async (input, init = {}) => {
      calls.push({ url: String(input), method: init.method ?? "GET" });
      return responses.shift();
    }
  });

  assert.equal(result.source, "reused");
  assert.equal(result.agreementId, "agreement-2");
  assert.deepEqual(calls.map(({ method }) => method), ["GET", "GET"]);
});
