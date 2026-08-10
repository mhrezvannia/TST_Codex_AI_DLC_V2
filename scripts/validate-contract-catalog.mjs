import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ALLOWED_COMPATIBILITY = new Set([
  "pending",
  "compatible",
  "compatible_with_warning",
  "incompatible",
  "breaking",
  "failed",
  "not_comparable",
  "unknown"
]);

export const ALLOWED_LIFECYCLE = new Set([
  "review",
  "draft_document",
  "candidate_executable",
  "verified",
  "deprecated",
  "retired",
  "failed"
]);

export const ALLOWED_COMPATIBILITY_MODES = new Set(["backward", "forward", "full", "none"]);

export const REQUIRED_EVENTS = [
  "referencedata.party-customer.changed",
  "referencedata.location.changed",
  "referencedata.region.changed",
  "referencedata.voyage.changed",
  "referencedata.currency.changed",
  "referencedata.charge-code.changed",
  "referencedata.equipment-type.changed",
  "referencedata.commodity.changed",
  "referencedata.trade-lane.changed"
];

export const REQUIRED_EVENT_SCHEMAS = {
  "event-reference-data-changed": {
    eventTypes: REQUIRED_EVENTS,
    requiredFields: ["eventId", "eventType", "schemaVersion", "source", "occurredAt", "correlationId", "entityId", "operation", "payload"]
  },
  "event-booking-confirmed": {
    eventTypes: ["booking.confirmed"],
    requiredFields: [
      "id", "source", "type", "time", "correlationId", "dataSchemaVersion",
      "data.bookingId", "data.bookingRevision", "data.routing[]", "data.routing[].legSequence",
      "data.routing[].loadUnLocode", "data.routing[].dischargeUnLocode", "data.routing[].voyageId",
      "data.equipment[]", "data.equipment[].equipmentTypeCode", "data.equipment[].quantity"
    ]
  },
  "event-container-movement-status": {
    eventTypes: ["containermovement.status"],
    requiredFields: [
      "id", "source", "type", "time", "correlationId", "dataSchemaVersion",
      "data.bookingRef", "data.containerRef", "data.moveCode", "data.eventClassifierCode",
      "data.occurredDateTime", "data.receivedDateTime", "data.derivedStatus",
      "data.emptyIndicatorCode", "data.transshipment", "data.location.unLocationCode"
    ]
  }
};

export const REQUIRED_CONTRACT_IDS = [
  "api-reference-data-service",
  "api-identity-service",
  "api-charge-agreement-service",
  "asyncapi-reference-data-events",
  "asyncapi-booking-confirmed",
  "asyncapi-container-movement-status",
  "event-reference-data-changed",
  "event-booking-confirmed",
  "event-container-movement-status",
  "pact-booking-charge-pricing",
  "pact-booking-charge-dnd",
  "message-pact-booking-confirmed",
  "message-pact-container-movement-status"
];

const REQUIRED_FIELDS = [
  "contractId",
  "kind",
  "owner",
  "sourceService",
  "version",
  "lifecycleStatus",
  "artifactPath",
  "compatibilityStatus",
  "compatibilityMode",
  "protocol",
  "seamId",
  "linkedStories",
  "linkedRequirements"
];

export function validateContractCatalog(root = process.cwd(), options = {}) {
  const failures = [];
  const catalogPath = join(root, "contracts/catalog/contract-catalog.json");
  if (!existsSync(catalogPath)) {
    return { valid: false, failures: [`missing ${catalogPath}`], healthSnapshot: buildHealthSnapshot([], [`missing ${catalogPath}`]) };
  }

  let catalog;
  try {
    catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  } catch (error) {
    failures.push(`invalid catalog JSON: ${error.message}`);
    catalog = { contracts: [] };
  }

  if (!catalog.catalogVersion) failures.push("catalogVersion is required");
  if (!isSemver(catalog.catalogVersion)) failures.push("catalogVersion must be semantic version");
  if (!Array.isArray(catalog.contracts) || catalog.contracts.length === 0) failures.push("contracts must be non-empty");

  const seenIds = new Set();
  for (const contract of catalog.contracts ?? []) {
    validateContract(root, contract, failures, seenIds);
  }

  validateRequiredContractCoverage(catalog, failures);
  validateRequiredEvents(root, catalog, failures);

  const healthSnapshot = buildHealthSnapshot(catalog.contracts ?? [], failures);
  if (options.healthFile) {
    writeJson(resolve(root, options.healthFile), healthSnapshot);
  }

  return { valid: failures.length === 0, failures, catalog, healthSnapshot };
}

