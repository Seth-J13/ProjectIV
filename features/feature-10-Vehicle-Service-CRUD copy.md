# Feature: Vehicle Service Log

**Feature ID:** 10
**Branch pattern:** `feature/10-vehicle-service-log`
**Status:** Draft
**Created:** 2026-10-29
**Input:** Maintenance and Admin need to create, read, and update a service log for an existing vehicle.
**Depends on:** [Feature 1 — User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md)

---

## User Stories

### US-10.1: Create Vehicle logs

**As a** Maintance User or admin 
**I want to** create vehicle service logs 
**So that** I can record when a vehicle was serviced, what was fixed, and whether the service was completed. 

**Priority:** P1
**Independent test:** Sign in as maintenance, save a log with a service date, vehicle id, description, and completed status, and see that log listed for that vehicle.
**Acceptance scenarios:** see ### US-10.1 under Acceptance Criteria

### US-10.2: Vehicle logs Ownership permissions 

**As the** owner of the maintance log or an admin 
**I want to** assign ownership and permissions on a maintance log to others. 
**So that** Only authorized users can modify vehicle logs they worked on. 

**Priority:** P3
**Independent test:** As the owner, add another user as an owner. A maintenance user who is not an owner and is not an admin cannot change that log.
**Acceptance scenarios:** see ### US-10.2 under Acceptance Criteria

### US-10.3: Read Vehicle Logs 

**As a** Maintance User or admin  
**I want** View Vehicle service logs for all vehicles 
**So that** we can see when a vehicle was serviced, what was fixed, and if it was completed or not 

**Priority:** P1
**Independent test:** Sign in as maintenance, open the log list, and see the service date, vehicle id, description, completed status, and creator.
**Acceptance scenarios:** see ### US-10.3 under Acceptance Criteria

### US-10.4: Modify Vehicle Log 

**As the**  owner of the maintance log or an Admin 
**I want to** modify vehicle logs
**So that** I can fix any mistakes and Update maintance information as needed

**Priority:** P2
**Independent test:** As the owner, change the description and see the saved description on the log.
**Acceptance scenarios:** see ### US-10.4 under Acceptance Criteria


### US-10.5: Delete Vehicle Logs 

**As a** Vehicle log System 
**I want to** maintenance logs older than 18 months to be deleted automatically
**So that** unnecessary records are removed and database storage is reduced. 

**Priority:** P1
**Independent test:** A log whose service date is more than 18 months ago is removed and no longer appears on that vehicle’s logs.
**Acceptance scenarios:** see ### US-10.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

FR-001: Maintenance users and admins shall create vehicle logs.

FR-002: A vehicle log shall contain:
- service date
- vehicle identifier
- description
- completed status
- creator

FR-003: Maintenance users and admins shall view vehicle logs.

FR-004: Log owners and admins shall update vehicle logs.

FR-005: Log owners may assign ownership permissions to other users.

FR-006: Administrators may update any vehicle log.

FR-007: Vehicle logs older than 18 months shall be automatically deleted.

FR-008: Users without ownership permissions shall not modify vehicle logs.

FR-009: Deleted logs shall no longer appear in searches or lists.

FR-010: Vehicle log creation and modification actions shall store timestamps.

---

## Assumptions

- The vehicle registration application shell (Vue 3 frontend, Express API mounted at /api, MySQL database) already exists in the repository.

- User authentication and session management have already been implemented in a previous feature.

- Roles are user, driver, maintenance, and admin.

- vehicle service log button or menu option already exists for accessing the Vehicle Service Log page. 

- Only maintance and Admin see the View service log button to take them to the service log page

- Every vehicle has a unique vehicleId. 

- the Vehicle that we are attempting to view the service log exists 


---

## Edge Cases

User attempts to create a vehicle service log that is blank.

User attempts to delete a service log that they dont have ownership of. 

Non admin or maintance user attempts to access the vehicle service log page 





