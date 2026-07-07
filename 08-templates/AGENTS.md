# AGENTS.md

Instructions for AI agents working on this codebase.

## Context

This document is consumed by AI coding agents (Claude, GPT, Copilot, etc.) to understand project conventions and constraints.

## Project Structure

```
[Describe your project layout]
```

## Development Workflow

1. Read the relevant code before making changes
2. Follow existing patterns and conventions
3. Write tests for new functionality
4. Run the full test suite before completing
5. Use conventional commits

## Do

- Match existing code style
- Write descriptive commit messages
- Add tests for new features and bug fixes
- Handle errors explicitly
- Use typed interfaces

## Don't

- Add new dependencies without justification
- Modify architecture without an ADR
- Skip tests
- Leave TODO comments without context
- Force-push to main

## Testing

```bash
# Run all tests
[command]

# Run specific test
[command]

# Check types
[command]
```

## When Stuck

- Check existing patterns in the codebase
- Look at test files for usage examples
- Reference documentation in `docs/`
- Ask the user if uncertain
