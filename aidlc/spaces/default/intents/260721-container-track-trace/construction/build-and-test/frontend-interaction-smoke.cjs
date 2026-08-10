const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const React = require("react");
const ts = require("typescript");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/"
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(document, "hidden", { configurable: true, value: false });

const { act, cleanup, fireEvent, render, screen } = require("@testing-library/react");
const workspace = path.resolve(__dirname, "../../../../../../..");
const componentPath = path.join(
  workspace,
  "apps",
  "booking",
  "app",
  "bookings",
  "[bookingId]",
  "JourneyStatusPanel.tsx"
);
const source = fs.readFileSync(componentPath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: componentPath,
  reportDiagnostics: true
});
assert.equal(
  compiled.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error).length,
  0,
  "JourneyStatusPanel transpilation diagnostics"
);

const loaded = new Module(componentPath, module);
loaded.filename = componentPath;
loaded.paths = Module._nodeModulePaths(path.dirname(componentPath));
loaded._compile(compiled.outputText, componentPath);
const { JourneyStatusPanel } = loaded.exports;

const movementStatus = {
  bookingRef: "booking-1",
  containerRef: "MSCU6639870",
  movementId: "move-1",
  moveCode: "LOAD",
  eventClassifierCode: "ACT",
  occurredDateTime: "2026-07-16T10:00:00Z",
  receivedDateTime: "2026-07-16T10:01:00Z",
  derivedStatus: "LOADED",
  emptyIndicatorCode: "LADEN",
  transshipment: false,
  location: {
    unLocationCode: "CNSHA",
    facilityCode: "SHA01",
    facilityTypeCode: "TERMINAL"
  },
  eventId: "event-1",
  source: "container-movement-service",
  eventTime: "2026-07-16T10:01:00Z",
  dataSchemaVersion: 1,
  correlationId: "corr-1",
  projectedAt: "2026-07-16T10:01:01Z"
};

const intervals = [];
window.setInterval = (callback) => {
  intervals.push(callback);
  return intervals.length;
};
window.clearInterval = () => {};

function panel(initialStatuses) {
  return React.createElement(JourneyStatusPanel, {
    bookingId: "booking-1",
    status: "CONFIRMED",
    initialStatuses
  });
}

async function run() {
  render(panel([movementStatus]));
  assert.ok(screen.getByText("LOADED"));
  assert.ok(screen.getByText(/MSCU6639870 at CNSHA/));
  cleanup();

  let calls = 0;
  global.fetch = async (url, options) => {
    calls++;
    assert.equal(url, "/api/bookings/booking-1");
    assert.equal(options.cache, "no-store");
    return new Response(JSON.stringify({ movementStatuses: [movementStatus] }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
  render(panel([]));
  assert.ok(screen.getByText("PENDING_EVENT"));
  await act(async () => intervals.at(-1)());
  assert.equal(calls, 1);
  assert.ok(screen.getByText("LOADED"));
  cleanup();

  global.fetch = async () => new Response(JSON.stringify({ movementStatuses: [] }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
  render(panel([]));
  const boundedPoll = intervals.at(-1);
  await act(async () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      await boundedPoll();
    }
  });
  assert.ok(screen.getByText("Container Movement has not projected a journey status yet."));
  const retry = screen.getByTestId("journey-status-retry");
  assert.ok(retry);
  fireEvent.click(retry);
  assert.equal(screen.queryByTestId("journey-status-retry"), null);
  assert.ok(screen.getByText(/Confirmation is committed locally/));
  cleanup();

  process.stdout.write(JSON.stringify({
    status: "passed",
    cases: 4,
    scope: "in-process DOM interactions; Next bundling and real browser excluded"
  }) + "\n");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
