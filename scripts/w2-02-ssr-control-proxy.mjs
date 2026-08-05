import { createServer } from "node:http";

export const CONTROL_PORT = 43102;
export const HOST_CONTROL_PORT = 14312;
const ALLOWED_STATES = new Set(["loading", "populated", "empty", "error-retry", "denied", "degraded", "validation", "pending", "success"]);

const observation = (method, path, action, status) => ({ method, path, action, status });

export function observationContractForCaseId(caseId) {
  const mode = controlModeForCaseId(caseId);
  if (/^visual:create:/.test(caseId)) {
    const reference = observation("GET", /^\/api\/reference-options$/, "passthrough", 200);
    return { mode, required: [reference], allowed: [reference] };
  }
  if (caseId === "keyboard:create-to-confirm") {
    const reference = observation("GET", /^\/api\/reference-options$/, "passthrough", 200);
    const create = observation("POST", /^\/api\/bookings$/, "passthrough", 201);
    const detail = observation("GET", /^\/api\/bookings\/[^/]+$/, "passthrough", 200);
    const validate = observation("POST", /^\/api\/bookings\/[^/]+\/validate$/, "passthrough", 200);
    const price = observation("POST", /^\/api\/bookings\/[^/]+\/price$/, "passthrough", 200);
    const confirm = observation("POST", /^\/api\/bookings\/[^/]+\/confirm$/, "passthrough", 200);
    return { mode, required: [reference, create, validate, price, confirm], allowed: [reference, create, detail, validate, price, confirm] };
  }
  if (/^visual:list:|^keyboard:list-filter$/.test(caseId)) {
    const item = observation("GET", /^\/api\/bookings$/, "synthetic-list", 200);
    return { mode, required: [item], allowed: [item] };
  }
  if (/^visual:detail:/.test(caseId)) {
    const item = observation("GET", /^\/api\/bookings\/W2-02-DETAIL$/, "synthetic-detail", 200);
    return { mode, required: [item], allowed: [item] };
  }
  const stateName = caseId.split(":")[1];
  const byState = {
    loading: observation("GET", /^\/api\/bookings$/, "delayed-response", 200),
    populated: observation("GET", /^\/api\/bookings$/, "synthetic-list", 200),
    empty: observation("GET", /^\/api\/bookings$/, "synthetic-empty", 200),
    "error-retry": observation("GET", /^\/api\/bookings$/, "synthetic-error", 503),
    denied: observation("GET", /^\/api\/bookings$/, "synthetic-denied", 403),
    degraded: observation("GET", /^\/api\/bookings\/W2-02-DEGRADED$/, "synthetic-degraded", 200),
    validation: observation("GET", /^\/api\/bookings\/W2-02-VALIDATION$/, "synthetic-validation", 200),
    success: observation("GET", /^\/api\/bookings\/W2-02-SUCCESS$/, "synthetic-success", 200)
  };
  if (stateName === "pending") {
    const base = observation("GET", /^\/api\/bookings\/W2-02-PENDING$/, "synthetic-pending-base", 200);
    const action = observation("POST", /^\/api\/bookings\/W2-02-PENDING\/validate$/, "delayed-action", 200);
    return { mode, required: [base, action], allowed: [base, action] };
  }
  const item = byState[stateName];
  if (!item) throw new Error("Case has no causal observation contract");
  return { mode, required: [item], allowed: [item] };
}

const matchesObservation = (expected, actual) => actual?.method === expected.method && expected.path.test(actual?.path ?? "") && actual?.action === expected.action && (Array.isArray(expected.status) ? expected.status.includes(actual?.status) : actual?.status === expected.status);

export function validateCausalObservation(caseId, value) {
  const contract = observationContractForCaseId(caseId);
  if (value?.mode !== contract.mode || value?.causal !== true || !Number.isInteger(value?.appliedCount) || value.appliedCount < 1 || !Array.isArray(value.observations)) throw new Error("SSR observation is not causal for the armed case");
  for (const expected of contract.required) if (!value.observations.some((actual) => matchesObservation(expected, actual))) throw new Error(`Required SSR transition was not observed for ${caseId}`);
  for (const actual of value.observations) if (!contract.allowed.some((expected) => matchesObservation(expected, actual))) throw new Error(`SSR observation is outside the ${caseId} allow-list: ${actual?.method} ${actual?.path}`);
  return value;
}

export function controlModeForCaseId(caseId) {
  if (/^state:/.test(caseId)) {
    const state = caseId.split(":")[1];
    if (!ALLOWED_STATES.has(state)) throw new Error("Unknown state case");
    return `${state}-${["loading", "populated", "empty", "error-retry", "denied"].includes(state) ? "list" : state === "pending" ? "action" : "detail"}`;
  }
  if (/^visual:list:|^keyboard:list-filter$/.test(caseId)) return "populated-list";
  if (/^visual:detail:/.test(caseId)) return "populated-detail";
  if (/^visual:create:|^keyboard:create-to-confirm$/.test(caseId)) return "passthrough";
  throw new Error("Case is not allow-listed for SSR control");
}

export function sampleBooking(id, overrides = {}) {
  return {
    id, bookingNumber: `BKG-${id}`, revision: 1, status: "DRAFT", customerId: "CUST-W2-02",
    routing: [{ legSequence: 1, loadUnLocode: "NLRTM", dischargeUnLocode: "SGSIN", voyageId: "VOY-W2-02" }],
    equipment: [{ equipmentId: "MSCU1234567", equipmentTypeCode: "22G1", quantity: 1 }],
    currency: "USD", cargoMode: "FCL_DRY", reefer: false, dangerousGoods: false, legacyIncomplete: false,
    referenceValidation: null, pricingSnapshot: null, lifecycleEvents: [], movementStatuses: [], attributes: {}, ...overrides
  };
}

