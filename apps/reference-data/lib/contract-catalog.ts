export type ContractStatus = "pending" | "compatible" | "incompatible" | "failed" | "unknown";

export type ContractSummary = {
  contractId: string;
  label: string;
  kind: "OpenAPI" | "Avro events";
  sourceService: string;
  version: string;
  lifecycleStatus: string;
  compatibilityStatus: ContractStatus;
  artifactPath: string;
};

export type ContractFinding = {
  findingId: string;
  contractId: string;
  severity: string;
  summary: string;
  status: string;
};

export const contractSummaries: ContractSummary[] = [
  {
    contractId: "api-reference-data-service",
    label: "Reference Data Service API",
    kind: "OpenAPI",
    sourceService: "reference-data-service",
    version: "0.1.0",
    lifecycleStatus: "review",
    compatibilityStatus: "pending",
    artifactPath: "contracts/openapi/reference-data-service.yaml"
  },
  {
    contractId: "api-identity-service",
    label: "Identity Service API",
    kind: "OpenAPI",
    sourceService: "identity-service",
    version: "0.1.0",
    lifecycleStatus: "review",
    compatibilityStatus: "pending",
    artifactPath: "contracts/openapi/identity-service.yaml"
  },
  {
    contractId: "event-reference-data-changed",
    label: "Reference Data Changed Events",
    kind: "Avro events",
    sourceService: "reference-data-service",
    version: "1.0.0",
    lifecycleStatus: "review",
    compatibilityStatus: "pending",
    artifactPath: "contracts/avro"
  }
];

export const contractFindings: ContractFinding[] = [
  {
    findingId: "U07-F001",
    contractId: "event-reference-data-changed",
    severity: "medium",
    summary: "Schema Registry compatibility execution is pending U08 CI gate wiring.",
    status: "deferred"
  }
];

export function statusLabel(status: ContractStatus) {
  return `Compatibility ${status}`;
}
