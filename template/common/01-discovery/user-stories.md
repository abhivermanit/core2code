# User Stories

## Story Format

Every user story follows this structure:

```
As a [persona],
I want to [action/capability],
so that [benefit/value].
```

The "so that" clause is mandatory. If you can't articulate the value, the story isn't ready to build.

---

## Writing Good Stories

### INVEST Criteria

Every story should be:

- **Independent** — Can be developed without depending on other stories
- **Negotiable** — Details can be discussed; it's not a contract
- **Valuable** — Delivers value to the user or business
- **Estimable** — Team can roughly size it
- **Small** — Completable in one sprint (ideally 1-3 days of work)
- **Testable** — Has clear pass/fail acceptance criteria

### Story Sizing

| Size | Guideline | Action |
|------|-----------|--------|
| XS | < 1 day | Ship it |
| S | 1-2 days | Good size |
| M | 3-5 days | Acceptable |
| L | 5-10 days | Consider splitting |
| XL | > 10 days | Must split before starting |

If a story is larger than M, split it by:
- Happy path vs error handling
- Create vs read vs update vs delete
- Single item vs bulk operations
- API layer vs UI layer (only if independently valuable)

---

## Prioritization

### MoSCoW Method

| Priority | Meaning | Guidance |
|----------|---------|----------|
| **Must** | Launch blocker | Without this, the product fails to deliver core value |
| **Should** | Expected | Users will notice its absence, but product still works |
| **Could** | Nice to have | Enhances experience, not critical |
| **Won't** | Not this release | Explicitly deferred (with reason documented) |

### Prioritization Criteria

Score each story on:

1. **User value** (1-5): How much pain does this relieve?
2. **Business value** (1-5): Revenue impact, retention impact, strategic alignment?
3. **Effort** (1-5): Development complexity and time?
4. **Risk** (1-5): Technical uncertainty, dependency risk?

**Priority Score** = (User Value + Business Value) / (Effort + Risk)

Higher score = higher priority. Use this as input, not as a mechanical formula.

---

## Acceptance Criteria

Every story requires acceptance criteria written before development starts. Use the Given/When/Then format for clarity:

### Format

```gherkin
Given [precondition/context]
When [action/trigger]
Then [expected outcome]
```

### Rules for Good Acceptance Criteria

1. **Specific and measurable** — No vague language ("should be fast", "looks good")
2. **Testable** — A developer can write an automated test for each criterion
3. **Independent** — Each criterion tests one behavior
4. **Boundary-aware** — Include edge cases and limits
5. **Complete** — Cover happy path, error cases, and edge cases

### Example

**Story:** As a customer, I want to search for products by name, so that I can find what I'm looking for quickly.

**Acceptance Criteria:**

```gherkin
Scenario: Successful search
Given I am on the product listing page
When I enter "wireless headphones" in the search field
And I press Enter or click Search
Then I see a list of products matching "wireless headphones"
And results are ordered by relevance
And each result shows product name, price, and thumbnail

Scenario: No results
Given I am on the product listing page
When I search for "xyznonexistent123"
Then I see a "No products found" message
And I see suggestions for alternative searches

Scenario: Search input validation
Given I am on the product listing page
When I submit an empty search
Then no search is performed
And the search field shows a validation hint

Scenario: Performance
Given there are 1,000,000 products in the catalog
When I perform a search
Then results appear within 500ms (p95)
And only the first 20 results are loaded initially
```

---

## Story Template

```markdown
## [Story ID]: [Brief Title]

**As a** [persona],
**I want to** [action],
**so that** [value].

### Priority: [Must/Should/Could/Won't]

### Acceptance Criteria

- [ ] Given [context], when [action], then [outcome]
- [ ] Given [context], when [action], then [outcome]
- [ ] Given [error condition], when [action], then [error handling]

### Technical Notes

- [Any implementation constraints or considerations]
- [Dependencies on other stories or systems]

### Out of Scope

- [What this story explicitly does NOT cover]

### Design Reference

- [Link to mockup/wireframe if applicable]
```

---

## Story Splitting Patterns

When a story is too large, split using these patterns:

### 1. Workflow Steps
- Story: "User completes checkout"
- Split: "User adds payment method" + "User confirms order" + "User receives confirmation"

### 2. Business Rule Variations
- Story: "System calculates shipping cost"
- Split: "Calculate domestic shipping" + "Calculate international shipping" + "Apply free shipping rules"

### 3. Data Variations
- Story: "User imports data"
- Split: "Import CSV" + "Import JSON" + "Import from API"

### 4. Operations (CRUD)
- Story: "User manages their profile"
- Split: "User views profile" + "User edits profile" + "User deletes account"

### 5. Performance/Scale
- Story: "Dashboard loads quickly"
- Split: "Dashboard loads with pagination" + "Dashboard caches frequent queries" + "Dashboard lazy-loads charts"

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Technical stories without user value | "Set up Redis" — who benefits? | Frame as user outcome: "User sees results within 200ms" |
| Stories without acceptance criteria | No way to know when it's done | Write AC before estimation |
| Epic-sized stories | Can't be completed in a sprint | Split into smaller stories |
| Solution-prescriptive stories | "Use React to build X" — that's implementation | Focus on behavior: "User can filter results" |
| Missing error scenarios | Only happy path covered | Always include error and edge case AC |