const list = (items) => ({ items, returned: items.length, page: 0, size: 25 });
const json = (response, status, body) => { response.writeHead(status, { "content-type": "application/json", "x-w2-02-control": "applied" }); response.end(JSON.stringify(body)); };
const readBody = async (request) => { const chunks = []; for await (const chunk of request) chunks.push(chunk); return Buffer.concat(chunks); };

export function createControlProxy({ upstream = "http://apps-booking:3000", token = process.env.W2_02_PROXY_CONTROL_TOKEN } = {}) {
  if (!token || token.length < 32) throw new Error("W2_02_PROXY_CONTROL_TOKEN must be an orchestrator-issued value");
  let active = null;
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://w2-02-control");
    if (url.pathname === "/__w2-02/health") return json(response, 200, { status: "UP", proxy: "w2-02-ssr-control/v1" });
    if (url.pathname === "/__w2-02/control" && request.method === "POST") {
      if (request.headers["x-w2-02-control"] !== token) return json(response, 403, { message: "control denied" });
      const body = JSON.parse((await readBody(request)).toString("utf8"));
      const mode = controlModeForCaseId(body.caseId);
      active = { transitionId: body.transitionId, caseId: body.caseId, mode, appliedCount: 0, observations: [] };
      return json(response, 200, { transitionId: active.transitionId, mode, armed: true });
    }
    if (url.pathname === "/__w2-02/observation" && request.method === "GET") {
      if (request.headers["x-w2-02-control"] !== token || !active || url.searchParams.get("transitionId") !== active.transitionId) return json(response, 404, { message: "transition not found" });
      return json(response, 200, { ...active, causal: active.appliedCount > 0 });
    }
    if (!active) return json(response, 428, { message: "acceptance control is not armed" });

    const observe = (status, action) => { active.appliedCount += 1; active.observations.push({ method: request.method, path: url.pathname, status, action }); };
    const forward = async ({ record = true } = {}) => {
      const body = ["GET", "HEAD"].includes(request.method ?? "GET") ? undefined : await readBody(request);
      const upstreamResponse = await fetch(new URL(request.url ?? "/", upstream), { method: request.method, headers: request.headers, body, redirect: "manual" });
      if (record) observe(upstreamResponse.status, "passthrough");
      response.writeHead(upstreamResponse.status, Object.fromEntries([...upstreamResponse.headers].filter(([name]) => !["connection", "transfer-encoding", "set-cookie"].includes(name.toLowerCase()))));
      response.end(Buffer.from(await upstreamResponse.arrayBuffer()));
    };
    const isList = url.pathname === "/api/bookings";
    const id = decodeURIComponent(url.pathname.split("/").filter(Boolean).at(2) ?? "W2-02-DETAIL");
    if (active.mode === "loading-list" && request.method === "GET" && url.pathname === "/api/reference-options") return forward({ record: false });
    if (active.mode === "loading-list" && isList) { observe(200, "delayed-response"); await new Promise((resolve) => setTimeout(resolve, 5_000)); return json(response, 200, list([sampleBooking("W2-02-LIST")])); }
    if (active.mode === "populated-list" && isList) { observe(200, "synthetic-list"); return json(response, 200, list([sampleBooking("W2-02-LIST")])); }
    if (active.mode === "empty-list" && isList) { observe(200, "synthetic-empty"); return json(response, 200, list([])); }
    if (active.mode === "error-retry-list" && isList) { observe(503, "synthetic-error"); return json(response, 503, { message: "Controlled Booking service error", correlationId: "w2-02-error" }); }
    if (active.mode === "denied-list" && isList) { observe(403, "synthetic-denied"); return json(response, 403, { message: "Controlled Booking access denial", correlationId: "w2-02-denied" }); }
    if (active.mode === "populated-detail" && request.method === "GET" && url.pathname === "/api/bookings/W2-02-DETAIL") { observe(200, "synthetic-detail"); return json(response, 200, sampleBooking("W2-02-DETAIL")); }
    if (active.mode === "degraded-detail" && request.method === "GET" && url.pathname === "/api/bookings/W2-02-DEGRADED") { observe(200, "synthetic-degraded"); return json(response, 200, sampleBooking("W2-02-DEGRADED", { status: "CONFIRMED" })); }
    if (active.mode === "validation-detail" && request.method === "GET" && url.pathname === "/api/bookings/W2-02-VALIDATION") { observe(200, "synthetic-validation"); return json(response, 200, sampleBooking("W2-02-VALIDATION", { legacyIncomplete: true, routing: [], equipment: [] })); }
    if (active.mode === "success-detail" && request.method === "GET" && url.pathname === "/api/bookings/W2-02-SUCCESS") { observe(200, "synthetic-success"); return json(response, 200, sampleBooking("W2-02-SUCCESS")); }
    if (active.mode === "pending-action") {
      if (request.method === "GET" && url.pathname === "/api/bookings/W2-02-PENDING") { observe(200, "synthetic-pending-base"); return json(response, 200, sampleBooking("W2-02-PENDING")); }
      if (request.method === "POST" && url.pathname.endsWith("/validate")) { observe(200, "delayed-action"); await new Promise((resolve) => setTimeout(resolve, 5_000)); return json(response, 200, sampleBooking("W2-02-PENDING", { status: "VALIDATED" })); }
    }
    if (active.mode !== "passthrough") return json(response, 409, { message: `Control ${active.mode} does not allow ${request.method} ${url.pathname}` });
    return forward();
  });
}
