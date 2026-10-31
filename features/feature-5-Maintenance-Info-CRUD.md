# Feature: Maintenance Info CRUD
**Feature ID:** 5
**Branch pattern:** `feature/5-Maintenance-Info-CRUD`
**Status:** Draft
**Created:** 2026-10-27
**Input:** This feature is a maintenance view page
**Depends on:** [Feature 4 -- Vehicle-CRUD](feature-4-Vehicle-CRUD.md),  
**Required for future use:** [Feature 9 -- Note-CRUD](feature-9-note-crud.md), [Feature 10 -- Vehicle-Service-Log](feature-10-Vehicle-Service-Log)

---

## User Stories

### US-5.1: User views a vehicle's maintenance page

**As a** (`admin` or `maintenance`)
**I want to** view a vehicle's maintenance information consisting of `Maintenance Notes` and `Vehicle Information`
**So that** I can see basic information about the vehicle and what needs to be worked on

**Priority:** P1
**Independent test:** I view a vehicle's maintenance notes and can view the basic vehicle info (`Make`, `Model`, `Year`, `Fuel Type`, `Recommended Tire PSI`, `Oil Viscosity`, `Fuel Capacity`, `Tire Type`, and `Last Updated Mileage`) and maintenance note's related to that vehicle.
**Acceptance scenarios:** see ### US-5.1 under Acceptance Criteria

### US-5.2: User adds a maintenance note
**As a** (`admin` or `maintenance`)
**I want to** add a maintenance note to a vehicle
**So that** I can add to the service requests for the vehicle

**Priority:** P1
**Independent test:** I add a note service request and it shows up in the note service list 
**Acceptance scenarios:** see ### US-5.2 under Acceptance Criteria

### US-5.3: User edits a maintenance note
**As a** (`admin` or `maintenance`)
**I want to** edit a maintenance note
**So that** I can change add, change, or delete any information on the service note

**Priority:** P1
**Independent test:** I can click the edit icon button and a edit modal pops up so I can change the information
**Acceptance scenarios:** see ### US-5.3 under Acceptance Criteria

### US-5.4: User deletes a maintenance note 
**As a** (`admin` or `maintenance`)
**I want to** delete completed service requests
**So that** I can remove todo service requests from the `Service Request List`

**Priority:** P1
**Independent test:** I click the delete button and the service note is removed from the `Service Request List` and a `Maintencance Log` is created
**Acceptance scenarios:** see ### US-5.4 under Acceptance Criteria

### US-5.5: User updates the car's mileage
**As a** (`admin` or `maintenance`)
**I want to** update the mileage of the car
**So that** the system has a accurate mileage for the vehicle I am viewing

**Priority:** P1
**Independent test:** I click on the `Update Mileage` button and a modal pops up allowing me to input numbers to update the mileage
**Acceptance scenarios:** see ### US-5.5 under Acceptance Criteria

### US-5.6: User selects a service note
**As a** (`admin` or `maintenance`)
**I want to** click a service note and view a modal with that note's information
**So that** I can see specific details about the maintenance request to do better work on the vehicle

**Priority:** P1
**Independent test:** I click on a `Service Request` and a modal pops up with the service note details
**Acceptance scenarios:** see ### US-5.6 under Acceptance Criteria

### US-5.7: User clicks the `View Service Logs` button
**As a** (`admin` or `maintenance`)
**I want to** view the service logs for this vehicle
**So that** I can see the logs created for this vehicle

**Priority:** P2
**Independent test:** I click on `View Service Logs` and I am taken to the Service Logs page
**Acceptance scenarios:** see ### US-5.7 under Acceptance Criteria

### US-5.8: User clicks the `Back` button
**As a** (`admin` or `maintenance`)
**I want to** return to the Vehicle.vue page
**So that** I can browse the other vehicles

**Priority:** P2
**Independent test:** I click the back button and I am returned to the Vehicles.vue page
**Acceptance scenarios:** see ### US-5.8 under Acceptance Criteria

### US-5.9: User clicks the `Edit Maintenance Info` button
**As a** (`admin` or `maintenance`)
**I want to** edit the maintenance info for this type of vehicle
**So that** I correct mistakes or update for new information

**Priority:** P2
**Independent test:** I click the `Edit Maintenance Info` button and a edit modal pops up
**Acceptance scenarios:** see ### US-5.9 under Acceptance Criteria

### US-5.10: User clicks the `Manage Fuels` button
**As a** (`admin` or `maintenance`)
**I want to** manage the fuel types for vehicles
**So that** I can add, edit, or delete fuels

