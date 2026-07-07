# Architecture Checklist

## Before Starting

- [ ] Problem statement is clear
- [ ] Requirements are documented
- [ ] Constraints identified (time, budget, team size)
- [ ] Existing systems mapped

## Design

- [ ] Component responsibilities are clear and non-overlapping
- [ ] Interfaces between components are defined
- [ ] Data flow is documented
- [ ] Failure modes identified
- [ ] Scalability approach defined
- [ ] Security boundaries drawn

## Non-Functional

- [ ] Performance targets defined
- [ ] Availability requirements set
- [ ] Data retention policy defined
- [ ] Compliance requirements addressed
- [ ] Observability designed in

## Implementation

- [ ] Technology choices justified
- [ ] No single points of failure
- [ ] Stateless where possible
- [ ] Idempotent operations where applicable
- [ ] Backward compatibility considered

## Review

- [ ] Threat model completed
- [ ] Architecture reviewed by peers
- [ ] ADR written for key decisions
- [ ] Deployment strategy defined
- [ ] Rollback plan exists
