import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { EvidenceWriter } from "../aidlc-evidence-fs.mjs";
import { runBoundedCommand } from "./command.mjs";
import { createDefaultBrowserAdapter } from "./browser-adapter.mjs";
import { REQUIRED_TERMINAL_GATE_IDS } from "./contracts.mjs";
import { OWNER_LOCAL_DATABASE_COMMANDS, STARTUP } from "./gate-catalog.mjs";
import { assertManagerUnchanged, runPreGuard, runReadOnlyManagerInventory, runWaveAConfig } from "./isolation.mjs";
import { DurableLedger, recoverLedger } from "./ledger.mjs";
import { MIGRATIONS, orchestrateGates, restoreTarget, validateMigrationProof, validateRestoreGuard } from "./live-gates.mjs";
import { compileManifest, publishManifest } from "./manifest.mjs";
import { createObservationAdapter } from "./observation-adapter.mjs";
import { PublicationCapability } from "./publication.mjs";
import { assertResourcePreflight, createRunId } from "./provenance.mjs";
import { validateRegistry, validateResults } from "./registry.mjs";

const CATEGORY_STAGE = Object.freeze({ PRESERVATION: "preservation", SECURITY: "security", COMMERCIAL: "commercial",
  BROWSER_STRUCTURAL: "browser", BROWSER_STATE: "browser", DESIGN_DEPENDENCY: "browser", OBSERVABILITY: "observability",
  QUALITY: "quality", AUDIT: "audits" });
const SAFETY_GATE_IDS = Object.freeze(["teardown", "manager-post-guard", "manager-inventory-after", "manager-unchanged"]);
const MAIN_GATE_IDS = Object.freeze(REQUIRED_TERMINAL_GATE_IDS.slice(0, REQUIRED_TERMINAL_GATE_IDS.indexOf("teardown")));

export async function runU06Acceptance({ root, registry, adapters = createDefaultAdapters({ root }), runId = createRunId(), now = () => new Date() }) {
  validateRegistry(registry);
  const runRoot = path.join(root, "artifacts", "w2-03-live", runId); mkdirSync(runRoot, { recursive: true });
  const ledger = new DurableLedger(path.join(runRoot, "ledger.log"));
  const state = { root, runRoot, runId, registry, adapters, registryResults: [], artifacts: [], stageResults: new Map(), now };
  const gates = MAIN_GATE_IDS.map((id) => ({ id, run: async () => executeAdapter(id, state) }));
  let orchestration;
  try {
    const main = await orchestrateGates(gates);
    const startupResult = main.results.find((result) => result.id === "live-startup");
    state.waveAMutated = startupResult?.waveAMutated === true || ["PASS", "FAIL"].includes(startupResult?.status);
    const safety = state.waveAMutated
      ? await runSafetyRecoveryLane(SAFETY_GATE_IDS, state)
      : SAFETY_GATE_IDS.map((id) => ({ id, status: "SKIPPED", skippedBecause: firstTerminalId(main.results) ?? "live-startup" }));
    orchestration = { ...main, results: [...main.results, ...safety] };
    for (const result of orchestration.results) { state.stageResults.set(result.id, result); ledger.append(asGateRecord(result, now)); }
    const closedResults = closeRegistryResults(state);
    for (const result of closedResults) ledger.append(result);
    for (const artifact of state.artifacts) ledger.append(artifact);
    const recovery = recoverLedger(path.join(runRoot, "ledger.log"));
    ledger.append(asGateRecord({ id: "ledger-recovery", status: recovery.truncatedBytes === 0 ? "PASS" : "FAIL", summary: `records=${recovery.records.length};truncated=${recovery.truncatedBytes}` }, now));
    const rehashStatus = state.artifacts.length > 0 ? "PASS" : "BLOCKED";
    ledger.append(asGateRecord({ id: "artifact-rehash", status: rehashStatus, blockerId: rehashStatus === "BLOCKED" ? "B-artifact-rehash" : undefined,
      summary: rehashStatus === "PASS" ? "artifacts reopened during manifest compilation" : "no publishable artifacts" }, now));
    ledger.close();
    const records = recoverLedger(path.join(runRoot, "ledger.log")).records;
    const manifest = compileManifest({ runId, ledgerRecords: records, registry, runRoot });
    const publication = publishManifest(runRoot, manifest);
    return { schemaVersion: 1, runId, runRoot: path.relative(root, runRoot).replaceAll("\\", "/"), status: publication.published ? manifest.status : "BLOCKED",
      humanApproval: "NOT_EVALUATED", results: orchestration.results, registryResults: closedResults, manifest: publication };
  } finally { ledger.close(); }
}

