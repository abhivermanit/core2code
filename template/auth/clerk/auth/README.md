# {{PROJECT_NAME}} — Authentication (Clerk)

This project uses [Clerk](https://clerk.com) for authentication.

## Setup

1. Create an application at https://dashboard.clerk.com
2. Copy the API keys into your environment:
   - Frontend (`frontend/.env.local`): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Backend (`backend/.env`): `CLERK_SECRET_KEY`
3. Copy `.env.example` values as a reference.

## Frontend integration

Wrap the app in `<ClerkProvider>` and protect routes with `middleware.ts`
(a starter is provided in this folder — move it into `frontend/` when wiring Clerk).