---

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: Service log is able to be created 
- **SC-003**: When a service log is created it is applied to the vehicle id 
- **SC-004**: Service log is able to be read by maintance and admin
- **SC-005**: when reading a service log it we can find the service type, the description, the completion status, the creation date, the owners.
- **SC-006**: A vehicle service log is able to be modified 
- **SC-007**: Any modifications are changes are saved to the service log information. 
- **SC-008**: When vehicle service logs are deleted they are removed they form the vehicle logs for the vehicle id it is connected to.


---

## Data Ownership & Isolation

Vehicle logs are fleet records. A maintenance user or an admin may read every log. The creator is the first owner. Only an owner of that log, or an admin, may update it, delete it, or add another owner.


| Rule | Requirement |
| ---- | ----------- |
| **Read scope** | Roles `maintenance` and `admin` may list every log and open any log by id. |
| **Create scope** | Roles `maintenance` and `admin` may create a log for an existing `vehicleId`. The signed-in user is stored as `creatorId` and as an owner. |
| **Write scope** | Update, manual delete, and adding an owner succeed only when the caller owns that log or has role `admin`. |
| **Other roles** | Roles `user` and `driver` receive **403** on every vehicle-log route and do not see **View service log**. |
| **Unknown log** | An allowed role asking for a missing log id receives **404**. |
| **Retention** | A log whose service date is more than 18 months ago is deleted and does not appear in later lists. |


## API Requirements


| Method | Endpoint | Auth | Purpose |
| ------ | -------- | ---- | ------- |
| `POST` | `/api/vehicle-logs` | Bearer, `maintenance` or `admin` | Create a log |
| `GET` | `/api/vehicle-logs` | Bearer, `maintenance` or `admin` | List logs |
| `GET` | `/api/vehicle-logs/:id` | Bearer, `maintenance` or `admin` | Read one log |
| `PUT` | `/api/vehicle-logs/:id` | Bearer, owner or `admin` | Update a log |
| `DELETE` | `/api/vehicle-logs/:id` | Bearer, owner or `admin` | Delete a log |
| `POST` | `/api/vehicle-logs/:id/owners` | Bearer, owner or `admin` | Add an owner |


**Create and update body:**

```json
{
  "serviceDate": "2026-11-10",
  "vehicleId": "1HGCM82633A004352",
  "description": "Replaced front brake pads",
  "completed": true
}
```

**Success response** (`201` on create, `200` on read and update):

```json
{
  "id": 1,
  "serviceDate": "2026-11-10",
  "vehicleId": "1HGCM82633A004352",
  "description": "Replaced front brake pads",
  "completed": true,
  "creatorId": 4,
  "ownerIds": [4],
  "createdAt": "2026-11-10T18:00:00.000Z",
  "updatedAt": "2026-11-10T18:00:00.000Z"
}
```

**Add owner body:** `{ "userId": 9 }`

**Delete success:** `{ "message": "Vehicle log deleted." }`

**Error response:** `{ "message": "Human-readable explanation." }`

Quoted messages that tests must match:


| Situation | Status | `message` |
| --------- | ------ | --------- |
| Missing or expired token | 401 | `Unauthorized` |
| Role is `user` or `driver` | 403 | `Forbidden` |
| Caller is not an owner and is not admin | 403 | `Forbidden` |
| Unknown log id | 404 | `Vehicle log not found!` |
| Unknown vehicle id | 404 | `Vehicle not found!` |
| A required field is missing | 400 | `Vehicle log is incomplete!` |


---

## Key Entities

- **Vehicle log**: one service entry for an existing vehicle. It stores service date, vehicle id, description, completed status, creator, owners, and created and updated timestamps.
- **User**: the signed-in account from Feature 1. Role `maintenance` or `admin` may create and read logs. The creator, any assigned owner, and any admin may update, delete, and assign owners.
- **Vehicle**: not created by this feature. A log stores that vehicle’s id.

---

## Screen Requirements

