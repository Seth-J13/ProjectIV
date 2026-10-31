# Feature: Vehicle CRUD
**Feature ID:** 4
**Branch pattern:** `feature/4-Vehicle-CRUD`
**Status:** Draft
**Created:** 2026-10-24
**Input:** This feature is a vehicle management to view, add, update, and delete vehicles
**Depends on:** [Feature 1 -- User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md), [Feature 2 -- Google Auth](feature-2-Google-Auth),
**Required for future use:** [Feature 5 -- Maintenance Info CRUD](feature-5-Maintenance-Info-CRUD), [Feature 8 -- Requests CRUD](feature-8-Requests-CRUD), [Feature 11 -- Images](feature-11-Images)

---

## User Stories

### US-4.1: Add a new vehicle as a `admin` role

**As a** admin
**I want to** add a new vehicle
**So that** a new vehicle can be reserved

**Priority:** P1  
**Independent test:** Submit a valid request to backend as a `admin` role and the new vehicle shows up.
**Acceptance scenarios:** see ### US-4.1 under Acceptance Criteria

### US-4.2: Add a new vehicle as a `maintence` role
**As a** maintence
**I want to** add a new vehicle
**So that** a new vehicle can be reserved 

**Priority:** P1
**Independent test:** Submit a valid request to backend as a `maintence` role and the new vehicle shows up
**Acceptance scenarios:** see ### US-4.2 under Acceptance Criteria

### US-4.3: Edit a vehicle as a `admin` role

**As a** admin
**I want to** edit a vehicle
**So that** a vehicle currently in the system can have different information

**Priority:** P1  
**Independent test:** Submit a valid request to backend as a `admin` role and the selected vehicle is changed in the backend.
**Acceptance scenarios:** see ### US-4.3 under Acceptance Criteria

### US-4.4: Edit a vehicle as a `maintence` role
**As a** maintence
**I want to** edit a vehicle
**So that** a vehicle currently in the system can have different information 

**Priority:** P1
**Independent test:** Submit a valid request to backend as a `maintence` role and the selected vehicle is changed in the backend.
**Acceptance scenarios:** see ### US-4.4 under Acceptance Criteria

### US-4.5: Delete a vehicle as a `admin` role

**As a** admin
**I want to** delete a vehicle
**So that** a vehicle currently in the system will be removed from the system

**Priority:** P1  
**Independent test:** Submit a valid request to backend as a `admin` role and the selected vehicle is removed from the backend.
**Acceptance scenarios:** see ### US-4.5 under Acceptance Criteria

### US-4.6: Delete a vehicle as a `maintence` role
**As a** maintence
**I want to** delete a vehicle
**So that** a vehicle currently in the system will be removed from the system

**Priority:** P1
**Independent test:** Submit a valid request to backend as a `maintence` role and the selected vehicle is removed from the backend.
**Acceptance scenarios:** see ### US-4.6 under Acceptance Criteria

### US-4.7: View all vehicles as a `admin` role
**As a** admin
**I want to** view a list of all vehicles in the system
**So that** I can manage all vehicles

**Priority:** P1
**Independent test:** I am a valid user with a `admin` role and I am on the Vehicle page seeing a list of all vehicles
**Acceptance scenarios:** see ### US-4.7 under Acceptance Criteria

### US-4.8: View all vehicles as a `maintenance` role
**As a** maintenance
**I want to** view a list of all vehicles in the system
**So that** I can manage all vehicles

**Priority:** P1
**Independent test:** I am a valid user with a `maintenance` role and I am on the Vehicle page seeing a list of all vehicles
**Acceptance scenarios:** see ### US-4.8 under Acceptance Criteria

### US-4.9: Filter vehicle list as `admin` role
**As a** admin
**I want to** filter which vehicles are listed
**So that** I can view all vehicles that match the filters

**Priority:** P2
**Independent test:** I can see all filters `year`, `make`, `model`, `color`, `department`, `license`, `From Purchase Date`, `Before Purchase Date` as a `admin`
**Acceptance scenarios:** see ### US-4.9 under Acceptance Criteria

### US-4.10: Filter vehicle list as `maintenance` role
**As a** maintenace
**I want to** filter which vehicles are listed
**So that** I can view all vehicles that match the filters

**Priority:** P2
**Independent test:** I can see all filters `year`, `make`, `model`, `color`, `department`, `license`, `From Purchase Date`, `Before Purchase Date` as a `maintenance`
**Acceptance scenarios:** see ### US-4.10 under Acceptance Criteria


