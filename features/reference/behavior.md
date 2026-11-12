# Behavior & Rules Reference

**Living snapshot** of product rules currently in force on `dev`.

| Rule | Enforcement | Introduced |
| --- | --- | --- |
| Driver reads require a session | `GET /api/vehicle-t3` returns `401` without a bearer token | Feature 7 |
| Only admins create, update, or delete drivers | Non-admin writes return `403` `{ "message": "Admin access required." }`. Drivers are not owned by a user. Signed-in non-admins are sent to `landing` when that route exists | Feature 7 |
| Driver id must be an integer | Non-numeric `driver_id` returns `400` | Feature 7 |
| License status, expiration, and availability are required | Missing or blank values return `400`. Status and availability must be one of the allowed values | Feature 7 |
| A blank driver name is rejected | Whitespace-only `name` returns `400`. The drivers form blocks it before the request | Feature 7 |
| Drivers screen is admin-only | Signed-out users go to login. Signed-in non-admins go home | Feature 7 |
| Find filters the list | The **Find** box keeps rows whose id, name, or license status contains the text | Feature 7 |

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md`.

| File | Role |
|------|------|
| [api.md](./api.md) | Routes / payloads |
| [data-model.md](./data-model.md) | Tables / columns |
| **This file** | Ownership, sort, validation, UI rules |
