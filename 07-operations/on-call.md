# On-Call

On-call exists to protect users. Not to punish engineers. A sustainable on-call rotation is a sign of a healthy engineering organization.

## Rotation Structure

### Recommended Setup

```
Primary on-call:    Responds to all pages
Secondary on-call:  Backup if primary doesn't respond in 10 min
Escalation:         Engineering manager → Director → VP

Rotation: Weekly, handoff on weekday mornings (not Friday)
Team size: Minimum 4 people in rotation (1 week on, 3 weeks off)
```

### Rotation Rules

- Never fewer than 4 people in a rotation (burnout guarantee)
- Maximum 1 week on-call per person per month
- New team members shadow for 2 rotations before going primary
- Swap requests honored no-questions-asked
- Public holidays count as on-call time (reduced team = more coverage needed)

## Escalation Policy

```
T+0:   Alert fires → page primary on-call
T+5:   Not acknowledged → page secondary on-call
T+10:  Not acknowledged → page engineering manager
T+15:  P1 not mitigated → page director
T+30:  P1 still active → all-hands war room
```

### Escalation Triggers (beyond time)

- Multiple systems affected simultaneously
- Data loss confirmed or suspected
- Security breach suspected
- On-call engineer unsure of next steps (escalate immediately, don't struggle alone)

## On-Call Expectations

### What On-Call Means

- Respond to pages within 5 minutes
- Have laptop and internet access
- Be sober and alert enough to make good decisions
- Follow runbooks and escalate when stuck

### What On-Call Does NOT Mean

- Working on tickets or features during off-hours
- Watching dashboards constantly
- Being the only person who can fix anything
- Being punished for taking time off after a bad night

## Tools

| Purpose | Recommendations |
|---------|-----------------|
| Paging | PagerDuty, Opsgenie |
| Scheduling | PagerDuty, OpsGenie, native rotation |
| Communication | Slack + dedicated incident channel |
| Video | Zoom/Meet for war rooms |
| Documentation | Runbooks in git, linked from alerts |
| Status page | Statuspage, Instatus |

### Tool Requirements

- Mobile push notifications (SMS backup)
- Escalation automation
- Schedule overrides and swaps
- Incident timeline tracking
- Integration with monitoring tools

## Burnout Prevention

### Indicators of On-Call Burnout

- Pages during off-hours > 2 per week
- Same person paged for same issue repeatedly
- On-call engineers dreading their rotation
- Engineers leaving the team to avoid on-call
- Alert acknowledgment time increasing (apathy)

### Prevention Strategies

1. **Reduce alert volume** — fewer, better alerts (see [alerts.md](../06-delivery/alerts.md))
2. **Fix root causes** — postmortem action items must be completed
3. **Compensate** — on-call pay, time off in lieu, or reduced workload during rotation
4. **Distribute fairly** — everyone in rotation, including senior engineers and managers
5. **Invest in automation** — automate remediation for common issues
6. **Follow the sun** — for global teams, hand off to the awake timezone

### Compensation Models

| Model | When to Use |
|-------|-------------|
| Additional pay (flat rate) | Per on-call shift |
| Per-incident bonus | When pages are rare but impactful |
| Time off in lieu | After particularly bad shifts |
| Reduced sprint load | During on-call week |

## Handoff Procedures

### End of Shift Handoff (15 min meeting or async doc)

```markdown
## On-Call Handoff: [date]

### Active Issues
- [Issue description, current state, next steps]

### Recent Changes
- Deployed v2.3.1 yesterday (monitoring, no issues so far)
- New alert added for payment timeout

### Upcoming
- Database maintenance window Thursday 2 AM
- Marketing campaign launching (expect traffic spike)

### Notes
- Redis memory is at 70%, trending up (ticket: INFRA-123)
- Stripe had intermittent issues yesterday, resolved on their end
```

### Handoff Rules

- Never hand off during an active incident (resolve or escalate first)
- Document anything unusual during your shift
- Flag upcoming events (deploys, campaigns, maintenance)
- Review open incidents and their status

## Improving On-Call Over Time

### Weekly On-Call Review

- How many pages this week?
- Were they actionable?
- Were runbooks helpful?
- What should be automated?
- What should be fixed permanently?

### Quarterly Metrics

- Pages per on-call shift (target: < 5)
- Pages during sleep hours (target: < 1)
- Mean time to acknowledge
- Repeat page rate (same alert within 7 days)
- On-call satisfaction survey

## Anti-Patterns

- **One-person on-call** — single point of failure, guaranteed burnout
- **No escalation path** — on-call is stuck with no help
- **All alerts are P1** — everything is urgent = nothing is
- **No compensation** — on-call is unpaid labor = resentment
- **Never fixing the root cause** — same page every week, no action items completed
- **On-call as hazing** — new engineers get the worst shifts with no support
- **No handoff** — the next person discovers issues by getting paged
