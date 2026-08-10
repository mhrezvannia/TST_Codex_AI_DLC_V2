import { lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import {
  OBSERVABILITY_IDS,
  PRESERVATION_IDS,
  SECURITY_IDS,
  validateAudit,
  validateClosedMatrix,
  validateCommercialScenario,
  validateObservability,
  validatePerformanceSamples,
  validateResourceCycles,
} from "./live-gates.mjs";

const MAX_OBSERVATION_BYTES = 32 * 1024 * 1024;
const QUALITY_IDS = Object.freeze(["BACKEND", "FRONTEND", "CONTRACT", "MIGRATION", "COVERAGE", "NGINX", "PLAYWRIGHT", "PERFORMANCE", "RESTART_RESTORE", "GIT_DIFF"]);
const STAGE_CATEGORY = Object.freeze({
  commercial: ["COMMERCIAL"],
  security: ["SECURITY"],
  observability: ["OBSERVABILITY"],
  preservation: ["PRESERVATION"],
  quality: ["QUALITY"],
  audits: ["AUDIT"],
});

export function createObservationAdapter(stage, { root }) {
  return (state) => {
    if (!state.publication) return blocked(stage, "writer publication capability unavailable");
    const observationPath = path.join(root, "artifacts", "u06", "observations", `${stage}.json`);
    let envelope;
    try { envelope = readObservationEnvelope(observationPath, root); }
    catch (error) {
      if (error.code === "ENOENT") return blocked(stage, `observation capability unavailable: artifacts/u06/observations/${stage}.json`);
      throw error;
    }
    validateEnvelope(stage, envelope);
    if (stage === "readiness") return validateReadiness(envelope);
    if (stage === "performance") return validatePerformance(envelope);
    const categories = STAGE_CATEGORY[stage];
    const members = state.registry.members.filter((member) => categories.includes(member.category));
    if (envelope.results.length !== members.length
      || envelope.results.some((result, index) => result.key !== members[index].key)) {
      throw new Error(`${stage} observation registry order/cardinality mismatch`);
    }
    validateStageProof(stage, envelope);
    const registryResults = [];
    const artifacts = [];
    for (const [index, result] of envelope.results.entries()) {
      const member = members[index];
      if (result.status !== "PASS") {
        registryResults.push({ recordId: member.key, key: member.key, status: result.status,
          blockerId: result.status === "BLOCKED" ? result.blockerId ?? `B-${member.key}` : undefined,
          summary: result.summary, artifacts: [] });
        continue;
      }
      const payloadKinds = Object.keys(result.artifactPayloads ?? {}).sort();
      if (JSON.stringify(payloadKinds) !== JSON.stringify([...member.artifactKinds].sort())) {
        throw new Error(`${member.key} observation artifact kinds mismatch`);
      }
      const published = state.publication.publishCell({ registryKey: member.key, producingGate: stage, payloads: result.artifactPayloads });
      artifacts.push(...published.records);
      registryResults.push({ recordId: member.key, key: member.key, status: "PASS",
        scenario: member.correlationRequired ? result.scenario : undefined,
        correlationId: member.correlationRequired ? result.correlationId : undefined,
        artifacts: published.refs });
    }
    const status = registryResults.some((result) => result.status === "FAIL") ? "FAIL"
      : registryResults.some((result) => result.status === "BLOCKED") ? "BLOCKED" : "PASS";
    return { status, blockerId: status === "BLOCKED" ? `B-${stage}` : undefined, registryResults, artifacts,
      summary: `${stage} machine-readable observations=${registryResults.length}` };
  };
}

function readObservationEnvelope(filePath, root) {
  const stat = lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_OBSERVATION_BYTES) throw new Error("observation file identity/size rejected");
  const real = realpathSync.native(filePath);
  const allowed = path.resolve(root, "artifacts", "u06", "observations");
  if (!real.toLocaleLowerCase("en-US").startsWith(`${allowed.toLocaleLowerCase("en-US")}${path.sep}`)) throw new Error("observation containment rejected");
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function validateEnvelope(stage, envelope) {
  if (envelope?.schemaVersion !== 1 || envelope.stage !== stage || !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(envelope.observedAt)
    || Number.isNaN(Date.parse(envelope.observedAt))) throw new Error(`${stage} typed observation envelope invalid`);
}

function validateReadiness(envelope) {
  const proof = envelope.proof;
  return proof?.status === "PASS" && proof.signedAuthenticated === true && Array.isArray(proof.services)
    && proof.services.length > 0 && proof.services.every((service) => service.ready && service.authenticated)
    ? { status: "PASS", summary: `authenticated readiness observed for ${proof.services.length} services` }
    : blocked("readiness", "authenticated readiness observation incomplete");
}

function validatePerformance(envelope) {
  try {
    validatePerformanceSamples(envelope.proof?.samples ?? []);
    if (validateResourceCycles(envelope.proof?.cycles ?? []) !== "PASS") throw new Error("resource cycles mismatch");
    return { status: "PASS", summary: "fresh performance samples and resource cycles observed" };
  } catch (error) { return { status: "FAIL", summary: error.message }; }
}

function validateStageProof(stage, envelope) {
  const observations = envelope.results.map((result) => result.observation ?? { id: result.key.split(":")[1], status: result.status });
  if (stage === "commercial" && observations.some((item) => validateCommercialScenario(item) !== "PASS")) throw new Error("commercial observation mismatch");
  if (stage === "security" && validateClosedMatrix(SECURITY_IDS, observations) !== "PASS") throw new Error("security observation mismatch");
  if (stage === "observability" && validateObservability(observations) !== "PASS") throw new Error("observability observation mismatch");
  if (stage === "preservation" && validateClosedMatrix(PRESERVATION_IDS, observations) !== "PASS") throw new Error("preservation observation mismatch");
  if (stage === "quality" && validateClosedMatrix(QUALITY_IDS, observations) !== "PASS") throw new Error("quality observation mismatch");
  if (stage === "audits" && validateAudit(envelope.auditDomains) !== "PASS") throw new Error("audit observation mismatch");
}

function blocked(id, summary) {
  return { status: "BLOCKED", blockerId: `B-${id}`, summary };
}
