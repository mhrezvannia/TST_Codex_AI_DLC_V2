import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runW204Acceptance } from "./w2-04-live-acceptance.mjs";

test("drives ordered W2-04 lifecycle, typed conflicts, projection, and evidence", async () => {
  const bookingId = "booking-test";
  const journeyId = "journey-test";
  const history = [];
  const expected = [
    { sequence: 1, eventClassifierCode: "PLN", moveCode: "LOAD", locationId: "USNYC" },
    { sequence: 2, eventClassifierCode: "PLN", moveCode: "DISC", locationId: "NLRTM" }
  ];
  const server = createServer(async (request, response) => {
    const body = await readJson(request);
    if (request.method === "GET" && request.url.startsWith(`/api/container-movement/bookings/${bookingId}/journey`)) {
      return json(response, 200, journey());
    }
    if (request.method === "GET" && request.url.startsWith(`/api/container-movement/journeys/${journeyId}`)) {
      return json(response, 200, journey());
    }
    if (request.method === "GET" && request.url === `/api/bookings/${bookingId}`) {
      assert.equal(request.headers["x-linercore-service-id"], "booking-bff");
      return json(response, 200, {
        movementStatuses: history.length === 4 ? [{
          containerRef: "MSCU6639870", derivedStatus: "RETURNED_EMPTY", moveCode: "GTIN"
        }] : []
      });
    }
    if (request.method === "POST" && request.url === `/api/container-movement/journeys/${journeyId}/movements`) {
      const next = ["GTOT", "ACT_LOAD", "ACT_DISC", "ACT_GTIN"][history.length];
      if (body.eventType === "ACT_DISC" && history.length === 0) {
        return json(response, 409, { code: "OUT_OF_SEQUENCE_MOVEMENT", requiredNext: "GTOT" });
      }
      if (body.eventType === "GTOT" && history.length === 4) {
        return json(response, 409, { code: "DUPLICATE_MOVEMENT" });
      }
      assert.equal(body.eventType, next);
      history.push({ eventType: body.eventType, locationId: body.locationId });
      return json(response, 200, journey());
    }
    return json(response, 404, { code: "not_found" });
  });
  await new Promise((resolvePromise) => server.listen(0, "127.0.0.1", resolvePromise));
  const root = mkdtempSync(join(tmpdir(), "w2-04-acceptance-"));
  try {
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const evidenceFile = join(root, "evidence.json");
    const evidence = await runW204Acceptance({
      bookingId,
      cmmUrl: baseUrl,
      bookingUrl: baseUrl,
      evidenceFile,
      timeoutMs: 2_000,
      correlationPrefix: "test"
    });
    assert.equal(evidence.decision, "PASS");
    assert.equal(evidence.finalStatus, "RETURNED_EMPTY");
    assert.equal(evidence.history.length, 4);
    assert.equal(evidence.bookingProjection.moveCode, "GTIN");
    assert.equal(evidence.wrongNext.code, "OUT_OF_SEQUENCE_MOVEMENT");
    assert.equal(evidence.duplicate.code, "DUPLICATE_MOVEMENT");
    assert.equal(JSON.parse(readFileSync(evidenceFile, "utf8")).preservation.historicalW1Result, "BLOCKED_WAIVED");
  } finally {
    await new Promise((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise()));
    rmSync(root, { recursive: true, force: true });
  }

  function journey() {
    return {
      id: journeyId,
      bookingId,
      status: history.length === 4 ? "RETURNED_EMPTY" : "OPEN",
      expectedMovements: expected,
      history
    };
  }
});

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : null;
}

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}
