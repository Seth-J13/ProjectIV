# Feature: User Authentication & Session Management

**Feature ID:** 12
**Branch pattern:** `feature/12-Landing-Vue`
**Status:** Draft
**Created:** 2026-11-07
**Input:** Create the landing page for different roles to view
**Depends on:** [Feature 1 -- User Auth & Session Management](features/feature-1-User-Auth-&-Session-Management), [Feature 2 -- Google Auth](features/feature-2-Google-Auth), [Feature 8 -- Requests CRUD](features/feature-8-Request-CRUD)

---

## User Stories

### US-12.1: View All Available Vehicles
**As a** (`admin`, `maintenance`, `driver`, or `user`)
**I want to** View all vehicles that are available for reservation
**So that** I can see my options of available vehicles

**Priority:** P1
**Independent test:** I land on the landing page and see a list of all available vehicles
**Acceptance scenarios:**see ### US-12.1 under Acceptance Criteria

### US-12.2: View `My` Reserved Vehicles
**As a** (`admin`, `driver`, `maintenance` or `user`)
**I want to** see a list of vehicles that I have reserved
**So that** I can manage my reservation requests

**Priority:** P1
**Independent test:** I land on the landing page and view my reserved vehicles
**Acceptance scenarios:**see ### US-12.2 under Acceptance Criteria

### US-12.3: View Vehicles Currently in Service
**As a** (`admin`, or `maintenance`)
**I want to** view a list of vehicles that are currently in service
**So that** I know which vehicles are needing to be serviced and can manage them

**Priority:** P1
**Independent test:** I land on the landing page and view a list of vehicles that have maintenance requests
**Acceptance scenarios:**see ### US-12.3 under Acceptance Criteria

### US-12.4: Toggle between Vehicle Request Form and Maintenance Request
**As a** (`admin`, `maintenance`)
**I want to** toggle between different `Vehicle Request Form` and `Maintenance Request`
**So that** I can make different requests as needed

**Priority:** P1
**Independent test:** I land on the landing page and I see a toggle switch that changes the form component
**Acceptance scenarios:**see ### US-12.4 under Acceptance Criteria

### US-12.5: View `Vehicle Request Form` component
**As a** (`admin`, `maintenance`, `driver`, and `user`)
**I want to** view the `Vehicle Request Form` component
**So that** I can make a request for to reserve a vehicle

**Priority:** P1
**Independent test:** I land on the landing page and at the bottom is the `Vehicle Request Form` component
**Acceptance scenarios:**see ### US-12.5 under Acceptance Criteria

### US-12.6: View `Maintenance Request Form` component
**As a** (`admin`, `maintenance`)
**I want to** view the `Maintenance Request Form` component
**So that** I can make a request for to reserve a vehicle for maintenance

**Priority:** P1
**Independent test:** I land on the landing page and at the bottom is the `Maintenance Request Form` component
**Acceptance scenarios:**see ### US-12.6 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: System **MUST** show what the user role is allowed to see
- **FR-002**: System **MUST NOT** show what the use role is not allowed to see
- **FR-003**: System **MUST** use `Vehicle Request Form` component
- **FR-004**: System **MUST** use `Maintenance Request Form` component
- **FR-005**: System **MUST** navigate user to proper `.vue`s when managing list items on the landing page
- **FR-006**: System **MUST** adhere to `WCAG` and maintain visual hierarchy
- **FR-007**: System **MUST** display lists in a way that is readable from varying screen sizes and layouts

---

## Assumptions

- What already exists 
    - `feature-1-User-Auth-&-Session-Management`
    - `feature-2-Google-Auth`
    - `feature-3-Department-CRUD`
    - `feature-4-Vehicle-CRUD`
    - `feature-5-Maintenance-Info-CRUD`
    - `feature-6-Destination-CRUD`
    - `feature-7-Driver-CRUD`
    - `feature-8-Requests-CRUD`
    - `feature-9-Note-CRUD`
    - `feature-10-Vehicle-Service-Log-CRUD`
    - `feature-11-Images`
    - `Vehicle Request Form` component
    - `Maintenance Request Form` component
    - `Menu Bar` component
