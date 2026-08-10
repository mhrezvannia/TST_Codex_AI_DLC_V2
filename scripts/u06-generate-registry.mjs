import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "tests", "u06", "acceptance-registry.json");
const members = [];

function add(category, id, options = {}) {
  const key = `${category}:${id}`;
  const dependsOn = options.dependsOn ?? [];
  members.push({
    key,
    category,
    id,
    route: options.route ?? null,
    scenario: options.scenario ?? null,
    correlationRequired: options.correlationRequired ?? false,
    artifactKinds: options.artifactKinds ?? ["assertion-json"],
    destination: `results/${category.toLowerCase().replaceAll("_", "-")}/${id.toLowerCase().replaceAll("_", "-")}.json`,
    dependsOn,
    legalSkippedAfter: [...dependsOn],
  });
}

const preservation = ["W0-01", "W0-02", "W1-01", "W2-01", "W2-02"];
for (const id of preservation) add("PRESERVATION", id, { artifactKinds: ["command-log", "protected-hash", "assertion-json"] });

const security = ["SEC-U06-001", "SEC-U06-002", "SEC-U06-003", "SEC-U06-004", "SEC-U06-005", "SEC-U06-006"];
for (const id of security) add("SECURITY", id, {
  dependsOn: ["PRESERVATION:W0-01"], scenario: id, correlationRequired: true,
  artifactKinds: ["http-evidence", "mutation-count", "audit-evidence"],
});

const commercial = ["AGREEMENT_PRICE", "TARIFF_FALLBACK", "SUCCESSOR_REPRICE", "NO_RATE",
  "AMBIGUITY_AGREEMENT", "AMBIGUITY_BASE", "AMBIGUITY_SURCHARGE", "AMBIGUITY_LOCAL",
  "OUTAGE_TIMEOUT", "OUTAGE_503", "OUTAGE_CIRCUIT", "CHARGE_DISABLED", "RECONFIRM_NO_CHARGE"];
for (const id of commercial) add("COMMERCIAL", id, {
  dependsOn: ["SECURITY:SEC-U06-001"], scenario: id, correlationRequired: true,
  artifactKinds: ["http-evidence", "database-evidence", "correlation-proof"],
});

const families = ["LIST_FILTER", "CREATE_EDIT", "DETAIL_LIFECYCLE", "MANUAL_EVIDENCE", "BOOKING_PRICING"];
const widths = [375, 768, 1024, 1440];
const themes = ["LIGHT", "DARK"];
const familyRoutes = {
  LIST_FILTER: "/charge-agreements",
  CREATE_EDIT: "/charge-agreements/new",
  DETAIL_LIFECYCLE: "/charge-agreements/[agreementId]",
  MANUAL_EVIDENCE: "/charge-agreements/manual-pricing",
  BOOKING_PRICING: "/booking/[id]",
};
for (const family of families) for (const width of widths) for (const theme of themes) {
  add("BROWSER_STRUCTURAL", `STRUCT-${family}-${width}-${theme}`, {
    dependsOn: ["SECURITY:SEC-U06-001"], route: familyRoutes[family],
    artifactKinds: ["screenshot", "assertion-json", "axe-report", "sanitized-trace"],
  });
}

