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

**As a** maintenance User or admin 
**I want to** create vehicle service logs 
**So that** I can record when a vehicle was serviced, what was fixed, and whether the service was completed. 

**Priority:** P1
**Independent test:** Sign in as maintenance, save a log with a service date, vehicle id, description, and completed status, and see that log listed for that vehicle.
**Acceptance scenarios:** see ### US-10.1 under Acceptance Criteria

### US-10.2: Vehicle logs Ownership permissions 

**As the** owner of the maintenance log or an admin 
**I want to** assign ownership and permissions on a maintenance log to others. 
**So that** Only authorized users can modify vehicle logs they worked on. 

**Priority:** P3
**Independent test:** As the owner, add another user as an owner. A maintenance user who is not an owner and is not an admin cannot change that log.
**Acceptance scenarios:** see ### US-10.2 under Acceptance Criteria

### US-10.3: Read Vehicle Logs 

**As a** maintenance User or admin  
**I want** View Vehicle service logs for all vehicles 
**So that** we can see when a vehicle was serviced, what was fixed, and if it was completed or not 

**Priority:** P1
**Independent test:** Sign in as maintenance, open the log list, and see the service date, vehicle id, description, completed status, and creator.
**Acceptance scenarios:** see ### US-10.3 under Acceptance Criteria

### US-10.4: Modify Vehicle Log 

**As the**  owner of the maintenance log or an Admin 
**I want to** modify vehicle logs
**So that** I can fix any mistakes and Update maintenance information as needed

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

- **View Service Logs** already exists on a vehicle's maintenance page. It opens that vehicle's logs and does not change the route.

- Only maintenance and admin see **View Service Logs**

- Every vehicle has a unique vin (vin). 

- the Vehicle that we are attempting to view a service log of exists 


---

## Edge Cases

User attempts to create a vehicle service log that is blank -> `400` error.

A caller who is not the creator and is not an admin attempts to delete a service log -> `403` error 

Non admin or maintenance user attempts to access the vehicle service log page -> `403` error





---

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: Service log is able to be created 
- **SC-003**: When a service log is created it is applied to the vehicle id 
- **SC-004**: Service log is able to be read by maintenance and admin
- **SC-005**: When reading a service log, the list shows the service date, the vehicle, the description, the completion status, the creator, and the owners.
- **SC-006**: A vehicle service log is able to be modified 
- **SC-007**: Any modifications are changes are saved to the service log information. 
- **SC-008**: When vehicle service logs are deleted they are removed from the logs for the vehicle they belong to.


---

## Data Ownership & Isolation

Vehicle logs are fleet records. A maintenance user or an admin may read every log. The creator is the first owner. Only an owner of that log, or an admin, may update it or add another owner. Only the creator or an admin may delete the log.


| Rule | Requirement |
| ---- | ----------- |
| **Read scope** | Roles `maintenance` and `admin` may list every log and open any log by id. |
| **Create scope** | Roles `maintenance` and `admin` may create a log for an existing `vin`. The signed-in user is stored as `creatorId` and as an owner. |
| **Write scope** | An owner or an `admin` may update the description and completed status, and may add or remove an owner. Service date and vehicle change only when the caller is the creator or has role `admin`. Anyone else who changes those fields receives **403** and the saved values stay. Manual delete succeeds only when the caller is the creator or has role `admin`. |
| **Other roles** | Roles `user` and `driver` receive **403** on every vehicle-log route and do not see **View service log**. |
| **Unknown log** | An allowed role asking for a missing log id receives **404**. |
| **Retention** | A log whose service date is more than 18 months ago is deleted and does not appear in later lists. |


## API Requirements


| Method | Endpoint | Auth | Purpose |
| ------ | -------- | ---- | ------- |
| `POST` | `/api/vehicle-logs` | Yes, `maintenance` or `admin` | Create a log |
| `GET` | `/api/vehicle-logs` | Yes, `maintenance` or `admin` | List logs |
| `GET` | `/api/vehicle-logs/owner-choices` | Yes, `maintenance` or `admin` | List users as `id`, `firstName`, and `lastName` for the owner field. No email, role, password, or `googleSub` |
| `GET` | `/api/vehicle-logs/:id` | Yes, `maintenance` or `admin` | Read one log |
| `PUT` | `/api/vehicle-logs/:id` | Yes, owner or `admin`. Service date and vehicle only for the creator or `admin` | Update a log |
| `DELETE` | `/api/vehicle-logs/:id` | Yes, creator or `admin` | Delete a log |
| `POST` | `/api/vehicle-logs/:id/owners` | Yes, owner or `admin` | Add an owner |
| `DELETE` | `/api/vehicle-logs/:id/owners/:userId` | Yes, owner or `admin` | Remove an owner |


