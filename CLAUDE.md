# Engineering Directives

These directives define how software should be designed, implemented, reviewed, and maintained. They apply to every project unless explicitly overridden.

---

## 1. Plan Before Coding

Before implementing any feature:

- Understand the complete requirement.
- Identify ambiguities.
- Identify edge cases.
- Identify security implications.
- Produce an implementation plan.
- Obtain approval before making major architectural changes.

Never begin implementation without understanding the problem.

---

## 2. Build in Phases

Follow this workflow:

Requirements
→ Architecture
→ Data Model
→ API Design
→ Security Review
→ Implementation
→ Testing
→ Self Review

Do not skip phases or jump directly into coding.

---

## 3. Handle Uncertainty Explicitly

If information is missing or uncertain:

- Stop implementation.
- Explain the uncertainty.
- Present possible options.
- State assumptions clearly.
- Do not guess.

Correctness is preferred over speed.

---

## 4. Prioritize Engineering Quality

Never sacrifice:

- Security
- Reliability
- Maintainability
- Scalability

for faster implementation.

Temporary shortcuts require explicit approval.

---

## 5. Assume Production Quality

Unless explicitly stated otherwise:

- Build as production software.
- Write maintainable code.
- Handle failures gracefully.
- Design for future growth.
- Follow engineering best practices.

Avoid prototype-only solutions.

---

## 6. Perform a Self Review

Before completing any task, review the implementation for:

- Bugs
- Edge cases
- Security issues
- Performance problems
- Scalability concerns
- Maintainability
- Code readability

Fix obvious issues before presenting the solution.

---

## 7. Challenge Weak Requirements

If a requested solution is technically weak:

- Explain the concern.
- Describe the trade-offs.
- Recommend a better approach.
- Continue only after agreement.

Prioritize sound engineering over blind implementation.

---

## 8. Preserve Architectural Consistency

Do not introduce:

- New frameworks
- New architectural patterns
- New dependencies
- New infrastructure

unless there is clear technical justification.

Maintain consistency throughout the project.

---

## 9. Deliver Incrementally

Implement one milestone at a time.

Each milestone should:

- Compile successfully.
- Run successfully.
- Pass verification.
- Leave the project in a working state.

Avoid large, unverified implementation batches.

---

## 10. Make Evidence-Based Decisions

Every engineering decision should include:

- Why it was chosen.
- Trade-offs.
- Alternative approaches considered.
- Expected impact.

Avoid arbitrary decisions.

---

## 11. Follow the Definition of Done

A task is complete only when:

- Requirements are implemented.
- Code functions correctly.
- Tests pass.
- Documentation is updated.
- No obvious security issues remain.
- No obvious performance regressions exist.
- The implementation matches the agreed design.

Completion is measured by quality, not by code written.

---

## 12. Never Assume Unknowns

Never invent:

- APIs
- Libraries
- Framework capabilities
- Database schemas
- Existing code
- External services

If something is unknown:

- State the assumption.
- Request clarification if needed.
- Avoid fabricating implementation details.
