# Data Model Reference

**Status:** empty starter — no application tables yet.

Update this file when a feature that defines schema merges to `dev`.

## Tables

### `Vehicles` Table
| Field                 | Type           | Rules                                                       |
| --------------------- | -------------- | ----------------------------------------------------------- |
| `vin`                 | INTEGER     PK | Primary Key, Must be 17 numbers (0-9)                       |
| `make`                | VARCHAR(30)    | Required                                                    |
| `model`               | VARCHAR(65)    | Required                                                    |
| `year`                | INTEGER        | Required                                                    |
| `purchased_date`      | DATE           | Required; Cannot be in the future                           |
| `color`               | VARCHAR(20)    | NULLABLE;                                                   |
| `license_plate_num`   | VARCHAR(8)     | NULLABLE; Unique                                            |
| `tag_exp_month`       | DATE           | Required                                                    |
| `department`          | VARCHAR(30) FK | Foreign Key, NOT NULLABLE                                   |
| `most_recent_dest_id` | INTEGER        | NULLABLE;                                                   |
| `available`           | BIT            | Required                                                    |
| `mileage`             | INTEGER        | Required, Non-negative                                      |

## Associations

### `Vehicles` table
 - Associates with request