function validateContract(root, contract, failures, seenIds) {
  for (const field of REQUIRED_FIELDS) {
    if (contract[field] === undefined || contract[field] === null || contract[field] === "") {
      failures.push(`${contract.contractId ?? "<unknown>"}.${field} is required`);
    }
  }

  if (seenIds.has(contract.contractId)) failures.push(`${contract.contractId} is duplicated`);
  if (contract.contractId) seenIds.add(contract.contractId);

  if (!isSemver(contract.version)) failures.push(`${contract.contractId}.version must be semantic version`);
  if (!ALLOWED_LIFECYCLE.has(contract.lifecycleStatus)) failures.push(`${contract.contractId}.lifecycleStatus is invalid`);
  if (!ALLOWED_COMPATIBILITY.has(contract.compatibilityStatus)) failures.push(`${contract.contractId}.compatibilityStatus is invalid`);
  if (!ALLOWED_COMPATIBILITY_MODES.has(contract.compatibilityMode)) failures.push(`${contract.contractId}.compatibilityMode is invalid`);
  if (!Array.isArray(contract.linkedStories) || contract.linkedStories.length === 0) failures.push(`${contract.contractId}.linkedStories must be non-empty`);
  if (!Array.isArray(contract.linkedRequirements) || contract.linkedRequirements.length === 0) failures.push(`${contract.contractId}.linkedRequirements must be non-empty`);
  if (contract.kind === "markdown" || contract.lifecycleStatus === "draft_document") failures.push(`${contract.contractId} is not executable readiness evidence`);

  const artifactPath = join(root, contract.artifactPath ?? "");
  if (!existsSync(artifactPath)) failures.push(`${contract.contractId} artifact missing: ${contract.artifactPath}`);

  for (const example of contract.examples ?? []) {
    parseJsonFile(root, example, failures);
  }
  for (const fixture of contract.fixtures ?? []) {
    parseJsonFile(root, fixture, failures);
  }
}

function validateRequiredContractCoverage(catalog, failures) {
  const ids = new Set((catalog.contracts ?? []).map((contract) => contract.contractId));
  for (const contractId of REQUIRED_CONTRACT_IDS) {
    if (!ids.has(contractId)) failures.push(`required contract missing ${contractId}`);
  }
}

function validateRequiredEvents(root, catalog, failures) {
  for (const [contractId, expected] of Object.entries(REQUIRED_EVENT_SCHEMAS)) {
    const eventContract = catalog.contracts?.find((contract) => contract.contractId === contractId);
    for (const eventType of expected.eventTypes) {
      if (!eventContract?.eventTypes?.includes(eventType)) {
        failures.push(`${contractId} missing ${eventType}`);
      }
      const schemaPath = join(root, "contracts/avro", `${eventType}.avsc`);
      const schema = parseJsonFile(root, schemaPath, failures, true);
      if (schema) validateSchemaFields(schema, eventType, expected.requiredFields, failures);
    }
  }
}

function validateSchemaFields(schema, eventType, requiredFields, failures) {
  if (schema.type !== "record" || !schema.name) {
    failures.push(`${eventType} schema must be an Avro record with a name`);
    return;
  }
  for (const field of requiredFields) {
    if (!hasSchemaFieldPath(schema, field)) failures.push(`${eventType} schema missing field ${field}`);
  }
}

export function hasSchemaFieldPath(schema, path) {
  let current = schema;
  for (const rawSegment of path.split(".")) {
    const arraySegment = rawSegment.endsWith("[]");
    const segment = arraySegment ? rawSegment.slice(0, -2) : rawSegment;
    const record = unwrapSchema(current);
    if (record?.type !== "record") return false;
    const field = (record.fields ?? []).find((candidate) => candidate.name === segment);
    if (!field) return false;
    current = unwrapSchema(field.type);
    if (arraySegment) {
      if (current?.type !== "array") return false;
      current = unwrapSchema(current.items);
    }
  }
  return true;
}

function unwrapSchema(schema) {
  if (!Array.isArray(schema)) return schema;
  return schema.find((candidate) => candidate !== "null") ?? null;
}

function parseJsonFile(root, path, failures, pathIsAbsolute = false) {
  const filePath = pathIsAbsolute ? path : join(root, path);
  if (!existsSync(filePath)) {
    failures.push(`missing JSON artifact: ${path}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`invalid JSON artifact ${path}: ${error.message}`);
    return null;
  }
}

function buildHealthSnapshot(contracts, failures) {
  const seamStatuses = contracts.map((contract) => ({
    contractId: contract.contractId,
    seamId: contract.seamId,
    owner: contract.owner,
    provider: contract.sourceService,
    consumer: contract.consumerService ?? null,
    protocol: contract.protocol,
    status: contract.compatibilityStatus === "compatible" || contract.compatibilityStatus === "compatible_with_warning" ? "green" : "amber",
    lifecycleStatus: contract.lifecycleStatus,
    artifactPath: contract.artifactPath,
    linkedStories: contract.linkedStories ?? [],
    linkedRequirements: contract.linkedRequirements ?? []
  }));

  return {
    snapshotId: `contract-health-${new Date().toISOString()}`,
    generatedAt: new Date().toISOString(),
    overallStatus: failures.length > 0 ? "red" : "green",
    staleThreshold: "P7D",
    seamStatuses,
    blockingFailures: failures
  };
}

function writeJson(path, payload) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}

function isSemver(value) {
  return typeof value === "string" && /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(value);
}

function parseArgs(argv) {
  const args = { healthFile: null };
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === "--health-file") args.healthFile = argv[++index];
  }
  return args;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const result = validateContractCatalog(process.cwd(), args);
  if (!result.valid) {
    console.error(JSON.stringify({ status: "failed", failures: result.failures, healthSnapshot: result.healthSnapshot }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({
    status: "ok",
    catalogVersion: result.catalog.catalogVersion,
    contracts: result.catalog.contracts.length,
    healthSnapshot: result.healthSnapshot
  }, null, 2));
}
