# API Reference

**Status:** Feature 1 auth, Feature 2 Google login, and Feature 3 user management are implemented. Mount path is `/api`.

Flat JSON responses (no `{ success, data }` envelope). Errors are `{ "message": "..." }`. Protected routes read `Authorization: Bearer <session token>`.

## Endpoints

| Method | Endpoint | Auth | Purpose | Introduced |
| --- | --- | --- | --- | --- |
| `POST` | `/api/register` | No | Create an email/password account and a session | Feature 1 |
| `POST` | `/api/login` | No (Basic email:password) | Sign in and create or reuse a session | Feature 1 |
| `POST` | `/api/google` | No | Verify a Google ID token, then create or reuse a user and session | Feature 2 |
| `POST` | `/api/logout` | Yes (`Bearer` session token) | Delete the caller's current session | Feature 1 |
| `GET` | `/api/users` | Yes (`Bearer` session token, role `admin`) | List every user's account fields | Feature 3 |
| `PUT` | `/api/users/:id` | Yes (`Bearer` session token, role `admin`) | Update one user's name, email, and role | Feature 3 |

A missing or expired Bearer token returns **401** `{ "message": "Unauthorized!" }` and the handler does not run.

### `POST /api/register`

```json
{
  "firstName": "Danny",
  "lastName": "Devito",
  "email": "DDevito@example.com",
  "password": "a-valid-password"
}
```

Success is the login payload below. Role is `user`. Duplicate email is **409** `"Email already in use!"` and does not start a session.

### `POST /api/login`

`Authorization: Basic <base64(email:password)>`. No JSON body is required.

Unknown email is **401** `"User not found!"`. Wrong password, including a Google-only account with a null password, is **401** `"Invalid password!"`. Neither starts a new session.

### `POST /api/google`

```json
{
  "idToken": "<google-id-token>"
}
```

The server reads `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the environment. It verifies the ID token (signature, issuer `https://accounts.google.com` or `accounts.google.com`, audience equal to `GOOGLE_CLIENT_ID`, expiration, and `email_verified` true) before it creates or reuses a user or session. Email and name come from that verified token.

| Situation | Status | `message` |
| --- | --- | --- |
| Missing ID token | 400 | `Google sign-in failed.` |
| Invalid, expired, wrong audience, or unverified email | 401 | `Google sign-in failed.` |
| Verified token missing given name or family name | 400 | `Google did not provide a name.` |
| Email already belongs to a password account | 409 | `Email already in use!` |

The **409** case does not start a session and does not change that user.

### Login success payload

Returned by `POST /api/register`, `POST /api/login`, and `POST /api/google`. Never includes `password`, `googleSub`, or a Google token.

```json
{
  "id": 1,
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "role": "user",
  "token": "<session-token>"
}
```

A later Google sign-in for the same `googleSub` returns the same user id and reuses a non-expired session token.

### `POST /api/logout`

Success: `{ "message": "Logged out successfully." }`

The session row for that Bearer token is deleted.

### `GET /api/users`

Admin only. Success is a JSON array ordered by `lastName` A–Z. Each item is only:

```json
{
  "id": 1,
  "firstName": "Danny",
  "lastName": "Devito",
  "email": "DDevito@example.com",
  "role": "user"
}
```

`password`, `googleSub`, and session tokens are not included. A signed-in role other than `admin` is **403** `{ "message": "Admin access required." }` and returns no rows.

### `PUT /api/users/:id`

Admin only. Body:

```json
{
  "firstName": "Danny",
  "lastName": "Devito",
  "email": "DDevito@example.com",
  "role": "driver"
}
```

Success is **200** and the same flat user object as a list item. `password` and `googleSub` in the body are ignored and are not changed. Changing `email` updates that user's `sessions.email` values and leaves the session tokens valid.

| Situation | Status | `message` |
| --- | --- | --- |
| Signed in, role is not `admin` | 403 | `Admin access required.` |
| Empty first name, last name, or email, or a role other than `user`, `driver`, `maintenance`, or `admin` | 400 | `First name, last name, email, and a valid role are required.` |
| Admin changes their own role | 400 | `You cannot change your own role.` |
| Email already belongs to another user | 409 | `Email already in use!` |
| User id does not exist | 404 | `User with id={id} not found.` |

The **400**, **403**, **404**, and **409** cases do not change the user.
