# Playbook: Build an AI Chat App

AI chat apps have unique engineering challenges: streaming responses, token management, cost control, and handling the inherent unpredictability of LLM outputs.

## Streaming Responses

### Server-Sent Events (SSE)

```typescript
// Server: stream response as tokens arrive
app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: req.body.messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
});
```

### Client-Side Streaming

```typescript
// Client: consume SSE stream
async function streamChat(messages: Message[]) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6); // remove "data: "
      if (data === '[DONE]') return;
      const { content } = JSON.parse(data);
      appendToUI(content); // render incrementally
    }
  }
}
```

### Streaming UX

- Show typing indicator before first token arrives
- Render markdown incrementally (not after complete)
- Allow user to stop generation mid-stream
- Show "generating..." state clearly
- Handle connection drops gracefully (reconnect or show error)

## Token Management

### Context Window Strategy

```typescript
const MAX_CONTEXT_TOKENS = 8000;  // leave room for response
const MAX_RESPONSE_TOKENS = 4000;

function prepareMessages(conversation: Message[]): Message[] {
  let totalTokens = 0;
  const messages: Message[] = [];

  // Always include system prompt
  messages.push(systemPrompt);
  totalTokens += countTokens(systemPrompt);

  // Include messages from newest to oldest until budget exhausted
  for (const msg of conversation.reverse()) {
    const msgTokens = countTokens(msg);
    if (totalTokens + msgTokens > MAX_CONTEXT_TOKENS) break;
    messages.unshift(msg);
    totalTokens += msgTokens;
  }

  return messages;
}
```

### Token Counting

```typescript
// Use tiktoken for accurate counts (or estimate at 4 chars per token)
import { encoding_for_model } from 'tiktoken';

function countTokens(text: string, model = 'gpt-4'): number {
  const enc = encoding_for_model(model);
  return enc.encode(text).length;
}
```

### Long Conversation Strategies

| Strategy | When | Trade-off |
|----------|------|-----------|
| Truncate oldest | Simple apps | Loses early context |
| Summarize history | Complex conversations | Adds latency, costs tokens |
| RAG over history | Large knowledge bases | Complex, needs vector DB |
| Sliding window + summary | Best balance | Summary of old + recent verbatim |

## Conversation History

### Storage

```sql
conversations (id, user_id, title, model, created_at, updated_at)
messages (id, conversation_id, role, content, tokens_used, model, created_at)
```

### History Management

- Generate title from first few messages (async, after first response)
- Allow users to edit/delete messages (regenerate from that point)
- Branching: let users try different responses from same point
- Export: allow conversation download (JSON, markdown)
- Retention: auto-archive conversations older than 90 days

## Rate Limiting

### Per-User Limits

```typescript
const RATE_LIMITS = {
  free: { requestsPerMinute: 5, tokensPerDay: 10_000 },
  pro: { requestsPerMinute: 30, tokensPerDay: 500_000 },
  enterprise: { requestsPerMinute: 100, tokensPerDay: 5_000_000 },
};

// Sliding window rate limiter
async function checkRateLimit(userId: string, plan: Plan): Promise<boolean> {
  const limits = RATE_LIMITS[plan];
  const recentRequests = await redis.zcount(
    `ratelimit:${userId}`,
    Date.now() - 60_000,
    Date.now()
  );
  return recentRequests < limits.requestsPerMinute;
}
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 28
X-RateLimit-Reset: 1710523200
```

## Cost Control

### Cost Tracking

```typescript
// Track cost per request
async function trackUsage(userId: string, usage: TokenUsage) {
  const cost = calculateCost(usage.model, usage.promptTokens, usage.completionTokens);

  await db.insert('usage_records', {
    userId,
    model: usage.model,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    costCents: Math.ceil(cost * 100),
    timestamp: new Date(),
  });
}
```

### Cost Control Strategies

| Strategy | Implementation |
|----------|----------------|
| Hard spending cap | Block requests after daily/monthly limit |
| Model routing | Use cheaper models for simple queries |
| Prompt caching | Cache identical system prompts |
| Response caching | Cache identical question/answer pairs |
| Max response length | Set max_tokens per request |
| Usage alerts | Notify user at 80% of quota |

### Model Routing

```typescript
// Route to appropriate model based on task
function selectModel(message: string, context: Context): string {
  if (context.requiresReasoning) return 'gpt-4';
  if (message.length < 100 && !context.complex) return 'gpt-3.5-turbo';
  return 'gpt-4'; // default to capable model
}
```

## Structured Output

### Forcing JSON Responses

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
  response_format: { type: 'json_object' },
  // Or use function calling for structured extraction
});
```

### Validation

```typescript
import { z } from 'zod';

const ResponseSchema = z.object({
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()).optional(),
});

// Always validate LLM output
function parseResponse(raw: string): ParsedResponse {
  try {
    const parsed = JSON.parse(raw);
    return ResponseSchema.parse(parsed);
  } catch (e) {
    // Fallback: treat as plain text
    return { answer: raw, confidence: 0, sources: [] };
  }
}
```

## Error Handling

| Error | Handling |
|-------|----------|
| Rate limited by provider (429) | Retry with exponential backoff, show "busy" to user |
| Context too long | Truncate history, retry |
| Invalid response | Retry once, show generic message |
| Provider outage | Failover to secondary provider or queue request |
| Timeout | Show partial response + "generation interrupted" |
| Content filtered | Show "I can't help with that" message |

## Architecture

```
Client → API Gateway → Chat Service → LLM Provider
                           │                 │
                           ├── Vector DB (RAG)
                           ├── Cache (Redis)
                           ├── Message Store (DB)
                           └── Usage Tracker
```

## Anti-Patterns

- **No streaming** — users stare at a blank screen for 10+ seconds
- **Sending entire history every time** — context window overflow, wasted tokens
- **No cost tracking** — surprise $10K bills
- **Trusting LLM output format** — always validate and handle malformed responses
- **No rate limiting** — one user can burn your entire API budget
- **Synchronous only** — long generations should be streamable and cancellable
- **No fallback for outages** — LLM providers have downtime, plan for it
- **Storing prompts insecurely** — system prompts may contain sensitive business logic
