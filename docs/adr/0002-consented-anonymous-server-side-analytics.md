# Use consented anonymous server-side analytics

Keepel records analytics only after prior consent stored in a signed, versioned first-party cookie. The browser never loads an analytics SDK or contacts OpenPanel. The Keepel server may send one of three property-free authentication success-event names to the self-hosted OpenPanel instance in Spain, without profiles, account or resource identifiers, paths, referrers, visitor IP addresses, or browser user agents.

## Consequences

- Missing, rejected, expired, malformed, or unverifiable consent disables analytics. Accept and reject controls have equal prominence, and the choice can be changed from the global footer.
- The event allowlist contains only successful email login, Google login, and logout counters. These outcomes are verified by server-owned authentication commands; browser-side CRUD is deliberately excluded because a separate telemetry action could not prove that a mutation succeeded.
- Consent is checked on the server immediately before best-effort delivery. Analytics failures never alter authentication outcomes.
- OpenPanel does not hold identified profiles, so withdrawing consent stops future events rather than triggering per-profile deletion. Anonymous events expire after a maximum of 13 months.
- Adding browser analytics, persistent identifiers, new properties, or new event categories requires reopening this decision and updating the privacy notice before collection begins.
