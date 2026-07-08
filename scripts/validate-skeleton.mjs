import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const required = [
  "apps/auth/app",
  "apps/auth/app/api",
  "apps/reference-data/app",
  "apps/reference-data/app/api",
  "packages/ui/src",
  "packages/api-core/src",
  "packages/auth/src",
  "packages/transformers/src",
  "packages/shared-types/src",
  "packages/config/src",
  "packages/utils/src",
  "services/identity-service/domain-core",
  "services/identity-service/application-service",
  "services/identity-service/application",
  "services/identity-service/dataaccess",
  "services/identity-service/messaging",
  "services/identity-service/published-language",
  "services/identity-service/container",
  "services/reference-data-service/domain-core",
  "services/reference-data-service/application-service",
  "services/reference-data-service/application",
  "services/reference-data-service/dataaccess",
  "services/reference-data-service/messaging",
  "services/reference-data-service/published-language",
  "services/reference-data-service/container",
  "contracts/openapi",
  "contracts/avro",
  "contracts/examples",
  "contracts/pact",
  "infrastructure/nginx"
];

const forbiddenRoots = ["charge-service", "booking-service", "container-movement-service"];
const forbiddenLockfiles = ["package-lock.json", "pnpm-lock.yaml"];

const missing = required.filter((path) => !existsSync(join(root, path)));
const forbiddenRuntime = forbiddenRoots.filter((path) => existsSync(join(root, path)));
const forbiddenLocks = forbiddenLockfiles.filter((path) => existsSync(join(root, path)));

const serviceRoots = readdirSync(join(root, "services"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

if (missing.length > 0 || forbiddenRuntime.length > 0 || forbiddenLocks.length > 0) {
  console.error(JSON.stringify({ missing, forbiddenRuntime, forbiddenLocks }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: "ok", serviceRoots }, null, 2));
