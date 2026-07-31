# Environment Inventory — W2-02 Design-System Closure

## Inputs and scope

This inventory implements `booking-design-system-closure/infrastructure-design/deployment-architecture.md`, `booking-design-system-closure/infrastructure-design/infrastructure-services.md`, and `operation/deployment-pipeline/cd-config.md`.

The only provisioned environment class is the local Docker Desktop runtime. The persistent manager demo is protected and guard-only. Wave A is an ephemeral deployment target and is intentionally absent until an owned acceptance attempt starts it.

## Runtime inventory

| Item | Observed value | Status |
|---|---|---|
| Docker client/server | 29.6.2 / 29.6.2 | AVAILABLE |
| Engine platform | Linux amd64 | AVAILABLE |
| Docker Compose | v5.3.1 | AVAILABLE |
| Protected manager project | `linercore-shared-platform` | HEALTHY / NON-TARGET |
| Manager guard | 21 containers, 21 services; routes 200/308/301/301 | PASS |
| Acceptance project | `linercore-wave-a` | ABSENT / CLEAN |
| Acceptance config | Base Compose plus W2-02 overlay, wrapper validated | PASS |
| Acceptance edge | `http://127.0.0.1:18088` | RESERVED FOR OWNED RUN |
| Manager edge | `http://127.0.0.1:8088` | PROTECTED |

## Required image inventory

The following local images were observed by immutable image ID:

| Image | Image ID |
|---|---|
| `postgres:15` | `sha256:74e110c41804365e3915fcc09d5e7a1eff50161aaa94d5da0e58e0cd75ae509c` |
| `quay.io/keycloak/keycloak:24.0` | `sha256:f8ade94c1d0ad2f2fa7734a455fee5392764f402c43ca35e9af6bf63a2541dc9` |
| `confluentinc/cp-kafka:7.7.1` | `sha256:653f49c51cfebcf8301938d01044efead6afbd8dd60acd2bcf1605d7c6494d3b` |
| `confluentinc/cp-schema-registry:7.7.1` | `sha256:b0f1473e9b724ada5338390346438229206f3568ccee94d78bdff1f37e3c8c52` |
| `nginx:1.27` | `sha256:6784fb0834aa7dbbe12e3d7471e69c290df3e6ba810dc38b34ae33d3c1c05f7d` |
| `docker.elastic.co/elasticsearch/elasticsearch:8.16.1` | `sha256:39cbbfcca086e8741d2dab3ab310a85510c8a7730fd2d0914ef4caa4364cef94` |
| `docker.elastic.co/kibana/kibana:8.16.1` | `sha256:7053b4c1bf56f22a0d3623c5eed9d78c2aa3ebad4dca6eded4e1f2691de69a25` |
| `linercore/apps-shell:wave-a` | `sha256:2985eed1655779beaecc90a1d032de38196d175e39948bbc1fdee5b582dfa4f3` |
| `linercore/apps-booking:wave-a` | `sha256:ee4f74c543ddd7f62c444de0ddb5eb8c0b5fd2ef61d834546a99dcf55797d8e1` |
| `linercore/w2-02-node-deps:a37a1fefcfe8` | `sha256:0fd641d31abc9c44eefcc8113fb16ee9d2a3344bd49a3c5d7abdb45b14bcf31e` |
| `linercore/w2-02-audit-tools:1` | `sha256:cd4f747d1106c020c9a722af0b1fca134f805a87933d65dcc0ea23bace52eca3` |

Additional local service/app images required by the Compose topology remain present through the healthy manager and the previously completed formal Wave A run.

## Service and data boundaries

Existing nginx, Shell, Booking BFF, Keycloak/auth/identity, Booking, Reference Data, Charge Agreement, Container Movement, PostgreSQL, Kafka, and Schema Registry responsibilities remain unchanged. Each service retains its owned database and existing messaging contracts.

Wave A creates attempt-owned networks and volumes only while deployed. No AWS service, managed database, cache, object store, external DNS, CDN, service mesh, or evidence database is provisioned.

## Secrets and compliance inventory

No cloud credentials, real user credentials, production secrets, or personal customer data are provisioned. Local/test identities are synthetic and short-lived. Storage state, proxy tokens, and raw traces remain ignored/transient; only sanitized evidence is durable.

No regulatory certification, residency guarantee, encryption posture, backup policy, or production audit-control claim is made for this local environment.
