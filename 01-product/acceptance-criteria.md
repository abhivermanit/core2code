# Acceptance Criteria Guide

## Purpose

Acceptance criteria define the conditions that must be satisfied for a story to be considered complete. They are the contract between product and engineering.

## Guidelines

- Write in **Given-When-Then** format for behavioral criteria.
- Be **specific and measurable** — avoid ambiguity.
- Include **happy path** and **edge cases**.
- Define **error states** and expected behavior.
- Keep criteria **testable** — each should map to at least one test.

## Format

### Given-When-Then

```
Given [precondition],
When [action],
Then [expected result].
```

### Example

```
Given a user is logged in,
When they click "Export" on the dashboard,
Then a CSV file downloads containing all visible data.
```

## Checklist for Good Acceptance Criteria

- [ ] Unambiguous — only one interpretation
- [ ] Testable — can be verified automatically or manually
- [ ] Independent — doesn't depend on other stories
- [ ] Complete — covers all scenarios (happy path, errors, edge cases)
- [ ] Concise — no unnecessary detail
