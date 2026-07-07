# Engineering Principles

These are the non-negotiable values that guide every technical decision we make. When in doubt, return to these.

## 1. Simplicity Over Cleverness

The best code is the code that doesn't need to exist. The second best is code that anyone on the team can read, understand, and modify without the original author present. Clever solutions create maintenance debt. Simple solutions compound in value.

- Prefer boring technology over novel technology
- Choose the simplest approach that solves the actual problem
- If you need a comment to explain what the code does, the code is too complex

## 2. Correctness Over Speed

Software that produces wrong results quickly is worse than software that produces correct results slowly. Correctness is the foundation — performance is an optimization applied to correct systems.

- Write tests before or alongside implementation, not after
- Handle edge cases explicitly, not optimistically
- Validate at boundaries, trust within boundaries

## 3. Explicit Over Implicit

Hidden behavior creates hidden bugs. Every important decision, side effect, and dependency should be visible at the point of use. Magic is the enemy of debuggability.

- Name things for what they do, not how they're implemented
- Make dependencies injectable, not hidden
- Configuration should be obvious, not discovered through source diving
- Errors should describe what went wrong and what to do about it

## 4. Composition Over Inheritance

Small, focused units that combine predictably are easier to test, easier to understand, and easier to replace than deep hierarchies. Design for composition at every level — functions, modules, services.

- Prefer pure functions over stateful objects
- Build small things that do one thing well
- Connect components through well-defined interfaces
- Favor dependency injection over service locators

## 5. Fail Fast, Fail Loud

The worst bugs are the ones that silently corrupt data or produce subtly wrong results. Systems should detect problems as early as possible and surface them clearly.

- Validate inputs at system boundaries immediately
- Throw errors rather than returning default values for unexpected states
- Use type systems to make illegal states unrepresentable
- Log failures with enough context to diagnose without reproduction

## 6. Own What You Ship

Every line of code you write is a liability until proven otherwise. If you build it, you operate it. This means thinking about observability, failure modes, and operational burden before the code is written.

- Design for operability from day one
- Every feature needs monitoring, alerting, and a runbook
- If you can't explain how to debug it in production, it's not ready to ship
- Technical debt is only acceptable when explicitly tracked and scheduled
