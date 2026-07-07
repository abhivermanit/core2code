# Playbook: Build a Marketplace

Marketplaces have a unique challenge: you're building for two user types simultaneously, and neither side has value without the other.

## Two-Sided Architecture

### User Types

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'buyer', 'seller', 'both'
  status TEXT DEFAULT 'active',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

seller_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  display_name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  rating_avg DECIMAL(3,2),
  rating_count INT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  payout_account_id TEXT, -- Stripe Connect account
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Seller Onboarding

```
1. Sign up as seller
2. Identity verification (KYC if handling money)
3. Profile setup (name, description, photo)
4. Payment setup (Stripe Connect onboarding)
5. First listing creation
6. Listing review/approval (if moderated)
7. Live on marketplace
```

## Listings

### Data Model

```sql
listings (
  id UUID PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  price_cents INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft', -- draft, pending_review, active, paused, sold, removed
  condition TEXT, -- 'new', 'like_new', 'good', 'fair'
  images TEXT[], -- array of URLs
  attributes JSONB, -- category-specific fields
  location GEOGRAPHY, -- for local marketplaces
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Listing Lifecycle

```
Draft → Submit for Review → Approved/Rejected → Active → Sold/Paused/Removed
```

### Moderation

- New sellers: first 3 listings manually reviewed
- Established sellers: spot-check 10% of listings
- Automated checks: prohibited items, spam, duplicate detection
- Report system: buyers can flag listings
- Appeal process: sellers can contest removal

## Search and Discovery

### Search Requirements

- Full-text search with typo tolerance
- Category navigation (hierarchical)
- Filters: price range, condition, location, rating
- Sort: relevance, price, newest, best-selling
- Saved searches with notifications ("alert me when...")

### Search Implementation

```
Typesense/Elasticsearch index:
  - title (searchable, high weight)
  - description (searchable, lower weight)
  - category (filterable)
  - price (filterable, sortable)
  - location (geo-filterable)
  - seller_rating (sortable)
  - created_at (sortable)
  - attributes.* (filterable)
```

### Ranking Algorithm

```
Score = relevance_score
  + (seller_rating * 0.2)
  + (recency_boost * 0.1)
  + (completion_boost * 0.1)  // listings with more photos/details
  - (report_penalty * 0.3)
```

## Reviews and Ratings

### Data Model

```sql
reviews (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  order_id UUID REFERENCES orders(id), -- only verified purchases can review
  reviewer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  images TEXT[],
  verified_purchase BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active', -- active, flagged, removed
  seller_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Review Rules

- Only verified buyers can leave reviews (purchased + received)
- Review window: 7-60 days after delivery
- Sellers can respond publicly (once per review)
- Reviews are modifiable for 48 hours after posting
- Fraudulent review detection (same IP, bulk reviews, quid pro quo)

## Payment Split

### Stripe Connect

```typescript
// Create payment with automatic split
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalCents,
  currency: 'usd',
  application_fee_amount: calculatePlatformFee(totalCents), // your cut
  transfer_data: {
    destination: seller.stripeConnectAccountId, // seller gets the rest
  },
  metadata: { orderId, listingId },
});
```

### Fee Structure

| Component | Recipient | Example |
|-----------|-----------|---------|
| Platform fee | You | 10-15% of transaction |
| Payment processing | Stripe | 2.9% + $0.30 |
| Seller payout | Seller | Remainder |

### Payout Schedule

```
Transaction confirmed
  → Hold period (7-14 days for new sellers, 2-3 days for established)
  → Payout to seller bank account
  → Settlement (2-3 business days)
```

Hold periods protect against:
- Buyer disputes (chargebacks)
- Fraudulent sellers
- Delivery issues

## Trust and Safety

### Verification Layers

| Layer | What | When |
|-------|------|------|
| Email verification | Confirm email ownership | Sign up |
| Phone verification | SMS code | Before first transaction |
| Identity verification | Government ID | Sellers, high-value transactions |
| Payment verification | Bank account ownership | Seller onboarding |
| Address verification | Confirmed shipping address | Before shipping |

### Fraud Detection

```typescript
// Risk scoring for transactions
function calculateRiskScore(order: Order): number {
  let risk = 0;
  
  if (order.buyer.accountAge < 7) risk += 20;  // new account
  if (order.amount > 500_00) risk += 15;        // high value
  if (order.buyer.previousOrders === 0) risk += 10; // first purchase
  if (order.shippingAddress !== order.billingAddress) risk += 10;
  if (order.seller.disputeRate > 0.05) risk += 25; // seller has dispute history
  
  return risk; // > 50 = manual review, > 80 = block
}
```

### Dispute Resolution

```
Buyer opens dispute
  → Seller has 48h to respond
  → Platform mediates if unresolved
  → Resolution: refund, partial refund, or dismiss
  → If pattern: flag account for review
```

## Messaging

- In-platform messaging between buyer and seller
- Pre-purchase questions about listings
- Post-purchase coordination (shipping, delivery)
- Never expose personal email/phone (use platform messaging)
- Report and block functionality
- Automated messages (order confirmed, shipped, delivered)

## Anti-Patterns

- **No escrow/hold period** — seller gets paid instantly, scams and runs
- **No moderation** — marketplace fills with spam and prohibited items
- **Direct payment between parties** — lose all protection and revenue
- **Reviews without verification** — fake reviews destroy trust
- **No dispute resolution** — buyers go straight to chargebacks (expensive)
- **Exposing contact info** — users transact off-platform, you lose the fee
- **Same UX for buyers and sellers** — different needs, different journeys
- **No seller quality signals** — buyers can't distinguish good from bad sellers
