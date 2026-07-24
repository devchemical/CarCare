# Privacy operations runbook

This runbook supports the public commitments in `/privacidad`. It is an operational checklist, not a substitute for legal review.

## Request intake and identity verification

1. Receive the request at `privacidad@keepel.dev`.
2. Record the received date, requested right, account email, handler, and deadline without copying unrelated message content.
3. Ask the requester to reply from the email associated with the Keepel account.
4. Request additional identification only when reasonable doubt remains; do not request an identity document by default.
5. Acknowledge the request and respond within one month. Record any lawful extension and its reason before the first month expires.

## Access and manual portability export

Prepare a JSON or CSV bundle containing only the requester's data:

- Supabase Auth account metadata and profile data.
- Vehicles.
- Maintenance records.
- Scheduled services.
- Current privacy preference, when available.

Review the export for data belonging to another account before delivery. Deliver it through a secure channel and remove temporary export files after confirmed receipt or expiry of the delivery link.

## Rectification

Confirm the field to correct, update the authoritative Supabase record, and verify that related projections display the new value. Authentication-email changes must follow Supabase's verified-email flow.

## Account and data deletion

1. Confirm the request from the account email.
2. Record the deletion deadline, no later than 30 days after verification.
3. Export data first only when the requester also asks for portability.
4. Delete the Supabase Auth user using an authorized administrative process.
5. Verify cascaded removal from `profiles`, `vehicles`, `maintenance_records`, and `scheduled_services`.
6. Confirm that no identified OpenPanel profile exists; analytics is anonymous by design.
7. Record the deletion completion date and notify the requester.
8. Do not restore deleted account data from backup except for disaster recovery. Restored data must re-enter the deletion queue.

## Retention controls

- Active account data: while the account remains active.
- Verified deletion request: remove from active systems within 30 days.
- Backups: expire within 90 days.
- Application and security logs: expire within 30 days.
- OpenPanel anonymous events: expire within 13 months.
- Consent preference: renew or expire within 12 months.
- Upstash operational keys: only for the technical period needed to enforce the configured 60-second login or one-hour signup limit; Upstash analytics remains disabled.

Review retention settings quarterly and after changing any provider.

## Consent withdrawal

The footer control changes the signed preference immediately. Rejection or withdrawal stops future events. Previous OpenPanel events contain no profile or resource identifiers and expire under the 13-month retention rule.

## Material policy changes

1. Prepare the revised policy and legal review.
2. Increment the visible version and consent-policy version when analytics information or choices materially change.
3. Publish the new effective and updated dates.
4. Notify account holders by email using an appropriate delivery tool.
5. Show a versioned in-app notice.
6. Request consent again before any newly optional processing begins.

## Incident handling

Escalate suspected personal-data incidents immediately to the service operator. Preserve only the logs needed to investigate, document affected systems and data, assess notification duties, and contact the AEPD and affected people within applicable deadlines when required.