### [View: Vehicle Service Logs] — route name `vehicle-logs` (`/vehicle-logs`)

- Shown only to `maintenance` and `admin`
- Heading: **Vehicle Service Logs**
- Table columns: **Service date**, **Vehicle**, **Description**, **Completed**, **Creator**
- An empty list still shows the heading and **Create log**
- **Create log** opens a dialog with **Service date**, **Vehicle**, **Description**, and **Completed** (all required)
- Opening a row shows that log. An owner or an admin sees **Save**, **Delete**, and **Add owner**
- **Save** writes the edited fields and the list shows the saved values
- **Delete** removes the row from the list
- **Add owner** asks for a user and adds that user as an owner
- A maintenance user who is not an owner and is not an admin does not see **Save**, **Delete**, or **Add owner**
- **Error:** shows the API `message`, including **"Vehicle log is incomplete!"**, **"Vehicle not found!"**, **"Vehicle log not found!"**, and **"Forbidden"**

### App chrome

- `maintenance` and `admin` see **View service log**, which opens `vehicle-logs`
- `user` and `driver` do not see **View service log**. Opening `/vehicle-logs` directly shows no logs

---

## Data Model Requirements

This feature **owns** `vehicle_logs` and `vehicle_log_owners`. It stores `vehicleId` and `creatorId`. It does not create the `vehicles` or `users` tables.

### `vehicle_logs` table


| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `serviceDate` | DATE | Required |
| `vehicleId` | STRING | Required; references an existing vehicle |
| `description` | TEXT | Required |
| `completed` | BOOLEAN | Required |
| `creatorId` | INTEGER FK | Required; references `users.id`. Set to the signed-in user on create |
| `createdAt` | DATE | Set when the log is created |
| `updatedAt` | DATE | Set when the log is created and on every update |


### `vehicle_log_owners` table


| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `vehicleLogId` | INTEGER FK | Required; references `vehicle_logs.id` |
| `userId` | INTEGER FK | Required; references `users.id` |


The creator’s user id is inserted as the first owner row.

### Associations

- `VehicleLog` belongsTo `User` as creator
- `VehicleLog` belongsToMany `User` as owners through `vehicle_log_owners`
- `VehicleLog` belongsTo `Vehicle` through `vehicleId`

---

## Acceptance Criteria (Gherkin)

### US-10.1 — Create Vehicle logs

#### Scenario: Maintenance creates a log

- **Given** I am signed in as `maintenance`
- **And** a vehicle exists
- **When** I open **Vehicle Service Logs** and press **Create log**
- **And** I enter a service date, that vehicle, a description, and a completed status
- **And** I save
- **Then** the list shows that log for that vehicle id
- **And** I am the creator
- **And** I am an owner

#### Scenario: Admin creates a log

- **Given** I am signed in as `admin`
- **And** a vehicle exists
- **When** I create a log for that vehicle with a service date, description, and completed status
- **Then** the log is stored for that vehicle id

#### Scenario: Blank log

- **Given** I am signed in as `maintenance`
- **When** I press **Create log** and save with a required field empty
- **Then** I see **"Vehicle log is incomplete!"**
- **And** no log is added

### US-10.2 — Vehicle logs Ownership permissions

#### Scenario: Owner assigns another owner

- **Given** I am signed in as the owner of a vehicle log
- **And** another user exists
- **When** I add that user as an owner
- **Then** that user can modify the log

#### Scenario: Non-owner cannot modify

- **Given** I am signed in as `maintenance`
- **And** I am not an owner of a log
- **And** I am not an admin
- **When** I try to update that log
- **Then** I see **"Forbidden"**
- **And** the log is unchanged

### US-10.3 — Read Vehicle Logs

#### Scenario: Maintenance reads the logs

- **Given** I am signed in as `maintenance`
- **And** a vehicle log exists
- **When** I open **Vehicle Service Logs**
- **Then** I see its service date, vehicle id, description, completed status, and creator

