import { validateCommercialScenario } from "./live-gates.mjs";

export const COMMERCIAL_IDS = Object.freeze([
  "AGREEMENT_PRICE", "TARIFF_FALLBACK", "SUCCESSOR_REPRICE", "NO_RATE",
  "AMBIGUITY_AGREEMENT", "AMBIGUITY_BASE", "AMBIGUITY_SURCHARGE", "AMBIGUITY_LOCAL",
  "OUTAGE_TIMEOUT", "OUTAGE_503", "OUTAGE_CIRCUIT", "CHARGE_DISABLED", "RECONFIRM_NO_CHARGE",
]);

export function buildCommercialEnvelope(observations, now = new Date()) {
  if (!Array.isArray(observations) || observations.length !== COMMERCIAL_IDS.length) {
    throw new Error("commercial observation cardinality mismatch");
  }
  const results = observations.map((observation, index) => {
    const id = COMMERCIAL_IDS[index];
    if (observation?.id !== id || validateCommercialScenario(observation) !== "PASS") {
      throw new Error(`commercial observation mismatch: ${id}`);
    }
    const correlationId = observation.correlationId;
    const http = observation.httpEvidence;
    const database = observation.databaseEvidence;
    if (!Array.isArray(http) || http.length !== observation.httpCount
      || !Array.isArray(database) || database.length === 0
      || http.some((item) => item.correlationId !== correlationId)
      || database.some((item) => item.correlationId !== correlationId)) {
      throw new Error(`commercial evidence correlation mismatch: ${id}`);
    }
    return {
      key: `COMMERCIAL:${id}`,
      status: "PASS",
      scenario: id,
      correlationId,
      observation: publicObservation(observation),
      artifactPayloads: {
        "http-evidence": { schemaVersion: 1, scenario: id, correlationId, exchanges: http },
        "database-evidence": { schemaVersion: 1, scenario: id, correlationId, observations: database },
        "correlation-proof": { schemaVersion: 1, scenario: id, correlationId,
          httpHops: http.length, databaseOwners: observation.ownerLocalDbOwners },
      },
    };
  });
  return { schemaVersion: 1, stage: "commercial", observedAt: now.toISOString(), results };
}

function publicObservation(observation) {
  const { httpEvidence: _httpEvidence, databaseEvidence: _databaseEvidence, ...value } = observation;
  return value;
}
