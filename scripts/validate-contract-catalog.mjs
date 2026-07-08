import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ALLOWED_COMPATIBILITY = new Set(["pending", "compatible", "incompatible", "failed", "unknown"]);
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

export function validateContractCatalog(root = process.cwd()) {
  const failures = [];
  const catalogPath = join(root, "contracts/catalog/contract-catalog.json");
  if (!existsSync(catalogPath)) {
    return { valid: false, failures: [`missing ${catalogPath}`] };
  }
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  if (!catalog.catalogVersion) failures.push("catalogVersion is required");
  if (!Array.isArray(catalog.contracts) || catalog.contracts.length === 0) failures.push("contracts must be non-empty");
  for (const contract of catalog.contracts ?? []) {
    validateContract(root, contract, failures);
  }
  validateRequiredEvents(root, catalog, failures);
  validateNoDownstreamRuntime(root, failures);
  return { valid: failures.length === 0, failures, catalog };
}

function validateContract(root, contract, failures) {
  for (const field of ["contractId", "owner", "sourceService", "version", "lifecycleStatus", "artifactPath", "compatibilityStatus"]) {
    if (!contract[field]) failures.push(`${contract.contractId ?? "<unknown>"}.${field} is required`);
  }
  if (!ALLOWED_COMPATIBILITY.has(contract.compatibilityStatus)) {
    failures.push(`${contract.contractId}.compatibilityStatus is invalid`);
  }
  const artifactPath = join(root, contract.artifactPath ?? "");
  if (!existsSync(artifactPath)) {
    failures.push(`${contract.contractId} artifact missing: ${contract.artifactPath}`);
  }
  for (const example of contract.examples ?? []) {
    parseJsonFile(root, example, failures);
  }
  for (const fixture of contract.fixtures ?? []) {
    parseJsonFile(root, fixture, failures);
  }
}

function validateRequiredEvents(root, catalog, failures) {
  const eventContract = catalog.contracts?.find((contract) => contract.contractId === "event-reference-data-changed");
  for (const eventType of REQUIRED_EVENTS) {
    if (!eventContract?.eventTypes?.includes(eventType)) {
      failures.push(`event contract missing ${eventType}`);
    }
    const schemaPath = join(root, "contracts/avro", `${eventType}.avsc`);
    parseJsonFile(root, schemaPath, failures, true);
  }
}

function validateNoDownstreamRuntime(root, failures) {
  for (const forbidden of ["services/charge-service", "services/booking-service", "services/container-movement-service", "apps/charge", "apps/booking", "apps/container-movement"]) {
    if (existsSync(join(root, forbidden))) {
      failures.push(`downstream runtime out of scope: ${forbidden}`);
    }
  }
}

function parseJsonFile(root, path, failures, pathIsAbsolute = false) {
  const filePath = pathIsAbsolute ? path : join(root, path);
  if (!existsSync(filePath)) {
    failures.push(`missing JSON artifact: ${path}`);
    return;
  }
  try {
    JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`invalid JSON artifact ${path}: ${error.message}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = validateContractCatalog();
  if (!result.valid) {
    console.error(JSON.stringify({ status: "failed", failures: result.failures }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({
    status: "ok",
    catalogVersion: result.catalog.catalogVersion,
    contracts: result.catalog.contracts.length
  }, null, 2));
}
