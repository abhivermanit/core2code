# AI-Assisted Development

## Principle

AI is a force multiplier, not a replacement for engineering judgment. Use it to accelerate implementation — never to skip understanding. The workflow is: specify clearly, generate, review critically, integrate deliberately.

---

## Workflow: Specify → Generate → Review → Integrate

### 1. Specify

Before prompting AI, define what you actually want:

- What is the input/output contract?
- What are the constraints (performance, security, compatibility)?
- What patterns does the codebase already use?
- What should NOT be changed?

**Bad prompt:** "Write a user service"
**Good prompt:** "Write a createUser function that accepts a CreateUserInput (name, email, role), validates with zod, inserts into the users table using our existing db client (src/lib/db.ts), and returns a User type. Follow the pattern in src/services/orders.service.ts. Throw ValidationError for bad input and ConflictError if email already exists."

### 2. Generate

- Provide relevant context (existing code, types, patterns)
- Ask for one focused thing at a time
- Include constraints upfront, not as afterthoughts
- Reference existing files the AI should match

### 3. Review

Treat AI output like a junior developer's PR — helpful, often correct, sometimes subtly wrong:

- [ ] Does it match existing patterns and conventions?
- [ ] Are there security issues (SQL injection, XSS, auth bypass)?
- [ ] Does it handle errors correctly (not swallowing, not leaking)?
- [ ] Are edge cases covered?
- [ ] Does it import from the right places (not hallucinated packages)?
- [ ] Is it tested? Are the tests meaningful?
- [ ] Would you approve this in a code review from a human?

### 4. Integrate

- Don't paste AI code as a blob. Integrate file by file.
- Run tests. Run the linter. Check types.
- Commit with context about what was AI-generated and what was modified.
- If you don't fully understand what the code does, don't ship it.

---

## What AI Should NOT Decide

| Decision | Why |
|----------|-----|
| Architecture | AI lacks context about team capabilities, business constraints, and future plans |
| Security model | Too critical for pattern-matching. Requires threat modeling. |
| Database schema design | Requires understanding of access patterns, growth, and relationships |
| Dependency choices | AI may suggest deprecated, insecure, or unnecessary packages |
| What to build | Product decisions require business context |
| Performance trade-offs | Requires understanding of actual load and constraints |
| When to take shortcuts | AI doesn't understand deadlines, risk, or organizational context |

---

## What AI is Good For

| Task | Why It Works |
|------|-------------|
| Boilerplate implementation | Well-defined patterns with clear inputs |
| Test generation | Given a function, generating test cases is mechanical |
| Type definitions from examples | Pattern recognition task |
| Refactoring (rename, extract, restructure) | Mechanical transformation |
| Documentation (from code) | Summarizing what exists |
| Regex and complex expressions | Correctness is verifiable |
| Migration scripts | Repetitive transformations |
| Code review assistance | Second pair of eyes (but not the final authority) |

---

## Prompt Engineering Tips

### Be Explicit About Context

```
The codebase uses:
- TypeScript with strict mode
- Fastify for HTTP (not Express)
- Drizzle ORM (not Prisma, not raw SQL)
- Zod for validation
- Pino for logging

Do not use any other libraries.
```

### Constrain the Output

```
- Maximum 50 lines per function
- No classes — use functions and plain objects
- Error handling must use our AppError hierarchy (see attached)
- Tests use vitest, not jest
```

### Provide Examples of What You Want

```
Here's an existing service that follows our patterns:
[paste example]

Write the equivalent for the billing domain.
```

### Ask for Explanations

```
Explain any non-obvious decisions in code comments.
If there are multiple valid approaches, explain why you chose this one.
```

---

## Code Review of AI-Generated Code

Apply extra scrutiny to:

| Area | Common AI Mistakes |
|------|-------------------|
| Imports | Hallucinated packages, wrong import paths |
| Error handling | Swallowing errors, generic catches, no typed errors |
| Security | Missing input validation, SQL injection, hardcoded secrets |
| Types | Using `any`, overly broad types, incorrect generics |
| Tests | Testing implementation details, not behavior. Missing edge cases. |
| Naming | Generic names (`data`, `result`, `handler`) |
| Dependencies | Suggesting packages not in use, deprecated packages |
| Concurrency | Race conditions, missing locks, incorrect async patterns |

---

## Rules for AI-Generated Code

1. **You own it.** Once you commit AI code, it's yours. You're responsible for bugs.
2. **Understand before committing.** If you can't explain what it does line by line, don't ship it.
3. **Test it like human code.** AI code doesn't get a pass on test coverage.
4. **Review it like a PR.** Apply the same code review standards.
5. **Don't over-generate.** Writing 20 lines yourself is often faster and better than prompting, reviewing, and fixing 100 AI-generated lines.

---

## Anti-Patterns

- **Prompt → paste → push** without reading the output
- **Using AI to write code you don't understand** — You can't debug what you can't read.
- **"AI said so" as justification** — AI is a tool, not an authority. Evaluate the output.
- **Generating entire applications** — AI lacks coherent long-range design. Build incrementally.
- **Ignoring AI suggestions about bugs/risks** — It's often right about potential issues, even if the fix it suggests isn't perfect.
