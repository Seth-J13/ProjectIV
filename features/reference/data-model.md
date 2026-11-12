# Data Model Reference

**Status:** Features 1,2,4,5,6,7,9,10,12,13 applied.

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

### `destinations` table

| Field             | Type                    | Rules                               |
| ----------------- | ----------------------- | ----------------------------------- |
| `id`              | INTEGER; AUTO-INCREMENT | Primary Key                         |
| `zip`             | VARCHAR(10)             | Required (some ZIPs are #####-####) |
| `city`            | VARCHAR(255)            | Required                            |
| `state`           | VARCHAR(255)            | Required                            |
| `addr_line_1`     | VARCHAR(255)            | Required                            |
| `addr_line_2`     | VARCHAR(255)            | Nullable                            |
| `dest_name`       | VARCHAR(255)            | Required                            |
| `last_visited_on` | DATE                    | Nullable                            |

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
| `area_id`             | VARCHAR(30) FK | Foreign Key, NOT NULLABLE             |
| `most_recent_dest_id` | INTEGER        | NULLABLE;                             |
| `available`           | BIT            | Required                              |
| `mileage`             | INTEGER        | NULLABLE, Non-negative                |

### `Maintenance_Info` Table

| Field                  | Type           | Rules                  |
| ---------------------- | -------------- | ---------------------- |
| `make`                 | VARCHAR(30) PK | Primary Key, Required  |
| `model`                | VARCHAR(65) PK | Primary Key, Required  |
| `year`                 | INTEGER PK     | Primary Key, Required  |
| `fuel_type_id`         | INTEGER FK     | Required               |
| `fuel_capacity`        | INTEGER        | Required, Non-negative |
| `oil_viscosity`        | CHAR(3)        | Required               |
| `recommended_tire_psi` | DECIMAL(5, 2)  | Required, Non-negative |
| `tire_type`            | VARCHAR(17)    | Required               |

### `Fuel_Type` Table

| Field       | Type        | Rules       |
| ----------- | ----------- | ----------- |
| `fuel_id`   | INTEGER PK  | Primary Key |
| `fuel_type` | VARCHAR(50) | Required    |

### `Drivers` table

| Field              | Type   | Rules                                             |
| ------------------ | ------ | ------------------------------------------------- |
| `driver_id`        | INT PK | Required; unique; supplied by the client          |
| `name`             | STRING | Optional; trimmed. A blank name is rejected       |
| `license_status`   | ENUM   | Required; `expired`, `active`, `suspended`        |
| `license_exp_date` | STRING | Required; stored as entered (for example `05/2026`) |
| `availability`     | ENUM   | Required; `available`, `not available`, `on call` |

### `Notes` table

| Field                 | Type                    | Rules                 |
| --------------------- | ----------------------- | --------------------- |
| `id`                  | INTEGER; AUTO-INCREMENT | Primary Key, NOT NULL |
| `reason`              | VARCHAR(255)            | Required              |
| `maintenance_request` | BOOLEAN                 | Required              |
| `request_id`          | INTEGER, FOREIGN KEY    | Required              |
| `text`                | TEXT                    | Required              |

### `Contributors` table

| Field            | Type                    | Rules                 |
| ---------------- | ----------------------- | --------------------- |
| `id`             | INTEGER; AUTO-INCREMENT | Primary Key, NOT NULL |
| `note_id`        | INTEGER; FOREIGN KEY    | Required              |
| `contributor_id` | INTEGER; FOREIGN KEY    | Required              |
| `created_note`   | BOOLEAN                 | Required              |
| `date`           | DATE                    | Required              |

### `vehicle_logs` table

| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `serviceDate` | DATE | Required |
| `vin` | STRING | Required; references an existing vehicle |
| `description` | TEXT | Required |
| `completed` | BOOLEAN | Required |
| `creatorId` | INTEGER FK | Required; references `users.id`. Set to the signed-in user on create |
| `createdAt` | DATE | Set when the log is created |
| `updatedAt` | DATE | Set when the log is created and on every update |

### `vehicle_log_owners` table

| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `vehicleLogId` | INTEGER FK | Required; references `vehicle_logs.id` |
| `userId` | INTEGER FK | Required; references `users.id` |

### `Areas` table

| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment. ERD `id` |
| `name` | STRING(30) | Required, unique. ERD `name` |
| `logo` | BLOB | Optional. ERD `logo` |
| `noticeEmail` | STRING(255) | Required. ERD `notice_email` |

### Associations

- `User` hasMany `Session` ----| not every user has a session
- `Session` belongsTo `User` --| but every session is assigned to exactly one user
-
- `Requests` hasMany `Notes` -----| a request can have 0 or many notes
- `Notes` belongsTo `Requests` ---| but every note is assigned to exactly one request
-
- `Notes` hasMany `Contibutors` ---| every note has one or more contributor entries
- `Contributors` belongsTo `Notes` | every contributor entry is assigned to exactly one note
- `Contributors` belongsTo `Users`-| every contributor entry is made by exactly one user
-
- `User` hasOne `Drivers` ------| not every user is a driver
- `Drivers` belongsTo `User` ---| but every driver is a user
-
- `Vehicles` hasMany `Requests` -----| a vehicle can be included in many requests
- `Requests` belongsTo `Vehicles` ---| a request has between 0 and 1 vehicles
-
- `Fuel_Type` hasMany `Maintenance_Info` -----| one fuel type can be included in 0 or many maintenance info entries
-
- `Vehicle` belongsTo `Area` --| a vehicle belongs to one area
- `Area` hasMany `AreaImage` --| an area can have many images
- `Maintenance_Info` belongsTo `Fuel_Type` ---| a maintenance info entry has exactly one fuel type
-
- `VehicleLog` belongsTo `User` ----| a log belongs to one user as creator
- `VehicleLog` belongsToMany `User` | a log belongs to many users as owners
- `VehicleLog` belongsTo `Vehicle` -| a log belongs to one vehicle as vin
-
- `Destinations` hasMany `requests` ----| a destination can be included in many requests
- `requests` belongsTo `Destinations` --| a request has between 0 and 1 destinations
