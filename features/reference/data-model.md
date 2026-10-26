# Data Model Reference

**Status:** empty starter — no application tables yet.

Update this file when a feature that defines schema merges to `dev`.

## Tables

### `Vehicles` Table
| Field                 | Type           | Rules                                                       |
| --------------------- | -------------- | ----------------------------------------------------------- |
| `vin`                 | INTEGER(17) PK | Primary Key, NOT NULLABLE, Unique, Must be 17 numbers (0-9) |
| `make`                | VARCHAR(30)    | Required                                                    |
| `model`               | VARCHAR(65)    | Required                                                    |
| `year`                | SMALLINT(4)    | Required                                                    |
| `purchased_date`      | DATE           | Required;                                                   |
| `color`               | VARCHAR(20)    | NULLABLE;                                                   |
| `license_plate_num`   | INTERGER(10)   | NULLABLE; Unique                                            |
| `tag_exp_month`       | DATE           | Required                                                    |
| `department`          | VARCHAR(30) FK | Foreign Key, NOT NULLABLE                                   |
| `most_recent_dest_id` | INTEGER(10)    | NULLABLE;                                                   |
| `available`           | BIT            | Required                                                    |

## Associations

### `Vehicles` table
 - Associates with request