#### Scenario: Admin reads the logs

- **Given** I am signed in as `admin`
- **And** a vehicle log exists
- **When** I open **Vehicle Service Logs**
- **Then** I see that log

#### Scenario: Driver cannot open the page

- **Given** I am signed in as `driver`
- **When** I go to `/vehicle-logs`
- **Then** I do not see the log list

### US-10.4 — Modify Vehicle Log

#### Scenario: Owner updates a log

- **Given** I am signed in as the owner of a vehicle log
- **When** I change the description and save
- **Then** the list shows the new description

#### Scenario: Admin updates any log

- **Given** I am signed in as `admin`
- **And** I am not the creator of a log
- **When** I change the completed status and save
- **Then** the log shows the new completed status

### US-10.5 — Delete Vehicle Logs

#### Scenario: Log older than 18 months is removed

- **Given** a vehicle log has a service date more than 18 months ago
- **When** retention runs
- **Then** that log is deleted
- **And** it does not appear on that vehicle’s logs

#### Scenario: Non-owner cannot delete

- **Given** I am signed in as `maintenance`
- **And** I am not an owner of a log
- **And** I am not an admin
- **When** I try to delete that log
- **Then** I see **"Forbidden"**
- **And** the log remains on the list

---

## Test Coverage Map

Each scenario above must map to at least one automated test.


| Story | Scenario | Test file | Test name |
| ----- | -------- | --------- | --------- |
| US-10.1 | Maintenance creates a log | `frontend/tests/VehicleLog.test.js` | `it("Maintenance creates a log")` |
| US-10.1 | Admin creates a log | `backend/tests/vehicleLog.test.js` | `it("Admin creates a log")` |
| US-10.1 | Blank log | `backend/tests/vehicleLog.test.js` | `it("Blank log")` |
| US-10.2 | Owner assigns another owner | `backend/tests/vehicleLog.test.js` | `it("Owner assigns another owner")` |
| US-10.2 | Non-owner cannot modify | `backend/tests/vehicleLog.test.js` | `it("Non-owner cannot modify")` |
| US-10.3 | Maintenance reads the logs | `frontend/tests/VehicleLog.test.js` | `it("Maintenance reads the logs")` |
| US-10.3 | Admin reads the logs | `frontend/tests/VehicleLog.test.js` | `it("Admin reads the logs")` |
| US-10.3 | Driver cannot open the page | `frontend/tests/VehicleLog.test.js` | `it("Driver cannot open the page")` |
| US-10.4 | Owner updates a log | `frontend/tests/VehicleLog.test.js` | `it("Owner updates a log")` |
| US-10.4 | Admin updates any log | `backend/tests/vehicleLog.test.js` | `it("Admin updates any log")` |
| US-10.5 | Log older than 18 months is removed | `backend/tests/vehicleLog.test.js` | `it("Log older than 18 months is removed")` |
| US-10.5 | Non-owner cannot delete | `backend/tests/vehicleLog.test.js` | `it("Non-owner cannot delete")` |


## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 10 from @features/feature-10-Vehicle-Service-CRUD copy.md on branch `feature/10-vehicle-service-log`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior listed under Out of Scope.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

## Definition of Done

- [ ] Backend and frontend implemented per this spec (**FR-00N** satisfied)
- [ ] **Success Criteria (SC-00N)** met
- [ ] All mapped tests pass (`npm test`)
- [ ] Test Coverage Map complete
- [ ] Test traceability (file headers, nested `describe` / `it`, audit commands in this spec)
- [ ] `features/reference/data-model.md` updated (if schema changed)
- [ ] `features/reference/api.md` updated (if API changed)
- [ ] `features/reference/behavior.md` updated (if product rules changed)

---

## Out of Scope

- Creating, editing, or listing vehicles themselves
- Registration requests, departments, notes, and the maintenance specification catalog
- Login, create account, logout, and the landing-page placeholder
- Password reset, email verification, profile editing, and Google sign-in
