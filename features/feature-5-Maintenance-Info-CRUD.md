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

### US-5.: 
**As a** (`admin` or `maintenance`)
**I want to**
**So that**

**Priority:** P
**Independent test:**
**Acceptance scenarios:** see ### US-5. under Acceptance Criteria

### US-5.: 
**As a** (`admin` or `maintenance`)
**I want to**
**So that**

**Priority:** P
**Independent test:**
**Acceptance scenarios:** see ### US-5. under Acceptance Criteria

### US-5.: 
**As a** (`admin` or `maintenance`)
**I want to**
**So that**

**Priority:** P
**Independent test:**
**Acceptance scenarios:** see ### US-5. under Acceptance Criteria

### US-5.: 
**As a** (`admin` or `maintenance`)
**I want to**
**So that**

**Priority:** P
**Independent test:**
**Acceptance scenarios:** see ### US-5. under Acceptance Criteria

### US-5.: 
**As a** (`admin` or `maintenance`)
**I want to**
**So that**

**Priority:** P
**Independent test:**
**Acceptance scenarios:** see ### US-5. under Acceptance Criteria






---

## Requirements

### Functional Requirements

#### eg. (**FR-001**: Users MUST authenticate with **username** + **password** (not email-only login).)
#### The specifics on what it is supposed to do

- **FR-001**: <System MUST>
- **FR-002**: <Users MUST be able to ...>
- **FR-003**: <... MUST NOT ...>
- etc...

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
