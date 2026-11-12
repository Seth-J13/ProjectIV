# Behavior & Rules Reference

**Living snapshot** of product rules currently in force on `dev`.

Feature 8 request rules are in force on this branch. See the OC CS Speckit repo’s `features/reference/behavior.md` for the intended shape (rule → enforcement → provenance).

| Rule | Enforcement | Provenance |
| --- | --- | --- |
| A request route requires a bearer token. | `401` `{ "message": "Unauthorized!" }` | Feature 8 FR-001 |
| `requesterId` is the signed-in user. A client-supplied id is ignored. | Set in `request.controller.js` create | Feature 8 FR-003 |
| Trip end must be after start. | `400` `{ "message": "end must be after start." }` | Feature 8 FR-005 |
| Trip `numPeople` must be an integer of at least 1. | `400` `{ "message": "number of people must be at least 1." }` | Feature 8 FR-006 |
| Unknown vehicle | `400` `{ "message": "vehicle does not exist." }` | Feature 8 FR-004 |
| Only an admin can create `maintenance`. | `403` `{ "message": "Admin access required." }` | Feature 8 US-8.2 |
| A non-admin sees and changes only their own requests. Another user’s id is `404`. | `getAccessibleRequestOrNull` | Feature 8 US-8.3, US-8.5 |
| An admin sees and can edit every request. | List and update skip the owner filter | Feature 8 US-8.3, US-8.5 |
| Delete succeeds with `204`. | `request.controller.js` remove | Feature 8 US-8.5 |
| The requests screen requires a stored user and redirects to `login` otherwise. | `router.js` `beforeEach` | Feature 8 authentication scenario |

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md`.

| File | Role |
|------|------|
| [api.md](./api.md) | Routes / payloads |
| [data-model.md](./data-model.md) | Tables / columns |
| **This file** | Ownership, sort, validation, UI rules |
