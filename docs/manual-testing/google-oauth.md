# Google OAuth manual verification

Automated tests cover server initiation, PKCE callback exchange, cancellation, stable error mapping, exact scopes, trusted origins, and authenticated UI return. Run them with `bun run test` and `bun run test:e2e`. The real Google consent screen and provider dashboards still require this check.

## Prerequisites

- Enable Google in Supabase Auth.
- Set the Supabase production Site URL to `https://keepel.chemicaldev.com`.
- Add `https://keepel.chemicaldev.com/auth/callback` to the Supabase redirect allow list; keep localhost entries only for development.
- Add the Supabase Auth callback URL shown by the provider settings to the Google OAuth client.
- Configure `APP_BASE_URL=https://keepel.chemicaldev.com` in production.
- Configure Supabase environment variables and start local development with `bun run dev`.

## Successful sign-in

1. Open `http://localhost:3000/auth/login?redirect=/vehicles` in a signed-out browser.
2. Select **Continuar con Google** and complete the Google screen.
3. Confirm that the requested scopes are exactly `openid`, `email`, and `profile`; Keepel must not request offline access, Drive, Calendar, contacts, or other Google services.
4. Confirm that the browser returns to `/vehicles` and the authenticated UI is visible.
5. Reload `/vehicles` and confirm that the session remains authenticated through the necessary Supabase SSR cookie.
6. In developer tools, confirm the flow starts with `GET /auth/google`, no redirect points to localhost in production, and no access token, refresh token, or session appears in local storage, a response body, or a URL.
7. Confirm the PKCE verifier is short-lived, `HttpOnly`, `Secure` in production, and removed after the callback.

## Cancellation

1. Start the flow again in a signed-out browser.
2. Cancel or deny the Google request.
3. Confirm that Keepel opens `/auth/error?error=oauth_cancelled` on the correct application origin.
4. Confirm that the URL and page do not expose Google's error description, authorization code, or any token.
5. Confirm that no anonymous success analytics event is emitted.

## Production callback verification

Request `https://keepel.chemicaldev.com/auth/google` and inspect the Supabase authorization redirect. The encoded `redirect_to` value must begin with `https://keepel.chemicaldev.com/auth/callback`, never `localhost`, an internal container host, or an untrusted origin.
