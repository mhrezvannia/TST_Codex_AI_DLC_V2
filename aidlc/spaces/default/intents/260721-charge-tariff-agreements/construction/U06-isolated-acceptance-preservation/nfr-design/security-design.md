# Security Design - U06 Isolated Acceptance and Preservation

## Isolation and authority

All Wave A mutations use `node scripts/wave-a-compose.mjs` with exact project
`linercore-wave-a`; browser traffic uses the signed shell/session at 18088.
Raw Docker is read-only manager inventory only. Pre/post `npm run demo:guard`
uses default manager settings, and any inventory difference fails without
automated repair.

The six-cell matrix executes allowed human actions, denied/no-disclosure,
spoofed browser authority, missing Booking service identity/permission, missing
non-local secret, and non-local bypass. Each cell observes the service boundary;
hidden UI controls and health endpoints are not authorization proof.

## Evidence access and integrity

One collision-free `artifacts/w2-03-live/<run-id>/` root is created with
exclusive semantics. Callers never supply artifact paths: a closed registry ID
maps to a sanitized basename beneath a pre-created category directory. The
writer rejects absolute/UNC/device/drive-relative names, `..`, alternate
streams, reparse points/junctions/symlinks, and any ancestor whose canonical
case-folded real path or `stat.dev` differs from the captured run root.

It opens a random temporary file with exclusive `wx`, requires `nlink=1` and
same volume, then rechecks the opened file and every parent identity immediately
before a same-directory atomic rename. A changed/replaced parent fails the gate.
Finalization reopens by registry path and revalidates identity/hash.

The root contains no credential store and inherits project-local access control.
Prior-wave evidence is read-only, hashed input; U06 never rewrites or merges it.

## Redaction and disclosure

Command records store a redacted argument vector, UTC/monotonic times, exit,
classification, output path, and requirement IDs. Cookies, tokens, passwords,
service credentials, raw customer/party payload, owner tokens, and unnecessary
money are prohibited from commands, logs, traces, screenshots metadata, and
reports. Minimal scenario assertions may contain expected/observed commercial
values in their access-controlled file.

Playwright writes its raw trace ZIP only to an access-restricted temporary
directory outside the evidence root. The sanitizer expands every entry, removes
cookies, authorization/service headers, storage/session state, secrets, and
request bodies not explicitly allow-listed, then creates a deterministic
sanitized ZIP. It expands that ZIP again and scans every entry with prohibited
canaries and generic patterns before indexing. An encrypted, unknown, corrupt,
or unsafe entry makes the cell BLOCKED; neither raw nor sanitized archive is
indexed, and the raw temporary is removed. Only the safe assertion JSON and
screenshots that pass the same scan remain. Every lead has a manual disposition.

## Browser and UI proof

Playwright uses the normal shell and asserts no direct backend request, safe
return URLs, no browser-supplied authority, denial before disclosure, visible
focus, keyboard order, dialog trap/Escape/restore, semantic loading/error
announcements, and zero critical/serious axe findings. The finite matrix covers
375/768/1024/1440 and light/dark for representative Charge and Booking page
families.

Binding LinerCore tokens, IBM Plex Sans, `@erp/ui`, and the shared shell remain
authoritative. Marketing gateways, remote fonts, decorative styling, and a
U06 UI are explicitly rejected.

## Supply-chain and audit

Changed code/dependencies pass secret, SAST, license, convergence, and
vulnerability checks with no attributable unaccepted Critical/High issue.
`aidlc-audit` and `erp-fidelity-audit` detector output is only a lead list;
every manual seam is reviewed with severity, file:line, scenario, and
disposition.

## Verification and traceability

The manifest requires every security ID exactly once, bounded metric labels,
safe correlation continuity, redaction results, browser network evidence,
manager fingerprints, and manual audit dispositions.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
