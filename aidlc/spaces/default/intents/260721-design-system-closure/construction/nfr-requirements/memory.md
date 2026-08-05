# NFR Requirements Memory

## Interpretations

- 2026-07-21T18:56:00Z — Treated existing executable bounds (2,500 ms BFF deadline, 32,768-byte body limit, page size 25, four viewports, zero serious/critical accessibility findings) as measurable requirements while leaving unsupported production targets explicitly unspecified.
- 2026-07-21T19:03:00Z — Classified W2-02 reliability as deterministic local journey, recovery, demo-safety, evidence, and audit behavior rather than long-term availability.

## Deviations

- 2026-07-21T19:03:00Z — Did not invent percentile latency, throughput, availability, recovery, retention, scanner, regulatory, cloud, or cost targets despite generic NFR templates requesting them; no authoritative baseline or approved scope supports those claims.

## Tradeoffs

- 2026-07-21T19:01:00Z — Allowed a pinned dev-only Playwright/axe integration only if no existing severity-capable checker is executable; this adds test tooling but avoids false “zero serious/critical” evidence and does not affect runtime bundles.
- 2026-07-21T19:02:00Z — Chose bounded DOM/page-size evidence instead of load testing because the intent changes presentation and supplies no capacity forecast.

## Open questions

- 2026-07-21T19:04:00Z — No unresolved NFR target remains after all five boundary decisions selected explicit option A.