- What you are deliberately not building yet
    - You do not need to create new form components, **if you cannot find the correct components notify the user when making this feature doc**
    - Do not create multiple `Landing.vue`s for each role, only create one that filters out the lists depending on the user
    - Do no create a `Menu Bar` component

## Edge Cases

- PUT or Add request with the same id --> `400`
- PUT or POST with incorrect database types --> `500`
- PUT or POST with no inputted values --> `400`
- GET, POST, PUT, DELETE as a student --> `401`
- Cross-user access → (`driver`, `user`, and `maintenance`) roles should not be able to view vehicles that are unavailable unless they requested the vehicle

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge
- **SC-002**: Only one `.vue` created
- **SC-003**: Each role views only what they are allowed to view
- **SC-004**: After logging in every role is directed to the `Landing.vue`
- **SC-005**: Each role has access to all other vues they have access to with the `Menu Bar` 

---

## Data Ownership & Isolation (foundation)

Features 1 and 2 establishes identity; 

- No user owns the vehicles or requests
- Error messages should that confirm another user's request exists unless `admin`.

---

## Key Entities

- **User**: registered account (name, email, username, role)
- **Session**: server-side record tying a JWT token to a user; expires after 24 hours.
- **Requests**:
    - `Vehicle Request`- vehicles requested to be reserved
    - `Maintenance Request` - vehicles requested for maintenance

---

## Data Model Requirements
- **NO TABLE TO CREATE**

---

## API Requirements
All routes mount under `/vehicle-t3`, Auth is `Authorization: Bearer <token>` from Feature 1.
| Method   | Endpoint                                          | Purpose                                                                           |  Auth  |
| -------- | ------------------------------------------------- | --------------------------------------------------------------------------------- | ------ | 
| `GET`    | `/vehicle-t3/vehicles/`                           | Get all vehicles in the database                                                  |  All   |
| `GET`    | `/vehicle-t3/requests/`                           | Get all requests in the database                                                  |  All   |
| `POST`   | `/vehicle-t3/requests/`                           | Create a new vehicle request                                                      |  All   |
| `POST`   | `/vehicle-t3/requests/`                           | Create a new maintenance request                                                  |  `admin`, `maintenance` |
| `PUT`    | `/vehicle-t3/requests/:request_id`                | Update a new vehicle request                                                      |  All   |
| `PUT`    | `/vehicle-t3/requests/:request_id`                | Update a new maintenance request                                                  |  `admin`, `maintenance` |
| `DELETE` | `/vehicle-t3/requests/:request_id`                | Delete a vehicle request the designated request number                            |  All   |
| `DELETE` | `/vehicle-t3/requests/:request_id`                | Delete a maintenance request the designated request number                        |  `admin`, `maintenance` |

**Create / Update Request Body (Request Table)**

```json
{
    "userId": 12312312,
    "vehicleId": 12345671234567123,
    "destId": 1232123321,
    "driverId": 12312312,
    "numPeople": 5,
    "currentlyActive": true,
    "startDate": '2026-10-25',
    "endDate": '2026-10-28',
    "startTime": '09:00:00',
    "endTime": '17:00:00'
}
```

**Success — create (**`201`**) and update (**`200`**):**

**Error response:** `{"message": "..."}`
| Status | When | Message |
| ------ | ---------------------------------------------------- | --------------------------------------------------- |
| `400` | Missing field | `(attribute) is required` (same pattern for `car license`, `make`, `model`, `driver`, `destination`, `number of people`, `start date`, `end date`) |
| `400` | Year is less than 1900 and greater than current year | `Select a year between 1900-Today` |

---

## Screen Requirements

### [View: Landing.vue] -- route name `landing`

- Path: `/landing`
- Heading: **Vehicle Management System**
- Visible in the nav to all users

**Lists**
- Available Vehicles
    - Table Headers: `License`, `Make`, `Model`, `Image`
- Your Reserved Vehicles
    - Table Headers: `License`, `Make`, `Model`, `Year`, `Image`
- Vehicles In Service
    - Table Headers: `License`, `Make`, `Model`, `Year`, `Image`, `Action`
    - Action: `Info Icon` button
- Reserved Vehicles
    - Table Headers: `License`, `Make`, `Model`, `Year`, `Image`, `Action`