**Priority:** P3
**Independent test:** I click the `Manage Fuels` button and a `manage` modal pops up
**Acceptance scenarios:** see ### US-5.10 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: System **MUST** list all the maintenance request notes for the selected vehicle
- **FR-002**: System **MUST** allow user to edit each maintenance note
- **FR-003**: System **MUST** create a service log when deleting a maintenance note
- **FR-004**: System **MUST** allow the user to update the mileage of the car
- **FR-005**: System **MUST** take user to the `Vehicle-Service-Log.vue` when clicking the `View Service Logs` button
- **FR-006**: System **MUST** return user to `Vehicle.vue` when clicking the `Back` button
- **FR-007**: System **MUST** have a view, add, and edit `Maintenance Note` modal
- **FR-008**: System **MUST** confirm user wants to `delete` a maintenance note with a `Completion` modal
- **FR-009**: System **MUST NOT** allow non `admin` or non `maintenance` users view the `Maintenance.vue`
- **FR-010**: System **MUST** display the basic vehicle information `year`, `make`, `model`, `fuel type`, `recommended tire psi`, `oil viscosity`, `fuel capacity`, `tire type`, and `last updated mileage`(for the selected vehicle)

---

## Assumptions

- **What already exists**
 - `feature-1-User-Auth-&-Session-Management`
 - `feature-2-Google-Auth`
 - `feature-3-Department-CRUD`
 - `feature-4-Vehicle-CRUD`
- **What you are deliberately not building yet**
 - `feature-8-Requests-CRUD`
 - `feature-9-Note-CRUD`
 - `feature-10-Vehicle-Service-Log-CRUD`
 
## Edge Cases

- **Empty required field:**
  - `Text Fields`: `</v-alert>` to notify user that a empty field is required to be filled
  - `Radio Buttons`: `</v-alert>` to notify user that a selection needs to be made
- **Duplicate / invalid input**
 - Throw `400` restapi error and send a `</v-alert>` to notify user that the input is invalid or already exists

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge
- **SC-002**: Every functional requirement is met
- **SC-003**: Frontend, `Maintenance.vue` is the only created .vue for this feature doc
- **SC-004**: Backend, all routes, models, and controllers are created and configured correctly with authorization
- **SC-005**: User can successfully add a maintenance note 
- **SC-006**: User can successfully edit a maintenance note
- **SC-007**: User can successfully delete a maintenance note which causes a service log to be created
- **SC-008**: User can successfully update the mileage for the vehicle being viewed
- **SC-009**: User can be routed to `Vehicle-Service-Logs.vue` when clicking the `View Service Logs` button
- **SC-010**: User is returned to the `Vehicle.vue` when clicking the `Back` button

---

## Data Ownership & Isolation (foundation)

Feature 1 and 2 establishes identity

- Maintenance info is not owned by any user 
- No API in this feature returns another user's profile or session.
- Later features must never expose maintenance notes to unauthorized users.

---

## API Requirements

All routes mount under `/vehicle-t3`, Auth is `Authorization: Bearer <token>` from Feature 1. Every route below requires either a `admin` or `maintenance` session

| Method   | Endpoinnt                                         | Purpose                                                   |
| -------- | ------------------------------------------------- | --------------------------------------------------------- | 
| `GET`    | `/vehicle-t3/maintenance-infos?make=&model=&year=`| Retrieve the maintenance information for the specified `make`,`model`, and `year` | 
| `GET`    | `/vehicle-t3/requests/:vehicle_id`                | Retrieve the requests tied to this vehicle                | 
| `GET`    | `/vehicle-t3/notes/:request_id`                   | Retrieve all the notes from the specified request_id      |
| `GET`    | `/vehicle-t3/fuels/`                              | Retrieve all fuel types                                   |  
| `POST`   | `/vehicle-t3/fuels/`                              | Create a new fuel type                                    | 
| `POST`   | `/vehicle-t3/notes/`                              | Create a new maintenance note                             |
| `PUT`    | `/vehicle-t3/fuels/:fuel_id`                      | Update a specified fuel type                              | 
| `PUT`    | `/vehicle-t3/notes/:note_id`                      | Update a specified note                                   | 
| `PUT`    | `/vehicle-t3/vehicles/:vin`                       | Update a vehicle's mileage                                |
| `PUT`    | `/vehicle-t3/maintenance-infos?make=&model=&year=`| Update a maintenance info for a specified `make`, `model`, and `year` |
| `DELETE` | `/vehicle-t3/notes/:note_id`                      | Delete the specified note                                 |
| `DELETE` | `/vehicle-t3/fuels/:fuel_id`                      | Delete the specified fuel                                 | 

**Create / Update Note success response**
```json
{
  "submitted_when": "Morning",
  "type": "Maintenance",
  "maintenance_request": true,
  "request_id": 5,
  "name": John Doe,
  "date": "2026-10-29",
  "text": "Increased the tire pressure and fixed the steering."
}
```

**Update Vehicle success response**
```json
{
  "make": Honda,
  "model": Accord,
  "year": 2014,
  "purchased_date": "2015/12/16",
  "color": "White",
  "license_plate_num": "ABC344",
  "tag_exp_month": "2016/5/25",
  "department": "Engineering",
  "most_recent_dest_id": null,
  "available": 1,
  "mileage": 5320
}
```

**Update Maintenance info success response**
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

**Get Request success response**
```json
{
  "requester_id": 53,
  "vehicle_id": 17
}
```

**Error response:** `{"message": "human readable explanation"}` with approriate HTTP status
 | Status | When                                                 | Message                                             |
 | ------ | ---------------------------------------------------- | --------------------------------------------------- | 
 | `400`  | Missing field                                        | `(attribute) is required`                           | 
 | `401`  | A user who's role is not `admin` or `maintenance` tries to view the page | `Unauthorized user`             |
 