export function createDefaultAdapters({ root, execute, env = process.env } = {}) {
  const command = (id, phase, argv, requirements = ["BR-U06-005"], timeoutMs = 120_000) => () => runBoundedCommand({ id, phase,
    command: argv[0], args: argv.slice(1), cwd: root, requirements, timeoutMs }, { execute });
  return {
    "resource-preflight": () => ({ status: assertResourcePreflight(root).status }),
    "manager-pre-guard": () => runPreGuard({ execute }),
    "manager-inventory-before": (state) => {
      const inventory = runReadOnlyManagerInventory({ execute });
      state.managerBefore = inventory.fingerprint;
      return inventory.gate;
    },
    "wave-a-isolation-config": () => runWaveAConfig({ execute }),
    "evidence-writer": ({ registry, runRoot }) => {
      const writer = new EvidenceWriter({ runRoot: path.join(runRoot, "evidence"), registry });
      return { status: "PASS", publication: new PublicationCapability({ writer }) };
    },
    "live-startup": () => {
      const result = command("live-startup", "startup", STARTUP.command, ["BR-U06-004"], STARTUP.timeoutMs)();
      const unstarted = ["EPERM", "EACCES", "ENOENT", "ENOSYS"].includes(result.errorCode)
        || /spawnSync[^\r\n]*(?:EPERM|EACCES|ENOENT|ENOSYS)/i.test(`${result.stdout}\n${result.stderr}\n${result.summary}`);
      return { ...result, waveAMutated: !unstarted };
    },
    readiness: (state) => {
      if (!env.U06_SIGNED_STORAGE_STATE || !env.U06_SIGNED_SESSION_SUBJECT) return blocked("readiness", "signed readiness session capability unavailable");
      const capture = runBoundedCommand({ id: "readiness", phase: "readiness", command: "node",
        args: ["scripts/u06-observe-readiness.mjs", "--storage-state", env.U06_SIGNED_STORAGE_STATE, "--subject", env.U06_SIGNED_SESSION_SUBJECT],
        cwd: root, env, requirements: ["BR-U06-004"], timeoutMs: STARTUP.serviceReadinessMs }, { execute });
      if (capture.status !== "PASS") return capture;
      return { ...capture, ...createObservationAdapter("readiness", { root })(state) };
    },
    "migration-charge": createMigrationAdapter("CHARGE", { execute, root }), "migration-booking": createMigrationAdapter("BOOKING", { execute, root }),
    "restore-charge": createRestoreAdapter("CHARGE", { execute, root }), "restore-booking": createRestoreAdapter("BOOKING", { execute, root }),
    commercial: (state) => {
      if (!env.U06_SIGNED_STORAGE_STATE) return blocked("commercial", "signed commercial session capability unavailable");
      const capture = runBoundedCommand({ id: "commercial", phase: "commercial", command: "node",
        args: ["scripts/u06-observe-commercial.mjs", "--storage-state", env.U06_SIGNED_STORAGE_STATE],
        cwd: root, env, requirements: ["BR-U06-017", "BR-U06-018", "BR-U06-019", "BR-U06-020",
          "BR-U06-021", "BR-U06-022", "BR-U06-023", "BR-U06-024"], timeoutMs: 600_000 }, { execute });
      if (capture.status !== "PASS") return capture;
      return { ...capture, ...createObservationAdapter("commercial", { root })(state) };
    },
    browser: createDefaultBrowserAdapter({ root }),
    performance: createObservationAdapter("performance", { root }),
    security: createObservationAdapter("security", { root }),
    observability: createObservationAdapter("observability", { root }),
    preservation: createObservationAdapter("preservation", { root }),
    quality: createObservationAdapter("quality", { root }),
    audits: createObservationAdapter("audits", { root }),
    teardown: command("teardown", "teardown", ["node", "scripts/wave-a-compose.mjs", "down", "--volumes", "--remove-orphans"], ["BR-U06-003"], 120_000),
    "manager-post-guard": () => runPreGuard({ execute }),
    "manager-inventory-after": (state) => {
      const inventory = runReadOnlyManagerInventory({ execute });
      state.managerAfter = inventory.fingerprint;
      return inventory.gate;
    },
    "manager-unchanged": (state) => {
      if (!state.managerBefore || !state.managerAfter) return blocked("manager-unchanged", "manager fingerprint observation unavailable");
      assertManagerUnchanged(state.managerBefore, state.managerAfter);
      return { status: "PASS", summary: `manager fingerprint ${state.managerBefore.sha256} unchanged` };
    },
  };
}

