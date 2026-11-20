# API Reference

**Status:** Feature 1 auth, Feature 2 Google login, Feature 3 user management, Feature 4 vehicle CRUD, Feature 5 maintenance info, Feature 6 destinations, Feature 7 drivers, Feature 8 requests, and Feature 13 areas are implemented. Mount path is `/api`.

Flat JSON responses (no `{ success, data }` envelope). Errors are `{ "message": "..." }`. Protected routes read `Authorization: Bearer <session token>`.

## Endpoints


| Method   | Endpoint                           | Auth                                       | Purpose                                                           | Introduced |
| -------- | ---------------------------------- | ------------------------------------------ | ----------------------------------------------------------------- | ---------- |
| `POST`   | `/api/register`                    | No                                         | Create an email/password account and a session                    | Feature 1  |
| `POST`   | `/api/login`                       | No (Basic email:password)                  | Sign in and create or reuse a session                             | Feature 1  |
| `POST`   | `/api/google`                      | No                                         | Verify a Google ID token, then create or reuse a user and session | Feature 2  |
| `POST`   | `/api/logout`                      | Yes (`Bearer` session token)               | Delete the caller's current session                               | Feature 1  |
| `GET`    | `/api/users`                       | Yes (`Bearer` session token, role `admin`) | List every user's account fields                                  | Feature 3  |
| `PUT`    | `/api/users/:id`                   | Yes (`Bearer` session token, role `admin`) | Update one user's name, email, and role                           | Feature 3  |
| `GET`    | `/api/vehicle-t3/vehicles/`        | Yes (`admin` or `maintenance`)             | List all vehicles                                                 | Feature 4  |
| `GET`    | `/api/vehicle-t3/vehicles/:vin`    | Yes (`admin` or `maintenance`)             | Get one vehicle by VIN                                            | Feature 4  |
| `PUT`    | `/api/vehicle-t3/vehicles/`        | Yes (`admin` or `maintenance`)             | Create a vehicle                                                  | Feature 4  |
| `POST`   | `/api/vehicle-t3/vehicles/:vin`    | Yes (`admin` or `maintenance`)             | Update a vehicle                                                  | Feature 4  |
| `DELETE` | `/api/vehicle-t3/vehicles/:vin`    | Yes (`admin` or `maintenance`)             | Delete a vehicle                                                  | Feature 4  |
| `GET`    | `/api/vehicle-t3/fuels/`           | Yes (`admin` or `maintenance`)             | List fuel types                                                   | Feature 4  |
| `POST`   | `/api/vehicle-t3/fuels/`           | Yes (`admin` or `maintenance`)             | Create a fuel type                                                | Feature 4  |
| `GET`    | `/api/vehicle-t3/maintenance-info` | Yes (`admin` or `maintenance`)             | Look up maintenance info by `make`, `model`, `year`               | Feature 4  |
| `PUT`    | `/api/vehicle-t3/maintenance-info` | Yes (`admin` or `maintenance`)             | Create maintenance info for `make`, `model`, `year`               | Feature 4  |
| `GET`    | `/api/vehicle-t3/areas/`           | Yes (`admin` or `maintenance`)             | List areas for vehicle forms. Each area includes its logo as base64, or `null` | Feature 4  |
| `GET`    | `/api/vehicle-t3`                  | Yes (`Bearer` session token)               | List every driver                                                 | Feature 7  |
| `GET`    | `/api/vehicle-t3/:driver_id`       | Yes (`Bearer` session token)               | Show one driver                                                   | Feature 7  |
| `POST`   | `/api/vehicle-t3`                  | Yes (`Bearer` session token, role `admin`) | Create a driver                                                   | Feature 7  |
| `PUT`    | `/api/vehicle-t3/:driver_id`       | Yes (`Bearer` session token, role `admin`) | Update a driver                                                   | Feature 7  |
| `DELETE` | `/api/vehicle-t3/:driver_id`       | Yes (`Bearer` session token, role `admin`) | Delete a driver                                                   | Feature 7  |
| `GET`    | `/api/areas`                       | Yes (`Bearer` session token, role `admin`) | List every area                                                   | Feature 13 |
| `GET`    | `/api/areas/:id`                   | Yes (`Bearer` session token, role `admin`) | Read one area                                                     | Feature 13 |
| `POST`   | `/api/areas`                       | Yes (`Bearer` session token, role `admin`) | Create an area                                                    | Feature 13 |
| `PUT`    | `/api/areas/:id`                   | Yes (`Bearer` session token, role `admin`) | Update an area                                                    | Feature 13 |
| `DELETE` | `/api/areas/:id`                   | Yes (`Bearer` session token, role `admin`) | Delete an area that no vehicle references                         | Feature 13 |
| `GET` | `/api/vehicles` | Yes | Vehicle choices for a request: `vehicleId`, `license`, `make`, `model` | Feature 8 |
| `GET` | `/api/drivers` | Yes | Driver choices: `driverId`, `name` | Feature 8 |
| `GET` | `/api/destinations` | Yes | Destination choices: `destId`, `name` | Feature 8 |
| `GET` | `/api/requests` | Yes | The caller's requests. An admin receives every request | Feature 8 |
| `GET` | `/api/requests/:requestId` | Yes | One accessible request, or `404` | Feature 8 |
| `POST` | `/api/requests` | Yes | Create a trip, or a maintenance request when the caller is an admin or maintenance user | Feature 8 |
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

