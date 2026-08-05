# NFR Requirements Questions - U06 Isolated Acceptance and Preservation

## Context

U06 already fixes the isolated wrapper/project/port, pre/post manager guard,
closed preservation/security/browser matrices, fresh pricing p99 evidence,
restart/restore proof, audits, and technical-pass semantics. Only the local
readiness timeout remains unquantified. This is a harness bound, not a production
availability SLO.

## Question

### Q1. What bounded local readiness window should the acceptance runner enforce?

- A. Require each started/restarted service to become ready and complete its authenticated probe within 120 seconds, and the full isolated stack to reach all required readiness probes within 10 minutes; an exhausted healthy-environment wait is FAIL, while an unavailable Docker/required external capability is BLOCKED **(Recommended)**
- B. Record readiness duration but set no numeric timeout beyond individual command defaults
- C. Require 60 seconds per service and 5 minutes for the complete stack
- X. Other (please specify)

[Answer]: A. Require each started/restarted service to become ready and complete its authenticated probe within 120 seconds, and the full isolated stack to reach all required readiness probes within 10 minutes; an exhausted healthy-environment wait is FAIL, while an unavailable Docker/required external capability is BLOCKED (Recommended)

**Mode:** guided