**Form Section**
- Toggle Switch: Left side (`Request`), Right side (`Maintenance`)
- Form
    - Toggle to Left: `Vehicle Request Form`
    - Toggle to Right: `Maintenance Request Form`

---

## Acceptance Criteria (Gherkin)

### US-12.1 — View All Available Vehicles

#### Scenario: User logs in and `Landing.vue` is loaded

- **Given** I am a (`admin`, `mainentance`, `driver`, or `user`)
- **When** I log in 
- **And** the `Landing.vue` has loaded
- **And** a `GET` request is sent to get all vehicles
- **Then** the list displays all vehicles available to reserve

#### Scenario: User clicks a vehicle in the `All Available Vehicles` list

- **Given** I am a (`admin`, `mainentance`, `driver`, or `user`)
- **When** I click a list item
- **Then** the `Vehicle Request From` will have vehicle details filled out
- **And** no API request is sent

---

### US-12.2 — View `My` Reserved Vehicles

#### Scenario: User logs in and `Landing.vue` is loaded

- **Given** I am a (`admin`, `mainentance`, `driver`, or `user`)
- **When** I log in
- **And** the `Landing.vue` has loaded  
- **And** a `GET` request is sent to get all vehicles 
- **And** a `GET` request is sent to get all requests with my userId
- **Then** I see all the vehicles associated with my requests

#### Scenario: User clicks on a list item

- **Given** I am a (`admin`, `mainentance`, `driver`, or `user`)
- **When** I click one of the vehicles that I have reserved
- **Then** I am sent to the `Requests.vue`
- **And** no API request is sent

---

### US-12.3 — View Vehicles Currently in Service

#### Scenario: User logs in and `Landing.vue` is loaded 

- **Given** I am a (`admin` or `maintenance`)
- **When** I log in
- **And** a `GET` request is sent to get all vehicles  
- **Then** the list displays all vehicles currently reserved for maintenance work

#### Scenario: User clicks a list item

- **Given** I am a (`admin` or `maintenance`)
- **When** I click on a vehicle in the `Vehicles Currently in Service`
- **Then** I am redirected to the `Maintenance.vue` for the selected vehicle
- **And** no API request is sent

---

### US-12.4 — Toggle between Vehicle Request Form and Maintenance Request

#### Scenario: User clicks the form toggle switch 

- **Given** I am a (`admin` or `maintenance`)
- **When** I view the `Vehicle Request Form` component
- **And** I click the toggle button  
- **Then** the request form component switches to the `Maintenance Request Form` component
- **And** no API request is sent

---

### US-12.5 — View `Vehicle Request Form` component

#### Scenario: User correctly fills out the `Vehicle Request Form`

- **Given** I am a (`admin`, `mainentance`, `driver`, or `user`)
- **When** I fill out the `Vehicle Request Form` component
- **And** click `submit`
- **Then** a `POST` request is sent to create a vehicle request
- **And** returns `201` with a payload of `{"message": "human readable message"}`
- **And** component is reset for another request

#### Scenario: User incorrectly fills out the `Vehicle Request Form`

- **Given** I am a (`admin`, `mainentance`, `driver`, or `user`)
- **When** I fill out the `Vehicle Request Form` component
- **And** click `submit`
- **Then** a `POST` request is sent to create a vehicle request
- **And** returns `400` with a payload of `{"message": "human readable message"}`

---

### US-12.6 — View `Maintenance Request Form` component

#### Scenario: User correctly fills out the `Vehicle Request Form`

- **Given** I am a (`admin` or `mainentance`)
- **When** I fill out the `Maintenance Request Form` component
- **And** click `submit`
- **Then** a `POST` request is sent to create a maintenance request
- **And** returns `201` with a payload of `{"message": "human readable message"}`
- **And** component is reset for another request

#### Scenario: User incorrectly fills out the `Maintenance Request Form`

- **Given** I am a (`admin` or `mainentance`)
- **When** I fill out the `Maintenance Request Form` component
- **And** click `submit`
- **Then** a `POST` request is sent to create a maintenance request
- **And** returns `400` with a payload of `{"message": "human readable message"}`

---
