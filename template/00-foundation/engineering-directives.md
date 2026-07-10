# Engineering Directives

These 12 directives define how we work. They apply to every task — from a one-line fix to a multi-month project.

---

## 1. Plan Before Coding

Never start typing until you can articulate what you're building and why. Planning doesn't mean a 40-page document — it means clarity.

**Minimum bar:**
- What problem does this solve?
- What's the simplest approach?
- What are the edge cases?
- How will I know it works?

Write down the plan in whatever form fits the scope: a comment in the ticket, a design doc, or a sketch on paper. The act of writing forces clarity.

---

## 2. Build in Phases

Deliver working software at every step. Break large work into small, independently valuable increments. Each phase should leave the system in a deployable state.

**Practice:**
- Phase 1: Walking skeleton (end-to-end with minimal functionality)
- Phase 2: Core business logic
- Phase 3: Edge cases and hardening
- Phase 4: Polish and optimization

If any phase takes more than 3 days, break it down further.

---

## 3. Handle Uncertainty

You will encounter unknowns. The correct response is never to guess silently. Surface uncertainty, investigate it, and document what you learn.

**When you hit uncertainty:**
1. State the assumption explicitly
2. Time-box investigation (30 minutes max for tactical questions)
3. If unresolved, escalate with context, not just a question
4. Document the decision and rationale

---

## 4. Prioritize Quality

Quality is not a phase. It's not something you add at the end. Every commit should be production-worthy. This means tested, reviewed, and observable from the start.

**Non-negotiable quality bar:**
- Tests exist and pass
- No known bugs shipped intentionally without tracking
- Error handling is explicit
- Logging covers the happy and unhappy paths

---

## 5. Assume Production

Write every line of code as if it will run in production tonight. Because eventually, it will. This means thinking about failure modes, data integrity, and operational concerns from the first line.

**Implications:**
- No hardcoded secrets, ever
- No `TODO: handle error later` without a tracked ticket
- Connection pools, timeouts, and retries are not afterthoughts
- Data migrations are reversible

---

## 6. Self-Review

Review your own code before anyone else sees it. Read the diff as if you're reviewing someone else's work. You'll catch 80% of issues yourself.

**Self-review checklist:**
- Does the diff contain only what's needed for this change?
- Are names clear to someone without context?
- Are there any unhandled error paths?
- Would I be comfortable debugging this at 2 AM?

---

## 7. Challenge Weak Requirements

Requirements that are vague, contradictory, or incomplete are a signal, not a starting point. Push back. Ask questions. Propose alternatives. Building the wrong thing well is still building the wrong thing.

**Red flags in requirements:**
- "Should handle all cases" (which cases specifically?)
- "High performance" (what latency/throughput numbers?)
- "Simple UI" (simple for whom?)
- "Eventually consistent" (what's the consistency window?)

Clarify before building. It's always cheaper to fix requirements than code.

---

## 8. Preserve Consistency

A codebase is a shared artifact. Consistency reduces cognitive load for everyone. Follow existing patterns unless you have a compelling reason to deviate — and if you deviate, document why and migrate the old pattern.

**Rules:**
- Match existing code style in the file/module you're editing
- One pattern for one problem across the codebase
- If you introduce a new pattern, create an ADR and a migration plan
- Don't mix approaches within the same layer

---

## 9. Deliver Incrementally

Ship small, ship often. Large PRs are hard to review, hard to revert, and hard to debug. Aim for PRs that can be reviewed in under 30 minutes.

**Guidelines:**
- One logical change per PR
- Under 400 lines of meaningful change (excluding generated code)
- Feature flags for incomplete features
- Trunk-based development over long-lived branches

---

## 10. Evidence-Based Decisions

Opinions are cheap. Data is expensive but valuable. When making technical decisions, gather evidence first. Profile before optimizing. Measure before scaling. Benchmark before choosing.

**Decision inputs (in order of preference):**
1. Production metrics and data
2. Load tests and benchmarks
3. Prototypes and spikes
4. Industry research and case studies
5. Team experience (useful but verify)

---

## 11. Definition of Done

"Done" is not "works on my machine." Done means deployed, monitored, documented, and validated. Every task has a clear definition of done agreed upon before work starts.

**Done means:**
- [ ] Code complete and self-reviewed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] PR reviewed and approved
- [ ] Deployed to staging and validated
- [ ] Monitoring and alerting confirmed
- [ ] Stakeholder acceptance (if applicable)

---

## 12. Never Assume Unknowns

If you don't know, say so. If the documentation is ambiguous, test it. If the behavior is undefined, define it. Assumptions are the root cause of the most expensive bugs.

**Practice:**
- Write down assumptions explicitly in design docs
- Verify assumptions with tests, not mental models
- When integrating with external systems, test actual behavior — don't trust their docs blindly
- "I think it works this way" is never acceptable as a basis for production code
