# API Reference

**Status:** Feature 1 auth, Feature 2 Google login, Feature 3 user management, Feature 4 vehicle CRUD, and Feature 8 requests are implemented. Mount path is `/api`.

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
| `GET` | `/api/vehicle-t3/vehicles/` | Yes (`admin` or `maintenance`) | List all vehicles | Feature 4 |
| `GET` | `/api/vehicle-t3/vehicles/:vin` | Yes (`admin` or `maintenance`) | Get one vehicle by VIN | Feature 4 |
| `PUT` | `/api/vehicle-t3/vehicles/` | Yes (`admin` or `maintenance`) | Create a vehicle | Feature 4 |
| `POST` | `/api/vehicle-t3/vehicles/:vin` | Yes (`admin` or `maintenance`) | Update a vehicle | Feature 4 |
| `DELETE` | `/api/vehicle-t3/vehicles/:vin` | Yes (`admin` or `maintenance`) | Delete a vehicle | Feature 4 |
| `GET` | `/api/vehicle-t3/fuels/` | Yes (`admin` or `maintenance`) | List fuel types | Feature 4 |
| `POST` | `/api/vehicle-t3/fuels/` | Yes (`admin` or `maintenance`) | Create a fuel type | Feature 4 |
| `GET` | `/api/vehicle-t3/maintenance-info` | Yes (`admin` or `maintenance`) | Look up maintenance info by `make`, `model`, `year` | Feature 4 |
| `PUT` | `/api/vehicle-t3/maintenance-info` | Yes (`admin` or `maintenance`) | Create maintenance info for `make`, `model`, `year` | Feature 4 |
| `GET` | `/api/vehicle-t3/areas/` | Yes (`admin` or `maintenance`) | List areas for vehicle forms/filters | Feature 4 |
| `GET` | `/api/vehicles` | Yes | Vehicle choices for a request: `vehicleId`, `license`, `make`, `model` | Feature 8 |
| `GET` | `/api/drivers` | Yes | Driver choices: `driverId`, `name` | Feature 8 |
| `GET` | `/api/destinations` | Yes | Destination choices: `destId`, `name` | Feature 8 |
| `GET` | `/api/requests` | Yes | The caller's requests. An admin receives every request | Feature 8 |
| `GET` | `/api/requests/:requestId` | Yes | One accessible request, or `404` | Feature 8 |
| `POST` | `/api/requests` | Yes | Create a trip, or a maintenance request when the caller is an admin | Feature 8 |
| `PUT` | `/api/requests/:requestId` | Yes | Update a request without changing `requestType` or `requesterId` | Feature 8 |
| `DELETE` | `/api/requests/:requestId` | Yes | Delete an accessible request. Success is `204` | Feature 8 |

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

### Feature 4 — Vehicle CRUD (`/api/vehicle-t3`)

Roles other than `admin` and `maintenance` receive **401** `{ "message": "Unauthorized user" }`.

**Create vehicle body (`PUT /vehicles/`):**

```json
{
  "vin": "12345671234567123",
  "make": "Honda",
  "model": "Accord",
  "year": 2014,
  "purchased_date": "2015/12/16",
  "color": "White",
  "license_plate_num": "ABC344",
  "tag_exp_month": "2016/5/25",
  "area_id": 5,
  "most_recent_dest_id": null,
  "available": 1,
  "mileage": 0
}
```

`vin` is stored as a 17-digit string. Create success is **201** `{ "message": "Successfully created vehicle." }`. Update success is **201** `{ "message": "Successfully updated vehicle." }`. List success is **200** `{ "message": "Successfully retreived all vehicles", "vehicles": [...] }`.

| Situation | Status | `message` |
| --- | --- | --- |
| Missing required vehicle field | 400 | `(attribute) is required` |
| Year outside 1900–current year | 400 | `Select a year between 1900-Today` |
| Duplicate VIN on create | 409 | `A vehicle with this VIN already exists.` |
| Duplicate license plate | 409 | `A vehicle already has license number (plate)` |
| Vehicle VIN not found | 404 | `Vehicle with vin={vin} not found.` |

**Create fuel:** `POST /fuels/` body `{ "fuel_type": "87 Octane" }` → **201** `{ "message": "Successfully created fuel type.", "fuel_id": 1, "fuel_type": "87 Octane" }`.

**Create maintenance info:** `PUT /maintenance-info?make=&model=&year=` with body fields `fuel_type_id`, `fuel_capacity`, `recommended_tire_psi`, `tire_type` (and optional `oil_viscosity`, default `5W4`) → **201** `{ "message": "Successfully created maintenance-info." }`.

### Feature 5 — Maintenance Info CRUD (`/api/vehicle-t3`)

Same `admin` / `maintenance` guard as Feature 4 (`401` `Unauthorized user` otherwise).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/maintenance-infos?make=&model=&year=` | Read maintenance info (alias of Feature 4 `GET /maintenance-info`) |
| `PUT` | `/maintenance-infos?make=&model=&year=` | Update maintenance info → **200** `{ "message": "Successfully updated maintenance-info." }` |
| `POST` | `/maintenance-info/` | Create maintenance info → **201** |
| `GET` | `/requests/:vehicle_id` | Requests for a vehicle VIN |
| `GET` | `/notes/:request_id` | Notes for a request |
| `POST` | `/notes/` | Create note → **201** `{ "message": "Successfully created maintenance note.", "note_id": … }` |
| `PUT` | `/notes/:note_id` | Update note → **201** |
| `DELETE` | `/notes/:note_id` | Delete note → **200** `Successfully deleted…` |
| `POST` | `/vehicle-service-logs/` | Create service log when completing a note → **201** |
| `PUT` | `/vehicles/:vin` | Partial update (mileage and/or make/model/year) → **200** |
| `PUT` | `/fuels/:fuel_id` | Update fuel type → **200** |
| `DELETE` | `/fuels/:fuel_id` | Delete fuel type → **200** |

Missing `request_id` on create note returns **404**. Missing note/fuel/vehicle returns **404**.
