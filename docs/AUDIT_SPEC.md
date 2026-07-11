# Core2Code Audit Specification (v1)

**Status:** Frozen. This is the record format every check — implemented or
not — must conform to. It's the API contract between the audit *matrix*
(what exists, [AUDIT_MATRIX.md](AUDIT_MATRIX.md)) and the audit *engine*
(how checks run, `src/audit/`). Changing a field here is a breaking change
to that contract and requires a new spec version, not a silent edit.

Once a check's record is written against this spec, adding it to the engine
should be close to mechanical — the record already contains the pass/fail
condition, the severity, and whether it's even attemptable automatically.
That's the point: **a new check becomes data, not code.**

## ID convention

`<PHASE-CODE>-<NNN>`, zero-padded to 3 digits, assigned once and never
reused even if a check is later retired.

| Phase | Code |
| --- | --- |
| Discovery | `DISC` |
| Architecture | `ARCH` |
| Engineering | `ENG` |
| Security | `SEC` |
| Quality | `QUAL` |
| Delivery | `DEL` |
| Operations | `OPS` |

## Field reference

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | yes | string | `<PHASE-CODE>-<NNN>`, stable forever |
| `title` | yes | string | Short human-readable name |
| `phase` | yes | enum | One of the 7 lifecycle phases |
| `severity` | yes | enum | `critical` \| `high` \| `medium` \| `info` |
| `type` | yes | enum | `automatic` \| `manual` — see rule below |
| `why` | yes | string | One sentence: what breaks in production if this fails |
| `evidence` | yes | string | What satisfies the check, described as a form of evidence (never a literal file path — see [AUDIT_MATRIX.md design principle #1](AUDIT_MATRIX.md#1-audit-evidence-not-filenames)) |
| `pass` | yes | string | The condition that must hold true for a pass |
| `fail` | yes | string | The condition that constitutes a fail |
| `manual_review` | yes | `Yes` \| `No` | Must equal `Yes` iff `type: manual` (see validation rule) |
| `remediation` | yes | string | What to do when the check fails / is flagged for review |
| `references` | no | string | External standard this check maps to (e.g. `OWASP ASVS 2.1`, `NIST SSDF PW.1`) — omit if none applies |

## Validation rules

1. `manual_review` is derived from `type`, not independently chosen —
   `type: automatic` ⟹ `manual_review: No`, `type: manual` ⟹
   `manual_review: Yes`. It's kept as its own field (rather than collapsed
   into `type`) because it's the field the *report* reads to decide how to
   render the result — keeping it explicit avoids the report layer having
   to know the type taxonomy.
2. `type: automatic` checks' `pass`/`fail` text must describe something a
   program can decide without judgment (a file matches a pattern, a
   dependency is present, a config key is set). If writing `pass`/`fail`
   for a check requires words like "well-defined", "sound", "adequate", or
   "good", it's `type: manual`, not `automatic` — that's the tell.
3. `type: manual` checks never resolve to `pass`/`fail` at runtime; the
   engine emits `manual_review` as the check's status regardless of what
   it finds. `pass`/`fail` in the record still get written — they describe
   what a *human* reviewer should look for, not what the engine decides.
4. Severity is set by production impact if the check fails, not by how
   hard the check is to implement.

## Worked examples

One per `type`, chosen to be representative:

```yaml
id: SEC-001
title: Authentication exists
phase: security
severity: critical
type: automatic
why: Prevents unauthorized access to the system.
evidence: An authentication mechanism (middleware, guard, or equivalent) is wired into the request path.
pass: Every non-public route requires a valid authentication check before executing.
fail: Private routes are reachable without any authentication check.
manual_review: No
remediation: Implement authentication middleware and apply it to all non-public routes.
references: OWASP ASVS 2.1
```

```yaml
id: DISC-001
title: A problem statement exists
phase: discovery
severity: critical
type: automatic
why: Without a stated problem, "production ready" has no target to be ready for.
evidence: A PRD, vision doc, or linked external doc (Notion/Confluence/Linear) describing the problem being solved.
pass: A problem-statement artifact is found and is non-empty beyond template placeholders.
fail: No problem-statement artifact is found, or it contains only unfilled template placeholders.
manual_review: No
remediation: Write a PRD or link to where the problem statement lives.
```

```yaml
id: ARCH-006
title: Architectural decisions show real reasoning
phase: architecture
severity: high
type: manual
why: Undocumented or unreasoned decisions get silently relitigated or contradicted as the codebase grows, and AI coding assistants have no record of why a pattern was chosen.
evidence: Decision records (ADRs or equivalent) exist that state the decision, alternatives considered, and tradeoff reasoning.
pass: A reviewer confirms the decision records show genuine alternatives-considered reasoning, not just an assertion of the choice made.
fail: Decision records are missing, or present but state only the decision with no reasoning.
manual_review: Yes
remediation: Write or backfill ADRs for significant decisions already made; require an ADR for the next one.
references: null
```

## Storage (for Milestone 2 implementation — not decided yet, noted here so it isn't forgotten)

Once implementation starts, each check's full record should live as
reviewable data (one YAML file per check, or one file per phase) rather
than being embedded only as TS object literals — so a new check can, in the
limit, be added by a non-engineer editing a record and doesn't require
understanding `src/audit/checks/*`. This is an implementation decision for
whoever picks up the first vertical slice (Discovery, per the phased
roadmap) — flagged here, not settled.

## Change log

- **v1** — initial freeze. Fields: id, title, phase, severity, type, why,
  evidence, pass, fail, manual_review, remediation, references.
