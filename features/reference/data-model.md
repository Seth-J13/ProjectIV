# Data Model Reference

**Status:** Feature 1 applied.

## Tables

### `users` table

| Field | Type | Rules |
| --- | --- | --- |
| `id` | INTEGER PK | Auto-increment. Introduced in Feature 1. |
| `firstName` | STRING | Required. |
| `lastName` | STRING | Required. |
| `email` | STRING | Required, unique; login identifier. Stored trimmed; lookup is case-insensitive. |
| `password` | STRING | Required. Bcrypt hash only — never store or return plaintext. |
| `role` | STRING | Required; `user`, `driver`, `maintenance`, or `admin`. Create account sets `user`. |

### `sessions` table

| Field | Type | Rules |
| --- | --- | --- |
| `sessionId` | INTEGER PK | Auto-increment. |
| `token` | STRING | Required, unique; value returned to the client. |
| `email` | STRING | Required. Copied from the user at session start. |
| `expirationDate` | DATE | Required. Timestamp 24 hours after the session is created. A later login reuses a row that has not expired. |
| `userId` | INTEGER FK | Required; references `users.id`. |

## Associations

- `User` hasMany `Session`
- `Session` belongsTo `User`
