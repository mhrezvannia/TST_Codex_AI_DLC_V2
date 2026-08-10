# Contract catalog notes

## U03 Agreement authority

The additive W2 administration contract is
`openapi/charge-agreements.yaml`. Default media remains the legacy 1.0.0
contract. W2 clients must explicitly send and accept
`application/vnd.linercore.charge-agreement-v2+json`; the BFF never falls back
to legacy media after a vendor request.

Agreement events remain on `charge-agreement.events`. The five schemas under
`avro/charge-agreement.*.avsc` retain their 1.0.0 fields and add nullable,
defaulted W2 identity, version, lifecycle, correlation, link, and provenance
fields. Old payloads therefore remain readable while W2 producers populate the
new fields.

Validation is provided by `yarn contracts:validate`, `yarn contracts:verify`,
the controller/BFF contract tests, and
`node scripts/u03-agreement-preservation.test.mjs`. Live registry
compatibility and broker publication remain runtime evidence, not a
source-only claim.
