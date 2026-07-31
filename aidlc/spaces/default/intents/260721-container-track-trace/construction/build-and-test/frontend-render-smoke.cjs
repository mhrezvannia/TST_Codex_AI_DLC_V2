const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");

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

const inactive = renderToStaticMarkup(React.createElement(JourneyStatusPanel, {
  bookingId: "booking-1",
  status: "DRAFT",
  initialStatuses: []
}));
assert.equal(inactive, "");

const pending = renderToStaticMarkup(React.createElement(JourneyStatusPanel, {
  bookingId: "booking-1",
  status: "CONFIRMED",
  initialStatuses: []
}));
assert.match(pending, /data-testid="journey-capability-hint"/);
assert.match(pending, /data-testid="journey-freshness"/);
assert.match(pending, /PENDING_EVENT/);

const projected = renderToStaticMarkup(React.createElement(JourneyStatusPanel, {
  bookingId: "booking-1",
  status: "CONFIRMED",
  initialStatuses: [{
    bookingRef: "booking-1",
    containerRef: "MSCU6639870",
    moveCode: "GTOT",
    eventClassifierCode: "ACT",
    occurredDateTime: "2026-07-26T10:00:00Z",
    derivedStatus: "GATED_OUT",
    emptyIndicatorCode: "LADEN",
    transshipment: false,
    location: { unLocationCode: "SGSIN" }
  }]
}));
assert.match(projected, /GATED_OUT/);
assert.match(projected, /GTOT \/ ACT/);
assert.match(projected, /MSCU6639870 at SGSIN/);

process.stdout.write(JSON.stringify({
  status: "passed",
  cases: 3,
  scope: "server-render smoke; effects and interactions excluded"
}) + "\n");