| Situation                                             | Status | `message`                        |
| ----------------------------------------------------- | ------ | -------------------------------- |
| Missing ID token                                      | 400    | `Google sign-in failed.`         |
| Invalid, expired, wrong audience, or unverified email | 401    | `Google sign-in failed.`         |
| Verified token missing given name or family name      | 400    | `Google did not provide a name.` |
| Email already belongs to a password account           | 409    | `Email already in use!`          |

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

| Situation                                                                                               | Status | `message`                                                      |
| ------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| Signed in, role is not `admin`                                                                          | 403    | `Admin access required.`                                       |
| Empty first name, last name, or email, or a role other than `user`, `driver`, `maintenance`, or `admin` | 400    | `First name, last name, email, and a valid role are required.` |
| Admin changes their own role                                                                            | 400    | `You cannot change your own role.`                             |
| Email already belongs to another user                                                                   | 409    | `Email already in use!`                                        |
| User id does not exist                                                                                  | 404    | `User with id={id} not found.`                                 |

The **400**, **403**, **404**, and **409** cases do not change the user.

## Destinations

Mounted at `/vehicle-t3/destinations` and `/api/vehicle-t3/destinations`. Flat JSON. Errors are `{ "message": "…" }`. These routes do not include user fields.

Any signed-in user may list, read, and create. Only an admin may update or delete. A missing bearer token is **401** `{ "message": "Please sign in. If you think this is a mistake, contact your system administrator" }`. A signed-in role other than `admin` on update or delete is **403** `{ "message": "Please contact a system administrator for assistance." }`.

`GET /vehicle-t3/destinations` returns at most 5 rows. `offset` selects the next batch. Rows are ordered by `last_visited_on` descending, and a null or future `last_visited_on` sorts after visited rows. Each item:

```json
{
  "id": 1,
  "zip": "12345-0001",
  "city": "Omaha",
  "state": "Nebraska",
  "addr_line_1": "69420 Appleberry Lane",
  "addr_line_2": null,
  "dest_name": "ur mom's house",
  "last_visited": "2026-10-25"
}
```

`last_visited` is `last_visited_on` as `YYYY-MM-DD`, or `null` when that date is empty or in the future.

### `POST /vehicle-t3/destinations/`

```json
{
  "zip": "12345-0001",
  "city": "Omaha",
  "state": "Nebraska",
  "addr_line_1": "69420 Appleberry Lane",
  "addr_line_2": null,
  "dest_name": "ur mom's house"
}
```

Success is **201** `{ "message": "New destination created with id=<id>" }`.

### `GET /vehicle-t3/destinations/:destinationId`

Success is **200** and one object in the list shape above.

### `PUT /vehicle-t3/destinations/:destinationId`

Same body as create. `last_visited_on`, when sent, must be `YYYY-M-D`. Success is **201** `{ "message": "Destination updated with id=<id>" }`. A missing date leaves the stored `last_visited_on` unchanged.

### `DELETE /vehicle-t3/destinations/:destinationId`

Success is **204** with an empty body.

| Situation                                                                          | Status | `message`                                                                           |
| ---------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| Missing required field, a value longer than the column, or a bad `last_visited_on` | 400    | `Malformed request. Please make sure everything in the form is properly formatted!` |
| Zip is not `#####` or `#####-####`                                                 | 400    | `Zip code must be formatted like ##### or #####-####`                               |
| Same `zip`, `city`, `state`, `addr_line_1`, and `addr_line_2` already exists       | 409    | `Destination with this address already exists!`                                     |
| Id does not exist                                                                  | 404    | `No destination was found for id=<id>`                                              |

### Feature 4 — Vehicle CRUD (`/api/vehicle-t3`)

Roles other than `admin` and `maintenance` receive **401** `{ "message": "Unauthorized user" }`.

