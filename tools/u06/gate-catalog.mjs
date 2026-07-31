export const STARTUP = Object.freeze({ command: ["node", "scripts/wave-a-compose.mjs", "up", "-d", "--build"], timeoutMs: 600_000, serviceReadinessMs: 120_000, edge: "http://127.0.0.1:18088" });
export const OWNER_LOCAL_DATABASE_COMMANDS = Object.freeze({
  CHARGE: ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "psql", "-d", "linercore_pricing"],
  BOOKING: ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "psql", "-d", "linercore_booking"],
});
export const PRESERVATION_GATES = Object.freeze([
  ["W0-01", "node scripts/validate-skeleton.mjs"], ["W0-02", "npm run seed:validate"],
  ["W1-01", "npm run w1:live-acceptance:dry-run"], ["W2-01", "npm run w2-01:live-acceptance:dry-run"],
  ["W2-02", "playwright test --project=u06-structural"],
]);
export const QUALITY_GATES = Object.freeze([
  ["BACKEND", "npm run backend:test"], ["FRONTEND", "npm test"], ["CONTRACT", "npm run contracts:verify"],
  ["MIGRATION", "mvn -f services/pom.xml -Ppostgres-it verify"], ["COVERAGE", "changed-lines >= 80%"],
  ["NGINX", "node scripts/u02-route-preservation.mjs"], ["PLAYWRIGHT", "playwright test tests/u06"],
  ["PERFORMANCE", "node scripts/u06-acceptance.mjs --performance"], ["RESTART_RESTORE", "node scripts/u06-acceptance.mjs --restart-restore"],
  ["GIT_DIFF", "git diff --check"],
]);
export const SUPPLY_CHAIN_GATES = Object.freeze(["dependency-convergence", "secret-scan", "sast", "license", "vulnerability"]);
export const AUDIT_GATES = Object.freeze([
  ["AIDLC_DETECTOR", "bash .claude/skills/aidlc-audit/detectors.sh"], ["AIDLC_MANUAL", ".claude/skills/aidlc-audit/SKILL.md"],
  ["ERP_FIDELITY_DETECTOR", "bash .claude/skills/erp-fidelity-audit/detectors.sh"], ["ERP_FIDELITY_MANUAL", ".claude/skills/erp-fidelity-audit/SKILL.md"],
]);
export const TEARDOWN = Object.freeze({ captureBefore: ["logs", "owner-local-db"], optionalCleanup: ["node", "scripts/wave-a-compose.mjs", "down"], postGuard: ["npm", "run", "demo:guard"], managerRepair: false });

export function validateManualAuditFinding(finding) {
  return Boolean(finding?.severity && /^[^:]+:\d+$/.test(finding.fileLine) && finding.scenario && finding.reviewer && finding.disposition && finding.completedAt);
}
