# Security Design - U04 Confirm to CMM Journey

## Local Messaging Boundary

Profile guard permits PLAINTEXT/no ACL only with `local`, expected Compose broker/registry hosts, real adapters, and isolated network. Any non-local/noop/unknown registry fails startup. Producer/consumer validates topic/key/source/type/int version/fingerprint and strict nested fields; payload mapper has 256 KiB and array/vocabulary limits.

Replay endpoint/script is separate from product APIs and validates `LOCAL_REPLAY_TOKEN` in constant time for `messaging:replay`, actor/reason/coordinates/hashes. Headers/tokens/raw payload/PII are redacted; schema reset tool allow-lists disposable-local URL/subjects/fingerprints.

## Source Coverage

Design implements `security-requirements.md` with `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U04 `business-logic-model.md`.