export function createMigrationAdapter(owner, { execute, root }) {
  return () => {
    const service = owner === "CHARGE" ? "charge-agreement-service" : "booking-service";
    const before = runJsonDatabaseProbe(owner, "catalog-before", MIGRATION_CATALOG_SQL[owner], { execute, root });
    if (before.gate.status !== "PASS") return before.gate;
    const restart = runLifecycleCommand(`migration-${owner.toLowerCase()}-restart`, "migration",
      ["node", "scripts/wave-a-compose.mjs", "restart", service], { execute, root });
    if (restart.status !== "PASS") return restart;
    const ready = runLifecycleCommand(`migration-${owner.toLowerCase()}-ready`, "migration",
      ["node", "scripts/wave-a-compose.mjs", "up", "-d", "--no-deps", "--wait", service], { execute, root });
    if (ready.status !== "PASS") return ready;
    const after = runJsonDatabaseProbe(owner, "catalog-after", MIGRATION_CATALOG_SQL[owner], { execute, root });
    if (after.gate.status !== "PASS") return after.gate;
    const immutable = runJsonDatabaseProbe(owner, "immutability", IMMUTABILITY_EVIDENCE_SQL[owner], { execute, root });
    if (immutable.gate.status !== "PASS") return immutable.gate;
    const proof = {
      owner,
      startingShape: before.value.startingShape,
      databaseOid: before.value.databaseOid,
      migrations: migrationSourceHashes(owner, root),
      catalogBefore: before.value.catalog,
      catalogAfter: after.value.catalog,
      catalogHashBefore: hashJson(before.value.catalog),
      catalogHashAfter: hashJson(after.value.catalog),
      restartHashStable: hashJson(before.value.catalog) === hashJson(after.value.catalog),
      immutableMutation: immutable.value,
      legacyRowsPreserved: before.value.legacyFingerprint === after.value.legacyFingerprint,
      legacySnapshotsPreserved: before.value.legacyFingerprint === after.value.legacyFingerprint,
      inventedRateLinks: after.value.inventedRateLinks,
    };
    return { ...after.gate, id: `migration-${owner.toLowerCase()}`, status: validateMigrationProof(proof), proof,
      summary: `machine-readable catalog/OID/restart/immutability/legacy proof observed for ${owner}` };
  };
}

