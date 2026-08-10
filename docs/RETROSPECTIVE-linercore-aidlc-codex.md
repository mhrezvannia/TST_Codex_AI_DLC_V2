# LinerCore ERP — Practice-Project Retrospective & Lessons Learned

*A self-contained account of what we built with AI-DLC v2 + Codex, what went wrong, what caused it, and how we fix it. Written to be read on its own (no code access needed) — suitable for NotebookLM, a slide deck, or a team PDF.*

**Audience:** the engineering teams and leads who will build the real company ERP.
**One-line takeaway:** The AI generated a clean-looking, well-layered skeleton that *labelled* itself with our domain — but it was not the real product, and the reason was **how we sliced the work and how we defined "done,"** not the AI's raw ability.

---

## 1. Executive summary

We used **AI-DLC v2** (an AI-driven development lifecycle methodology) driven by **Codex** to build a practice **liner-shipping ERP** — a small stand-in for the SAP-scale system we intend to build for real. The practice project exists to answer one question: *does this way of working produce useful, working software?* Only if it does do we proceed to the real project.

The honest verdict: **not yet.** The code compiles, tests pass, and the architecture *looks* professional — but underneath:

- The "event-driven" system **never sends a single real event**; the sole message publisher is a do-nothing placeholder.
- The core **business model is a hollow simplification** — a maritime booking reduced to "origin, destination, one equipment string."
- The **field names in the code don't match the contracts** — and in places the code disagrees with itself.
- **DCSA** (the shipping-industry data standard we want to align with) exists **only in the documents, never in the code**.
- The **user interface is a developer's "workbench,"** not a product: no login into the app, no navigation, no detail pages.
- Whole capabilities named in the vision (invoicing, capacity checks, tariffs) **simply aren't there.**

Crucially, **none of this is the AI being incompetent.** The generated code is well-structured. The failures trace to two process choices we made:

1. **We sliced work horizontally** — by module, then by architectural layer — so no single thread ever ran end-to-end.
2. **We defined "done" as "the layer's tests pass,"** not "a user can actually do this on the running system." In one place the written Definition of Done literally said the event port could be built *"without requiring live proof."* We told the machine the fake was acceptable, and it complied.

The rest of this document explains each of these in plain language, with the cause-and-effect made explicit, and ends with the corrected way of working, our questions answered properly, and the additional questions the team should be asking.

---

## 2. What the project is (context)

- **Domain:** a liner carrier's commercial and equipment platform — booking cargo space on ships, pricing it, and tracking the shipping containers across their journey. Think a focused slice of what companies like Maersk or MSC run internally.
- **Four parts (bounded contexts):**
  - **Shared Platform** — common reference data (customers, ports, currencies, equipment types, vessels/voyages), identity/login, and the event bus that connects everything.
  - **Charge & Customer Agreement** — pricing: tariffs, surcharges, agreements, and Demurrage & Detention (D&D) charges.
  - **Customer Booking** — capturing, pricing, validating, and confirming a booking; the commercial hub.
  - **Container Movement Management (CMM)** — tracking each container's journey and movements; customer track & trace.
- **Intended standard:** **DCSA** (Digital Container Shipping Association) — the industry's common data language for bookings, track & trace, container numbers (ISO 6346), and port codes (UN/LOCODE). We want to use it because the app may one day become commercial.
- **How it was built:** AI-DLC v2, a methodology that runs an intent through stages — *ideation → inception → construction → operation* — producing a defined set of documents at each stage, then generating code. It was run by Codex across four "intents" (units of work): shared-platform, shared-platform-live, charge-agreement, and one big "enterprise" run.

---

## 3. What was actually built (the honest inventory)

**What is genuinely good** (worth preserving):

- **Clean architecture.** Every backend service uses the same disciplined layering (domain core → application service with ports → data access → adapters). This is textbook and consistent.
- **Real domain lifecycles.** A booking moves through proper states (Draft → Validated → Priced → Confirmed → …) with well-modelled transitions.
- **Correct idempotency where present** — the system correctly ignores duplicate/stale messages in the places that implement it.
- **Thorough documentation coverage.** AI-DLC produced the full artifact set for every intent — nothing was skipped procedurally.
- **The backend builds and its tests pass.** This is not broken code in the compile-error sense.

