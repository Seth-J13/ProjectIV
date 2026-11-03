# Data Model Reference

**Status:** empty starter — no application tables yet.

Update this file when a feature that defines schema merges to `dev`.

## Tables

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

### Associations

- `Requests` hasMany `Notes`
- `Notes` belongsTo `Requests`
- `Notes` belongsTo `Users`

- `Notes` hasMany `Contibutors`
- `Contributors` belongsTo `Notes`
- `Contributors` belongsTo `Users`