### US-4.11: Vehicle maintenance as a `admin`
**As a** admin
**I want to** click a maintenance button
**So that** I can be taken to the maintenance page to view the selected vehicle's maintenance needs

**Priority:** P2
**Independent test:** I click the maintenance button and I am redirected to the maintenance page with the selected vehicle pulled up to view
**Acceptance scenarios:** see ### US-4.11 under Acceptance Criteria

### US-4.12: Vehicle maintenance as a `maintenance`
**As a** maintenance
**I want to** click a maintenance button
**So that** I can be taken to the maintenance page to view the selected vehicle's maintenance needs

**Priority:** P2
**Independent test:** I click the maintenance button and I am redirected to the maintenance page with the selected vehicle pulled up to view
**Acceptance scenarios:** see ### US-4.12 under Acceptance Criteria

### US-4.13: View vehicle image as a `admin`
**As a** admin
**I want to** hover over vehicle
**So that** I can view the vehicle's image if one exists

**Priority:** P3
**Independent test:** I hover over a vehicle and the image is displayed
**Acceptance scenarios:** see ### US-4.13 under Acceptance Criteria

### US-4.14: View vehicle image as a `maintenance`
**As a** maintenance
**I want to** hover over vehicle
**So that** I can view the vehicle's image if one exists

**Priority:** P3
**Independent test:** I hover over a vehicle and the image is displayed
**Acceptance scenarios:** see ### US-4.14 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: System **MUST** list all vehicles
- **FR-002**: User **MUST** be able to input filters and the list update as filters are being inputted
- **FR-003**: System **MUST** make a `POST` request when a new vehicle has been added
- **FR-004**: System **MUST** make a `PUT` request when a user updates a vehicle's information
- **FR-005**: System **MUST** make a `DELETE` request when a user deletes a vehicle from the database
- **FR-006**: System **MUST** make a `GET` request when first loading the page or re-retrieving vehicles after making a `update` or `delete`
- **FR-007**: System **MUST NOT** allow any roles other than `admin` and `maintenance` to access this page
- **FR-008**: System **Must** send user to the Maintenance page with the selected vehicle's details pulled up
- **FR-009**: System **MUST** display the `Make`, `Model`, `Year`, `Purchase Date`, `License`, `Color`, and `Department` for each vehicle
- **FR-010**: System **MUST** display a vehicle image if one is available from the `Images` table

---

## Assumptions

- **What already exists**: 
  - `feature-1-User-Auth-&-Session-Management`
  - `feature-2-Google-Auth`
  - `feature-3-Department-CRUD`
  - `MenuBar.vue`
- **What you are deliberately not building yet**
  - `feature-5-Maintenance-Info-CRUD`
  - `Maintenance.vue`
  - `feature-8-Requests-CRUD`: Assume that requests will be added later, for data model see `features/references/data-model.md`
  - `Requests.vue`
  - `feature-11-Images`: Assume that images will be added later, for data model see `features/references/data-model.md`
  - `Images.vue`

## Edge Cases

- **Empty required field**
  - `Text Fields`: `</v-alert>` to notify user that a empty field is required to be filled
  - `Radio Buttons`: `</v-alert>` to notify user that a selection needs to be made
  - `Date Picker`: `</v-alert>` to notify user that a correct date must be picked
  - `Combo Box`: `</v-alert>` to notify user that a selection needs to be made

- **Duplicate Inputs**
  - Throw `400` restapi error and send a `</v-alert>` to notify user that the input is invalid or already exists

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge
- **SC-002**: Every functional requirement is met
- **SC-003**: Frontend, `Vehicle.vue` is the only .vue created for this feature doc
- **SC-004**: Backend, all routes, models, and controllers are created and configured correctly with authorization 

---

## Data Ownership & Isolation (foundation)

Feature 1 and 2 establishes identity

- Vehicles are not owned by any user
- No API in this feature returns another user's profile or session.
- Later features must never expose vehicles to unauthorized users.

---

## Key Entities

- **User**: registered account (name, email, username, role)
- **Session**: server-side record tying a JWT token to a user; expires after 24 hours.
- **Vehicles**: server-side record of all vehicles in the database

---

## Data Model Requirements
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
| `mileage`             | INTEGER        | NULLABLE, Non-negative                                      |

