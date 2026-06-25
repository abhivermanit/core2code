# CONTEXT.md — core2code (Agency Website V1)

> Living project doc. Paste the relevant section into each AI tool at session start. Update at the end of every session.

---

## Product

core2code is a lean digital agency — founded and run by the CEO with an AI-assisted delivery team — that designs and ships **end-to-end, production-grade websites and web apps** for clients. The pitch is quality: fully engineered, tested, maintainable software, **not disposable "vibe-coded" prototypes**. Delivery is agile and structured, taking a client brief from concept to a deployed, fully functional product. Initial services: custom websites and web apps; expanding into automation jobs and landing pages.

**Target user:** Small-to-mid businesses, founders, and other agencies who need real, maintainable software delivered fast — especially those burned by cheap throwaway builds who want engineering quality without hiring in-house.

**This project (V1):** The core2code agency website itself. Its job is to **win clients** — communicate the positioning and capture qualified leads. It is also the agency's first end-to-end run through the SOP and a live proof of the "not vibe-coded" promise, so it must be built to the same standard we'd sell.

---

## Stack

Standardized delivery stack (this becomes the reusable `core2code-starter` template for future client projects):

- **Language:** TypeScript end-to-end
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Lead email:** Resend (transactional email to inbox on form submit)
- **Lead storage:** Postgres (Supabase or Neon) — optional for V1, recommended so leads aren't email-only
- **Hosting:** Vercel (app) + managed Postgres
- **Repo:** GitHub, with CI (lint + typecheck + test) via GitHub Actions

> Marketing site = intentionally lightweight backend. The only "real functionality" is the lead-capture flow — that single path is where we prove production quality.

---

## Architecture

Light, as fits a marketing site. The one real subsystem is lead capture.

### Folder Structure (feature-based)

```
/app
  /(marketing)        # home, services, process, about
  /contact            # contact page + form
  /api/lead           # lead submission endpoint (or server action)
/components           # reusable UI (Button, Section, Card, Form fields)
/lib                  # email client, db client, validation
/content              # services/process copy as data (easy to edit)
```

### Lead-Capture Flow (the critical path)

```
Visitor fills form
  → client-side validation
  → server action / POST /api/lead
  → validate (zod)
  → store lead in DB
  → send notification email via Resend
  → success state to user
```

### Lead Data Model

```
Lead {
  id           uuid
  name         string
  email        string
  company      string?
  projectType  enum(website | web_app | automation | landing_page | other)
  budgetRange  string?
  message      string
  createdAt    timestamp
}
```

### Key Decisions & Tradeoffs

- No CMS in V1 — services/process copy lives as typed data in `/content`. Add a CMS only if editing becomes frequent.
- Server-side validation with zod is mandatory even though it's "just a form" — it's the visible proof of engineering discipline.
- API keys (Resend, DB) server-side only, in env vars. Never client-exposed.
- Screen 3 is "How we work / Process" (not Portfolio) — sells the method on day one, honest positioning, no fake work needed.

---

## Standards

Follow the SOP (see `README.md`). Summary: TypeScript, clean architecture, SOLID, feature-based folders, meaningful commits, CI green before merge, secrets never committed, all AI-generated libraries/APIs verified real, lead-capture path has tests.

---

## V1 Scope

**5 screens:**

1. **Home** — hero with "production-grade, not vibe-coded" positioning; what we do; why we're different; primary CTA to contact.
2. **Services** — websites, web apps, automation, landing pages. Each: what it is, what the client gets, the process.
3. **How we work** — the agency method (founder + AI-assisted, agile, structured end-to-end delivery). Turn "solo + AI" into a strength: senior oversight on every project, no junior hand-offs.
4. **About** — the founder story and agency model.
5. **Contact** — the lead form (the one piece of real functionality).

**Core flow that must work end-to-end:** visitor → reads positioning → submits qualified lead → notified + lead stored.

**Explicitly OUT of V1:** blog, CMS, client portal, payments, portfolio, multi-language, analytics dashboards.

---

## Current State

- Phase 0 (Define & Research): **done**
- Phase 1 (Architecture): **done**
- Phase 2 (UI/MVP in Lovable): not started
- Phase 3 (Implementation — lead capture + tests): not started
- Phase 4 (Review): not started
- Phase 5 (Ship): not started

**Next action:** Generate UI in Lovable from the 5 screens above, then build lead-capture backend in Gemini.

---

## Decisions Log

| Date | Decision | Why |
|---|---|---|
| 2026-06-25 | Repo initialized with SOP, CONTEXT.md, SECURITY.md, .gitignore | Baseline for all future work per SOP v1 |
| 2026-06-25 | V1 = core2code's own agency website | No client yet; site is the lead engine and first SOP run |
| 2026-06-25 | Stack: TypeScript + Next.js + Tailwind + Postgres + Vercel | Becomes reusable starter template for client work |
| 2026-06-25 | Core message: "production-grade, not vibe-coded" | Primary differentiator from cheap throwaway builds |
| 2026-06-25 | Backend-light; lead capture is the single real subsystem | Marketing site doesn't need more; quality proof on the one flow that matters |
| 2026-06-25 | Screen 3 = "How we work" process page (option a), not portfolio | Honest on day one; process page reinforces engineering discipline positioning |
