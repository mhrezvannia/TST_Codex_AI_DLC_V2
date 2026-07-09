# Scalability Design - U04

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Start with normalized tables and query indexes. Avoid duplicating reference records to reduce data growth and sync risk.

## Growth

Future partitioning is not needed until agreement volume exceeds local MVP assumptions.