**Create and update body:**

```json
{
  "serviceDate": "2026-11-10",
  "vin": "1HGCM82633A004352",
  "description": "Replaced front brake pads",
  "completed": true
}
```

**Success response** (`201` on create, `200` on read and update):

```json
{
  "id": 1,
  "serviceDate": "2026-11-10",
  "vin": "1HGCM82633A004352",
  "description": "Replaced front brake pads",
  "completed": true,
  "creatorId": 4,
  "ownerIds": [4],
  "createdAt": "2026-11-10T18:00:00.000Z",
  "updatedAt": "2026-11-10T18:00:00.000Z"
}
```

**Add owner body:** `{ "userId": 9 }`

**Remove owner:** `DELETE /api/vehicle-logs/:id/owners/:userId`. Success is the same log object with that id gone from `ownerIds`. The service date, vehicle, description, completed status, and creator stay the same.

**Delete success:** `{ "message": "Vehicle log deleted." }`

**Error response:** `{ "message": "Human-readable explanation." }`

Quoted messages that tests must match:


| Situation | Status | `message` |
| --------- | ------ | --------- |
| Missing or expired token | 401 | `Unauthorized!` |
| Role is `user` or `driver` | 403 | `Forbidden` |
| Caller is not an owner and is not admin | 403 | `Forbidden` |
| An added owner changes the service date or vehicle | 403 | `Forbidden` |
| Unknown log id | 404 | `Vehicle log not found!` |
| Unknown vehicle id | 404 | `Vehicle not found!` |
| A required field is missing | 400 | `Vehicle log is incomplete!` |


---

## Key Entities

- **Vehicle log**: one service entry for an existing vehicle. It stores service date, vehicle id, description, completed status, creator, owners, and created and updated timestamps.
- **User**: the signed-in account from Feature 1. Role `maintenance` or `admin` may create and read logs. An assigned owner may update the description and completed status and may add or remove owners. Only the creator or an admin may change the service date or vehicle, or delete the log.
- **Vehicle**: not created by this feature. A log stores that vehicle’s id.

---

## Screen Requirements

### [View: Vehicle Service Logs] — route name `vehicle-logs` (`/vehicle-logs`)

- Shown only to `maintenance` and `admin`
- Heading: **Vehicle Service Logs**
- Table columns: **Service date**, **Vehicle**, **Description**, **Completed**, **Creator**, **Owners**
- An empty list still shows the heading and **Create log**
- **Create log** opens a dialog with **Service date**, **Vehicle**, **Description**, and **Completed** (all required). **Completed** is a combo box with **Completed** and **Not completed**
- Opening a row shows that log. An owner or an admin sees **Save** and **Add owner**. The creator or an admin also sees **Delete**
- **Service date** and **Vehicle** are gray and read-only unless the signed-in user is the creator or an admin. Hovering either field shows **Only the original owner and admins can modify this field.** An owner may still change **Description** and **Completed**
- Clicking outside the create or edit dialog closes it and discards unsaved changes, including an owner added or removed in that dialog
- **Save** writes the edited fields and the list shows the saved values
- **Delete** asks **Delete this vehicle service log?** **Cancel** or a click outside leaves the log. Confirming removes the row from the list. An added owner who is not the creator does not see **Delete**, and the server answers **Forbidden**
- The open log lists every saved owner. **User** is a combobox of accounts, in the same form as driver id: each row is `Name (id)`, typing filters that text and the id, and **Add owner** puts that person on the list in the dialog. **Save** sends only the selected user id. Adding another person keeps the owners already saved
- **Remove** takes that person off the list in the dialog. **Save** deletes that person. The rest of the log stays
- A maintenance user who is not an owner and is not an admin does not see **Save**, **Delete**, or **Add owner**
- **Error:** shows the API `message`, including **"Vehicle log is incomplete!"**, **"Vehicle not found!"**, **"Vehicle log not found!"**, and **"Forbidden"**

### App chrome

- `maintenance` and `admin` see **View Service Logs** on a vehicle's maintenance page. It opens that vehicle's logs and does not change the route
- `user` and `driver` do not see **View Service Logs**. Opening `/vehicle-logs` sends them to the landing page and shows no logs

---

## Data Model Requirements

This feature **owns** `vehicle_logs` and `vehicle_log_owners`. It stores `vin` and `creatorId`. It does not create the `vehicles` or `users` tables.

### `vehicle_logs` table


| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `serviceDate` | DATE | Required |
| `vin` | STRING | Required; references an existing vehicle |
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
- `VehicleLog` belongsTo `Vehicle` through `vin`

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

