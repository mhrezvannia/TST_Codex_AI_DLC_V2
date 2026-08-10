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
  failures.push(...validateU04PricingMatrix(root, catalog));

  const healthSnapshot = buildHealthSnapshot(catalog.contracts ?? [], failures);
  if (options.healthFile) {
    writeJson(resolve(root, options.healthFile), healthSnapshot);
  }

  return { valid: failures.length === 0, failures, catalog, healthSnapshot };
}

export function validateU04PricingMatrix(root = process.cwd(), catalogOverride = null) {
  const failures = [];
  const matrixPath = join(root, "contracts/examples/pricing-u04-terminal-matrix.json");
  const fixturePath = join(root, "contracts/pact/booking-charge-pricing-fixtures.json");
  const catalogPath = join(root, "contracts/catalog/contract-catalog.json");
  const matrix = readJson(matrixPath, failures, "U04 pricing matrix");
  const fixture = readJson(fixturePath, failures, "U04 pricing Pact fixture");
  const catalog = catalogOverride ?? readJson(catalogPath, failures, "contract catalog");
  if (!matrix || !fixture || !catalog) return failures;

  const expected = new Map([
    ["agreement-success", { status: 200, contentType: "application/vnd.api.v1+json" }],
    ["tariff-success", { status: 200, contentType: "application/vnd.api.v1+json" }],
    ["no-rate", { status: 404, contentType: "application/json", code: "NO_RATE", reason: "NO_RATE" }],
    ["ambiguous-agreement-authority", { status: 422, contentType: "application/json", code: "PRICING_VALIDATION", reason: "AMBIGUOUS_AGREEMENT_AUTHORITY" }],
    ["ambiguous-base-rate", { status: 422, contentType: "application/json", code: "PRICING_VALIDATION", reason: "AMBIGUOUS_BASE_RATE" }],
    ["ambiguous-surcharge-rate", { status: 422, contentType: "application/json", code: "PRICING_VALIDATION", reason: "AMBIGUOUS_SURCHARGE_RATE" }],
    ["ambiguous-local-rate", { status: 422, contentType: "application/json", code: "PRICING_VALIDATION", reason: "AMBIGUOUS_LOCAL_RATE" }],
    ["idempotency-conflict", { status: 409, contentType: "application/json", code: "IDEMPOTENCY_CONFLICT" }],
    ["pricing-in-progress", { status: 409, contentType: "application/json", code: "PRICING_IN_PROGRESS" }]
  ]);
  const scenarios = new Map((matrix.scenarios ?? []).map((scenario) => [scenario.scenarioId, scenario]));
  const interactions = new Map((fixture.interactions ?? []).map((interaction) => [interaction.scenarioId, interaction]));

  for (const [scenarioId, contract] of expected) {
    const scenario = scenarios.get(scenarioId);
    const interaction = interactions.get(scenarioId);
    if (!scenario) {
      failures.push(`U04 pricing matrix missing scenario ${scenarioId}`);
      continue;
    }
    if (!interaction) failures.push(`U04 pricing Pact fixture missing interaction ${scenarioId}`);
    if (scenario.status !== contract.status) failures.push(`${scenarioId}.status must be ${contract.status}`);
    if (scenario.contentType !== contract.contentType) failures.push(`${scenarioId}.contentType must be ${contract.contentType}`);
    if (interaction && (interaction.status !== contract.status || interaction.contentType !== contract.contentType)) {
      failures.push(`${scenarioId} Pact status/contentType must match the provider matrix`);
    }
    if (contract.status === 200) {
      validateEnrichedSuccess(scenarioId, scenario.response, failures);
    } else {
      validateTerminalError(scenarioId, scenario.response, contract, failures);
    }
  }
  if (scenarios.size !== expected.size) failures.push("U04 pricing matrix must contain exactly the approved terminal scenarios");
  if (interactions.size !== expected.size) failures.push("U04 pricing Pact fixture must contain exactly the approved interactions");
  if (scenarios.get("pricing-in-progress")?.expectedHeaders?.["Retry-After"] !== "1"
      || interactions.get("pricing-in-progress")?.expectedHeaders?.["Retry-After"] !== "1") {
    failures.push("pricing-in-progress must preserve Retry-After: 1 in matrix and Pact fixture");
  }

  const api = catalog.contracts?.find((contract) => contract.contractId === "api-charge-agreement-service");
  const pact = catalog.contracts?.find((contract) => contract.contractId === "pact-booking-charge-pricing");
  if (api?.sourceService !== "charge-agreement-service" || api?.consumerService !== "booking-service") {
    failures.push("Charge pricing OpenAPI ownership must remain provider=charge-agreement-service consumer=booking-service");
  }
  if (pact?.sourceService !== api?.sourceService || pact?.consumerService !== api?.consumerService) {
    failures.push("Charge pricing OpenAPI and Pact ownership must be synchronized");
  }
  if (!api?.examples?.includes("contracts/examples/pricing-u04-terminal-matrix.json")) {
    failures.push("Charge pricing catalog entry must publish the U04 terminal matrix");
  }
  return failures;
}

