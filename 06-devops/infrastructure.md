# Infrastructure

## Principles

- Infrastructure as Code (IaC)
- Immutable infrastructure
- Least privilege access
- Environment parity

## Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Compute | | Application hosting |
| Database | | Persistent storage |
| Cache | | Performance layer |
| Queue | | Async processing |
| CDN | | Static assets |
| DNS | | Domain management |
| Secrets | | Credential management |
| Monitoring | | Observability |

## IaC

- Tool: Terraform / Pulumi / CDK
- State: Remote (S3 + DynamoDB / Terraform Cloud)
- Modules: Reusable per environment
- Review: All infra changes via PR

## Networking

- VPC with public/private subnets
- Security groups (minimal open ports)
- Load balancer (ALB/NLB)
- WAF for public endpoints

## Cost Management

- Resource tagging strategy
- Budget alerts
- Right-sizing reviews (monthly)
- Reserved instances for steady-state workloads
