export type CapabilityFlag = {
  key: string;
  enabled: boolean;
  description: string;
};

export type ModuleInfo = {
  serviceName: string;
  mode: string;
  version: string;
  checkedAt: string;
  backendStatus: "fallback" | "live" | string;
  capabilities: CapabilityFlag[];
};

export type AgreementListItem = {
  id: string;
  agreementNumber: string;
  customer: string;
  status: "Draft" | "Approved" | "Suspended" | "Expired";
  validFrom: string;
  validTo: string;
  tradeLane: string;
};

export type RuntimeStatus = {
  authMode: string;
  backend: string;
  referenceData: string;
};

export const skeletonModuleInfo: ModuleInfo = {
  serviceName: "charge-agreement-service",
  mode: "local-host-runtime",
  version: "0.1.0-SNAPSHOT",
  checkedAt: new Date(0).toISOString(),
  backendStatus: "fallback",
  capabilities: [
    { key: "backend-health", enabled: true, description: "Backend skeleton endpoint is expected on port 8084" },
    { key: "agreement-lifecycle", enabled: false, description: "Agreement lifecycle arrives in U02/U03" },
    { key: "persistence-api", enabled: false, description: "Persistence and CRUD arrive in U04/U05" },
    { key: "ui-write-workflows", enabled: false, description: "Create/edit/approve arrives in U06" }
  ]
};

export const skeletonRuntimeStatus: RuntimeStatus = {
  authMode: "Local bypass visible",
  backend: "Skeleton fallback loaded",
  referenceData: "Reference integration arrives in U07"
};

export const skeletonAgreements: AgreementListItem[] = [
  {
    id: "demo-draft",
    agreementNumber: "AGR-SKEL-001",
    customer: "Demo Customer",
    status: "Draft",
    validFrom: "2026-07-01",
    validTo: "2026-12-31",
    tradeLane: "Asia-Europe"
  }
];