---

## API Requirements

All routes mount under `/vehicle-t3`, Auth is `Authorization: Bearer <token>` from Feature 1. Every route below requires either a `admin` or `maintenance` session

| Method   | Endpoinnt                             | Purpose                                                        |
| -------- | ------------------------------------- | -------------------------------------------------------------- |
| `GET`    | `/vehicle-t3/vehicles/`              | Get all vehicles in the database                                |
| `GET`    | `/vehicle-t3/vehicles/:vin`          | Get a vehicle with the designated vin number                    |
| `GET`    | `/vehicle-t3/maintenance-info?make=&model=&year=` | Check to see if a vehicle of `year`, `make`, `model` has maintenance info already |
| `GET`    | `/vehicle-t3/fuels/`                 | Get all fuels in the system                                     |
| `POST`   | `/vehicle-t3/fuels/`                 | Create a new fuel type                                          |
| `PUT`    | `/vehicle-t3/vehicles/`              | Create a new vehicle                                            |
| `PUT`    | `/vehicle-t3/maintenance-info?make=&model=&year=` | Create a new maintenance info for a vehicle of `year`, `make`, `model` |
| `POST`   | `/vehicle-t3/vehicles/:vin`          | Update a vehicle in the database with the designated vin number |
| `DELETE` | `/vehicle-t3/vehicles/:vin`          | Delete a vehicle with the designated vin number                 |
 
**Create / Update Request Body (Vehicle Table)**
```json
{
  "vin": "12345671234567123",
  "make": "Honda",
  "model": "Accord",
  "year": 2014,
  "purchased_date": "2015/12/16",
  "color": "White",
  "license_plate_num": "ABC344",
  "tag_exp_month": "2016/5/25",
  "department": "Engineering",
  "most_recent_dest_id": null,
  "available": 1,
  "mileage": 0
}
```
**Create Request Body (Maintenance-Info Table)**
```json
 {
    "make": "Honda",
    "model": "Accord",
    "year": 2014,
    "fuel_type_id": 2,
    "fuel_capacity": 30,
    "recommended_tire_psi": 35,
    "tire_type": "P205/55R16 95H"
 }
 ```
 **Success — create (**`201`**) and update (**`200`**):**

 **Error response:** `{"message": "..."}`
 | Status | When                                                 | Message                                             |
 | ------ | ---------------------------------------------------- | --------------------------------------------------- | 
 | `400`  | Missing field                                        | `(attribute) is required` (same pattern for `make`, `model`, `year`, `purchased_date`, `tag_exp_mont`, `department`, and `available`)
 | `400`  | Two vehicles share the same license plate number     | `A vehicle already has license number (AAA-###)`    |
 | `400`  | Year is less than 1900 and greater than current year | `Select a year between 1900-Today`                  |
 | `401`  | A user who's role is not `admin` or `maintenance` tries to view the page | `Unauthorized user`             |

---

## Screen Requirements

### [View: Vehicle.vue] -- route name `vehicleManagement`
- Path: `/vehicles`
- Heading: **Vehicle Management**
- Visible in the nav only when the stored user `role` is `admin` or `maintenance`

**Filters**
- Fields: 
  - `Year`: Drop down with values from 1900 to present year
  - `Make`: Combobox (Values should show all distinct `makes` in system or add a new make)
  - `Model`: Combobox (Values should show all distinct `models` in system or add a new model)
  - `Color`: Text field
  - `Department`: Dropd own with all departments
  - `License`: Text field
  - `From Purchase Date`: Calendar Picker
  - `Before Purchase Date`: Calendar Picker

**Table**
- Headers: `License`, `Make`, `Model`, `Year`, `Purchase Date`, `Color`, `Department`, `Actions`
- Actions: `Maintenance Icon Button` - Wrench, `Edit Icon Button` - Pencil, `Delete Icon Button` - Trashcan

**Add / Edit Modal**
- **Add Vehicle** button opens the add dialog (`oc-cta`), **Edit Icon Button** - Pencil opens the edit dialog (`oc-cta`) 
  - Fields: 
    - `License`- Text field
    - `Make`- Combo box
    - `Model`- Combo box
    - `Year`- Drop down with values from 1900 to present year
    - `Color`- Text field
    - `Department`- Drop down with all departments
    - `Purchase Date` - Calendar Picker
    - `Tag Expiration Month` - Calendar Picker
    - `Fuel Type` - Combo box
    - `Fuel Capacity` - Stepper
    - `Recommended Tire PSI` - Stepper

