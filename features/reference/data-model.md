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




## Associations

- `User` hasMany `Session`
- `Session` belongsTo `User`

