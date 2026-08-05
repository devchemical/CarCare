# Use one shared shell for authenticated product views

Keepel renders one persistent application shell around authenticated product views while keeping the anonymous landing, guest-only authentication routes, callbacks, and public privacy surfaces outside it. The authenticated dashboard remains at `/`; it and explicitly registered private areas such as `/vehicles*` share the same mounted top bar, desktop navigation rail, mobile drawer, account controls, and main-content boundary. Route membership selects presentation only and never replaces server-side authentication or authorization.

## Consequences

- Future authenticated product areas opt into the shell explicitly. Authentication alone does not place an otherwise public route inside it.
- Navigation changes the main view without remounting the shell. The rail preference survives navigation and reloads; mobile navigation closes after selection, and transient page state does not carry into the next view.
- Private loading, empty, and recoverable error states keep the shell visible. Session expiry redirects to login and removes it.
- `/vehicles/[id]/maintenance` remains part of the Vehicles navigation hierarchy. The obsolete per-vehicle header selector is not carried forward.
- Existing Vehicles and Maintenance content is integrated without a broader visual redesign. Authenticated views omit the public header and footer; discreet Privacy and cookie-preference actions remain available in the shell account area.
- A richer avatar account popover and the missing `/vehicles/[id]` destination used by the dashboard's `Ver vehículo` action remain separate follow-up work.
- Acceptance covers the public/private route matrix, active navigation, shell continuity, responsive and focus behavior, private loading states, privacy controls, legacy-chrome removal, affected end-to-end journeys, and the repository's canonical checks.
