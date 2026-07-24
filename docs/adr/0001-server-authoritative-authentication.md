# Make authentication server-authoritative

Keepel treats the server-side Supabase SSR integration as the authority for creating, refreshing, validating, and destroying authentication sessions. The browser receives only a reactive `CurrentUser` projection from application commands, while necessary Supabase SSR cookies hold session material for the existing browser data client to perform RLS-protected CRUD. Tokens are never returned in command results, placed in URLs or local storage, or broadcast between tabs.

## Consequences

- The shared interface exposes only typed constants and discriminated contracts for `CurrentUser`, authentication state, command results, signup outcomes, and recoverable errors. Supabase clients, sessions, tokens, and database profiles remain private implementation details.
- Email/password login, signup, Google OAuth, callback handling, and logout execute on the server. Signup explicitly supports both immediate authentication and required email confirmation; normal logout affects the local session, while a future "sign out all devices" action must opt into global scope.
- `proxy.ts` uses verified claims for fast navigation checks. Server Actions and Route Handlers that access private data validate the user against Supabase Auth, with RLS as the final authorization boundary.
- The current browser Supabase client reads the necessary SSR session cookie for direct database requests. That cookie is intentionally not `HttpOnly`; making it `HttpOnly` requires a separate migration of browser data access behind server commands.
- Client tabs synchronize by broadcasting invalidation events only. Session expiration is handled centrally by invalidating the projection and refreshing the route; authentication data is never broadcast.
- Profile loading, anonymous analytics, form pending state, and translated error messages remain outside the authentication core. Return paths pass through one same-origin redirect sanitizer.
