import { clerkMiddleware } from '@clerk/nextjs/server';

// Starter Clerk middleware for {{PROJECT_NAME}}.
// Move this into your Next.js app root when integrating Clerk.
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