`vin` is stored as a 17-digit string. Create success is **201** `{ "message": "Successfully created vehicle." }`. Update success is **201** `{ "message": "Successfully updated vehicle." }`. List success is **200** `{ "message": "Successfully retreived all vehicles", "vehicles": [...] }`.

| Situation                      | Status | `message`                                      |
| ------------------------------ | ------ | ---------------------------------------------- |
| Missing required vehicle field | 400    | `(attribute) is required`                      |
| Year outside 1900–current year | 400    | `Select a year between 1900-Today`             |
| Duplicate VIN on create        | 409    | `A vehicle with this VIN already exists.`      |
| Duplicate license plate        | 409    | `A vehicle already has license number (plate)` |
| Vehicle VIN not found          | 404    | `Vehicle with vin={vin} not found.`            |

**Create fuel:** `POST /fuels/` body `{ "fuel_type": "87 Octane" }` → **201** `{ "message": "Successfully created fuel type.", "fuel_id": 1, "fuel_type": "87 Octane" }`.

**Create maintenance info:** `PUT /maintenance-info?make=&model=&year=` with body fields `fuel_type_id`, `fuel_capacity`, `recommended_tire_psi`, `tire_type` (and optional `oil_viscosity`, default `5W4`) → **201** `{ "message": "Successfully created maintenance-info." }`.

### Feature 5 — Maintenance Info CRUD (`/api/vehicle-t3`)

Same `admin` / `maintenance` guard as Feature 4 (`401` `Unauthorized user` otherwise).

| Method   | Endpoint                                | Purpose                                                                                       |
| -------- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `GET`    | `/maintenance-infos?make=&model=&year=` | Read maintenance info (alias of Feature 4 `GET /maintenance-info`)                            |
| `PUT`    | `/maintenance-infos?make=&model=&year=` | Update maintenance info → **200** `{ "message": "Successfully updated maintenance-info." }`   |
| `POST`   | `/maintenance-info/`                    | Create maintenance info → **201**                                                             |
| `GET`    | `/requests/:vehicle_id`                 | Requests for a vehicle VIN                                                                    |
| `GET`    | `/notes/:request_id`                    | Notes for a request                                                                           |
| `POST`   | `/notes/`                               | Create note → **201** `{ "message": "Successfully created maintenance note.", "note_id": … }` |
| `PUT`    | `/notes/:note_id`                       | Update note → **201**                                                                         |
| `DELETE` | `/notes/:note_id`                       | Delete note → **200** `Successfully deleted…`                                                 |
| `POST`   | `/vehicle-service-logs/`                | Create service log when completing a note → **201**                                           |
| `PUT`    | `/vehicles/:vin`                        | Partial update (mileage and/or make/model/year) → **200**                                     |
| `PUT`    | `/fuels/:fuel_id`                       | Update fuel type → **200**                                                                    |
| `DELETE` | `/fuels/:fuel_id`                       | Delete fuel type → **200**                                                                    |

Missing `request_id` on create note returns **404**. Missing note/fuel/vehicle returns **404**. `vehicle_id` on requests and service logs is the vehicle VIN string.

### Drivers (`/api/vehicle-t3`)

Create and update body: `driver_id`, `license_status` (`expired`, `active`, or `suspended`), `license_exp_date` (chosen with a date picker and stored as entered, for example `2026-05-01`), and `availability` (`available`, `not available`, or `on call`). `name` is optional. `driver_id` must be an integer. A missing or blank required field, or a non-numeric `driver_id`, is **400**. A signed-in role other than `admin` on `POST`, `PUT`, or `DELETE` is **403** `{ "message": "Admin access required." }`. An unknown driver is **404**. Delete success is **204** with no body. `GET` returns every driver to any signed-in user.

### Areas (`/api/areas`)

Admin only. Create and update body:

```json
{
  "name": "North Campus",
  "noticeEmail": "north@example.com"
}
```

`name` is required, unique, and at most 30 characters. `noticeEmail` is required. `logo` may be omitted. When it is sent, it is one PNG as base64 and is stored as a blob on the area row. The response returns that base64, or `null`. Success is **201** on create and **200** on read and update:

```json
{
  "id": 1,
  "name": "North Campus",
  "noticeEmail": "north@example.com",
  "logo": null
}
```

Delete success is **200** `{ "message": "Area deleted." }`.

| Situation                                  | Status | `message`                   |
| ------------------------------------------ | ------ | --------------------------- |
| Missing or expired token                   | 401    | `Unauthorized!`             |
| Role is `user`, `driver`, or `maintenance` | 403    | `Forbidden`                 |
| Unknown area id                            | 404    | `Area not found!`           |
| Name already used                          | 409    | `Area name already in use!` |
| A vehicle still references the area        | 409    | `Area is in use!`           |
| Name or notice email missing               | 400    | `Area is incomplete!`       |

