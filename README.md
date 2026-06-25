# core2code

> AI-Assisted Product Development — end-to-end project repository.

See [`CONTEXT.md`](CONTEXT.md) for the current project state, architecture, and decisions log.

---

# AI-Assisted Product Development SOP

**Owner:** Founder / CTO (single point of continuity — reviews everything)
**Purpose:** A repeatable procedure to ship websites, apps, and SaaS products using a multi-tool AI workflow without losing code quality, security, or maintainability.
**How to use:** Read sections 1–3 once. Run sections 4–6 on every project. Copy section 7 (the Run Sheet) for each new product.

---

## 1. The Stack & Roles

| Phase | Tool | Does | Does NOT do |
|---|---|---|---|
| Research | Perplexity | Market/competitor research, framework comparisons, citations | Build anything |
| Architecture + Review | Claude | System design, data models, API contracts, code review, refactor, security/perf audit | Write the bulk of the implementation |
| Implementation + Long-context | Gemini | Custom logic, backend/frontend code, tests, bug-fixing, reasoning across the whole repo | Make architecture decisions for you |
| UI / MVP | Lovable | Rapid deployable UI, landing pages, prototype front-ends | Architecture, review, complex logic, tests |
| Everything | You | Decide, review, approve, merge, ship | — |

**Rule:** These are *defaults for who leads each phase*, not walls. If Gemini suggests a better architecture or Claude writes a helper to illustrate a fix, take it. You override when it makes sense.

---

## 2. Operating Principles (non-negotiable)

- Production-first; AI-assisted, not AI-dependent.
- Documentation before coding. Architecture decided before implementation.
- TypeScript preferred. Clean architecture, SOLID, feature-based folders.
- GitHub-first. Meaningful commits. Review every significant PR.
- Tests required on critical paths (auth, payments, data writes) — not "where appropriate."
- Never paste secrets/API keys into any AI tool. Never commit them.
- Treat all AI-generated code as untrusted until it runs and its imports/APIs are verified real.
- Ship one small real thing end-to-end before scaling the pipeline.

---

## 3. The Project Context Doc (the glue)

The tools don't share memory. To stop losing context at every handoff, maintain **one living markdown file per project** (`CONTEXT.md` in the repo). Paste the relevant section into each tool at the start of a session.

It contains:
- **Product:** one-paragraph description + target user.
- **Stack:** languages, frameworks, key libraries, hosting.
- **Architecture:** data models, API contracts, folder structure (output of Phase 1).
- **Standards:** link/paste of section 2 above.
- **Current state:** what's built, what's in progress, known issues.
- **Decisions log:** dated one-liners of why key choices were made.

Update it at the end of every work session. This file *is* your continuity.

---

## 4. The Pipeline (per feature or per product)

Each phase has: **Input → Action → Output → Gate.** Don't pass the gate until the output exists.

### Phase 0 — Define & Research  *(You + Perplexity)*
- **Input:** the problem / product idea.
- **Action:** Write a one-paragraph spec. Use Perplexity for market check, competitor features, and framework/library options with sources.
- **Output:** spec + chosen tech direction added to `CONTEXT.md`.
- **Gate:** you can state in one sentence what you're building and for whom.

### Phase 1 — Architecture  *(Claude)*
- **Input:** spec + tech direction from `CONTEXT.md`.
- **Action:** Ask Claude for data models, API contracts, folder structure, and the 2–3 key tradeoff decisions. Push back on anything you don't understand.
- **Output:** architecture section written into `CONTEXT.md`.
- **Gate:** the data model and API surface are written down and you agree with them.

### Phase 2 — UI / MVP scaffold  *(Lovable)*  — *for products with a real front-end*
- **Input:** product description + the screens you need.
- **Action:** Generate UI/landing/MVP in Lovable. Keep it to layout + presentation; don't bury complex logic here.
- **Output:** working front-end prototype, exported to the repo.
- **Gate:** the UI exists and is in version control.

### Phase 3 — Implementation  *(Gemini)*
- **Input:** architecture from `CONTEXT.md` + the UI/repo.
- **Action:** Build the real logic — backend, APIs, data layer, integrations, and tests. Use Gemini's large context to work across files. Verify every library/API it uses actually exists.
- **Output:** feature code + tests, committed to a feature branch.
- **Gate:** code runs locally; tests on critical paths pass.

