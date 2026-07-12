# LinerCore ERP — Workflow Map (Target A→Z vs. Current Reality)

> Built from `program-vision-document.md` §3–§5, the three `enterprise-contracts/*.md`, and a code-level verification pass (2026-07-11).
> Legend for status badges used below: ✅ implemented · 🟡 partial/degenerate · ❌ missing.
>
> **How to read this file:** Diagram 1 is the *target* business flow the docs promise. Diagram 2 is the *target* user/navigation experience you described (login → app → modules → detail). Diagrams 3–4 show what the code *actually* does today. The contrast is the gap.

---

## 1. Target business workflow — "Quote to Cash, carrier side" (Journey 1, Vision §3)

```mermaid
flowchart TD
    subgraph SP["Shared Platform (reference + identity + event bus)"]
        REF["Reference Data<br/>Customer · Port/UNLOCODE · Region · Vessel/Voyage · Currency · Charge-code · Equipment-type · Commodity · Trade-lane"]
        IAM["Identity & Access (OIDC/SSO)"]
    end

    A["A. Pricing defines Customer Agreement + Tariffs/Surcharges/D&D rules"]:::chg
    B["B. Customer submits booking request<br/>(FCL, equipment, commodity, reefer/DG, dates, quantities)"]:::book
    C["C. Booking validates capacity<br/>against Vessel/Voyage allocation"]:::book
    D["D. Booking → Charge: pricing.request (SYNC)"]:::book
    E["E. Charge prices vs agreement → pricing.result (SYNC)"]:::chg
    F["F. Booking confirms<br/>(vessel, voyage, ETD/ETA, cutoffs) + assigns equipment"]:::book
    G["G. booking.confirmed (ASYNC event) → CMM<br/>full routing[] + equipment[]"]:::book
    H["H. CMM opens container journey, derives expected moves (POL→PTS→POD)"]:::cmm
    I["I. Terminals/depots feed moves via EDI (CODECO/COARRI) → ACL"]:::ext
    J["J. containermovement.status (ASYNC event) → Booking<br/>all validated moves, DCSA-coded, actual dates"]:::cmm
    K["K. Booking recognises a D&D-bounding move<br/>(owns the D&D trigger)"]:::book
    L["L. Booking → Charge: pricing.dnd-request (SYNC)"]:::book
    M["M. Charge applies D&D ruleset → pricing.dnd-result (SYNC)"]:::chg
    N["N. Booking emits invoice.booking + invoice.dnd → External Finance (ACL)"]:::book
    O["O. CMM publishes DCSA track & trace → Customers (OHS)"]:::cmm

    IAM -.authn.-> B
    REF -.reference.-> B & C & E & H
    A --> B --> C --> D --> E --> F --> G --> H
    I --> H --> J --> K --> L --> M --> N
    H --> O

    classDef chg fill:#ECEAFB,stroke:#5B50C4,color:#2C2566;
    classDef book fill:#E2F4EC,stroke:#157A5F,color:#0C3A2E;
    classDef cmm fill:#FBEDE6,stroke:#A8492A,color:#50200F;
    classDef ext fill:#ECEAE3,stroke:#8A897F,color:#2C2C2A;
```

**Implementation status of each step:**

| Step | Capability | Status | Note |
|---|---|---|---|
| A | Agreement + tariffs/surcharges/D&D rules | 🟡 | Agreement lifecycle exists; **Tariff/Surcharge = 0 in code**, D&D rules minimal |
| B | Booking request (commodity, reefer/DG, quantities) | 🟡 | Only customer + flat origin/dest + single equipment string; **no commodity, reefer/DG, quantities** |
| C | Capacity validation vs Vessel/Voyage | ❌ | `validate()` only checks reference *activeness*; **no capacity, no Vessel/Voyage** |
| D–E | Sync pricing request/result | ✅ | Real sync HTTP path exists |
| F | Confirm with vessel/voyage/ETD/ETA/cutoffs + equipment | 🟡 | Confirms status only; **no voyage/ETD/ETA/cutoffs, no equipment assignment model** |
| G | `booking.confirmed` **async event** | ❌ | Delivered as **synchronous HTTP POST**; payload is flat, **no `routing[]`/`equipment[]`** (see gap analysis) |
| H | CMM journey + derive POL/PTS/POD moves | 🟡 | Journey intake exists; **no multi-leg routing derivation** |
| I | EDI ingestion (ACL) | ❌ | Not built (Phase-2 per docs — acceptable) |
| J | `containermovement.status` async, DCSA-coded | 🟡 | Callback exists as HTTP; **no DCSA move codes** |
| K–M | D&D trigger + sync D&D pricing | 🟡 | D&D scaffolding present; ruleset shallow |
| N | Invoice emission to Finance | ❌ | **`invoice` ≈ 0 in code** |
| O | DCSA track & trace OHS | ❌ | **DCSA = 0 in code** (55 doc mentions) |

