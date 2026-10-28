# Feature: Maintenance Info CRUD
**Feature ID:** 5
**Branch pattern:** `feature/5-Maintenance-Info-CRUD`
**Status:** Draft
**Created:** 2026-10-27
**Input:** This feature is a maintenance view page
**Depends on:** [Feature 4 -- Vehicle-CRUD](feature-4-Vehicle-CRUD.md)

---

## User Stories

### US-5.1: User views a vehicle's maintenance page

**As a** (`admin` or `maintenance`)
**I want to** view a vehicle's maintenance information consisting of `Maintenance Notes` and `Vehicle Information`
**So that** I can see basic information about the vehicle and what needs to be worked on

**Priority:** PN (eg. P1 for most important)  
**Independent test:** <how to verify this story alone, in one sentence> (eg. Submit valid registration and land on protected home with `user` in `localStorage`)
**Acceptance scenarios:** see ### US-N.N (eg. ### US-1.1) under Acceptance Criteria

### US-1.2: ...
**As a**
**I want to**
**So that**

**Priority:** PN
**Independent test:**
**Acceptance scenarios:**

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