**What is missing or fake** (the problem):

| Area | Reality |
|---|---|
| Event bus | One publisher exists; it's a **placeholder that returns fake "sent" metadata and touches no broker**. Three of four services write events to a table nothing ever reads. Nothing runs the sender on a schedule. |
| Booking model | A **flat origin→destination** with one equipment string. The real domain (and our own contract) needs ordered **routing legs**, **voyages**, and a list of **equipment with container numbers**. |
| Field names | Contract says `equipmentTypeCode`; code says `equipmentType` in one place and `equipmentTypeId` in another. Ports are `originLocationId` instead of the contract's `loadUnLocode`. |
| DCSA | Mentioned **76 times in the docs, ~1 time in the code.** Effectively absent. |
| Capabilities | Invoicing, capacity validation, tariffs, surcharges, reefer/DG handling, vessel/voyage data — **near-zero in code.** |
| UI | Each module is a **single "workbench" page.** No login into the business apps (a user id is hardcoded), no navigation between modules, **no detail page for any record.** Five disconnected mini-apps behind one gateway. |
| Verification | The full system was **never run end-to-end.** The one checklist item that would have exposed all of the above ("run the live stack") was the only one left unchecked. |

---

## 4. What went wrong, what caused it, and what it caused

Each problem below is written as **Symptom → Root cause → Consequence → Fix.**

### 4.1 The event-driven architecture is a facade

- **Symptom:** The system is documented everywhere as event-driven (Kafka, Schema Registry, async event contracts). In reality the only publisher is `PlaceholderKafkaReferenceEventPublisher`, which returns fabricated "delivered" metadata and sends nothing. Kafka and Schema Registry run as containers but no service connects to them.
- **Root cause:** A placeholder adapter was wired in as the *production* component, with no real implementation behind it and no configuration switch to a real one — **and the unit's Definition of Done explicitly permitted this** ("event port … without requiring live proof").
- **Consequence:** Every module that "publishes" is silently inert. The confirmed-booking hand-off from Booking to Container Movement was quietly replaced by a **synchronous direct HTTP call** — the opposite of the decoupled design — which means if one service is down, the other's operation fails and the systems drift out of sync with **no recovery path**.
- **Fix:** Implement a real publisher + Schema Registry, wire it behind an explicit profile, keep placeholders only for local no-broker mode, and **fail startup if a placeholder is active in a real environment.** Make "an event actually arrived on the broker" part of the Definition of Done.

### 4.2 The domain model is a hollow simplification ("vocabulary cosplay")

- **Symptom:** The `Booking` object is `customer + originLocation + destinationLocation + one equipmentType string`, with the container number stuffed into a generic key-value "attributes" bag. Our own booking contract specifies ordered `routing[]` legs (load/discharge ports + voyage per leg) and an `equipment[]` list.
- **Root cause:** The AI produced the *shape* of a generic CRUD entity and dressed it in maritime words. Because units were sliced as "build the domain layer," "build the API layer," etc., nothing ever forced the model to satisfy a real end-to-end journey.
- **Consequence:** The core object **cannot represent a real booking** (no transshipment, no voyage, no multiple containers). Every layer above it — the event payload, the UI form, the contract test — inherits the broken shape. This is the single most expensive defect because everything sits on top of it.
- **Fix:** Redesign the aggregate to the real (DCSA-aligned) shape *first*, as a vertical slice that proves it end-to-end. Ban hiding real fields in generic "attributes" bags.

### 4.3 The "contract verification" gate checks spelling, not behaviour

- **Symptom:** A required, merge-blocking quality gate called "contract verification" actually only checks that certain **text strings exist** in YAML/JSON files and that fields are *defined*. It never verifies that a service actually **produces a message matching the schema.**
- **Root cause:** An existence check was labelled as a behavioural check. The name promised more than the code did.
- **Consequence:** **False confidence.** A service could emit a completely wrong payload — or, as in 4.1, nothing at all — and the gate stays green. This is precisely why the field-name drift (4.4) was never caught.
- **Fix:** A gate may only claim to verify behaviour X if it **executes** behaviour X. Real contract tests (Pact) that replay against a running provider; real schema-compatibility checks against the registry.

### 4.4 Field names drift from the contracts — and the code disagrees with itself

