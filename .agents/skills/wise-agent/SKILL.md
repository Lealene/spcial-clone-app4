---
name: wise-agent
description: Integrate Wise Agent CRM for real estate lead capture. Use when syncing leads/contacts to Wise Agent, building Frontend → Payload Leads → CRM pipelines, or working with Wise Agent lead-capture email, API keys, OAuth, Source, or ClientID fields.
---

# Wise Agent CRM

Official product: [wiseagent.com](https://wiseagent.com/).
Developer API: [wiseagent.com/docs/api.asp](https://wiseagent.com/docs/api.asp).

## Read this first — the account API key cannot call the API

`webconnect.asp` authenticates **only** with an OAuth Bearer token. The account API key (Integrations → Settings → API Keys and Lead Email) does not work with it.

Verified against the live API: a request with **no credential at all** returns exactly the same `permission denied` as one carrying the account key as `key`, `apikey`, `APIKey`, or `token`. Identical responses mean the key is ignored, not rejected. Sent as a Bearer token it returns `401 invalid_client — The OAuth client was not found`.

Corroboration: every `requestType` in the developer docs lists `Required OAuth scopes`, and Wise Agent's own WordPress lead-form plugin uses OAuth + PKCE.

The account API key is for **pre-registered partners** (Real Geeks, Realtor.com, Zapier) to paste into *their* dashboards. It is not a server-side credential.

Do not spend time guessing parameter names. Either complete OAuth or use email parsing.

## Architecture in this repo

```
Frontend form → Payload Leads collection (source of truth) → Wise Agent lead-capture email → CRM
```

Implemented and shipped. See `docs/lead-capture-setup.md`.

- `apps/backend/src/services/wise-agent/lead-email.ts` — builds the parseable email
- `apps/backend/src/jobs/sync-lead-to-wise-agent.ts` — sends it via `payload.sendEmail`
- Transport is SMTP (`@payloadcms/email-nodemailer`), so the provider is an env change

Never call Wise Agent from the browser. Sync after the Payload lead write succeeds, and let a failed sync leave the lead intact for `leads:resync`.

## Path A — email parsing (what this repo uses)

Wise Agent's documented path for custom website forms. No approval needed; works with the lead-capture email address on the account.

Email the account's `…@leads.wiseagent.com` address with one label per line:

```
Source Name: MVP Realty Website - Tour Request
First Name: Jane
Last Name: Ellison
Email Address: jane@example.com
Phone: (239) 555-0148
Extra Details: <message + listing/community/page context, one line>
```

Rules that matter:

- **One line per value.** The parser reads labels line by line; a newline inside a value truncates it.
- **Omit labels with no value.** An empty label carries nothing and clutters the contact's Activity.
- **The whole body is stored on the contact's Activity**, so verbatim text below the labelled block is preserved.
- Supported labels include `Name`, `Source Name`, `First Name`, `Last Name`, `Company`, `Phone Number`, `Phone`, `Extra Details`, `Email Address`, `Street Address`, `City`, `State`, `Website`.

Trade-off: one-way. No `ClientID`, no duplicate-match signal, no delivery confirmation. Treat "mail provider accepted it" as the strongest available status and verify early leads by hand.

If a lead arrives at the address but no contact appears, forward the email to `help@wiseagent.com` and say you are setting up email parsing for a custom website.

## Path B — OAuth `webcontact` (for richer sync later)

Only path that returns a `ClientID` and supports notes, property-of-interest fields, and pipelines. Requires Wise Agent to issue `client_id` / `client_secret` (app name, logo URL, redirect domain, scopes — at least `contacts`).

1. Complete authorization-code OAuth; store `access_token` + `refresh_token` server-side only.
2. `POST` form-urlencoded to `https://sync.thewiseagent.com/http/webconnect.asp` with `Authorization: Bearer <access_token>`, `Accept: application/json`.
3. Required `webcontact` fields: `requestType=webcontact`, `CFirst`, `CLast`, `Source`.
4. Save `data.ClientID` and `data.NewContact` on the Payload lead.
5. `NewContact: false` means Wise Agent matched an existing contact — use `updateContact` with `clientID` to refresh profile fields.
6. On `401` / `invalid_grant`, refresh with `grant_type=refresh_token`.

Full field list and auth flows: [REFERENCE.md](REFERENCE.md).

## Do not

- Call Wise Agent from `apps/web` or expose credentials to the browser.
- Reuse one generic `Source` for every form — automation depends on distinct sources.
- Take `Source` from client input; derive it server-side from the form type.
- Treat `webcontact` as an upsert of all fields when `NewContact: false`.
- Let a failed sync roll back a successful Payload lead write. Retry instead.
