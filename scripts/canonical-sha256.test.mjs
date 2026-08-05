import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { sha256CanonicalText } from "./canonical-sha256.mjs";

test("produces the same digest for LF and CRLF text", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "linercore-sha256-"));
  const lfPath = path.join(root, "lf.sql");
  const crlfPath = path.join(root, "crlf.sql");

  try {
    writeFileSync(lfPath, "select 1;\nselect 2;\n", "utf8");
    writeFileSync(crlfPath, "select 1;\r\nselect 2;\r\n", "utf8");
    assert.equal(sha256CanonicalText(lfPath), sha256CanonicalText(crlfPath));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
