import { REQUIRED_CASE_IDS, REQUIRED_STATES, ROUTES } from "./w2-02-coverage-ledger.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const FIXTURE_SCHEMA_VERSION = 2;
export const CONTROL_URL = "http://127.0.0.1:14312";

const route = (path, routePattern, stateSelector, stateValue, landmark, primaryAction, liveRegionSelector) => ({
  path, routePattern, stateSelector, stateValue, landmark, primaryAction, liveRegionSelector
});

const state = (path, routePattern, stateSelector, stateValue, landmark, primaryAction, liveRegionSelector, controlMode, trigger) => ({
  path, routePattern, stateSelector, stateValue, landmark, primaryAction, liveRegionSelector,
  control: { transport: "ssr-proxy", mode: controlMode }, ...(trigger ? { trigger } : {})
});

export function createFixtureManifest() {
  return {
    schemaVersion: FIXTURE_SCHEMA_VERSION,
    controlURL: CONTROL_URL,
    routes: {
      list: route("/booking", "^/booking$", '[data-testid="shell-booking-list"]', "populated", { role: "table", name: "Bookings" }, { role: "link", name: "New booking" }, '[role="status"]'),
      create: route("/booking/new", "^/booking/new$", 'form[data-state="idle"]', "idle", { role: "heading", name: "New booking" }, { role: "button", name: "Create draft" }, 'form[aria-live]'),
      detail: route("/booking/W2-02-DETAIL", "^/booking/W2-02-DETAIL$", '[data-testid="booking-detail"]', "populated", { role: "heading", name: "BKG-W2-02-DETAIL" }, { role: "link", name: "Back to Booking" }, '[data-testid="booking-detail"][aria-live]')
    },
    states: {
      loading: state("/booking/new", "^/booking$", '[data-state="loading"]', "loading", { role: "region", name: "Loading bookings" }, { role: "link", name: "Booking" }, '[aria-busy="true"]', "loading-list", { role: "link", name: "Booking" }),
      populated: state("/booking", "^/booking$", '[data-testid="shell-booking-list"]', "populated", { role: "table", name: "Bookings" }, { role: "link", name: "New booking" }, '[role="status"]', "populated-list"),
      empty: state("/booking", "^/booking$", '[data-state="empty"]', "empty", { role: "status", name: "" }, { role: "link", name: "Create booking" }, '[data-state="empty"][role="status"]', "empty-list"),
      "error-retry": state("/booking", "^/booking$", '[data-state="error"]', "error", { role: "alert", name: "" }, { role: "link", name: "Retry" }, '[data-state="error"][role="alert"]', "error-list"),
      denied: state("/booking", "^/booking$", '[data-state="denied"]', "denied", { role: "region", name: "Access denied" }, { role: "link", name: "Request access" }, '[data-state="denied"]', "denied-list"),
      degraded: state("/booking/W2-02-DEGRADED", "^/booking/W2-02-DEGRADED$", '[data-state="degraded"]', "degraded", { role: "status", name: "" }, { role: "link", name: "Back to Booking" }, '[data-state="degraded"][role="status"]', "degraded-detail"),
      validation: state("/booking/W2-02-VALIDATION", "^/booking/W2-02-VALIDATION$", '[data-state="validation-blocked"]', "validation-blocked", { role: "alert", name: "" }, { role: "link", name: "Back to Booking" }, '[data-state="validation-blocked"][role="alert"]', "validation-detail"),
      pending: state("/booking/W2-02-PENDING", "^/booking/W2-02-PENDING$", '[data-state="pending"]', "pending", { role: "status", name: "" }, { role: "link", name: "Back to Booking" }, '[data-state="pending"][role="status"]', "pending-action", { role: "button", name: "Validate references" }),
      success: state("/booking/W2-02-SUCCESS?created=1", "^/booking/W2-02-SUCCESS$", '[data-state="success"]', "success", { role: "status", name: "" }, { role: "link", name: "Back to Booking" }, '[data-state="success"][role="status"]', "success-detail")
    }
  };
}

const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export function validateFixtureManifest(value) {
  const expected = createFixtureManifest();
  if (!value || value.schemaVersion !== FIXTURE_SCHEMA_VERSION || !equal(value, expected)) throw new Error("Fixture manifest must exactly match the versioned W2-02 production contract");
  return value;
}

export function registerRequiredCases(register) {
  for (const id of REQUIRED_CASE_IDS) register(id);
}

export async function writeProductionFixture(path) {
  const fixture = validateFixtureManifest(createFixtureManifest());
  await mkdir(dirname(path), { recursive: true }); await writeFile(path, JSON.stringify(fixture, null, 2) + "\n", "utf8");
  return fixture;
}

export function assertFixtureCoverage(value) {
  validateFixtureManifest(value);
  if (!equal(Object.keys(value.routes), ROUTES) || !equal(Object.keys(value.states), REQUIRED_STATES)) throw new Error("Fixture route/state coverage drifted from the required ledger");
  return value;
}
