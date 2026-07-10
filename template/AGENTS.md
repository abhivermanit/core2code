# Agent Rules

Tool-agnostic rules for any AI agent working in this repository or in a project
bootstrapped from it. These mirror `CLAUDE.md`; if both are present they are
equivalent.

## Non-negotiables

1. **Plan before coding.** Understand the requirement, edge cases, and security
   implications first. State assumptions; never fabricate APIs, schemas, or libs.

2. **Follow the phase order:** requirements → architecture → data model → API
   design → security review → implementation → testing → self-review.

3. **Security is a gate, not a step.** Before proposing any code that handles
   input, auth, data access, files, or outbound requests, check it against
   `04-security/` and `09-checklists/security-checklist.md`.

4. **Definition of done = `09-checklists/production-hardening.md`.** A change is
   not "done" until the relevant items in that checklist pass. Treat unchecked
   items as blocking, or explicitly justify N/A.

5. **Deliver incrementally.** Each milestone must build, run, and pass checks and
   leave the repo in a working state.

## Before you say a task is complete

Run and report the result of:

- Lint (incl. `eslint-plugin-security`), type check, tests, `npm audit`.

- The applicable sections of `09-checklists/production-hardening.md`.

- For any SSRF/RLS/auth/file-upload code: the specific patterns in `04-security/`.

If a check cannot be run, say so explicitly — do not claim it passed.

## Do not

- Introduce new frameworks, patterns, dependencies, or infra without justification.
- Copy security snippets without verifying them against `04-security/`.
- Commit secrets, disable a failing check to make CI green, or mark items done
  that were not verified.
