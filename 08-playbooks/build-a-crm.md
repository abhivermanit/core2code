# Playbook: Build a CRM

A CRM is a data-heavy application where the value is in relationships between entities, not individual records.

## Core Domain Model

### Contacts

```sql
contacts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'person' | 'company'
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id UUID REFERENCES contacts(id), -- person → company
  owner_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active',
  source TEXT, -- 'web_form', 'import', 'manual', 'api'
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tags for flexible categorization
contact_tags (contact_id UUID, tag TEXT, PRIMARY KEY (contact_id, tag));
```

### Key Decisions

- **Custom fields:** Use JSONB column + schema validation. Don't create columns per field.
- **Deduplication:** Match on email (primary), phone (secondary), name+company (fuzzy)
- **Merge:** Support merging duplicate contacts (keep all history, combine data)
- **Soft delete:** Never hard-delete contacts (compliance, history)

## Pipelines (Sales Stages)

```sql
pipelines (id, tenant_id, name, stages JSONB)
-- stages: [{id, name, order, probability, rottenDays}]

deals (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  pipeline_id UUID REFERENCES pipelines(id),
  stage_id TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  owner_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  value_cents BIGINT,
  currency TEXT DEFAULT 'USD',
  expected_close_date DATE,
  status TEXT DEFAULT 'open', -- open, won, lost
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Pipeline Features

- Drag-and-drop Kanban view (stages as columns, deals as cards)
- Stage probability for revenue forecasting
- "Rotten" deals (stale in a stage too long) → alert owner
- Win/loss tracking with reasons
- Pipeline analytics (conversion rates between stages)
- Multiple pipelines per tenant (sales, partnerships, recruiting)

## Activities & Timeline

```sql
activities (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  contact_id UUID,
  deal_id UUID,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'note', 'email', 'call', 'meeting', 'task'
  title TEXT,
  body TEXT,
  metadata JSONB, -- duration, participants, outcome
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Activity Types

| Type | Tracking | Automation |
|------|----------|------------|
| Email | Sent/opened/clicked/replied | Log automatically from integration |
| Call | Duration, outcome, recording link | Log from phone integration |
| Meeting | Attendees, notes, follow-ups | Calendar sync |
| Note | Free-form text | Manual |
| Task | Due date, assignee, completion | Reminders |

### Timeline View

Show all activities for a contact or deal in reverse chronological order. Mix automated events (email opened, deal stage changed) with manual entries (notes, calls).

## Permissions

### Role-Based Access

```typescript
const ROLES = {
  admin: { contacts: 'all', deals: 'all', settings: true, reports: true },
  manager: { contacts: 'team', deals: 'team', settings: false, reports: true },
  rep: { contacts: 'own', deals: 'own', settings: false, reports: 'own' },
  viewer: { contacts: 'read', deals: 'read', settings: false, reports: 'read' },
};
```

### Access Scopes

| Scope | Sees | Can Edit |
|-------|------|----------|
| all | Everything in tenant | Everything |
| team | Their team's records | Their team's records |
| own | Their assigned records | Their assigned records |
| read | Everything (read-only) | Nothing |

### Critical Permission Rules

- Owner always has full access to their records
- Reassigning a record transfers access
- Shared records visible to all participants
- Admin can view/edit everything (for support)
- Deleted records visible to admin only

## Import/Export

### Import

```
1. Upload CSV/Excel file
2. Map columns to fields (with smart suggestions)
3. Preview first 10 rows with mapped data
4. Deduplication check (show potential duplicates)
5. Import with progress indicator
6. Summary: created, updated, skipped, errors
```

**Import Rules:**
- Validate data before importing (email format, required fields)
- Batch processing (don't block on large imports)
- Allow undo within 24 hours (soft-link imported records)
- Limit import size (10K records per batch for free, more for paid)

### Export

- Export any list view to CSV
- Full account export (GDPR compliance)
- Scheduled exports (daily/weekly to email or S3)
- API access for programmatic export
- Include related data (contact + their deals + activities)

## Integrations

### Essential Integrations

| Category | Services | Purpose |
|----------|----------|---------|
| Email | Gmail, Outlook | Auto-log emails, send from CRM |
| Calendar | Google Calendar, Outlook | Meeting scheduling, sync |
| Communication | Slack, Teams | Notifications, deal updates |
| Phone | Twilio, RingCentral | Click-to-call, call logging |
| Marketing | Mailchimp, HubSpot | Lead sync, campaign tracking |
| Enrichment | Clearbit, Apollo | Auto-fill company/contact data |

### Integration Architecture

```typescript
// Webhook receiver pattern
app.post('/webhooks/:provider', async (req, res) => {
  const { provider } = req.params;
  const event = validateWebhook(provider, req);

  // Queue for async processing
  await queue.add('process-integration-event', {
    provider,
    event,
    tenantId: extractTenantFromWebhook(event),
  });

  res.json({ received: true });
});
```

### OAuth Flow for Integrations

```
1. User clicks "Connect Gmail"
2. Redirect to Google OAuth consent screen
3. Callback with auth code
4. Exchange for tokens, store encrypted
5. Background sync begins
6. Show connection status in settings
```

## Search

### Requirements

- Full-text search across contacts, deals, activities
- Filter by any field (status, owner, date range, tags)
- Saved views (filtered lists that persist)
- Recent contacts (quick access)
- Global search bar (search everything from anywhere)

### Implementation

```
Simple (< 100K contacts): PostgreSQL full-text search + GIN indexes
Moderate (100K-1M): PostgreSQL + materialized views for common queries
Large (> 1M): Elasticsearch/Typesense for search, Postgres for source of truth
```

## Anti-Patterns

- **No activity timeline** — a CRM without history is just a contact list
- **Rigid schemas** — every business has different fields. Support custom fields from day one.
- **No deduplication** — duplicate contacts destroy data quality
- **All-or-nothing permissions** — salespeople need to see their deals, not everyone's
- **Manual-only data entry** — integrations should auto-log emails, calls, meetings
- **No bulk operations** — users need to update, tag, reassign hundreds of records at once
- **Ignoring data quality** — validate on input, flag incomplete records, merge duplicates