### Feature 9 — Note CRUD (`/vehicle-t3/notes` and `/api/vehicle-t3/notes`)

These paths are mounted before the vehicle router so `GET /notes/:request_id`, `POST /notes/`, `PUT /notes/:note_id`, and `DELETE /notes/:note_id` from Feature 5 still belong to maintenance. A maintenance create body that sends `subject` and no `reason` continues to Feature 5. Feature 9 bodies send `reason`.

Any signed-in user may list notes. `contributor_id` is the signed-in user. A missing bearer token is **401** `{ "message": "Please sign in. If you think this is a mistake, contact your system administrator" }`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/notes?offset=` | Next 3 notes, newest `date` first. `offset` defaults to 0 |
| `POST` | `/notes/` | Create a note and its first contribution → **201** |
| `GET` | `/notes/note/:noteId` | Note details plus `contributors` |
| `GET` | `/notes/request/:requestId` | Notes for one request |
| `GET` | `/notes/user/:userId` | Admin. Notes that user contributed to |
| `PUT` | `/notes/note/:noteId` | Update the note and add a contribution → **200** |
| `DELETE` | `/notes/note/:noteId` | Delete the note and its contributions → **204** empty |
| `DELETE` | `/notes/request/:requestId` | Admin. Delete every note on a request → **204** |
| `GET` | `/notes/contributors` | Admin. Every contribution |
| `POST` | `/notes/contributors` | Add a contribution |
| `GET` | `/notes/contributors/note/:noteId` | Contributions for one note |
| `GET` | `/notes/contributors/user/:userId` | Admin. Contributions by one user |
| `DELETE` | `/notes/contributors/contribution/:contributionId` | Admin. Delete one contribution → **204** |
| `DELETE` | `/notes/contributors/note/:noteId` | Delete every contribution on a note → **204** |

Create body: `reason`, `text`, `request_id`, and optional `maintenance_request` (defaults to `false`). Success:

```json
{
  "message": "New note created with id=1",
  "note_id": 1,
  "contributor_id": 1,
  "created_note": true,
  "date": "2026-11-18 23:14:00"
}
```

`date` is the contribution's local date and time, `YYYY-MM-DD HH:mm:ss`, with no timezone. Update success is **200** with `note_id`, `created_note: false`, `contributor_id`, and that same `date`.

| Situation | Status | `message` |
| --- | --- | --- |
| Missing `reason`, `request_id`, or `text` | 400 | `Malformed request. Please make sure everything in the form is properly formatted!` |
| Signed out | 401 | `Please sign in. If you think this is a mistake, contact your system administrator` |
| Not allowed to change the note | 403 | `Please contact a system administrator for assistance.` |
| Unknown note | 404 | `No note was found for id=<id>` |
| Request has no notes | 404 | `This request <requestId> doesn't have any notes` |
| Note has no contributions | 404 | `This note <noteId> doesn't have any contributions` |
| Same `request_id` and `text` already stored | 409 | `Note with these details already exists!` |
| Second contribution with `created_note: true` | 409 | `contributor with these details already exists!` |

### Feature 11 — Images (`/vehicle-t3/noteimage`, `/vehicle-t3/vehicleimage`, `/vehicle-t3/areaimage`)

The same routes are also mounted under `/api`. `[type]` is `note`, `vehicle`, or `area`. `PUT` is **403** `{ "message": "PUT and overwriting requests are not allowed to image entries" }` with or without a token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/[type]image?offset=` | Next 3 images, newest `date` first |
| `POST` | `/[type]image/` | Create one image → **201** `{ "message": "New image created with id=<id>" }` |
| `GET` | `/[type]image/:id` | One image |
| `DELETE` | `/[type]image/:id` | Delete one image → **204** empty |
| `GET` | `/[type]image/[type]/:parentId` | Every image for that parent |
| `DELETE` | `/[type]image/[type]/:parentId` | Delete every image for that parent → **204** |

Create sends multipart field `image` plus `note_id`, `vehicle_id`, or `area_id`. `vehicle_id` is the vehicle `vin`. A JSON body may send `image` as base64. The response `image` is base64 PNG. A parent with no images is **404** `This note <:noteId> doesn't have any images`, `This vehicle <:vehicleId> doesn't have any images`, or `This area <:areaId> doesn't have any images`. A missing image is **404** `{ "message": "No image was found for id=<id>" }`. A duplicate image for the same parent is **409** `{ "message": "Image with these details already exists!" }`. A missing file or parent id is **400** `{ "message": "Malformed request. Please make sure everything in the form is properly formatted!" }`.