const states = {
  LIST_FILTER: ["LOADING", "POPULATED", "EMPTY", "BACKEND_ERROR", "FORBIDDEN"],
  CREATE_EDIT: ["PRISTINE", "INVALID_SUMMARY_FOCUS", "REFERENCE_LOADING_ERROR", "DIRTY_NAVIGATION", "OPTIMISTIC_CONFLICT", "DENIED"],
  DETAIL_LIFECYCLE: ["DRAFT", "APPROVED_IMMUTABLE", "HISTORY", "APPROVAL_PENDING_SUCCESS_CONFLICT", "DIALOG_ESCAPE", "DIALOG_TAB_RESTORE"],
  MANUAL_EVIDENCE: ["OPEN_RESULT", "NO_AMOUNT_TOTAL", "EMPTY", "DENIED_NO_DISCLOSURE"],
  BOOKING_PRICING: ["FIRST_PRICE", "AGREEMENT_RESULT", "TARIFF_RESULT", "REPRICE_CURRENT_PRIOR", "LEGACY_EVIDENCE", "NO_RATE", "AMBIGUITY", "OUTAGE", "CIRCUIT_OPEN", "MALFORMED", "CONFLICT", "IN_PROGRESS"],
};
const stateScenario = {
  POPULATED: "AGREEMENT_PRICE", APPROVED_IMMUTABLE: "AGREEMENT_PRICE", HISTORY: "SUCCESSOR_REPRICE",
  OPEN_RESULT: "NO_RATE", NO_AMOUNT_TOTAL: "NO_RATE", FIRST_PRICE: "AGREEMENT_PRICE",
  AGREEMENT_RESULT: "AGREEMENT_PRICE", TARIFF_RESULT: "TARIFF_FALLBACK",
  REPRICE_CURRENT_PRIOR: "SUCCESSOR_REPRICE", NO_RATE: "NO_RATE", AMBIGUITY: "AMBIGUITY_AGREEMENT",
  OUTAGE: "OUTAGE_503", CIRCUIT_OPEN: "OUTAGE_CIRCUIT",
};
for (const [family, familyStates] of Object.entries(states)) for (const state of familyStates) {
  const scenario = stateScenario[state] ?? `${family}_${state}`;
  add("BROWSER_STATE", `STATE-${family}-${state}`, {
    route: familyRoutes[family], scenario, correlationRequired: true,
    dependsOn: [`BROWSER_STRUCTURAL:STRUCT-${family}-1024-LIGHT`],
    artifactKinds: ["assertion-json", "screenshot", "axe-report", "sanitized-trace"],
  });
}

for (const id of ["DS-01", "DS-02", "DS-03"]) add("DESIGN_DEPENDENCY", id, {
  dependsOn: ["BROWSER_STRUCTURAL:STRUCT-DETAIL_LIFECYCLE-1024-LIGHT"],
  artifactKinds: ["assertion-json", "screenshot"],
});

for (const id of ["LATENCY", "TERMINAL_OUTCOME", "BASIS", "MANUAL_FALLBACK", "REPLAY_CONFLICT", "REDACTION"]) add("OBSERVABILITY", id, {
  dependsOn: ["COMMERCIAL:AGREEMENT_PRICE"], scenario: id, correlationRequired: true,
  artifactKinds: ["metric-delta", "safe-log-hops", "redaction-report"],
});

for (const id of ["BACKEND", "FRONTEND", "CONTRACT", "MIGRATION", "COVERAGE", "NGINX", "PLAYWRIGHT", "PERFORMANCE", "RESTART_RESTORE", "GIT_DIFF"]) {
  const dependsOn = id === "PLAYWRIGHT" ? ["BROWSER_STRUCTURAL:STRUCT-LIST_FILTER-375-LIGHT"]
    : id === "PERFORMANCE" ? ["COMMERCIAL:AGREEMENT_PRICE"]
      : id === "RESTART_RESTORE" ? ["COMMERCIAL:NO_RATE"] : ["PRESERVATION:W0-01"];
  add("QUALITY", id, { dependsOn, artifactKinds: ["command-log", "assertion-json"] });
}

for (const id of ["AIDLC_DETECTOR", "AIDLC_MANUAL", "ERP_FIDELITY_DETECTOR", "ERP_FIDELITY_MANUAL"]) add("AUDIT", id, {
  dependsOn: ["QUALITY:GIT_DIFF"], artifactKinds: ["detector-output", "manual-review"],
});

const ownedRoutes = ["/charge-agreements", "/charge-agreements/new", "/charge-agreements/[agreementId]",
  "/charge-agreements/[agreementId]/edit", "/charge-agreements/rates", "/charge-agreements/rates/new",
  "/charge-agreements/rates/[rateId]", "/charge-agreements/rates/[rateId]?mode=edit",
  "/charge-agreements/manual-pricing", "/booking/[id]"];
const edgeRegressionRoutes = ["/", "/auth", "/reference-data", "/booking", "/bookings"];

const registry = {
  schemaVersion: 1,
  resultStatuses: ["PASS", "FAIL", "BLOCKED", "SKIPPED"],
  expectedCategoryCardinality: {
    PRESERVATION: 5, SECURITY: 6, COMMERCIAL: 13, BROWSER_STRUCTURAL: 40,
    BROWSER_STATE: 33, DESIGN_DEPENDENCY: 3, OBSERVABILITY: 6, QUALITY: 10, AUDIT: 4,
  },
  ownedRoutes,
  edgeRegressionRoutes,
  members,
};

mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`${path.relative(root, output)} (${members.length} members)`);
