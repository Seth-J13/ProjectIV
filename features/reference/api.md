# API Reference

**Status:** Feature 7 driver endpoints are documented below.

API mount path defaults to `/api` (see `backend/server.js`). Update this file when endpoints merge to `dev`.

## Endpoints

### Drivers (`/api/vehicle-t3`)

| Method | Path | Auth | Success |
| --- | --- | --- | --- |
| `GET` | `/api/vehicle-t3` | Bearer session | `200` array of drivers |
| `GET` | `/api/vehicle-t3/:driver_id` | Bearer session | `200` driver |
| `POST` | `/api/vehicle-t3` | Bearer session, admin | `201` driver |
| `PUT` | `/api/vehicle-t3/:driver_id` | Bearer session, admin | `200` driver |
| `DELETE` | `/api/vehicle-t3/:driver_id` | Bearer session, admin | `204` |

Create and update body: `driver_id`, `license_status`, `license_exp_date`, `availability`. `name` is optional. `driver_id` must be an integer. Non-admin writes return `403`. Missing token returns `401` `{ "message": "Unauthorized!" }`. Unknown driver returns `404`. Invalid body returns `400` `{ "message": "..." }`.

Introduced in Feature 7.

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>` (when Feature auth is implemented).