**Image** 
  - Vehicle Image should be displayed discretely but be obvious to find
  - The image **SHOULD NOT** be in the vehicle list
  - The image **SHOULD NOT** be next to the filters

---

## Acceptance Criteria (Gherkin)

### US-4.1 — Add a new vehicle as a `admin` role

#### Scenario: User clicks the add button

- **Given** I am on the Vehicles.vue as a `admin`
- **When** click the `Add` button
- **Then** a add vehicle modal pops up
- **And** no API request is sent

#### Scenario: User inputs valid information into the `Add Vehicle` modal

- **Given** I have clicked the `Add` button and I am viewing the `Add Vehicle` modal
- **And** I have correctly inputted values into the form
- **When** I click the `Add Vehicle` button
- **Then** the `Add Vehicle` modal closes
- **And** a `PUT` API request is sent to the server
- **And** returns a value of `201` with a payload containing `{"message": "Successfully created vehicle."}`

#### Scenario: User inputs invalid information into `Add Vehicle` modal

- **Given** I have clicked the `Add` button and I am viewing the `Add Vehicle` modal
- **And** I have incorrectly inputted values into the form
- **When** I click the `Add Vehicle` button
- **Then** a `</v-alert>` pops up saying `An error occured processing your form.`
- **And** a no API request is sent
 
#### Scenario: User inputs valid information into the `Add Vehicle` modal but a record already exists

- **Given** I have clicked the `Add` button and I am viewing the `Add Vehicle` modal
- **And** I have correctly inputted values into the form
- **When** I click the `Add Vehicle` button
- **Then** the `Add Vehicle` modal closes
- **And** a `PUT` API request is sent to the server
- **And** returns a value of `409` with a payload containing a `human readable error message`

---

### US-4.2 — Add a new vehicle as a `maintenance` role

#### Scenario: User clicks the add button

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** click the `Add` button
- **Then** a add vehicle modal pops up
- **And** no API request is sent

#### Scenario: User inputs valid information into the `Add Vehicle` modal

- **Given** I have clicked the `Add` button and I am viewing the `Add Vehicle` modal
- **And** I have correctly inputted values into the form
- **When** I click the `Add Vehicle` button
- **Then** the `Add Vehicle` modal closes
- **And** a `PUT` API request is sent to the server
- **And** returns a value of `201` with a payload containing `{"message": "Successfully created vehicle."}`

#### Scenario: User inputs invalid information into `Add Vehicle` modal

- **Given** I have clicked the `Add` button and I am viewing the `Add Vehicle` modal
- **And** I have incorrectly inputted values into the form
- **When** I click the `Add Vehicle` button
- **Then** a `</v-alert>` pops up saying `An error occured processing your form.`
- **And** a no API request is sent
 
#### Scenario: User inputs valid information into the `Add Vehicle` modal but a record already exists

- **Given** I have clicked the `Add` button and I am viewing the `Add Vehicle` modal
- **And** I have correctly inputted values into the form
- **When** I click the `Add Vehicle` button
- **Then** the `Add Vehicle` modal closes
- **And** a `PUT` API request is sent to the server
- **And** returns a value of `409` with a payload containing a `human readable error message`
 
---

### US-4.3 — Edit a vehicle as a `admin` role

#### Scenario: User clicks the edit icon button

- **Given** I am on the Vehicles.vue as a `admin`
- **When** click the `Edit` icon button
- **Then** a edit vehicle modal pops up
- **And** all form values are filled out with vehicle information 
- **And** no API request is sent

#### Scenario: User inputs valid information into the `Edit Vehicle` modal

- **Given** I have clicked the `Edit` icon button and I am viewing the `Edit Vehicle` modal
- **And** I have correctly inputted values into the form
- **When** I click the `Edit Vehicle` button
- **Then** the `Update Vehicle` modal closes
- **And** a `POST` API request is sent to the server
- **And** returns a value of `201` with a payload containing `{"message": "Successfully updated vehicle."}`

#### Scenario: User inputs invalid information into `Edit Vehicle` modal

- **Given** I have clicked the `Edit` icon button and I am viewing the `Edit Vehicle` modal
- **And** I have incorrectly inputted values into the form
- **When** I click the `Update Vehicle` button
- **Then** a `</v-alert>` pops up saying `An error occured processing your form.`
- **And** a no API request is sent
 