---

## Screen Requirements

### [View: Maintenance] - route name `maintenance`
- Path: `/maintenance-info`
- Heading: **Maintenance Management**
- Visible in the nav only when the stored user `role` is `admin` or `maintenance`

**Main Page**
- `back` button
- `View Service Logs` button
- `Edit Maintenance Info` button
- `Update Mileage` button
- `Manage Fuels` button
  - **Maintenance Info**
    - `Year`
    - `Make`
    - `Model`
    - `Fuel Type`
    - `Recommended Tire PSI`
    - `Oil Viscocity` 
    - `Fuel Capacity`
    - `Tire Type`
    - `Last Updated Mileage`

  - **Maintenance Notes Table**
    - Header
      - `Subject`, `Actions`
    - Table Item
      - `Subject`, `Edit Icon Button`(Opens `Edit Maintenance Note` modal), `Delete Icon Button` (Opens `Complete Note` modal)

**Modals**
- **`View` / `Add` / `Edit` maintenance notes**
  - `View`: Shows non-editable `subject`, `description`, and `close` button for the maintenance note
  - `Add`: Shows blank editable `subject`, `description`, `add` button, and `cancel` button
  - `Edit`: Shows filled out editable fields with the current note's `subject`, `description`, `update` button, and `cancel` button
- **Update Mileage**
  - Non-editable field showing the current mileage
  - Editable field only allowing integers 
  - `cancel` button
  - `add` button
- **Complete Note**
  - Header: `Complete`
  - Text: `Confirm Completion?`
  - `cancel` button
  - `confirm` button
- **`Edit` Maintenance Info**
  - `Year`: Drop down with values from 1900 to present year
  - `Make`: Combobox (Values should show all distinct `makes` in system or add a new make)
  - `Model`: Combobox (Values should show all distinct `models` in system or add a new model)
  - `Fuel Type`: Combobox (Values should show all distinct `fuels` in system or add a new fuel)
  - `Fuel Capacity`: Text field
  - `Recommended Tire PSI`: Stepper input
  - `Oil Viscosity`: Text field
  - `Tire Type`: Text field
  - `cancel` button
  - `update` button
- **`View` Fuel Management**
  - Header: `Fuel Management`
  - Table:
    - Headers: `Fuel Type`, `Actions`
    - Table Item:
      - Text: Fuel Type Name
      - Actions: `Edit Icon Button`,`Delete Icon Button`
  - `Add New Fuel` button
- **`Add` / `Edit` Fuel Management**
  - Fuel Text Field
  - `cancel` button
  - `add` / `update` button

---

## Key Entities

- **User**: registered account (name, email, username, role); owns future lists and todos.
- **Session**: server-side record tying a JWT token to a user; expires after 24 hours.
- **Vehicle**: server-side record of a vehicle
- **Maintenance Info**: server-side record of a `make`,`model`, and `year` vehicle
- **Request**: server-side record of all requests

---

## Data Model Requirements

### `Maintenance_Info` Table
| Field                 | Type           | Rules                                                       |
| --------------------- | -------------- | ----------------------------------------------------------- |
| `make`                | VARCHAR(30) PK | Primary Key, Required                                       |
| `model`               | VARCHAR(65) PK | Primary Key, Required                                       |
| `year`                | INTEGER     PK | Primary Key, Required                                       |
| `fuel_type_id`        | INTEGER     FK | Required                                                    |
| `fuel_capacity`       | INTEGER        | Required, Non-negative                                      |
| `oil_viscosity`       | CHAR(3)        | Required                                                    |
| `recommended_tire_psi`| DECIMAL(5, 2)  | Required, Non-negative                                      |
| `tire_type`           | VARCHAR(17)    | Required                                                    |

### `Fuel_Type` Table
| Field                 | Type           | Rules                                                       |
| --------------------- | -------------- | ----------------------------------------------------------- |
| `fuel_id`             | INTEGER     PK | Primary Key                                                 |
| `fuel_type`           | VARCHAR(50)    | Required                                                    |

---

## Acceptance Criteria (Gherkin)

### US-5.1 — User views a vehicle's maintenance page

#### Scenario: 

- **Given** 
- **When** 
- **Then** 
- **And** 

#### Scenario: 

- **Given** 
- **When** 
- **Then** 
- **And** 

#### Scenario: 

- **Given** 
- **When** 
- **Then** 
- **And** 

#### Scenario: 

- **Given** 
- **When** 
- **Then** 
- **And** 

---

### US-5. — 

#### Scenario: 

- **Given**  
- **When** 
- **Then** 
- **And** 

#### Scenario: 

- **Given** 
- **When** 
- **Then** 
- **And** 

#### Scenario: 

- **Given** 
- **When** 
- **Then** 
- **And** 

#### Scenario: 

- **Given** 
- **When** 
- **Then** 
- **And** 

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 1 from @features/feature-1-user-auth.md on branch `feature/1-user-auth`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/data-model.md`, `features/reference/api.md`, `features/reference/behavior.md`

---