---

## 2. Target user experience — the tour you described (login → app → modules → detail)

This is the navigation model that *should* exist. **None of the shell, routing, or detail layers exist today** (see Diagram 4).

```mermaid
flowchart LR
    L["🔐 Login page<br/>(OIDC/SSO)"] --> S{{"Authenticated App Shell<br/>top bar + left nav + user menu"}}
    S --> N1["Reference Data"]
    S --> N2["Charge & Agreements"]
    S --> N3["Booking"]
    S --> N4["Container Movement"]
    S --> N5["Admin / Identity"]

    N3 --> LST["Booking LIST page<br/>filter · search · status · paginate"]
    LST --> DET["Booking DETAIL page (master-detail)"]
    DET --> D1["Summary + lifecycle timeline"]
    DET --> D2["Routing legs (POL→PTS→POD)"]
    DET --> D3["Equipment assignment"]
    DET --> D4["Pricing / charges breakdown"]
    DET --> D5["Linked container journey →"]
    DET --> D6["Action panel: validate · price · confirm · amend"]
    D5 -.cross-link.-> N4

    classDef ok fill:#E2F4EC,stroke:#157A5F;
    classDef miss fill:#FBE9E7,stroke:#C62828,color:#7f1d1d;
    class L,S,LST,DET,D1,D2,D3,D4,D5,D6 miss;
```

> Everything in red is **not implemented**. The auth app exists as a *separate* island (Diagram 3) but is not the gateway to the business apps.

---

## 3. Current architecture reality — five disconnected islands

```mermaid
flowchart TB
    subgraph Browser
        AUTH["apps/auth<br/>sign-in, session (SEPARATE app)"]:::isl
        RD["apps/reference-data<br/>1 workbench page"]:::isl
        CA["apps/charge-agreements<br/>1 workbench page"]:::isl
        BK["apps/booking<br/>1 workbench page<br/>actorSubjectId = 'local-user' hardcoded"]:::isl
        CM["apps/container-movement<br/>1 workbench page"]:::isl
    end
    NGINX["Nginx gateway (compose)"] --> AUTH & RD & CA & BK & CM
    AUTH -. "no session handoff to business apps" .-x BK

    classDef isl fill:#FFF4E5,stroke:#B26A00,color:#5c3d00;
```

**Problems visible here:** no shared shell, no cross-module navigation, auth is not wired into any business app (each hardcodes a local user), each app is a single page with no list/detail routing.

---

## 4. Current booking "workflow" as actually coded

```mermaid
flowchart LR
    F["Create form<br/>(customer, origin, dest, equipment, container)"] --> API["POST /api/bookings"]
    API --> SVC["booking-service"]
    SVC --> V["Validate (reference activeness only)"]
    V --> P["Price (sync HTTP → charge)"]
    P --> C["Confirm"]
    C --> OBX[("outbox row<br/>❌ never dispatched")]
    C --> HTTP["SYNC HTTP POST → container-movement<br/>❌ flat payload, no routing/equipment arrays"]
    C --> UI["inline 'Status view' panel<br/>❌ not a real detail page"]

    classDef bad fill:#FBE9E7,stroke:#C62828,color:#7f1d1d;
    class OBX,HTTP,UI bad;
```

---

## Cross-references

- Backend integrity findings (event facade, dual-write, dead outbox, contract-theater): [`codex-review-findings.md`](codex-review-findings.md)
- Business-logic, field-naming, DCSA, and UI/UX gaps with fixes: [`erp-business-ui-gap-analysis.md`](erp-business-ui-gap-analysis.md)
