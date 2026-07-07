# Playbook: Build a Dashboard

Dashboards answer questions at a glance. If users need to think hard to understand your dashboard, it's not working.

## Real-Time Data

### Data Freshness Tiers

| Tier | Latency | Method | Use Case |
|------|---------|--------|----------|
| Real-time | < 1s | WebSocket/SSE | Live metrics, active users |
| Near-real-time | 1-30s | Polling, short-cache | Order counts, revenue |
| Periodic | 1-5 min | Background refresh | Aggregated analytics |
| Batch | Hourly/daily | Pre-computed | Historical reports, trends |

### WebSocket for Live Data

```typescript
// Server: push updates to connected clients
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  const userId = authenticateWs(req);
  const tenantId = getTenantId(userId);

  // Subscribe to tenant-specific updates
  const unsubscribe = eventBus.subscribe(`metrics:${tenantId}`, (data) => {
    ws.send(JSON.stringify({ type: 'metric_update', data }));
  });

  ws.on('close', () => unsubscribe());
});
```

### Polling Fallback

```typescript
// Client: poll when WebSocket isn't practical
function useDashboardData(refreshInterval = 30_000) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const result = await api.getDashboardMetrics();
      setData(result);
    };

    fetch(); // initial load
    const interval = setInterval(fetch, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return data;
}
```

## Charts and Visualizations

### Chart Selection Guide

| Data Type | Chart | When |
|-----------|-------|------|
| Trend over time | Line chart | Revenue, signups, traffic |
| Comparison | Bar chart | Products, regions, teams |
| Proportions | Donut/pie (small N) | Status distribution (< 7 items) |
| Distribution | Histogram | Response times, user ages |
| Correlation | Scatter plot | Price vs. sales, effort vs. outcome |
| Single value | KPI card | Total revenue, active users |
| Geographic | Map | Users by region, delivery coverage |

### Chart Best Practices

- Start Y-axis at zero (unless showing change is more important)
- Limit line chart to 5 series maximum
- Use consistent color coding across charts
- Show tooltips on hover with exact values
- Include comparison period (vs. last week/month)
- Show trend indicators (↑ 12% vs. last period)

### KPI Cards

```
┌─────────────────────┐
│ Active Users         │
│ 12,456    ↑ 8.3%    │
│ vs. last week        │
└─────────────────────┘
```

Every KPI card should show:
- Metric name
- Current value
- Trend (up/down/flat)
- Comparison context (vs. when)

## Filters

### Filter Architecture

```typescript
interface DashboardFilters {
  dateRange: { start: Date; end: Date };
  comparison?: { start: Date; end: Date };
  granularity: 'hour' | 'day' | 'week' | 'month';
  segments?: string[]; // user groups, regions, products
  team?: string;
}

// Filters apply globally to all widgets on the dashboard
// Individual widgets can override specific filters
```

### Filter UX

- Date range picker with presets (Today, Last 7 days, Last 30 days, Custom)
- Comparison toggle (vs. previous period, vs. same period last year)
- Segment filters persist across navigation
- URL reflects current filters (shareable links)
- Filter summary visible at all times

## Export

### Export Options

| Format | Use Case |
|--------|----------|
| CSV | Raw data for spreadsheet analysis |
| PDF | Reports for stakeholders |
| PNG/SVG | Individual charts for presentations |
| Scheduled email | Automated daily/weekly reports |
| API | Programmatic access for BI tools |

### Implementation

```typescript
// Server-side export for large datasets
app.post('/api/export', async (req, res) => {
  const { format, filters, widgets } = req.body;

  if (estimateRowCount(filters) > 10_000) {
    // Large export: queue and email
    await queue.add('export', { format, filters, widgets, userId: req.userId });
    return res.json({ status: 'processing', message: 'Export will be emailed' });
  }

  // Small export: generate inline
  const data = await generateExport(format, filters, widgets);
  res.setHeader('Content-Type', getMimeType(format));
  res.send(data);
});
```

## Permissions

### Dashboard Access Levels

| Level | Can View | Can Edit | Can Share |
|-------|----------|----------|-----------|
| Viewer | Assigned dashboards | No | No |
| Editor | All team dashboards | Own dashboards | Team |
| Admin | All dashboards | All dashboards | Anyone |

### Data Scoping

```typescript
// Widgets respect user permissions
async function getWidgetData(widget: Widget, user: User): Promise<WidgetData> {
  const baseQuery = widget.query;
  const scopedQuery = applyScopeFilter(baseQuery, user.role, user.teamId);
  return executeQuery(scopedQuery);
}
```

- Sales rep sees their own numbers
- Manager sees team numbers
- Executive sees company-wide
- Same dashboard, different data scope

## Widget System

### Widget Types

```typescript
interface Widget {
  id: string;
  type: 'kpi' | 'line_chart' | 'bar_chart' | 'table' | 'map' | 'text';
  title: string;
  dataSource: DataQuery;
  config: WidgetConfig; // chart options, formatting, thresholds
  position: { x: number; y: number; w: number; h: number }; // grid position
  refreshInterval?: number;
}
```

### Dashboard Layout

- Grid-based layout (12 columns, arbitrary rows)
- Drag-and-drop positioning
- Responsive: widgets reflow on smaller screens
- Default layouts for common use cases (sales, marketing, engineering)
- User can customize (clone template, modify)

## Performance

### Loading Strategy

```
1. Dashboard shell loads (layout, empty widget containers)
2. KPI cards load first (smallest, most important)
3. Charts load in viewport order (top to bottom)
4. Below-fold widgets load on scroll (intersection observer)
5. Heavy widgets (tables, maps) load last
```

### Caching

- Cache aggregated results (not raw data)
- Invalidate on new data arrival (event-driven)
- Different TTLs per freshness tier
- Pre-compute daily/weekly aggregations on schedule

### Query Optimization

- Pre-aggregate data into rollup tables
- Use materialized views for expensive aggregations
- Limit date ranges (max 1 year per query)
- Paginate table widgets
- Cancel in-flight requests when filters change

## Anti-Patterns

- **Loading all data on page load** — progressive loading based on viewport
- **Real-time everything** — most dashboard data doesn't need sub-second freshness
- **No date range limits** — querying years of data kills the database
- **Dashboard as configuration** — dashboards show data, not configure systems
- **Too many widgets** — 5-8 widgets per view. More needs sub-pages.
- **No empty states** — new users see a blank dashboard with no guidance
- **Client-side aggregation** — aggregate on the server/DB, not in the browser
