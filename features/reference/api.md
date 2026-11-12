# API Reference

**Status:** Feature 8 request endpoints.

API mount path defaults to `/api` (see `backend/server.js`). Update this file when endpoints merge to `dev`.

## Endpoints

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/vehicles` | Bearer | Vehicle choices for a request. `{ vehicleId, license, make, model }` |
| `GET` | `/api/drivers` | Bearer | Driver choices. `{ driverId, name }` |
| `GET` | `/api/destinations` | Bearer | Destination choices. `{ destId, name }` |
| `GET` | `/api/requests` | Bearer | Caller’s requests. An admin receives every request. |
| `GET` | `/api/requests/:requestId` | Bearer | One accessible request, or `404` |
| `POST` | `/api/requests` | Bearer | Create. `requesterId` comes from the session, not the body. Maintenance is admin-only (`403`). |
| `PUT` | `/api/requests/:requestId` | Bearer | Update fields for the existing type. Does not change `requestType` or `requesterId`. |
| `DELETE` | `/api/requests/:requestId` | Bearer | `204` when the caller can access the row. |

A trip body includes `vehicleId`, `driverId`, `destId`, `startDate`, `startTime`, `endDate`, `endTime`, and `numPeople`. A maintenance body includes `vehicleId` and may include `startDate` and `startTime`. Driver, destination, and `numPeople` are stored null.

Success JSON is flat and includes nested `vehicle`, `driver`, and `destination`. Maintenance leaves `driver`, `driverId`, `destination`, `destId`, and `numPeople` null. `currentlyActive` defaults to `true`.

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>` (when Feature auth is implemented).
