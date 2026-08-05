# Functional Design Architecture Review

## Review Execution

- Named reviewer `aidlc-architecture-reviewer-agent` could not start because its pinned `openai.gpt-5.4` model is unavailable on the ChatGPT-backed Codex account.
- The approved project fallback used an independent default subagent after loading `.codex/agents/aidlc-architecture-reviewer-agent.md`.
- Scope covered all six upstream artifacts and all seven unit Functional Design directories.

## Iteration 1 - Needs Changes

| Severity | Finding | Resolution |
|---|---|---|
| High | Durable `PRICING_PENDING` could be orphaned across timeout/crash. | Pricing busy is request-local; Booking remains durably validated/manual until atomic result application, with lease-bounded retry guidance. |
| High | `dataSchemaVersion` was modeled as semantic-version string. | Both event families use Avro/Java integer value `1`. |
| High | Manual completion could not fit success-only `PricingResult`. | Added sealed `PricingTerminalOutcome` with `Priced` and `Manual` variants and corrected the application method contract. |
| Major | DLT correction conflicted with unchanged replay. | Environmental repair replays unchanged; payload repair preserves envelope ID and audits original/corrected hashes and field differences. |
| Major | UUIDv5 namespaces/name encoding were not executable. | Added fixed namespace UUIDs and U+001F-delimited UTF-8 canonical names for both logical event identities. |
| Major | UI polling used ten seconds versus approved 30 seconds. | Aligned to one-second polling for at most 30 attempts. |
| Major | Flyway takeover from `spring.sql.init` was underspecified. | Defined service-local V1/V2 locations, disabled SQL init, baseline-on-migrate version 1, empty/non-empty behavior, and unknown-history failure. |
| Moderate | Messaging adapter names drifted from Application Design/source. | Aligned listener, mapper, and existing CMM publisher names exactly. |

## Iteration 2

The corrected artifacts were sent to an independent default-agent fallback using the same reviewer persona. The rereview could not return a verdict because the Codex account-wide subagent usage limit was reached. No iteration-2 findings were produced; independent READY remains unverified. Per the two-iteration limit, the stage proceeds to the human gate with this limitation disclosed.
