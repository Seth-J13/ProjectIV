# Feature: Vehicle CRUD
**Feature ID:** 4
**Branch pattern:** `feature/4-Vehicle-CRUD`
**Status:** Draft
**Created:** 2026-10-24
**Input:** This feature is a vehicle management to view, add, update, and delete vehicles
**Depends on:** [Feature 1 -- User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md), [Feature 2 -- Google Auth](feature-2-Google-Auth)
**Related:** `features/references...`, [ADR-NNNN](../docs/adr/NNNN-title.md) <-- optional

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
**Independent test:** I can see all filters `year`, `make`, `model`, `color`, `department`, `license`, `From Date`, `Before Date` as a `admin`
**Acceptance scenarios:** see ### US-4.9 under Acceptance Criteria

### US-4.10: Filter vehicle list as `maintenance` role
**As a** maintenace
**I want to** filter which vehicles are listed
**So that** I can view all vehicles that match the filters

**Priority:** P2
**Independent test:** I can see all filters `year`, `make`, `model`, `color`, `department`, `license`, `From Date`, `Before Date` as a `maintenance`
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

---

## Assumptions

- What already exists (eg. Feature 1 auth is on `dev`)
- What you are deliberately not building yet

## Edge Cases

- Empty required field → …
- Cross-user access → …
- Duplicate / invalid input → …

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge
- **SC-002**: <measurable outcome for this feature>

---

## Data Ownership & Isolation (foundation)

Feature 1 establishes identity; Features 2–3 enforce per-user data boundaries.

- Each user account is a separate tenant boundary for todo lists and items.
- No API in this feature returns another user's profile or session.
- Later features must never expose lists or todos across users — not in list responses, detail views, or error messages that confirm another user's resource exists.

---

## Key Entities

- **User**: registered account (name, email, username, role); owns future lists and todos.
- **Session**: server-side record tying a JWT token to a user; expires after 24 hours.

---



## Data Model Requirements
### Look under ./backend/app/models/(file name).js
- This shows the table you will need to model

## VVV Example table (Change or Delete) VVV
### `users` table


| Field      | Type        | Rules                              |
| ---------- | ----------- | ---------------------------------- |
| `id`       | INTEGER PK  | Auto-increment                     |
| `fName`    | STRING      | Required                           |
| `lName`    | STRING      | Required                           |
| `email`    | STRING      | Required, unique                   |
| `username` | STRING(100) | Required, unique; stored lowercase |
| `password` | STRING(255) | Required; bcrypt hash only         |
| `role`     | STRING(20)  | Default `worker`                   |

## ^^^ (Change or Delete) ^^^

---

## Acceptance Criteria (Gherkin)



### US-1.1 — {Related Functional Requirement}



#### Scenario: {What is happening or has happend}

- **Given** {Where are you on the website?}
- **When** {Main action?}
- **And** {What additional action did you take?}
- **Then** {Website response}
- **And** {additional response}
- **And** 
- **etc...** 


## VVV Example AC (Change or Delete) VVV
#### Scenario: User submits registration with missing email

- **Given** I am on the registration page
- **When** I leave the email field empty
- **And** I submit the form
- **Then** inline validation blocks the request
- **And** I see the message **"Email is required."**
- **And** no API request is sent
## ^^^ (Change or Delete) ^^^

---



### US-N.2 — {Related Functional Requirement}



#### Scenario: 

- **Given** 
- **And** 
- **When** 
- **And** 
- **Then** 
- **And** 
- **And**
- **And** 

---

### etc...
