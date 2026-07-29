# Wise Agent API reference

Canonical docs: [https://wiseagent.com/docs/api.asp](https://wiseagent.com/docs/api.asp)

Base API URL:

```
https://sync.thewiseagent.com/http/webconnect.asp
```

Auth hosts use `sync.wiseagent.com` (no `the`).

## Headers (API calls)

| Header | Value |
| --- | --- |
| `Authorization` | `Bearer <access_token>` |
| `Accept` | `application/json` |
| `Content-Type` | `application/x-www-form-urlencoded` |

## OAuth 2.0 (authorization code)

Request client ID/secret from Wise Agent with: application name, public logo URL, redirect domain, scopes.

### Scopes

| Scope | Use |
| --- | --- |
| `profile` | User profile; `getPipelines` |
| `team` | Inside/outside team; lead assignment IDs |
| `contacts` | Create/read/update contacts (required for leads) |
| `marketing` | Marketing programs |
| `properties` | Properties |
| `calendar` | Calendar / planner |

### Authorize

`GET https://sync.wiseagent.com/WiseAuth/auth`

Query: `client_id`, `redirect_uri`, `response_type=code`, `scope` (space-delimited).

Redirect returns: `code`, `expires_at`, `scope`.

### Token

`POST https://sync.wiseagent.com/WiseAuth/token` (JSON body, **server-only**)

Authorization code exchange:

```json
{
  "client_id": "...",
  "client_secret": "...",
  "code": "...",
  "grant_type": "authorization_code"
}
```

Or `Authorization: Basic base64(client_id:client_secret)`.

Refresh:

```json
{
  "grant_type": "refresh_token",
  "refresh_token": "..."
}
```

Response includes `access_token`, `expires_at`, `refresh_token`.

### Revoke

`POST https://sync.wiseagent.com/WiseAuth/revoke` (`application/x-www-form-urlencoded`): `token`, `token_type_hint=access_token|refresh_token`.

## `webcontact` — create lead/contact

`POST` with `requestType=webcontact` (query or body; docs show both styles; cURL example uses query `?requestType=webcontact`).

### Required

| Field | Notes |
| --- | --- |
| `CFirst` | First name |
| `CLast` | Last name |
| `Source` | Required for automation / lead rules — use distinct values per form |

### Common optional

| Field | Notes |
| --- | --- |
| `CEmail` | Email |
| `MobilePhone` / `WorkPhone` | Phones |
| `HomePhome` | Doc typo for home phone on create — verify against live API; update path uses `HomePhone` |
| `Company`, `Website` | |
| `AddressNumber`, `AddressStreet`, `SuiteNo`, `City`, `State`, `zip`, `country` | Home address |
| `Categories` | Semicolon-delimited, no spaces |
| `Pipeline` | Name or ID from `getPipelines`; `0` = none |
| `InsideTeamId` | From `getTeam` — overrides lead-rule distribution |
| `OutsideTeamAssignment` | Outside team member email from `getOutsideTeam` |
| `AssignedAgent` | Name match inside/outside team |
| `Price` | Interested home price (lead rules) |
| `DNC` | `"Y"` do-not-contact |
| `CommaDelimitedFormFields` | Pulls listed querystring keys into extra details |
| `calltype` | `1` phone, `2` email (default 2 if no phone) |

### Property of interest (not home address)

`paddress`, `pcity`, `pstate`, `pzip`, `pSuiteNo`, `pPOBox`, `pBldgFloor`, `pCounty`, `pCountry`, `pMLS`

Do not duplicate the same values as home address fields in one request.

### Property search profile

Set `propInfo=1` plus optional `propInfoCity`, `propInfoZip`, `propInfoPropType`, `propInfoMinPrice`, `propInfoMaxPrice`, `propInfoMinBeds`, `propInfoMinBaths`, etc.

### Success

```json
{ "success": "true", "data": { "ClientID": 1854784, "NewContact": true } }
```

Existing contact (no full profile update via `webcontact`):

```json
{
  "success": "true",
  "data": {
    "ClientID": 1854784,
    "NewContact": false,
    "Message": "Use 'updateContact' request to update contacts."
  }
}
```

Phones/emails may still be appended when the contact already exists.

## `updateContact`

`POST` `requestType=updateContact` — requires `clientID`. Other contact fields optional.  
`AddCategories` / `RemoveCategories` are CSV. Rank: `A`–`F`, `Unranked`. Status values include `New`, `Hot Lead`, `Nurture`, etc. (see official docs).

## `addContactNote`

`POST` `requestType=addContactNote` — `note`, `subject`, `categories` (CSV), `clientids` (CSV of ClientIDs), optional `InsideTeamId`.

## Useful GETs

All against `webconnect.asp` with `requestType=…` and Bearer token.

| requestType | Scope | Purpose |
| --- | --- | --- |
| `getUser` | `profile` | Connected user |
| `getPipelines` | `profile` | Pipeline ID/Name for assignment |
| `getTeam` | `team` | `InsideTeamId` for assignment |
| `getOutsideTeam` | `team` | Outside assignee emails |
| `getSingleContact` | `contacts` | Fetch by id |
| `getContacts` | `contacts` | List/search |

## Example cURL (from docs)

```bash
curl --location --request POST \
  'https://sync.thewiseagent.com/http/webconnect.asp?requestType=webcontact' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'Authorization: Bearer [access_token]' \
  --header 'Accept: application/json' \
  --data-urlencode 'CFirst=John' \
  --data-urlencode 'CLast=BECKER' \
  --data-urlencode 'CEmail=john@example.com' \
  --data-urlencode 'Source=API' \
  --data-urlencode 'pipeline=Buyer'
```

## Account API key / lead capture email

UI path: Integrations → Settings → API Keys and Lead Email.  
Used by partner integrations and email parsing — not a substitute for documenting OAuth `webcontact` in first-party sync.  
Help article: [API key & lead capture email](https://wise-agent-crm.instantdocsbase.com/help/how-to-locate-your-wise-agent-api-key-and-lead-capture-email).

## Suggested Payload lead ↔ Wise Agent mapping

| Payload (suggested) | Wise Agent |
| --- | --- |
| `firstName` | `CFirst` |
| `lastName` | `CLast` |
| `email` | `CEmail` |
| `phone` | `MobilePhone` |
| `source` / form id | `Source` |
| `message` | `addContactNote.note` |
| listing address / MLS | `paddress` / `pMLS` |
| `wiseAgentClientId` | `data.ClientID` |