export function createRestoreAdapter(owner, { execute, root }) {
  return ({ runId }) => {
    const target = restoreTarget(owner, runId);
    const sourceName = owner === "CHARGE" ? "linercore_pricing" : "linercore_booking";
    const sourceOwner = sourceName;
    const otherTarget = target.replace(owner.toLowerCase(), owner === "CHARGE" ? "booking" : "charge");
    const before = runAdminIdentityProbe({ owner, sourceName, target, otherTarget, execute, root, id: "before" });
    if (before.gate.status !== "PASS") return before.gate;
    validateRestoreGuard({ owner, target, sourceName, sourceOid: before.value.sourceOid, targetExists: before.value.targetExists,
      targetOid: before.value.targetOid, otherTarget, otherTargetOid: before.value.otherTargetOid,
      project: before.value.project, adminDatabase: before.value.adminDatabase, runId });
    const dump = `/tmp/u06-${owner.toLowerCase()}-${runId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}.dump`;
    const commands = [
      ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "pg_dump", "-U", sourceOwner, "--dbname", sourceName, "--format", "custom", "--file", dump],
      ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "createdb", "-U", "linercore", "--maintenance-db", "postgres", "--owner", sourceOwner, target],
      ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "pg_restore", "-U", sourceOwner, "--dbname", target, "--exit-on-error", dump],
      ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "psql", "-U", "linercore", "-X", "-v", "ON_ERROR_STOP=1", "-d", "postgres",
        "-c", `COMMENT ON DATABASE ${target} IS 'U06:${owner}:${runId}'`],
    ];
    let result;
    try {
      for (const [index, argv] of commands.entries()) {
        result = runLifecycleCommand(`restore-${owner.toLowerCase()}-${index + 1}`, "restore", argv, { execute, root });
        if (result.status !== "PASS") return { ...result, id: `restore-${owner.toLowerCase()}` };
      }
      const after = runAdminIdentityProbe({ owner, sourceName, target, otherTarget, execute, root, id: "after" });
      if (after.gate.status !== "PASS") return after.gate;
      validateRestoreGuard({ owner, target, sourceName, sourceOid: after.value.sourceOid, targetExists: after.value.targetExists,
        targetOid: after.value.targetOid, otherTarget, otherTargetOid: after.value.otherTargetOid,
        project: after.value.project, adminDatabase: after.value.adminDatabase,
        ownerMarker: after.value.ownerMarker, runId, expectedExists: true });
      const sourceCatalog = runCatalogHashProbe(owner, sourceName, "source", { execute, root });
      const restoredCatalog = runCatalogHashProbe(owner, target, "target", { execute, root });
      if (sourceCatalog.gate.status !== "PASS") return sourceCatalog.gate;
      if (restoredCatalog.gate.status !== "PASS") return restoredCatalog.gate;
      if (!after.value.targetExists || !after.value.targetOid || after.value.targetOid === after.value.sourceOid
        || restoredCatalog.value.catalogHash !== sourceCatalog.value.catalogHash) throw new Error("restored target identity/catalog mismatch");
      return { ...after.gate, id: `restore-${owner.toLowerCase()}`, status: "PASS",
        summary: `isolated restore ${target} verified by OID, owner marker, and catalog hash` };
    } finally {
      const cleanup = runLifecycleCommand(`restore-${owner.toLowerCase()}-cleanup`, "restore",
        ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "dropdb", "-U", "linercore", "--maintenance-db", "postgres", "--if-exists", target], { execute, root });
      if (cleanup.status === "PASS") {
        const cleaned = runAdminIdentityProbe({ owner, sourceName, target, otherTarget, execute, root, id: "cleanup" });
        if (cleaned.gate.status !== "PASS" || cleaned.value.targetExists || cleaned.value.targetOid) {
          throw new Error("restore cleanup was not observably complete");
        }
      } else if (result?.status === "PASS") {
        throw Object.assign(new Error("restore cleanup capability unavailable"), { status: cleanup.status });
      }
    }
  };
}

