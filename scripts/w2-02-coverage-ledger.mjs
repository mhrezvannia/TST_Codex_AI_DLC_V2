export const THEMES = ["light", "dark"];
export const VIEWPORTS = [375, 768, 1024, 1440];
export const ROUTES = ["list", "create", "detail"];
export const REQUIRED_STATES = ["loading", "populated", "empty", "error-retry", "denied", "degraded", "validation", "pending", "success"];

export const REQUIRED_CASE_IDS = [
  ...ROUTES.flatMap((route) => THEMES.flatMap((theme) => VIEWPORTS.map((width) => `visual:${route}:${theme}:${width}`))),
  ...REQUIRED_STATES.flatMap((state) => THEMES.flatMap((theme) => VIEWPORTS.map((width) => `state:${state}:${theme}:${width}`))),
  "keyboard:list-filter",
  "keyboard:create-to-confirm"
];

export const REQUIRED_GATES = ["demo-guard-pre-lifecycle", "wave-a-ownership", "wave-a-config", "wave-a-up", "wave-a-status", "wave-a-readiness", "pricing-fixture", "demo-guard-pre-browser", "wave-a-cleanup", "demo-guard-post", "aidlc-audit", "erp-fidelity-audit"];
export const WAVE_A_WRAPPER_COMMAND = "node scripts/wave-a-compose.mjs --parallel 1 -f compose.yaml -f infrastructure/compose/w2-02-acceptance.compose.yaml";
export const REQUIRED_GATE_COMMANDS = Object.freeze({
  "demo-guard-pre-lifecycle": "npm run demo:guard",
  "wave-a-ownership": `${WAVE_A_WRAPPER_COMMAND} ps --all --format json`,
  "wave-a-config": `${WAVE_A_WRAPPER_COMMAND} config --format json`,
  "wave-a-up": `${WAVE_A_WRAPPER_COMMAND} acceptance-up --wait-timeout 360`,
  "wave-a-status": `${WAVE_A_WRAPPER_COMMAND} ps --format json`,
  "wave-a-readiness": "GET http://127.0.0.1:18088/health + GET http://127.0.0.1:14312/__w2-02/health",
  "pricing-fixture": "node scripts/w2-02-pricing-fixture.mjs --json",
  "demo-guard-pre-browser": "npm run demo:guard",
  "demo-guard-post": "npm run demo:guard",
  "wave-a-cleanup": `${WAVE_A_WRAPPER_COMMAND} down --volumes --remove-orphans`,
  "aidlc-audit": "aidlc-audit",
  "erp-fidelity-audit": "erp-fidelity-audit"
});
