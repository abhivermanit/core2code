# AI-Assisted Development Workflow

## Principles

- AI assists; humans decide.
- All AI-generated code must be reviewed like human-written code.
- AI should follow the same coding standards and conventions.
- Never blindly accept AI output — verify correctness.

## Workflow

### 1. Specify

Provide clear context:
- What you're building
- Relevant files and interfaces
- Constraints and conventions
- Expected output format

### 2. Generate

Use AI for:
- Boilerplate code
- Test generation
- Documentation
- Refactoring suggestions
- Bug analysis

### 3. Review

Check AI output for:
- Correctness
- Security issues
- Performance implications
- Adherence to project conventions
- Edge cases missed

### 4. Integrate

- Run tests
- Run linter
- Verify types
- Manual testing where appropriate

## What AI Should Not Decide

- Architecture
- Security policy
- Data model design
- Deployment strategy
- Production access

## Prompt Engineering Tips

- Be specific about the codebase context
- Reference existing patterns in the project
- Ask for reasoning, not just code
- Iterate rather than expecting perfection on first try
