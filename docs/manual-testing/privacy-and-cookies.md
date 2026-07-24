# Privacy and cookies production verification

Run this checklist on a preview first and repeat it on `https://keepel.chemicaldev.com` before releasing policy version 1.0.

## Configuration

- Set distinct high-entropy values for `KEEPEL_CONSENT_SIGNING_SECRET` and `KEEPEL_RATE_LIMIT_HMAC_SECRET`.
- Configure `OPENPANEL_API_URL`, `OPENPANEL_SERVER_CLIENT_ID`, and `OPENPANEL_SERVER_CLIENT_SECRET` for the Spain-hosted writer.
- Set `APP_BASE_URL=https://keepel.chemicaldev.com` in production.
- Confirm Supabase and Upstash are in Frankfurt.
- Confirm OpenPanel event retention is at most 13 months, server logs 30 days, and backups 90 days.

## Cloudflare

1. Disable Network Error Logging for the production zone.
2. Clear relevant configuration/cache and request the public site again.
3. Confirm response headers contain neither `NEL` nor a `Report-To` group named `cf-nel`.
4. Confirm `Strict-Transport-Security: max-age=31536000; includeSubDomains` is present at the public edge.
5. Confirm the origin rejects or restricts traffic that bypasses Cloudflare.
6. Trigger any configured WAF/bot challenge in a clean browser and record every conditional Cloudflare cookie, its purpose, flags, and duration. Reconcile the result with `/privacidad`.

## Consent behavior

1. Use a clean browser profile and open `/privacidad` and `/` without signing in.
2. Confirm the banner appears, both choices are equally visible, and keyboard focus remains usable.
3. Reject analytics and reload. Confirm the banner stays hidden and the `keepel_privacy_consent` cookie is `HttpOnly`, `SameSite=Lax`, `Secure`, and expires within 12 months.
4. Open **Configurar cookies** from the footer, accept analytics, and reload.
5. Withdraw consent again and confirm later successful operations do not produce events.
6. Tamper with or delete the preference cookie and confirm analytics fails closed and the banner returns.

## Browser analytics boundary

- No request loads `openpanel.dev` or an OpenPanel browser script.
- No browser request goes directly to `openpanel.chemicaldev.com`.
- No OpenPanel key appears in local storage or session storage.
- OpenPanel receives no profile, email, name, account ID, vehicle ID, maintenance ID, VIN, registration plate, path, referrer, visitor IP, or visitor user-agent.

With accepted consent, verify one property-free server event after each successful supported action. With rejected consent, verify none.

## Necessary-cookie inventory

Check in a clean profile:

- Anonymous visit: no Supabase session cookie.
- Email login: `sb-<project>-auth-token` and any chunk variants use `Secure`, `SameSite=Lax`, and `Path=/`.
- Google initiation: the PKCE verifier is `HttpOnly`, `Secure`, `SameSite=Lax`, and expires within 10 minutes.
- Google completion: the verifier is removed and the session cookie is established.
- Logout: the Supabase session cookie is cleared.
- Cloudflare challenge: conditional security cookies match the published description.

## Rights-process dry run

- Send a test message to `privacidad@keepel.dev` from a test account email.
- Produce and review a JSON/CSV export for that account.
- Delete the test Supabase Auth user and verify cascaded removal from all user-owned tables.
- Record completion in the privacy operations log without retaining the exported personal data.

## Release gate

- `/privacidad` is public, indexable, canonical, in the sitemap, and has one H1.
- Footer privacy/settings controls are available on public, authentication, and authenticated pages.
- Signup shows the informational notice without a checkbox.
- Provider names, regions, cookie durations, and retention periods match verified production settings.
- A Spain/EEA legal professional has reviewed the final copy.