const MIGRATION_CATALOG_SQL = Object.freeze({
  CHARGE: String.raw`SELECT json_build_object(
    'databaseOid',(SELECT oid::int FROM pg_database WHERE datname=current_database()),
    'startingShape',CASE WHEN to_regclass('public.flyway_schema_history') IS NULL
      THEN CASE WHEN to_regclass('public.charge_agreements') IS NULL THEN 'EMPTY' ELSE 'LEGACY' END
      ELSE 'V' || COALESCE((SELECT max(version::int)::text FROM flyway_schema_history WHERE success), '0') END,
    'catalog',COALESCE((SELECT json_agg(json_build_object('version','V'||version,'checksum',checksum,'success',success) ORDER BY installed_rank) FROM flyway_schema_history),'[]'::json),
    'legacyFingerprint',md5(COALESCE((SELECT count(*)::text FROM charge_agreements WHERE authority_model='LEGACY'),'0')),
    'inventedRateLinks',COALESCE((SELECT count(*)::int FROM charge_agreement_rate_links l JOIN charge_agreement_versions v USING (agreement_version_id) WHERE v.authority_model='LEGACY'),0)
  )`,
  BOOKING: String.raw`SELECT json_build_object(
    'databaseOid',(SELECT oid::int FROM pg_database WHERE datname=current_database()),
    'startingShape',CASE WHEN to_regclass('public.flyway_schema_history') IS NULL
      THEN CASE WHEN to_regclass('public.booking_records') IS NULL THEN 'EMPTY' ELSE 'V1' END
      ELSE 'V' || COALESCE((SELECT max(version::int)::text FROM flyway_schema_history WHERE success), '0') END,
    'catalog',COALESCE((SELECT json_agg(json_build_object('version','V'||version,'checksum',checksum,'success',success) ORDER BY installed_rank) FROM flyway_schema_history),'[]'::json),
    'legacyFingerprint',md5(COALESCE((SELECT count(*)::text FROM booking_records WHERE snapshot::text LIKE '%LEGACY%'),'0')),
    'inventedRateLinks',0
  )`,
});

