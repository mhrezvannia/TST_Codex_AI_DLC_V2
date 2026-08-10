# Security Test Instructions — W2-03

## Security boundary

These instructions consume all six `code-generation-plan` and `code-summary`
artifacts and the
unit `security-requirements.md` artifacts. They validate signed-session human
authority, exact service credentials and permissions, authorization before
lookup/write, trusted subject assertions, replay limits, fixed BFF routing,
bounded bodies/responses/deadlines, safe error normalization, telemetry
allowlists, evidence redaction, and manager/runtime isolation.

## Executable checks

1. Run contract/provider checks covering the real Charge pricing and subject
   assertion filters and terminal renderer/schema parity.
2. Run Java security/filter tests through the Charge reactor.
3. Run U06 adversarial tests for nested/escaped JSON secrets, bearer and URL
   credentials, UTF-8 caps, malformed evidence, capability exceptions,
   fabricated receipts, route resolution, and incomplete browser publication.
4. Run the U02 security aggregate, SAST, dependency/CVE, secret, IaC, SBOM, and
   container scans only with the authoritative pinned toolchain and trusted
   clock required by the NFRs.
5. DAST and browser authorization/disclosure checks require the isolated signed
   Wave A stack and writer-backed evidence.

## Gate semantics

Critical or High findings fail the stage unless an owner-approved,
time-bounded waiver exists. Missing pinned scanners, Docker, signed runtime, or
trusted evidence capability is `BLOCKED`, not clean-scan evidence. Tests must
show that denied or malformed requests disclose no protected existence,
counts, money, manual-case data, credentials, stack traces, or internal
provider content.
