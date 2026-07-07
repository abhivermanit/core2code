# Runbook: [Alert/Issue Name]

**Service:** [service name]
**Last Updated:** [YYYY-MM-DD]
**Owner:** [team name]
**Alert:** [alert name that triggers this runbook]

---

## Trigger

What condition activates this runbook?

- Alert: [alert name and condition]
- Symptom: [what users experience]
- Metric: [specific metric threshold]

## Impact

- **Who is affected:** [all users / subset / internal]
- **What is broken:** [specific functionality]
- **Severity:** P1 / P2 / P3

## Quick Assessment (< 2 minutes)

1. Is this a known issue? Check #incidents channel
2. Was there a recent deployment? Check [deploy log link]
3. Is a dependency down? Check [status page links]
4. Is traffic abnormal? Check [traffic dashboard link]

## Diagnosis

### Step 1: [Check category]

```bash
# Command to run
[command]
```

Expected output: [what normal looks like]
Abnormal output: [what indicates the problem]

### Step 2: [Check category]

```bash
# Command to run
[command]
```

Dashboard: [link to relevant dashboard]

### Step 3: [Check category]

[Additional diagnostic steps]

## Resolution

### Scenario A: [Cause]

1. [Step 1]
2. [Step 2]
3. Verify: [how to confirm it worked]

### Scenario B: [Cause]

1. [Step 1]
2. [Step 2]
3. Verify: [how to confirm it worked]

### Scenario C: Unknown Cause

1. Rollback to previous deployment: `[command]`
2. If rollback doesn't help, escalate immediately

## Escalation

| Condition | Escalate To | Contact |
|-----------|-------------|---------|
| Not resolved in 15 min | [Team lead] | [contact] |
| Data loss suspected | [VP Engineering] | [contact] |
| Security concern | [Security team] | [contact] |

## Verification

After resolution:

- [ ] [Metric] returns to baseline
- [ ] [Health check] passes
- [ ] [User flow] works correctly
- [ ] No new errors in logs

## Post-Resolution

- [ ] Update #incidents channel
- [ ] Create incident ticket (if P1/P2)
- [ ] Schedule postmortem (if P1)
- [ ] Update this runbook if anything was unclear

## History

| Date | Trigger | Root Cause | Resolution Time |
|------|---------|-----------|-----------------|
| [date] | [what] | [why] | [how long] |
