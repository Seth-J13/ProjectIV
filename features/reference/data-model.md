# Data Model Reference

**Status:** Features 1 and 2 applied.

Update this file when a feature that defines schema merges to `dev`.

## Tables

### `users` table


| Field       | Type       | Rules                                                                                                                                                                |
| ----------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | INTEGER PK | Auto-increment                                                                                                                                                       |
| `firstName` | STRING     | Required                                                                                                                                                             |
| `lastName`  | STRING     | Required                                                                                                                                                             |
| `email`     | STRING     | Required, unique; login identifier. A Google-created row still stores the verified email.                                                                            |
| `password`  | STRING     | Required for email/password accounts. Null for accounts created by **Continue with Google**. Bcrypt hash only when set — never store plaintext or a Google password. |
| `role`      | STRING     | Required; `user`, `driver`, `maintenance`, or `admin`. Create account sets `user`                                                                                    |
| `googleSub` | STRING     | Nullable, unique when set. Google `sub` from the verified token. Required for accounts created by **Continue with Google**.                                          |


### `sessions` table

| Field            | Type       | Rules                                          |
| ---------------- | ---------- | ---------------------------------------------- |
| `sessionId`      | INTEGER PK | Auto-increment                                 |
| `token`          | STRING     | Required, unique; value returned to the client |
| `email`          | STRING     | Required                                       |
| `expirationDate` | DATE       | Required; 24 hours from login                  |
| `userId`         | INTEGER FK | Required; references `users.id`                |


### `Vehicles` Table

| Field                 | Type           | Rules                                 |
| --------------------- | -------------- | ------------------------------------- |
| `vin`                 | INTEGER PK     | Primary Key, Must be 17 numbers (0-9) |
| `make`                | VARCHAR(30)    | Required                              |
| `model`               | VARCHAR(65)    | Required                              |
| `year`                | INTEGER        | Required                              |
| `purchased_date`      | DATE           | Required; Cannot be in the future     |
| `color`               | VARCHAR(20)    | NULLABLE;                             |
| `license_plate_num`   | VARCHAR(8)     | NULLABLE; Unique                      |
| `tag_exp_month`       | DATE           | Required                              |
| `department`          | VARCHAR(30) FK | Foreign Key, NOT NULLABLE             |
| `most_recent_dest_id` | INTEGER        | NULLABLE;                             |
| `available`           | BIT            | Required                              |
| `mileage`             | INTEGER        | NULLABLE, Non-negative                |

### `Drivers` table

| Field               | Type      | Rules                                                  |
| ------------------- | --------- | ------------------------------------------------------ |
| `driver_id`          | INT PK | Required; Unique;                   |
| `license_status`        | ENUM    | Required; `expired`, `active`, `suspended`, |
| `license_exp_date`   | date      | Required; |
| `availability` | ENUM      | Required; `available`, `not available`, `on call` |

## Associations

- `User` hasMany `Session`
- `Session` belongsTo `User`

- `User` hasOne `Drivers`
- `Drivers` belongsTo `User`

- `Vehicles` hasMany `Requests`
- `Requests` belongsTo `Vehicles`
