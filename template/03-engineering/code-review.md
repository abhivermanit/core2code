# Code Review Standards

## Principle

Code review is a quality gate, a knowledge-sharing tool, and a design discussion mechanism. It's not a gatekeeping exercise. The goal is better code AND a better team.

---

## What to Check

### Correctness

- Does the code do what the PR description says?
- Are edge cases handled?
- Are there off-by-one errors, null/undefined risks, or race conditions?
- Does error handling cover the failure modes?

### Design

- Does this fit the existing architecture?
- Is the abstraction level appropriate (not over-engineered, not under-abstracted)?
- Are responsibilities in the right place?
- Will this be easy to modify/extend later?

### Security

- Input validation present?
- SQL injection / XSS / auth bypass risks?
- Secrets not hardcoded?
- Authorization checks at the right level?

### Performance

- Obvious N+1 queries?
- Unnecessary allocations in hot paths?
- Missing indexes for new queries?
- Acceptable memory usage for data sizes involved?

### Testing

- Are there tests? Do they test behavior (not implementation details)?
- Are edge cases tested?
- Would a bug here be caught by these tests?

### Readability

- Clear naming?
- Comments where logic is non-obvious?
- Consistent style with the rest of the codebase?
- Would a new team member understand this without explanation?

---

## How to Give Feedback

### Categorize Your Comments

| Prefix | Meaning | Blocking? |
|--------|---------|-----------|
| `blocking:` | Must be fixed before merge | Yes |
| `suggestion:` | Consider this improvement | No |
| `question:` | I need to understand this | Maybe |
| `nit:` | Style/minor preference | No |
| `praise:` | This is well done | No (but do it!) |

### Examples

```
blocking: This SQL query is vulnerable to injection. Use parameterized queries.

suggestion: Consider extracting this into a helper function — it's repeated in 3 places.

question: Why are we catching the error here instead of letting it propagate to the error handler?

nit: Prefer `const` over `let` since this value isn't reassigned.

praise: Great test coverage on the edge cases here. The boundary testing is thorough.
```

### Tone Rules

- **Be kind.** You're reviewing code, not judging a person.
- **Be specific.** "This is wrong" → "This will throw if `user` is null on line 42 because..."
- **Be constructive.** Don't just point out problems — suggest solutions or alternatives.
- **Ask, don't demand.** "What do you think about..." > "You need to..."
- **Explain why.** "Use X because Y" > "Use X"
- **Acknowledge trade-offs.** If it's a gray area, say so.

---

## Approval Criteria

A PR is ready to merge when:

- [ ] CI passes (build, tests, lint)
- [ ] At least 1 approval from a qualified reviewer
- [ ] All `blocking:` comments resolved
- [ ] PR description explains the what and why
- [ ] No unresolved questions about correctness or security
- [ ] Tests cover the new behavior

### Who Can Approve

- Any team member familiar with the area of code
- Security-sensitive changes: require security-aware reviewer
- Infrastructure changes: require ops/platform team member
- Database changes: require someone who understands data patterns

---

## Time Expectations

| Metric | Target |
|--------|--------|
| Time to first review | < 4 hours during work hours |
| Time to re-review (after changes) | < 2 hours |
| Total review cycle | < 1 business day |
| Reviewer time spent | < 30 minutes per review |

**If a PR takes > 30 min to review, it's too big.** Ask the author to split it.

---

## Author Responsibilities

- Keep PRs small and focused (see git-workflow.md for size limits)
- Write a clear description (what, why, how, testing)
- Self-review before requesting review (catch obvious issues yourself)
- Respond to feedback within 4 hours
- Don't take feedback personally — it's about the code

---

## Reviewer Responsibilities

- Review within 4 hours of request (or delegate)
- Focus on substance, not style (let linters handle formatting)
- If you're unsure about something, say so — don't just approve
- If a PR is too large, ask for it to be split before reviewing
- Approve promptly once issues are resolved (don't ghost)

---

## When to Skip Review

- Typo fixes in documentation (auto-merge OK)
- Dependency version bumps (if CI passes and Dependabot/Renovate approved)
- Generated code updates (if the generator is trusted)

Never skip review for:
- Any logic change
- Security-related code
- Database migrations
- Infrastructure changes

---

## Anti-Patterns

- **Rubber-stamp approvals** — "LGTM" without reading the code helps nobody.
- **Bikeshedding** — Spending 30 minutes debating a variable name while ignoring a race condition.
- **Gatekeeping** — Blocking PRs for stylistic preferences, not real issues.
- **Review fatigue** — If you're too tired to review well, say so and let someone else do it.
- **"I would have done it differently"** — Not a valid blocking comment unless the current approach has real problems.
- **Sitting on PRs for days** — If you can't review in 4 hours, delegate to someone who can.
