import { sanitizeTraceArchive } from "./w2-02-trace-sanitize.mjs";
const [input, output, report] = process.argv.slice(2);
if (!input || !output || !report) throw new Error("Usage: node scripts/w2-02-trace-sanitize-cli.mjs <raw.zip> <promoted.zip> <report.json>");
const localIdentities = JSON.parse(process.env.W2_02_LOCAL_IDENTITIES_JSON ?? "[]");
console.log(JSON.stringify(await sanitizeTraceArchive(input, output, report, { localIdentities })));