function validateEnrichedSuccess(scenarioId, response, failures) {
  const fields = [
    "bookingRef", "pricingBasis", "pricingRef", "charges", "applicableDndRuleTypes",
    "total", "currency", "requestedDepartureDate", "pricingRequestId", "correlationId", "pricedAt"
  ];
  if (!response || fields.some((field) => response[field] === undefined)) {
    failures.push(`${scenarioId} must contain the complete enriched success field set`);
    return;
  }
  if (!Array.isArray(response.charges) || response.charges.length !== 3) {
    failures.push(`${scenarioId}.charges must contain exactly three lines`);
    return;
  }
  const expectedCategories = ["BASE", "SURCHARGE", "LOCAL"];
  const expectedCodes = ["OFR", "BAF", "THC"];
  response.charges.forEach((line, index) => {
    const lineFields = ["chargeCode", "category", "amount", "currency", "rateCategory", "basis", "quantity", "unitRate", "sourceRateVersionId"];
    if (lineFields.some((field) => line[field] === undefined)) {
      failures.push(`${scenarioId}.charges[${index}] must contain the all-or-none enriched line fields`);
    }
    if (typeof line.amount !== "number" || typeof line.unitRate !== "number" || !Number.isInteger(line.quantity)) {
      failures.push(`${scenarioId}.charges[${index}] amount/unitRate/quantity must be JSON numbers`);
    }
    if (line.rateCategory !== expectedCategories[index] || line.chargeCode !== expectedCodes[index]) {
      failures.push(`${scenarioId}.charges must be ordered BASE/OFR, SURCHARGE/BAF, LOCAL/THC`);
    }
    if (line.basis !== "PER_CONTAINER" || line.currency !== "USD") {
      failures.push(`${scenarioId}.charges[${index}] must be USD PER_CONTAINER`);
    }
  });
  if (typeof response.total !== "number" || response.currency !== "USD") {
    failures.push(`${scenarioId}.total must be a numeric USD value`);
  }
  if (response.pricingBasis === "AGREEMENT" && !response.agreementVersionId) {
    failures.push(`${scenarioId} agreement success requires agreementVersionId`);
  }
  if (response.pricingBasis === "TARIFF" && response.agreementVersionId !== undefined) {
    failures.push(`${scenarioId} tariff success must omit agreementVersionId`);
  }
}

function validateTerminalError(scenarioId, response, contract, failures) {
  if (!response || response.code !== contract.code) failures.push(`${scenarioId}.code must be ${contract.code}`);
  if (typeof response?.correlationId !== "string" || response.correlationId.length === 0) {
    failures.push(`${scenarioId}.correlationId is required`);
  }
  if (contract.reason) {
    if (response.reasonCode !== contract.reason) failures.push(`${scenarioId}.reasonCode must be ${contract.reason}`);
    if (!response.pricingRequestId || !response.manualCaseId) {
      failures.push(`${scenarioId} manual terminal requires pricingRequestId and manualCaseId`);
    }
  } else if (response?.reasonCode !== undefined || response?.manualCaseId !== undefined) {
    failures.push(`${scenarioId} must not acquire manual-case fields`);
  }
}

function readJson(path, failures, label) {
  if (!existsSync(path)) {
    failures.push(`${label} is missing`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
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
