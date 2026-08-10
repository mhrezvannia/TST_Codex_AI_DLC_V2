import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const requiredFiles = [
  "infrastructure/observability/prometheus.yml",
  "infrastructure/observability/otel-collector.yml",
  "infrastructure/observability/grafana/provisioning/datasources/datasources.yml",
  "infrastructure/observability/grafana/provisioning/dashboards/dashboards.yml",
  "infrastructure/observability/grafana/dashboards/shared-platform-overview.json",
  "infrastructure/observability/readiness-profile.json"
];

export function serviceHasProfile(compose, service, profile) {
  const lines = String(compose).split(/\r?\n/);
  const start = lines.findIndex((line) => line.trimEnd() === `  ${service}:`);
  if (start < 0) return false;
  let end = start + 1;
  while (end < lines.length && !/^(?:  [A-Za-z0-9_-]+|[A-Za-z0-9_-]+):\s*$/.test(lines[end])) end += 1;
  const profileLine = lines.slice(start + 1, end).find((line) => /^\s{4}profiles:\s*\[.*\]\s*$/.test(line));
  if (!profileLine) return false;
  const profiles = profileLine
    .slice(profileLine.indexOf("[") + 1, profileLine.lastIndexOf("]"))
    .split(",")
    .map((value) => value.trim().replace(/^["']|["']$/g, ""));
  return profiles.includes(profile);
}

function main() {
  const failures = [];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      failures.push(`missing ${file}`);
    }
  }

  const compose = readFile("compose.yaml");
  for (const service of ["prometheus", "grafana", "jaeger", "otel-collector", "elasticsearch", "kibana"]) {
    if (!serviceHasProfile(compose, service, "observability")) {
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
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({ status: "ok", files: requiredFiles.length }, null, 2));
}

function readFile(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