#### Scenario: Owner removes an owner

- **Given** I am signed in as the owner of a vehicle log
- **And** another user is an owner
- **When** I remove that user
- **Then** that user is no longer an owner
- **And** the service date, vehicle, description, completed status, and creator are unchanged

#### Scenario: Owner picker sends the user id

- **Given** I am signed in as the owner of a vehicle log
- **And** another user exists
- **When** I choose that user from the owner list and press **Add owner**
- **And** I save
- **Then** the add-owner request contains only that user id

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

#### Scenario: Click outside cancels the log

- **Given** I am signed in as the owner of a vehicle log
- **And** I have changed the description without saving
- **And** I have added an owner in the dialog
- **When** I click outside the dialog
- **Then** the dialog closes
- **And** the list still shows the original description
- **And** that owner is not saved

#### Scenario: Added owner sees locked fields

- **Given** I am signed in as `maintenance`
- **And** I am an owner of a log I did not create
- **And** I am not an admin
- **When** I open that log
- **Then** **Service date** and **Vehicle** are read-only
- **And** hovering them shows **Only the original owner and admins can modify this field**
- **And** **Description** and **Completed** stay editable

#### Scenario: Added owner cannot change the vehicle

- **Given** I am signed in as `maintenance`
- **And** I am an owner of a log I did not create
- **And** I am not an admin
- **When** I try to change the service date or the vehicle
- **Then** I see **"Forbidden"**
- **And** the service date and vehicle stay as they were
- **And** I can still change the description and completed status

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

#### Scenario: Delete asks for confirmation

- **Given** I am the creator of a vehicle log
- **When** I press **Delete**
- **Then** I am asked **Delete this vehicle service log?**
- **And** the log remains until I confirm

#### Scenario: Added owner cannot delete

- **Given** I am signed in as `maintenance`
- **And** I am an owner of a log I did not create
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
| US-10.2 | Owner removes an owner | `backend/tests/vehicleLog.test.js` | `it("Owner removes an owner")` |
| US-10.2 | Owner picker sends the user id | `frontend/tests/VehicleLog.test.js` | `it("Owner picker sends the user id")` |
| US-10.2 | Non-owner cannot modify | `backend/tests/vehicleLog.test.js` | `it("Non-owner cannot modify")` |
| US-10.3 | Maintenance reads the logs | `frontend/tests/VehicleLog.test.js` | `it("Maintenance reads the logs")` |
| US-10.3 | Admin reads the logs | `frontend/tests/VehicleLog.test.js` | `it("Admin reads the logs")` |
| US-10.3 | Driver cannot open the page | `frontend/tests/VehicleLog.test.js` | `it("Driver cannot open the page")` |
| US-10.4 | Owner updates a log | `frontend/tests/VehicleLog.test.js` | `it("Owner updates a log")` |
| US-10.4 | Click outside cancels the log | `frontend/tests/VehicleLog.test.js` | `it("Click outside cancels the log")` |
| US-10.4 | Added owner sees locked fields | `frontend/tests/VehicleLog.test.js` | `it("Added owner sees locked fields")` |
| US-10.4 | Added owner cannot change the vehicle | `backend/tests/vehicleLog.test.js` | `it("Added owner cannot change the vehicle")` |
| US-10.4 | Admin updates any log | `backend/tests/vehicleLog.test.js` | `it("Admin updates any log")` |
| US-10.5 | Log older than 18 months is removed | `backend/tests/vehicleLog.test.js` | `it("Log older than 18 months is removed")` |
| US-10.5 | Non-owner cannot delete | `backend/tests/vehicleLog.test.js` | `it("Non-owner cannot delete")` |
| US-10.5 | Delete asks for confirmation | `frontend/tests/VehicleLog.test.js` | `it("Delete asks for confirmation")` |
| US-10.5 | Added owner cannot delete | `backend/tests/vehicleLog.test.js` | `it("Added owner cannot delete")` |


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

- [x] Backend and frontend implemented per this spec (**FR-00N** satisfied)
- [x] **Success Criteria (SC-00N)** met
- [ ] All mapped tests pass (`npm test`)
- [x] Test Coverage Map complete
- [x] Test traceability (file headers, nested `describe` / `it`, audit commands in this spec)
- [x] `features/reference/data-model.md` updated (if schema changed)
- [x] `features/reference/api.md` updated (if API changed)
- [x] `features/reference/behavior.md` updated (if product rules changed)

---

## Out of Scope

- Creating, editing, or listing vehicles themselves
- Registration requests, departments, notes, and the maintenance specification catalog
- Login, create account, logout, and the landing-page placeholder
- Password reset, email verification, profile editing, and Google sign-in