#### Scenario: User inputs valid information into the `Edit Vehicle` modal but a vehicle with a different VIN has the same licesnse plate number

- **Given** I have clicked the `Edit` icon button and I am viewing the `Edit Vehicle` modal
- **And** I have correctly inputted values into the form
- **When** I click the `Update Vehicle` button
- **Then** the `Edit Vehicle` modal closes
- **And** a `POST` API request is sent to the server
- **And** returns a value of `409` with a payload containing a `human readable error message`

---

### US-4.4 — Edit a vehicle as a `maintenance` role

#### Scenario: User clicks the edit icon button

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** click the `Edit` icon button
- **Then** a edit vehicle modal pops up
- **And** all form values are filled out with vehicle information 
- **And** no API request is sent

#### Scenario: User inputs valid information into the `Edit Vehicle` modal

- **Given** I have clicked the `Edit` icon button and I am viewing the `Edit Vehicle` modal
- **And** I have correctly inputted values into the form
- **When** I click the `Edit Vehicle` button
- **Then** the `Update Vehicle` modal closes
- **And** a `POST` API request is sent to the server
- **And** returns a value of `201` with a payload containing `{"message": "Successfully updated vehicle."}`

#### Scenario: User inputs invalid information into `Edit Vehicle` modal

- **Given** I have clicked the `Edit` icon button and I am viewing the `Edit Vehicle` modal
- **And** I have incorrectly inputted values into the form
- **When** I click the `Update Vehicle` button
- **Then** a `</v-alert>` pops up saying `An error occured processing your form.`
- **And** a no API request is sent
 
#### Scenario: User inputs valid information into the `Edit Vehicle` modal but a vehicle with a different VIN has the same licesnse plate number

- **Given** I have clicked the `Edit` icon button and I am viewing the `Edit Vehicle` modal
- **And** I have correctly inputted values into the form
- **When** I click the `Update Vehicle` button
- **Then** the `Edit Vehicle` modal closes
- **And** a `POST` API request is sent to the server
- **And** returns a value of `409` with a payload containing a `human readable error message`

---

### US-4.5 — Delete a vehicle as a `admin` role

#### Scenario: User clicks the delete icon button

- **Given** I am on the Vehicles.vue as a `admin`
- **When** click the `Delete` icon button
- **Then** a `DELETE` API request is sent to the server
- **And** removes the selected vehicle with matching VIN

#### Scenario: User clicks the delete icon button but no vehicle exists in the database

- **Given** I am on the Vehicles.vue as a `admin`
- **When** click the `Delete` icon button
- **Then** a `DELETE` API request is sent to the server
- **And** returns a `500` error with payload containing `{"message": "human readable error"}`

---

### US-4.6 — Delete a vehicle as a `maintenance` role

#### Scenario: User clicks the delete icon button

- **Given** I am on the Vehicles.vue as a `maintainence`
- **When** click the `Delete` icon button
- **Then** a `DELETE` API request is sent to the server
- **And** removes the selected vehicle with matching VIN

#### Scenario: User clicks the delete icon button but no vehicle exists in the database

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** click the `Delete` icon button
- **Then** a `DELETE` API request is sent to the server
- **And** returns a `500` error with payload containing `{"message": "human readable error"}`

---

### US-4.7 — View all vehicles as a `admin` role

#### Scenario: There no vehicles to display in the vehicle list

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I load the page
- **And** a `GET` API request is sent to the server
- **And** returns a `200` with a payload containing `{"message": "Successfully retreived all vehicles"}`
- **And** there are not vechiles to display
- **Then** the list will display the headers of the list table with no vehicles in the list
- **And** a `</v-alert>` pops up saying `No vehicles to display`

#### Scenario: User first loads the Vehicle page

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I first view the page
- **Then** a `GET` API request is sent to the server
- **And** returns a `200` with a payload containing `{"message": "Successfully retreived all vehicles"}`
- **And** list of all vehicles in the database are shown
- **And** each list item contains `License`, `Make`, `Model`, `Year`, `Purchase Date`, `Color`, `Department` information
- **And** on the far right of the list item three icon buttons appear `maintenance info`, `edit`, and `delete`

