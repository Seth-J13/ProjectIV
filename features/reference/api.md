# API Reference

**Status:** Feature 1 applied.

API mount path is `/api` (see `backend/server.js`).

## Endpoints

| Method | Endpoint | Auth | Purpose | Introduced |
| --- | --- | --- | --- | --- |
| `POST` | `/api/register` | No | Create an account with role `user` and start a session | Feature 1 |
| `POST` | `/api/login` | No (`Basic` email:password) | Sign in and create or reuse a session | Feature 1 |
| `POST` | `/api/logout` | Yes (`Bearer` token) | Delete the caller’s current session | Feature 1 |
| `GET` | `/api/health` | No | Process check | Shell |

**Login:** `Authorization: Basic <base64(email:password)>`. A JSON body is not required.

**Create account request body:**

```json
{
  "firstName": "Danny",
  "lastName": "Devito",
  "email": "DDevito@example.com",
  "password": "a-valid-password"
}
```

**Login and create-account success** (flat JSON, `200`; never includes `password`):

```json
{
  "id": 1,
  "email": "DDevito@example.com",
  "firstName": "Danny",
  "lastName": "Devito",
  "role": "user",
  "token": "<session-token>"
}
```

**Logout success:** `{ "message": "Logged out successfully." }`

**Error response:** `{ "message": "Human-readable explanation." }`

| Situation | Status | `message` |
| --- | --- | --- |
| Unknown email | 401 | `User not found!` |
| Wrong password | 401 | `Invalid password!` |
| Missing email or password on login | 401 | `Email and password are required.` |
| Email already in use | 409 | `Email already in use!` |
| Missing create-account field | 400 | `First name, last name, email, and password are required.` |
| Missing or expired Bearer token | 401 | `Unauthorized!` |

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`.
- The token is a server session row. Logout deletes only that row.