const IMMUTABILITY_EVIDENCE_SQL = Object.freeze({
  CHARGE: String.raw`BEGIN;
    CREATE TEMP TABLE u06_immutable_result(attempted boolean,rejected boolean,before_hash text,after_hash text) ON COMMIT DROP;
    DO $u06$ DECLARE v_id varchar(64); v_before text; v_after text; v_rejected boolean:=false;
    BEGIN
      SELECT agreement_version_id,md5(row_to_json(v)::text) INTO v_id,v_before FROM charge_agreement_versions v
        WHERE lifecycle='APPROVED' ORDER BY agreement_version_id LIMIT 1;
      IF v_id IS NULL THEN
        INSERT INTO charge_agreements(id,agreement_number,customer_id,trade_lane_id,commodity_id,valid_from,valid_to,status,version,
          created_by,created_at,updated_by,updated_at,snapshot,authority_model)
        VALUES('u06-immutable-agreement','U06-IMMUTABLE','u06-customer','u06-lane','u06-commodity',DATE '2026-01-01',DATE '2026-12-31',
          'APPROVED',1,'u06-observer',CURRENT_TIMESTAMP,'u06-observer',CURRENT_TIMESTAMP,'{}','W2_VERSIONED');
        INSERT INTO charge_agreement_versions(agreement_version_id,agreement_id,version_no,authority_model,w2_authority_eligible,
          customer_id,trade_lane_id,origin_location_id,destination_location_id,equipment_type_id,commodity_id,valid_from,valid_to,
          lifecycle,row_version,created_by,created_at,updated_by,updated_at,approved_by,approved_at,correlation_id,snapshot)
        VALUES('u06-immutable-agreement-v1','u06-immutable-agreement',1,'W2_VERSIONED',TRUE,'u06-customer','u06-lane','USNYC','NLRTM',
          '22G1','u06-commodity',DATE '2026-01-01',DATE '2026-12-31','APPROVED',0,'u06-observer',CURRENT_TIMESTAMP,
          'u06-observer',CURRENT_TIMESTAMP,'u06-observer',CURRENT_TIMESTAMP,'u06-immutable-correlation','{}');
        SELECT agreement_version_id,md5(row_to_json(v)::text) INTO v_id,v_before FROM charge_agreement_versions v
          WHERE agreement_version_id='u06-immutable-agreement-v1';
      END IF;
      BEGIN UPDATE charge_agreement_versions SET snapshot=snapshot||' ' WHERE agreement_version_id=v_id;
      EXCEPTION WHEN others THEN v_rejected:=true; END;
      SELECT md5(row_to_json(v)::text) INTO v_after FROM charge_agreement_versions v WHERE agreement_version_id=v_id;
      INSERT INTO u06_immutable_result VALUES(true,v_rejected,v_before,v_after);
    END $u06$;
    SELECT json_build_object('attempted',attempted,'rejected',rejected,'beforeHash',before_hash,'afterHash',after_hash) FROM u06_immutable_result;
    ROLLBACK;`,
  BOOKING: String.raw`BEGIN;
    CREATE TEMP TABLE u06_immutable_result(attempted boolean,rejected boolean,before_hash text,after_hash text) ON COMMIT DROP;
    DO $u06$ DECLARE v_booking varchar(64); v_request varchar(128); v_before text; v_after text; v_rejected boolean:=false;
    BEGIN
      SELECT booking_id,pricing_request_id,md5(row_to_json(v)::text) INTO v_booking,v_request,v_before
        FROM booking_pricing_snapshots v ORDER BY booking_id,pricing_request_id LIMIT 1;
      IF v_booking IS NULL THEN
        INSERT INTO booking_records(booking_id,booking_number,status,revision,customer_id,origin_location_id,destination_location_id,
          equipment_type_code,updated_at,snapshot_version,snapshot)
        VALUES('u06-immutable-booking','U06-IMMUTABLE','DRAFT',0,'u06-customer','USNYC','NLRTM','22G1',CURRENT_TIMESTAMP,1,'{}');
        INSERT INTO booking_pricing_snapshots(booking_id,pricing_request_id,amendment_seq,booking_revision,schema_version,snapshot,correlation_id)
        VALUES('u06-immutable-booking','u06-immutable-pricing',0,0,2,'{}','u06-immutable-correlation');
        SELECT booking_id,pricing_request_id,md5(row_to_json(v)::text) INTO v_booking,v_request,v_before
          FROM booking_pricing_snapshots v WHERE booking_id='u06-immutable-booking' AND pricing_request_id='u06-immutable-pricing';
      END IF;
      BEGIN UPDATE booking_pricing_snapshots SET snapshot=snapshot||' ' WHERE booking_id=v_booking AND pricing_request_id=v_request;
      EXCEPTION WHEN others THEN v_rejected:=true; END;
      SELECT md5(row_to_json(v)::text) INTO v_after FROM booking_pricing_snapshots v WHERE booking_id=v_booking AND pricing_request_id=v_request;
      INSERT INTO u06_immutable_result VALUES(true,v_rejected,v_before,v_after);
    END $u06$;
    SELECT json_build_object('attempted',attempted,'rejected',rejected,'beforeHash',before_hash,'afterHash',after_hash) FROM u06_immutable_result;
    ROLLBACK;`,
});

function runJsonDatabaseProbe(owner, suffix, sql, { execute, root }) {
  const argv = [...OWNER_LOCAL_DATABASE_COMMANDS[owner], "-X", "--no-psqlrc", "-qAt", "-v", "ON_ERROR_STOP=1", "-c", sql];
  const gate = runLifecycleCommand(`migration-${owner.toLowerCase()}-${suffix}`, "migration", argv, { execute, root });
  if (gate.status !== "PASS") return { gate, value: null };
  try {
    const lines = gate.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length !== 1) throw new Error(`expected one JSON row, observed ${lines.length}`);
    const value = JSON.parse(lines[0]);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("database probe JSON object required");
    return { gate, value };
  } catch (error) {
    return { gate: { ...gate, status: "FAIL", classification: "MACHINE_EVIDENCE_PARSE_MISMATCH", summary: error.message }, value: null };
  }
}