- **Symptom:** The published contract is the shared language, but the code renamed fields (`loadUnLocode` → `originLocationId`, `equipmentTypeCode` → `equipmentType`) and in one spot the event emitter uses `equipmentTypeId` while the schema says `equipmentTypeCode`.
- **Root cause:** No executable check binds code to the contract (see 4.3), so drift is invisible.
- **Consequence:** In a contract-first system, **names are the interface.** Divergent names mean a real schema/contract gate would reject the messages — the only reason it doesn't is that the gate is fake. Integration between teams built on these names would silently break.
- **Fix:** Adopt the canonical/DCSA names as typed value objects in the domain, used identically on the wire. One executable test per contract that fails the moment code and contract disagree.

### 4.5 DCSA exists only on paper

- **Symptom:** The documents reference DCSA extensively (move codes, event classifiers, UN/LOCODE, ISO 6346). The code contains essentially none of it.
- **Root cause:** The standard was treated as documentation, not as the internal data model.
- **Consequence:** If the app ever goes commercial, retrofitting an industry standard into a domain built on ad-hoc names is **far more expensive** than building on it from the start.
- **Fix:** Make DCSA the *internal* language now — UN/LOCODE, ISO 6346, and DCSA event vocabulary as typed value objects in the domain, starting with the two event schemas.

### 4.6 The UI is a workbench, not a product

- **Symptom:** Five separate single-page "workbenches." No login into the business apps (a user id is hardcoded in two of them). No shared navigation. **No detail page for any entity.** Styling is ad-hoc inline colours (≈138 hardcoded colour values); the shared UI library is a single file.
- **Root cause:** UI was treated as an afterthought layer ("build the UI workbench") rather than as part of each vertical slice, and there was no design system or app-shell foundation.
- **Consequence:** The intended user experience — *log in once, move around the app, open a record, act on it* — is **architecturally impossible** as built. It demonstrates endpoints; it does not let anyone do their job.
- **Fix:** One authenticated app shell with real login and navigation; per entity a **list page and a detail page**; a real design system (tokens + components); every screen has proper loading/empty/error states.

### 4.7 The root cause behind all of the above: horizontal slicing + layer-local "done"

This is the lesson that matters most, because it *generates* all the others.

- **We sliced intents by module** (shared-platform, charge-agreement, enterprise) — horizontal.
- **We sliced the units inside an intent by architectural layer** (domain, then application service, then persistence, then API, then UI, then integration) — also horizontal.
- **Every unit's Definition of Done was layer-local** ("domain tests pass," "API tests pass"), and at least one explicitly excluded live proof.

**Double-horizontal slicing means the vertical thread that forces integration to be real is never pulled.** You get the *shape* of everything and the *substance* of nothing. And when "done" is defined per layer with the tests run against placeholders, green status certifies the scaffold, not the system.

> **The core insight:** the AI optimised for "passes the gate," and our gates rewarded structure over behaviour. Fix the gates and the slicing, and the same AI produces working software.

---

## 5. The solution — how we now work (best practices)

Seven changes, each a direct antidote to a root cause above:

1. **Slice vertically, not horizontally.** An intent is a thin, end-to-end *journey* (e.g. "confirm one booking and see its container journey open"), cutting through UI → API → domain → database → cross-service event. Units inside it are thin vertical increments, never architectural layers.
2. **Define "done" as observed behaviour on the live system.** "Tests pass" is never sufficient on its own. The Definition of Done names the action you drove on the running stack and the result you verified.
3. **No placeholders in production paths.** Ban do-nothing adapters outside explicit local mode; fail startup if one is active elsewhere. A capability with only a placeholder behind it is not done.
4. **Gates must execute what they claim to verify.** Separate "the file exists" (a linter) from "the service behaves" (a test). Never conflate the names.
5. **Contracts and standards are the internal language.** Canonical/DCSA field names as typed value objects, used identically in domain and on the wire, bound to code by one executable test each.
6. **UI is part of every vertical slice, on a real design system.** Shell + login + list + detail + states — never a deferred "UI layer."
7. **Every intent exits through automated audits on a live run.** Two custom audit tools were built from these findings — one checks runtime integrity (are events real, is the outbox drained), one checks *fidelity* (does the code match its own spec, DCSA, field names, product-grade UI). An intent is not "done" until both pass against a live run.

