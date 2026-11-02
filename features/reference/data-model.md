# Data Model Reference

**Status:** empty starter — no application tables yet.

Update this file when a feature that defines schema merges to `dev`.

## Tables

### `Notes` table

| Field                 | Type                    | Rules       |
| --------------------- | ----------------------- | ----------- |
| `id`                  | INTEGER; AUTO-INCREMENT | Primary Key |
| `reason`              | VARCHAR(50)             | Required    |
| `maintenance_request` | BOOLEAN                 | Required    |
| `request_id`          | INTEGER, FOREIGN KEY    | Required    |
| `created_by`          | INTEGER, FOREIGN KEY    | Required    |
| `date`                | DATE                    | Required    |
| `text`                | TEXT                    | Required    |

## Associations

_(none)_