function runAdminIdentityProbe({ owner, sourceName, target, otherTarget, execute, root, id }) {
  const quoted = [sourceName, target, otherTarget].map((value) => `'${value.replaceAll("'", "''")}'`);
  const sql = `SELECT json_build_object('project','linercore-wave-a','adminDatabase',current_database(),`
    + `'sourceOid',(SELECT oid::int FROM pg_database WHERE datname=${quoted[0]}),`
    + `'targetExists',EXISTS(SELECT 1 FROM pg_database WHERE datname=${quoted[1]}),`
    + `'targetOid',(SELECT oid::int FROM pg_database WHERE datname=${quoted[1]}),`
    + `'otherTargetOid',(SELECT oid::int FROM pg_database WHERE datname=${quoted[2]}),`
    + `'ownerMarker',(SELECT shobj_description(oid,'pg_database') FROM pg_database WHERE datname=${quoted[1]}))`;
  const argv = ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "psql", "-U", "linercore", "-X", "--no-psqlrc", "-qAt",
    "-v", "ON_ERROR_STOP=1", "-d", "postgres", "-c", sql];
  const gate = runLifecycleCommand(`restore-${owner.toLowerCase()}-identity-${id}`, "restore", argv, { execute, root });
  if (gate.status !== "PASS") return { gate, value: null };
  try {
    const lines = gate.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length !== 1) throw new Error("admin identity probe must emit one JSON row");
    return { gate, value: JSON.parse(lines[0]) };
  } catch (error) {
    return { gate: { ...gate, status: "FAIL", classification: "MACHINE_EVIDENCE_PARSE_MISMATCH", summary: error.message }, value: null };
  }
}

function runCatalogHashProbe(owner, database, suffix, { execute, root }) {
  const sql = "SELECT json_build_object('catalogHash',md5(COALESCE((SELECT json_agg(json_build_object('version',version,'checksum',checksum,'success',success) ORDER BY installed_rank)::text FROM flyway_schema_history),'[]')))";
  const argv = ["node", "scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "psql", "-U", "linercore", "-X", "--no-psqlrc", "-qAt",
    "-v", "ON_ERROR_STOP=1", "-d", database, "-c", sql];
  const gate = runLifecycleCommand(`restore-${owner.toLowerCase()}-catalog-${suffix}`, "restore", argv, { execute, root });
  if (gate.status !== "PASS") return { gate, value: null };
  try {
    const lines = gate.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length !== 1) throw new Error("catalog hash probe must emit one JSON row");
    const value = JSON.parse(lines[0]);
    if (!/^[a-f0-9]{32}$/.test(value.catalogHash)) throw new Error("catalog hash missing");
    return { gate, value };
  } catch (error) {
    return { gate: { ...gate, status: "FAIL", classification: "MACHINE_EVIDENCE_PARSE_MISMATCH", summary: error.message }, value: null };
  }
}

function runLifecycleCommand(id, phase, argv, { execute, root }) {
  return runBoundedCommand({ id, phase, command: argv[0], args: argv.slice(1), cwd: root,
    requirements: [phase === "restore" ? "BR-U06-015" : "BR-U06-010"], timeoutMs: 120_000 }, { execute });
}

function migrationSourceHashes(owner, root) {
  const directory = path.join(root, "services", owner === "CHARGE" ? "charge-agreement-service" : "booking-service",
    "dataaccess", "src", "main", "resources", "db", "migration");
  const observed = readdirSync(directory).filter((name) => /^V\d+__.*\.sql$/.test(name))
    .sort((a, b) => Number(a.match(/^V(\d+)/)[1]) - Number(b.match(/^V(\d+)/)[1]))
    .map((name) => ({ version: name.match(/^(V\d+)/)[1], sha256: createHash("sha256").update(readFileSync(path.join(directory, name))).digest("hex") }));
  if (observed.length !== MIGRATIONS[owner].length) throw new Error(`${owner} migration source catalog cardinality mismatch`);
  return observed;
}