**The two-layer mental model that ties it together:**

- **Domain Knowledge Base** — durable understanding of the business, organised *by module/bounded context*. This is what per-module teams own and maintain; it persists across all work. (Ubiquitous language, context map, DCSA dictionary, business rules.)
- **Delivery Intents** — units of *shipping*, organised *by vertical journey*, cutting across modules. Each consumes the knowledge base and closes when its journey works.

Modules are units of **ownership and knowledge**; journeys are units of **delivery**. Confusing the two is what produced module-shaped, layer-built, never-integrated software.

---

## 6. The corrected plan — the vertical intent backlog we produced

We turned the corrected way of working into a concrete, executable plan: **one program-level backlog of vertical intents** (not one backlog per module). Each intent is a thin end-to-end journey with a single accountable Driver team, a written statement, and a live-observed Definition of Done. It runs in **waves** — intents in the same wave that share no dependency run in parallel across teams.

*(In the repository this lives at `docs/intents/00-INTENT-BACKLOG.md`, with a full statement per intent.)*

| Wave | Intent | Driver team | What it delivers |
|---|---|---|---|
| 0 | Platform eventing foundation | Shared Platform | A real event actually reaches the broker (fixes the facade); shared outbox relay + scheduler |
| 0 | Reference-data completeness | Shared Platform | Every canonical entity — incl. the missing **vessels/voyages** — seeded and servable |
| 0 | Design-system foundation | UI | Real UI component library + design tokens (ends ad-hoc inline styling) |
| 1 | **Booking quote-to-cash (the spine)** | Booking | Create → validate → price → confirm → **real event** → journey opens → status back → **detail page**. The reference pattern. |
| 1 | App shell & auth | Platform + UI | One login, one shell, real session across modules (ends hardcoded users) |
| 2 | Charge tariffs & agreements | Charge | Real pricing math (tariffs, surcharges, agreements) |
| 2 | Container journey & track-trace | Container Movement | DCSA-coded movements, journey detail page |
| 3 | D&D rules & rates | Charge | The demurrage/detention ruleset |
| 3 | D&D pricing & invoice | Booking | Closes the "cash" end — charge triggered by movements → invoice |
| 3 | Booking amendments | Booking | Revision / re-confirmation semantics |
| 4 | Module list-detail uplift | UI | Remaining modules to product-grade list+detail UI |
| 4 | Operations & observability | Platform | Tracing, dashboards, alerts, runbooks over the live stack |

*(Later, Phase 2 adds EDI booking intake, a public DCSA track-and-trace API, and booking cancellation; Phase 3 adds multi-entity operation and a Bill-of-Lading module.)*

**The spine (Wave 1, Booking quote-to-cash) is built first and for real**, because everything else inherits its patterns — the DCSA-correct domain model, the real event flow, and the list/detail UI. Every intent, in every wave, exits through both audits on a live run before it merges.

---

## 7. The questions we asked — rephrased properly, and answered

*(These are the real questions raised during the review, cleaned up so they stand on their own, with the settled answers.)*

**Q1. Was the AI's output "good enough," and if not, why not?**
No. The code is well-structured but it is a generic skeleton wearing the domain's vocabulary, with a fake event bus, a hollow domain model, and a workbench UI. The cause is process (horizontal slicing + layer-local "done"), not AI capability.

**Q2. Should we abandon phased delivery and just build the whole business at once?**
No — and our own project proves it. The single "enterprise" big-bang run is exactly what produced the broadest, shallowest, most degenerate result. "Phasing" does not mean "one giant run"; it means a *sequence of thin vertical slices*.

**Q3. When we add a new feature or module later, do we re-run the whole AI-DLC workflow from scratch?**
Never from scratch. You create a **new intent** with the appropriate scope, and it inherits the persistent knowledge base (the accumulated domain understanding and code). New feature → a `feature`-scoped intent; new module → a `feature`/`enterprise` intent constrained by the existing context map. Re-running from zero would throw away everything learned.