### Phase 4 — Review  *(Claude)*
- **Input:** the diff **plus surrounding code** + the standards from `CONTEXT.md`.
- **Action:** Claude reviews for logic, security, performance, maintainability, and consistency with the architecture. Each comment should be actionable. You triage severity.
- **Output:** review comments addressed; PR updated.
- **Gate:** no unresolved high-severity issues; code matches the agreed architecture.

### Phase 5 — Ship  *(You)*
- **Input:** reviewed, green PR.
- **Action:** Merge to GitHub. Deploy. Update `CONTEXT.md` current-state + decisions log.
- **Gate:** it's live and the context doc reflects reality.

**Variation by product type:**
- *Marketing site / landing page:* Phase 0 → 2 → 5 (skip heavy architecture/logic).
- *SaaS app:* full 0 → 5.
- *Working on existing codebase:* start with Gemini (long-context repo read) → Claude (architecture impact) → implement → review.

---

## 5. Quality Gates (Definition of Done)

A change is **done** only when all are true:
- [ ] Runs locally without errors.
- [ ] CI passes: lint + typecheck + tests automatically on the PR.
- [ ] Critical-path logic has tests.
- [ ] Reviewed by Claude; high-severity issues resolved.
- [ ] No secrets in code; `.env` gitignored.
- [ ] All AI-suggested libraries/APIs confirmed real.
- [ ] `CONTEXT.md` updated.

Set up CI once (GitHub Actions: lint + typecheck + test) so the mechanical checks are automatic and your review time goes to judgment, not formatting.

---

## 6. Standing Practices

**Security & secrets**
- Secrets live in `.env` (gitignored) or a secrets manager — never in code or chat tools.
- One set of SSH/API keys to manage; rotate if ever exposed.

**Anti-hallucination**
- Generated code is untrusted until it runs.
- Confirm imports, methods, and API signatures exist before they reach a PR.

**Cadence**
- *Per session:* update `CONTEXT.md` before you stop.
- *Per feature:* run the full pipeline (Phase 0–5).
- *Weekly:* review technical debt list; pick one item to pay down.

**Focus discipline**
- If running both agency work and your own SaaS: decide which one funds the other first. Don't run both at full tilt the same week.

---

## 7. Per-Project Run Sheet (copy this for each new product)

```
PROJECT: ____________________   DATE STARTED: __________

PHASE 0 — Define & Research
[ ] One-paragraph spec written
[ ] Target user defined
[ ] Perplexity: competitors / frameworks checked
[ ] Tech direction chosen
    → CONTEXT.md created

PHASE 1 — Architecture (Claude)
[ ] Data models defined
[ ] API contracts defined
[ ] Folder structure agreed
[ ] Key tradeoffs understood
    → CONTEXT.md architecture section filled

PHASE 2 — UI / MVP (Lovable)   [skip if no front-end]
[ ] Screens generated
[ ] Exported to repo + committed

PHASE 3 — Implementation (Gemini)
[ ] Logic / APIs / data layer built
[ ] Tests on critical paths written
[ ] All libraries/APIs verified real
[ ] Feature branch pushed

PHASE 4 — Review (Claude)
[ ] Diff + surrounding code + standards sent
[ ] Comments addressed
[ ] No unresolved high-severity issues

PHASE 5 — Ship
[ ] CI green
[ ] Merged to GitHub
[ ] Deployed
[ ] CONTEXT.md updated (state + decisions)

SHIPPED: [ ]   LIVE URL: __________________
```

---

## 8. Anti-Patterns (stop if you catch these)

- Perfecting the pipeline instead of shipping a product.
- Letting Lovable output go straight to production without review.
- "Tests where appropriate" quietly becoming no tests.
- Pasting API keys or proprietary architecture into a tool that trains on your data by default.
- Treating the role table as rigid law and bouncing between three models for one decision.
- Skipping `CONTEXT.md` updates — then re-explaining the project to every tool from scratch.

---

*Revision: v1 — refine this doc as you learn what actually slows you down.*