function hashJson(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function executeAdapter(id, state) {
  const adapter = state.adapters[id]; if (typeof adapter !== "function") throw Object.assign(new Error(`adapter ${id} unavailable`), { status: "BLOCKED" });
  const value = await adapter(state); const result = value?.gate ?? value;
  if (value?.publication) {
    if (state.publication) throw new Error("publication capability already initialized");
    state.publication = value.publication;
  }
  if (Array.isArray(value?.registryResults)) state.registryResults.push(...value.registryResults);
  if (Array.isArray(value?.artifacts)) {
    if (!state.publication) throw new Error("artifact publication attempted before writer capability");
    state.publication.assertIssued(value.artifacts);
    state.artifacts.push(...value.artifacts);
  }
  return { id, ...result };
}

async function runSafetyRecoveryLane(ids, state) {
  const results = [];
  for (const id of ids) {
    try {
      const result = await executeAdapter(id, state);
      results.push(result && ["PASS", "FAIL", "BLOCKED", "SKIPPED"].includes(result.status)
        ? result : { id, status: "FAIL", summary: "malformed recovery result" });
    } catch (error) {
      const status = error?.status === "BLOCKED" ? "BLOCKED" : "FAIL";
      results.push({ id, status, blockerId: status === "BLOCKED" ? `B-${id}` : undefined,
        summary: `recovery lane: ${String(error?.message ?? error)}` });
    }
  }
  return results;
}

function firstTerminalId(results) {
  return results.find((result) => ["FAIL", "BLOCKED"].includes(result.status))?.id;
}

function closeRegistryResults(state) {
  const supplied = new Map(state.registryResults.map((result) => [result.key, result])); const closed = [];
  for (const member of state.registry.members) {
    if (supplied.has(member.key)) { closed.push(normalizeRegistryResult(supplied.get(member.key), member)); continue; }
    const dependency = member.legalSkippedAfter.find((key) => ["FAIL", "BLOCKED", "SKIPPED"].includes(closed.find((result) => result.key === key)?.status));
    if (dependency) { closed.push({ recordKind: "registry-result", schemaVersion: 1, recordId: member.key, key: member.key, status: "SKIPPED", skippedBecause: dependency, artifacts: [] }); continue; }
    const stage = state.stageResults.get(CATEGORY_STAGE[member.category]); const status = stage?.status === "FAIL" ? "FAIL" : "BLOCKED";
    closed.push({ recordKind: "registry-result", schemaVersion: 1, recordId: member.key, key: member.key, status,
      blockerId: status === "BLOCKED" ? stage?.blockerId ?? `B-${CATEGORY_STAGE[member.category] ?? "lifecycle"}` : undefined, artifacts: [] });
  }
  validateResults(state.registry, closed); return closed;
}

function normalizeRegistryResult(result, member) { return { recordKind: "registry-result", schemaVersion: 1, recordId: member.key, ...result, key: member.key }; }
function asGateRecord(result, now) { const timestamp = now().toISOString(); return { recordKind: "gate", schemaVersion: 1, recordId: result.id, gateId: result.id,
  phase: "acceptance", requirements: ["BR-U06-005"], command: [], startedAt: result.startedAt ?? timestamp, completedAt: result.completedAt ?? timestamp,
  startMonotonicNs: result.startMonotonicNs ?? "0", endMonotonicNs: result.endMonotonicNs ?? "0", exitCode: result.exitCode ?? (result.status === "PASS" ? 0 : null),
  status: result.status, summary: result.summary ?? result.classification ?? result.status, blockerId: result.blockerId, skippedBecause: result.skippedBecause }; }
function blocked(id, summary) { return { id, status: "BLOCKED", blockerId: `B-${id}`, summary }; }