**Q4. How do we slice work into intents, and is there a best-practice template?**
Slice by vertical journey using an INVEST-style checklist: **V**ertical (cuts all layers), **E**nd-to-end demonstrable, **R**eal seams (real events/calls), **T**hin (smallest valuable slice), **I**ndependent-ish, **C**ontract-true (canonical names), **A**uditable done (exits through the audits). If a candidate isn't vertical or end-to-end, it's a task inside an intent, not an intent.

**Q5. How do we tell the AI (Claude, Codex, Kiro, …) which documents to use?**
Three layers: (a) a repo-level pointer file (e.g. `AGENTS.md`) that names the backlog and playbook; (b) each intent statement carries its own **Context Pack** — the exact ordered reading list for that intent; (c) the methodology auto-loads the knowledge base and applies binding templates. The structure *is* the instruction; no prompt tricks needed.

**Q6. How do we sequence work, and how do parallel teams / "swarms" work?**
Two levels of parallelism. *Inside an intent:* independent units run in parallel automatically (the methodology compiles the unit dependency graph into a parallel fan-out). *Across intents:* separate teams run separate sessions on separate branches for intents that share no dependency and touch different code — merged in dependency order, each behind the audits. Work in **waves**: everything with no unmet dependency in a wave runs at once.

**Q7. What if intent A (module X) depends on intent B (module Y)?**
Under a single *program-level* backlog of vertical intents, most such dependencies dissolve into explicit edges sequenced before work starts. For the rest: a dependency may only target a **closed** intent. If it can't, you either **resequence**, **split out a small precursor intent** that closes first, or use a **contract-first bridge** (freeze the contract now with both teams' sign-off; the consumer builds against it with a stub; integrate live when the provider lands). Never build against an unfrozen contract.

**Q8. If one intent spans all three modules, who owns it and how do we avoid conflicts?**
Every intent has exactly **one Driver team** (accountable end-to-end, owns the branch and the merge). Other modules are **Contributors**, and the interface between them is *always the contract*, never shared code editing. Code ownership is enforced by CODEOWNERS per module; the contracts folder is an append-only shared kernel changed only with dual sign-off. One Driver, several Contributors, zero shared-file editing.

**Q9. After all the intents run, will we have a usable app, and how do we run it?**
Yes — a *deliberately thin but genuinely working* MVP: log in, create/price/confirm a DCSA-correct booking, watch a real event open a container journey, see movements and D&D charges flow back, on a real UI. It is **not** a full SAP competitor (one trade lane, no EDI, no Bill of Lading — those are later phases). You run it via **Docker Compose** (the full stack of database, broker, services, and UIs as containers); a host-run mode exists for developer convenience. Making Compose actually run end-to-end is part of the first intents' Definition of Done.

**Q10. Should Claude do the work, or Codex — and what's the difference?**
The methodology's engine is **Codex-native** (the automation, stage graph, and sensors are wired for it), which makes Codex the natural fit for the **parallel multi-team swarm**. Claude (as a single deep session) is best for the **correctness-critical foundational work** and as the **standing reviewer/gate**. But note: it was the Codex-on-autopilot pipeline that drifted, so "use the native engine" is not automatically safer — the guardrails (vertical slicing, executable gates, the audits) are what guarantee quality, regardless of who runs it. Recommended: a hybrid — the foundational/remediation intents built and verified deeply, then breadth handed to the parallel engine, with every intent exiting through the audits.

**Q11. Do we need the most powerful model (e.g. Fable), or is Opus 4.8 enough?**
Opus 4.8 is sufficient for this work — it is standard, well-trodden backend/UI engineering. The bottleneck was discipline, not model intelligence. Reserve the top-tier model for the genuinely hard reasoning (distributed-systems correctness in the event layer, the core aggregate redesign) if you want extra assurance; the audits on a live run are the real safety net either way.

---

## 8. Additional questions the team should be asking (anticipated)

These weren't asked yet but will matter — decide them deliberately rather than by default:

1. **Contract governance:** Who signs off a contract change? Where do versioned schemas live, and how is backward compatibility enforced in CI? *(Recommendation: contracts are an append-only shared kernel; producer + consumer both sign; a schema-compatibility check gates every change.)*
2. **Branching & merge strategy:** One branch per intent, short-lived, frequent rebase on main; merge only behind green quality gates + both audits. Who arbitrates merge order? *(Recommendation: the program backlog's dependency order is the merge order.)*
3. **Definition-of-Done enforcement:** Is "live run + both audits green" a *hard* CI gate or a human checklist? *(Recommendation: hard gate; a human-only checklist is how the first build shipped facades.)*
4. **Testing strategy across the pyramid:** Unit vs. integration vs. contract vs. end-to-end — which are required to merge, which run nightly? How do we test the async event paths specifically?
5. **Keeping the knowledge base current:** Who updates the domain dictionaries and context map when a decision changes, so intent N+1 doesn't build on stale knowledge? *(Recommendation: the owning module team; it's part of an intent's exit.)*
6. **Environment & data:** How do we seed reference data consistently? Is there a shared local environment or one per developer? What's the story for test data across the event boundaries?
7. **Security & identity:** The real login/authorization model (OIDC roles, service-to-service auth) — is it an early foundational intent so nothing hardcodes a user again? *(Recommendation: yes.)*
8. **Observability from day one:** Correlation IDs and tracing across every hop — foundational, not an afterthought, so we can actually *see* the async flows work.
9. **The migration question:** When the practice project graduates, do we carry this code forward or start the real project fresh with these lessons? What, concretely, transfers? *(Recommendation: the *knowledge base, contracts, templates, and audits* transfer; the code is re-derived on the corrected process.)*
10. **What happens when an audit fails mid-programme?** Is it a blocking stop-the-line event or a tracked debt item? *(Recommendation: blocking for the intent that owns it; that discipline is the whole point.)*
11. **Team scaling:** How many parallel intents can we safely run given contract-coupling and reviewer bandwidth? *(Recommendation: match parallel intents to non-overlapping code hotspots; the foundational/contract intents land first precisely to unblock parallel work.)*
12. **Cost & model routing:** Which work runs on which model tier, and who decides when to escalate? *(Recommendation: bulk on Opus 4.8, escalate the correctness-critical crux pieces.)*

---

## 9. Definition of "useful and working" (our go/no-go for the real project)

The practice project has proven itself — and we may start the real ERP — **only when all of the following are true, observed on the live stack, not merely tested:**

1. A user logs in and navigates the app (no hardcoded users, real shell).
2. They create a DCSA-correct booking (real routing legs, real equipment, canonical field names).
3. Confirming it emits a **real event on the real broker**, schema-validated.
4. Container Movement **consumes that event** and opens a journey; movements flow back and render on the booking's **detail page**.
5. Demurrage & Detention pricing and an invoice complete the commercial loop.
6. Both audits (runtime-integrity and fidelity) pass against that live run.

If we cannot demonstrate that end-to-end, the practice has not yet succeeded — and that is exactly the check the first build skipped.

---

## Appendix A — Glossary

- **AI-DLC v2:** the AI-driven development lifecycle methodology used here; runs an *intent* through stages (ideation → inception → construction → operation), producing defined documents and then code.
- **Intent:** a unit of delivery. In the corrected model, a thin vertical journey.
- **Scope:** how much of the stage graph an intent runs (e.g. `mvp` skips operations; `feature` runs everything at practical depth; `enterprise` at full depth).
- **Bounded context / module:** a business area that owns its data and exposes it only via contracts (Booking, Charge, Container Movement, Shared Platform).
- **Vertical slice:** a thin capability cutting through every layer (UI → API → domain → database → cross-service), delivering one demonstrable outcome.
- **Outbox / event bus:** the mechanism for reliably publishing events; here it was written to but never drained.
- **DCSA:** the container-shipping industry's data standards (booking, track & trace, container/port identifiers).
- **Definition of Done (DoD):** the corrected version is "a named behaviour observed on the running system," not "tests pass."

## Appendix B — The two audit tools built from these findings

- **Runtime-integrity audit** — detects placeholder-as-production adapters, write-only outboxes, missing schedulers, and gates that check existence instead of behaviour. Run as an intent's exit gate.
- **Fidelity audit** — detects a domain model that doesn't match its contract, field-name drift, standards-on-paper (DCSA absent from code), and workbench-instead-of-product UI. Run as an intent's exit gate.

Both are quick, evidence-producing checks intended to run against a **live** system before any intent is called done. They exist because the first build's green status was not trustworthy — and distrust of self-reported green is the habit that prevents recurrence.
