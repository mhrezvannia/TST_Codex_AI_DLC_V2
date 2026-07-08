import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "infrastructure/observability/prometheus.yml",
  "infrastructure/observability/otel-collector.yml",
  "infrastructure/observability/grafana/provisioning/datasources/datasources.yml",
  "infrastructure/observability/grafana/provisioning/dashboards/dashboards.yml",
  "infrastructure/observability/grafana/dashboards/shared-platform-overview.json",
  "infrastructure/observability/readiness-profile.json"
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
  }
}

const compose = readFile("compose.yaml");
for (const service of ["prometheus", "grafana", "jaeger", "otel-collector", "elasticsearch", "kibana"]) {
  if (!compose.includes(`${service}:`) || !compose.includes('profiles: ["observability"]')) {
    failures.push(`observability compose service missing or unprofiled: ${service}`);
  }
}

const readiness = JSON.parse(readFile("infrastructure/observability/readiness-profile.json"));
for (const signal of ["structured-json-logs", "prometheus-metrics", "jaeger-traces", "outbox-publication-status"]) {
  if (!readiness.requiredSignals.includes(signal)) {
    failures.push(`readiness profile missing ${signal}`);
  }
}

const dashboard = JSON.parse(readFile("infrastructure/observability/grafana/dashboards/shared-platform-overview.json"));
if (!JSON.stringify(dashboard).includes("reference_event_freshness_seconds")) {
  failures.push("dashboard missing event freshness signal");
}

if (failures.length > 0) {
  console.error(JSON.stringify({ status: "failed", failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: "ok", files: requiredFiles.length }, null, 2));

function readFile(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}
