# Data Model Reference

**Status:** empty starter — no application tables yet.

Update this file when a feature that defines schema merges to `dev`.

## Tables

### `users` table

| Field       | Type       | Rules                                                                             |
| ----------- | ---------- | --------------------------------------------------------------------------------- |
| `id`        | INTEGER PK | Auto-increment                                                                    |
| `firstName` | STRING     | Required                                                                          |
| `lastName`  | STRING     | Required                                                                          |
| `email`     | STRING     | Required, unique; login identifier                                                |
| `password`  | STRING     | Required; bcrypt hash only — never store plaintext                                |
| `role`      | STRING     | Required; `user`, `driver`, `maintenance`, or `admin`. Create account sets `user` |

### `sessions` table

| Field            | Type       | Rules                                          |
| ---------------- | ---------- | ---------------------------------------------- |
| `sessionId`      | INTEGER PK | Auto-increment                                 |
| `token`          | STRING     | Required, unique; value returned to the client |
| `email`          | STRING     | Required                                       |
| `expirationDate` | DATE       | Required; 24 hours from login                  |
| `userId`         | INTEGER FK | Required; references `users.id`                |

### `destinations` table

| Field              | Type                    | Rules                                          |
| ------------------ | ----------------------- | ---------------------------------------------- |
| `id`               | INTEGER; AUTO-INCREMENT | Primary Key                                    |
| `zip`              | VARCHAR(10)             | Required (some ZIPs are #####-#### or similar) |
| `city`             | VARCHAR(255)            | Required                                       |
| `adr_line_1`       | VARCHAR(255)            | Required                                       |
| `adr_line_2`       | VARCHAR(255)            | Nullable                                       |
| `dest_name`        | VARCHAR(255)            | Required                                       |
| `recently_visited` | DATE                    | Nullable                                       |

## Associations

- `User` hasMany `Session`
- `Session` belongsTo `User`
