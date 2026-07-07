# Playbook: Build an Ecommerce

Ecommerce is deceptively complex. The happy path is easy. The edge cases around payments, inventory, and fulfillment are where the real engineering happens.

## Cart Management

### Cart Architecture

```typescript
interface Cart {
  id: string;
  userId?: string;         // null for guest carts
  sessionId: string;       // always present
  items: CartItem[];
  appliedCoupons: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;         // auto-cleanup for abandoned carts
}

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  priceAtAdd: number;      // snapshot price when added
  currentPrice: number;    // current price (may differ)
}
```

### Cart Rules

- Cart persists across sessions (cookie/DB-backed, not just memory)
- Guest carts merge into user cart on login
- Price changes are shown to user ("price updated since you added this")
- Out-of-stock items are flagged but not auto-removed
- Cart expiry: 30 days for logged-in users, 7 days for guests
- Never modify cart without explicit user action

## Inventory Management

### Stock Tracking

```
Available = Total - Reserved - Shipped

Reserve stock at checkout start (not at cart add)
Release reservation if payment fails or times out (15 min)
Decrement stock only after payment confirmed
```

### Oversell Prevention

```typescript
// Atomic stock reservation (use DB transaction or atomic operation)
async function reserveStock(productId: string, quantity: number): Promise<boolean> {
  const result = await db.query(`
    UPDATE inventory
    SET reserved = reserved + $2
    WHERE product_id = $1
    AND (available - reserved) >= $2
    RETURNING id
  `, [productId, quantity]);

  return result.rowCount > 0; // false = insufficient stock
}
```

### Inventory Strategies

| Strategy | When | Trade-off |
|----------|------|-----------|
| Hard reserve at checkout | High-value items | Users lose reserved stock if they abandon |
| Soft reserve (time-limited) | General products | 15 min window, then release |
| Allow oversell | Fast-selling events (drops) | Handle backorders manually |
| Pre-order | Not yet available | Set clear expectations |

## Payment Processing

### Payment Flow

```
Cart → Checkout → Create Payment Intent → Confirm → Fulfill
                                    │
                                    └── Failed → Retry or notify user
```

### Critical Rules

1. **Idempotency keys on every payment request** — prevent double charges
2. **Never store full card numbers** — use tokenization (Stripe)
3. **Handle webhooks** — don't rely on redirect callback alone
4. **Verify amount server-side** — never trust client-submitted totals
5. **Record every payment event** — create audit trail

```typescript
// Idempotent payment processing
async function processPayment(order: Order) {
  const idempotencyKey = `payment-${order.id}`; // same order = same key

  const intent = await stripe.paymentIntents.create({
    amount: order.totalCents,
    currency: 'usd',
    metadata: { orderId: order.id },
  }, {
    idempotencyKey, // Stripe deduplicates
  });

  return intent;
}
```

### Payment States

```
pending → processing → succeeded → captured
              │
              └── failed → retry / abandoned
                    │
                    └── disputed → evidence submitted → won/lost
```

### Webhook Handling

```typescript
// Handle payment webhooks idempotently
app.post('/webhooks/stripe', async (req, res) => {
  const event = verifyWebhookSignature(req);

  // Idempotent: check if already processed
  if (await isEventProcessed(event.id)) {
    return res.json({ received: true });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await fulfillOrder(event.data.object.metadata.orderId);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object.metadata.orderId);
      break;
    case 'charge.refunded':
      await processRefund(event.data.object);
      break;
  }

  await markEventProcessed(event.id);
  res.json({ received: true });
});
```

## Shipping

### Shipping Architecture

```
Order placed → Calculate shipping → Label created → Shipped → Tracking → Delivered
```

### Implementation

- Integrate with shipping APIs (EasyPost, ShipStation, Shippo)
- Calculate rates at checkout (not just flat rate unless intentional)
- Support multiple shipping methods (standard, express, overnight)
- Provide tracking numbers and status updates
- Handle split shipments (multiple packages per order)
- International: customs declarations, duties calculation

## Tax Calculation

**Never implement tax calculation yourself. Use a service.**

| Service | Best For |
|---------|----------|
| Stripe Tax | Already using Stripe |
| TaxJar | US-focused, simple |
| Avalara | Enterprise, international |

### Tax Rules

- Calculate tax at checkout (not cart — jurisdiction depends on shipping address)
- Store tax amount separately from product price
- Handle tax-exempt customers (B2B, non-profits)
- Generate tax reports for filing
- International: VAT, GST, customs duties vary by country

## Refunds

### Refund Types

| Type | When | Inventory |
|------|------|-----------|
| Full refund | Order canceled before ship | Return to stock |
| Partial refund | One item returned | Return item to stock |
| Store credit | Customer preference | N/A |
| Chargeback | Customer disputes with bank | Investigate |

### Refund Implementation

```typescript
async function processRefund(order: Order, items: RefundItem[]) {
  // 1. Calculate refund amount
  const amount = calculateRefundAmount(items);

  // 2. Process refund with payment provider (idempotent)
  await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
    amount: amount,
  }, { idempotencyKey: `refund-${order.id}-${Date.now()}` });

  // 3. Update order status
  await updateOrderStatus(order.id, items.length === order.items.length ? 'refunded' : 'partially_refunded');

  // 4. Return items to inventory (if applicable)
  for (const item of items) {
    await returnToStock(item.productId, item.quantity);
  }

  // 5. Notify customer
  await sendRefundConfirmation(order, amount);
}
```

## Order Lifecycle

```
Draft → Placed → Paid → Fulfilling → Shipped → Delivered → Completed
                  │                                            │
                  ├── Payment Failed → Retry/Cancel            └── Return requested
                  └── Canceled (refund if paid)                     └── Refunded
```

## Data Model

```sql
-- Core ecommerce tables
products (id, name, description, status, created_at)
product_variants (id, product_id, sku, price_cents, attributes)
inventory (variant_id, available, reserved, warehouse_id)
carts (id, user_id, session_id, expires_at)
cart_items (cart_id, variant_id, quantity, price_snapshot_cents)
orders (id, user_id, status, total_cents, tax_cents, shipping_cents)
order_items (order_id, variant_id, quantity, price_cents)
payments (id, order_id, provider, provider_id, amount_cents, status)
shipments (id, order_id, carrier, tracking_number, status)
refunds (id, order_id, payment_id, amount_cents, reason, status)
```

## Anti-Patterns

- **Trusting client-side prices** — always calculate totals server-side
- **No idempotency on payments** — double charges destroy trust
- **Stock check only at cart add** — stock can change between add and checkout
- **Synchronous payment processing** — use webhooks for confirmation
- **No order audit trail** — every state change must be recorded
- **Flat tax rate** — tax varies by jurisdiction, product type, and customer type
- **Building payment processing in-house** — PCI compliance alone costs more than Stripe