#### Scenario: User adds a new vehicle 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I add a new vehicle
- **Then** a `GET` API request is sent to the server
- **And** returns a `200` with a payload containing `{"message": "Successfully retreived all vehicles"}`
- **And** the frontend re-retreives all vehicles in the database 
- **And** lists out all retreived vehicles in a list
- **And** each list item contains `License`, `Make`, `Model`, `Year`, `Purchase Date`, `Color`, `Department` information
- **And** on the far right of the list item three icon buttons appear `maintenance info`, `edit`, and `delete`

#### Scenario: User edits a vehicle in the list

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I edit a selected vehicle
- **Then** a `GET` API request is sent to the server
- **And** returns a `200` with a payload containing `{"message": "Successfully retreived all vehicles"}`
- **And** the frontend re-retreives all vehicles in the database 
- **And** lists out all retreived vehicles in a list
- **And** each list item contains `License`, `Make`, `Model`, `Year`, `Purchase Date`, `Color`, `Department` information
- **And** on the far right of the list item three icon buttons appear `maintenance info`, `edit`, and `delete`

#### Scenario: Vehicle does not have a color value

- **Given** I am on the Vehicles.vue as a `admin`
- **And** a vehicle does not have a color value
- **When** the list loads the vehicle list item
- **Then** the value for null will be replaced with `No Color`
- **And**  no API request is sent

#### Scenario: Vehicle does not have a license plate number value

- **Given** I am on the Vehicles.vue as a `admin`
- **And** a vehicle does not have a license plate number value
- **When** the list loads the vehicle list item
- **Then** the value for null will be replaced with `No License Plate`
- **And**  no API request is sent

---

### US-4.8 — View all vehicles as a `maintenance` role

#### Scenario: There no vehicles to display in the vehicle list

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I load the page
- **And** a `GET` API request is sent to the server
- **And** returns a `200` with a payload containing `{"message": "Successfully retreived all vehicles"}`
- **And** there are not vechiles to display
- **Then** the list will display the headers of the list table with no vehicles in the list
- **And** a `</v-alert>` pops up saying `No vehicles to display`

#### Scenario: User first loads the Vehicle page

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I first view the page
- **Then** a `GET` API request is sent to the server
- **And** returns a `200` with a payload containing `{"message": "Successfully retreived all vehicles"}`
- **And** a list of all vehicles in the database are shown
- **And** each list item contains `License`, `Make`, `Model`, `Year`, `Purchase Date`, `Color`, `Department` information
- **And** on the far right of the list item three icon buttons appear `maintenance info`, `edit`, and `delete`

#### Scenario: User adds a new vehicle 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I add a new vehicle
- **Then** a `GET` API request is sent to the server
- **And** returns a `200` with a payload containing `{"message": "Successfully retreived all vehicles"}`
- **And** the frontend re-retreives all vehicles in the database 
- **And** lists out all retreived vehicles in a list
- **And** each list item contains `License`, `Make`, `Model`, `Year`, `Purchase Date`, `Color`, `Department` information
- **And** on the far right of the list item three icon buttons appear `maintenance info`, `edit`, and `delete`

#### Scenario: User edits a vehicle in the list

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I edit a selected vehicle
- **Then** a `GET` API request is sent to the server
- **And** returns a `200` with a payload containing `{"message": "Successfully retreived all vehicles"}`
- **And** the frontend re-retreives all vehicles in the database 
- **And** lists out all retreived vehicles in a list
- **And** each list item contains `License`, `Make`, `Model`, `Year`, `Purchase Date`, `Color`, `Department` information
- **And** on the far right of the list item three icon buttons appear `maintenance info`, `edit`, and `delete`

#### Scenario: Vehicle does not have a color value

- **Given** I am on the Vehicles.vue as a `maintenance`
- **And** a vehicle does not have a color value
- **When** the list loads the vehicle list item
- **Then** the value for null will be replaced with `No Color`
- **And**  no API request is sent

#### Scenario: Vehicle does not have a license plate number value

- **Given** I am on the Vehicles.vue as a `maintenance`
- **And** a vehicle does not have a license plate number value
- **When** the list loads the vehicle list item
- **Then** the value for null will be replaced with `No License Plate`
- **And**  no API request is sent

---

### US-4.9 — Filter vehicle list as `admin` role

