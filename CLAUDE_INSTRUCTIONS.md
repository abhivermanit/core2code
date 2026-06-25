# CLAUDE_INSTRUCTIONS.md

> **What this file is:** Timestamped instructions from Claude (architecture + review). Read the latest entry before starting work in any other tool (Gemini, Lovable, etc.) on any machine. This is the handoff mechanism.

---

## 2026-06-25 — Phase 2: Generate UI in Lovable

**Status:** Ready to execute

**What to do:**

Open Lovable and paste the brief below. Generate all 5 screens as a single Next.js + Tailwind project.

### Brief for Lovable

> Build a marketing website for "core2code" — a lean digital agency that ships production-grade websites and web apps. The positioning is: "fully engineered, not vibe-coded."
>
> **5 pages:**
>
> 1. **Home** — hero section with headline emphasizing "production-grade, not vibe-coded"; a short "what we do" section (websites, web apps, automation, landing pages); a "why us" section (engineered quality, senior oversight, structured delivery); a primary CTA button linking to /contact.
>
> 2. **Services** — 4 service cards: Custom Websites, Web Apps, Automation, Landing Pages. Each card: title, short description of what the client gets, and a "Get started" link to /contact.
>
> 3. **How We Work** — step-by-step process: (1) Discovery & spec, (2) Architecture & design, (3) Build & test, (4) Review & deploy, (5) Handoff & support. Emphasize: "founder oversight on every project, no junior hand-offs, structured agile delivery."
>
> 4. **About** — the agency model: solo founder + AI-assisted delivery team. Messaging: senior engineering discipline on every project, speed without sacrificing quality, transparent process.
>
> 5. **Contact** — a lead capture form with fields: Name (required), Email (required), Company (optional), Project Type (dropdown: Website, Web App, Automation, Landing Page, Other), Budget Range (optional), Message (required). Show a success state after submit.
>
> **Style:** dark/modern, clean, professional. Minimal animations. Mobile-responsive. Use a sans-serif font.
>
> **Tech:** Next.js App Router + Tailwind CSS. TypeScript.

### After Lovable generates the UI:

1. Export/connect it to the GitHub repo (`abhivermanit/core2code`)
2. Confirm all 5 pages render
3. Come back here — next step is Phase 3 (build lead-capture backend in Gemini)

---

## Upcoming (not yet actionable)

| Phase | Tool | Task |
|---|---|---|
| 3 | Gemini | Build lead-capture: server action, zod validation, Postgres insert, Resend email, tests |
| 4 | Claude | Review the implementation diff for security, logic, and architecture compliance |
| 5 | You | Deploy to Vercel, update CONTEXT.md |

---

*Updated by Claude. Check timestamps — only the latest entry is current.*
