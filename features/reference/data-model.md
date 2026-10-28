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

### `Maintenance_Info` Table
| Field                 | Type           | Rules                                                       |
| --------------------- | -------------- | ----------------------------------------------------------- |
| `make`                | VARCHAR(30) PK | Primary Key, Required                                       |
| `model`               | VARCHAR(65) PK | Primary Key, Required                                       |
| `year`                | INTEGER     PK | Primary Key, Required                                       |
| `fuel_type_id`        | INTEGER     FK | Required                                                    |
| `fuel_capacity`       | INTEGER        | Required, Non-negative                                      |
| `recommended_tire_psi`| DECIMAL(5, 2)  | Required, Non-negative                                      |
| `tire_type`           | VARCHAR(17)    | Required                                                    |
| `mileage`             | INTEGER        | Required, Non-negative                                      |

### `Fuel_Type` Table
| Field                 | Type           | Rules                                                       |
| --------------------- | -------------- | ----------------------------------------------------------- |
| `fuel_id`             | INTEGER     PK | Primary Key                                                 |
| `fuel_type`           | VARCHAR(50)    | Required                                                    |

## Associations

### `Vehicles` table
 - Associates with request
