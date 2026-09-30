# Security Specification - Intranet Mota & Advogados

## 1. Data Invariants
1. Only users with an authenticated and verified email from domain `@mota.adv.br` or the designated super-admin email `ti@mota.adv.br` can access or interact with corporate intranet records.
2. Tickets can only be created by an authenticated user where `requesterEmail == request.auth.token.email`.
3. Tickets can only be updated in status or solutionNotes by `ti@mota.adv.br` (TI Admin) or the ticket's creator.
4. Users cannot modify other users' core identity or RBAC roles.
5. All IDs must conform to regex `^[a-zA-Z0-9_\\-]+$` and size <= 128 bytes.
6. Default deny catch-all exists for all unmapped paths.

## 2. The Dirty Dozen Attack Payloads
1. **Unauthenticated Read on Tickets**: An unauthenticated user attempts to list `/tickets`.
2. **Outside Domain Read on Precatórios**: An authenticated user with `@gmail.com` attempts to read `/precatorios`.
3. **Spoofed Requester on Ticket Creation**: An authenticated user `user@mota.adv.br` attempts to create a ticket with `requesterEmail: "ti@mota.adv.br"`.
4. **Unauthorized Status Escalation**: A standard collaborator attempts to change `status: "Resolvido"` on another user's ticket.
5. **Path ID Injection**: Document write to `/tickets/{id}` where `{id}` contains path traversal `../../admin`.
6. **Oversized Field Payload**: Inserting a 500KB string into the `subject` field.
7. **Unverified Email Access**: An account with `email_verified: false` attempts to query `/crm_entities`.
8. **Role Escalation in User Profile**: A standard user updates their own role to `ti_admin` in `/users/{userId}`.
9. **Unauthenticated Write to Announcements**: Anonymous request writing to `/announcements`.
10. **Document Poisoning in Hub**: External non-domain user creating a fraudulent legal document in `/documents`.
11. **Malicious Meeting Injection**: Creating a meeting with an invalid external phishing link without valid authentication.
12. **Catch-All Probe**: Trying to read `/admins/{anyId}` without authorization.