#### Scenario: User chooses from the year drop down filter 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I select a value from the year drop down filter
- **Then** the drop down field shows the selected value
- **And** the frontend shows only the vehicles with that year
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User chooses from the department drop down filter 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I select a value from the department drop down filter
- **Then** the drop down field shows the selected value
- **And** the frontend shows only the vehicles with that department 
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User begins to type in the `Make` filter 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I begin to type in the `Make` filter combo box
- **Then** the frontend shows only the matching vehicles
- **And** continues to update the list as I type in the field
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User begins to type in the `Model` filter 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I begin to type in the `Model` filter combo box
- **Then** the frontend shows only the matching vehicles
- **And** continues to update the list as I type in the field
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User begins to type in the `Color` filter 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I begin to type in the `Color` filter text field
- **Then** the frontend shows only the matching vehicles
- **And** continues to update the list as I type in the field
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User begins to type in the `License` filter 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I begin to type in the `License` filter text field
- **Then** the frontend shows only the matching vehicles
- **And** continues to update the list as I type in the field
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User chooses from the `From Purchase Date` date filter 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I select a date from the `From Purchase Date` date filter
- **Then** the selected date shows in the field
- **And** the frontend shows only the vehicles purchased after or on the selected date to that current day
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User chooses from the `Before Purchase Date` date filter 

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I select a date from the `Before Purchase Date` date filter
- **Then** the selected date shows in the field
- **And** the frontend shows only the vehicles purchased before or on the selected date
- **And** still applying all other filters
- **And** no API request is sent

---

### US-4.10 — Filter vehicle list as `maintenance` role

#### Scenario: User chooses from the year drop down filter 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I select a value from the year drop down filter
- **Then** the drop down field shows the selected value
- **And** the frontend shows only the vehicles with that year
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User chooses from the department drop down filter 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I select a value from the department drop down filter
- **Then** the drop down field shows the selected value
- **And** the frontend shows only the vehicles with that department 
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User begins to type in the `Make` filter 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I begin to type in the `Make` filter combo box
- **Then** the frontend shows only the matching vehicles
- **And** continues to update the list as I type in the field
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User begins to type in the `Model` filter 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I begin to type in the `Model` filter combo box
- **Then** the frontend shows only the matching vehicles
- **And** continues to update the list as I type in the field
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User begins to type in the `Color` filter 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I begin to type in the `Color` filter text field
- **Then** the frontend shows only the matching vehicles
- **And** continues to update the list as I type in the field
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User begins to type in the `License` filter 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I begin to type in the `License` filter text field
- **Then** the frontend shows only the matching vehicles
- **And** continues to update the list as I type in the field
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User chooses from the `From Purchase Date` date filter 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I select a date from the `From Purchase Date` date filter
- **Then** the selected date shows in the field
- **And** the frontend shows only the vehicles purchased after or on the selected date to that current day
- **And** still applying all other filters
- **And** no API request is sent

#### Scenario: User chooses from the `Before Purchase Date` date filter 

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I select a date from the `Before Purchase Date` date filter
- **Then** the selected date shows in the field
- **And** the frontend shows only the vehicles purchased before or on the selected date
- **And** still applying all other filters
- **And** no API request is sent

---

### US-4.11 — Vehicle maintenance as a `admin`

#### Scenario: User clicks the `Maintenance` icon button

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I click the `Maintenance` icon button 
- **Then** I am taken to `Maintenance.vue`
- **And** the selected vehicle's VIN is sent in the `path` for the `Maintenance.vue` to use

---

### US-4.12 — Vehicle maintenance as a `maintenance`

#### Scenario: User clicks the `Maintenance` icon button

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I click the `Maintenance` icon button 
- **Then** I am taken to `Maintenance.vue`
- **And** the selected vehicle's VIN is sent in the `path` for the `Maintenance.vue` to use

### US-4.13 — View vehicle image as a `admin`

#### Scenario: User hovers over a vehicle list item as `admin`

- **Given** I am on the Vehicles.vue as a `admin`
- **When** I hover over a vehicle in the table 
- **Then** I view a image of the vehicle if one is available in the `Images` table
- **And** the selected vehicle's VIN is sent in the `path` for the `Maintenance.vue` to use

### US-4.14 — View vehicle image as a `maintenance`

#### Scenario: User hovers over a vehicle list item as `maintenance`

- **Given** I am on the Vehicles.vue as a `maintenance`
- **When** I hover over a vehicle in the table 
- **Then** I view a image of the vehicle if one is available in the `Images` table
- **And** the selected vehicle's VIN is sent in the `path` for the `Maintenance.vue` to use

---
