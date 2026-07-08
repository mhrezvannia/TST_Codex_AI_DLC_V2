# Local Seed Packs

Seed packs in this directory are local-only development data for the Shared Platform MVP.

## Rules

- Use fictional users and non-routable `.invalid` email addresses only.
- Do not copy production customers, employees, credentials, trade lanes, or commercial records into these files.
- Keep final trade-footprint decisions configurable; defaults only prove local behavior.
- Treat local development secrets as disposable. Non-local descriptors must use Vault or an approved secret reference path.
- Validate before running local smoke checks:

```bash
node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json
```

## Seed Summary

The loader reports `seedPackId`, `seedVersion`, `created`, `updated`, `skipped`, `failed`, and `correlationId`. A successful repeat run should produce already-current/skipped records instead of duplicate records when prior fingerprints are supplied by a persistent adapter.
