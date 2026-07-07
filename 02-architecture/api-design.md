# API Design

## Principles

- RESTful resource naming
- Consistent error response format
- Versioned endpoints (URL or header)
- Pagination for list endpoints
- Idempotent mutations where possible

## Base URL

```
https://api.example.com/v1
```

## Authentication

- Method: Bearer token / API key
- Header: `Authorization: Bearer <token>`

## Common Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `X-Request-Id` | Unique request identifier |

## Endpoints

### Resource: [Name]

#### List

```
GET /resources?page=1&limit=20
```

#### Get

```
GET /resources/:id
```

#### Create

```
POST /resources
Body: { ... }
```

#### Update

```
PUT /resources/:id
Body: { ... }
```

#### Delete

```
DELETE /resources/:id
```

## Error Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": {}
  }
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |
