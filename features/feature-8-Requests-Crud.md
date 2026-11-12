# Feature: Request Management

**Feature ID:** 8
**Branch pattern:** `feature/8-Request-CRUD`
**Status:** In Progress
**Created:** 2026-10-29
**Input:** signed-in users CRUD vehicle requests (normal trip requests and maintenance requests).
**Depends on:** [Feature 1 -- User Auth & Sessions](feature-1-user-auth-session-management.md),
[Feature 4 -- Vehicle CRUD](feature-4-Vehicle-CRUD.md),
[Feature 6 -- Destination CRUD](feature-6-Destination-CRUD.md),
[Feature 7 -- Driver CRUD](feature-7-Driver-CRUD.md),
[Feature 3 -- User Management](feature-3-User-Management.md)
**Related:** `frontend/src/views/Requests.vue`, `backend/app/routes/users.routes.js`, `backend/app/routes/Request.routes.js`,
`backend/app/routes/Vehicle.routes.js`, `backend/app/routes/Destination.routes.js`, `backend/app/routes/Driver.routes.js`

---

## User Stories

### US-8.1: Create a normal request

**As a** signed-in user
**I want to** create a trip request by choosing a vehicle, driver, destination, dates/times, and number of riders
**So that** a vehicle trip can be scheduled

**Priority:** P1
**Independent test:** Open the new-request dialog, choose **Trip**, fill the form, submit; the request appears in the requests view
**Acceptance scenarios:** see ### US-8.1 under Acceptance Criteria

### US-8.2: Create a maintenance request

**As a** signed-in user
**I want to** schedule maintenance for a vehicle by choosing a vehicle and a start date/time
**So that** the vehicle is marked as unavailable for that time

**Priority:** P1
**Independent test:** Open the new-request dialog, choose **Maintenance**, pick a vehicle and start date, submit; it appears in the requests view
**Acceptance scenarios:** see ### US-8.2 under Acceptance Criteria

### US-8.3: View requests

**As a** signed-in user
**I want to** see my requests on one screen (admins see all requests)
**So that** I can track what has been scheduled

**Priority:** P1
**Independent test:** Requests view loads a single list of accessible requests (no sidebar split)
**Acceptance scenarios:** see ### US-8.3 under Acceptance Criteria

### US-8.4: Manage request rows

**As a** signed-in user
**I want** each request row to show **edit** and **delete** actions
**So that** I can manage requests without leaving the requests view

**Priority:** P1
**Independent test:** Each row exposes edit and delete icon actions that open their respective dialogs
**Acceptance scenarios:** see ### US-8.4 under Acceptance Criteria

### US-8.5: Edit and delete requests

**As a** signed-in user
**I want to** edit or delete a request I own (admins: any request)
**So that** I can fix mistakes or cancel a request

**Priority:** P2
**Independent test:** Edit and delete an owned request from row actions; the requests view updates
**Acceptance scenarios:** see ### US-8.5 under Acceptance Criteria

### US-8.6: Filter requests

**As a** signed-in user
**I want to** filter requests by active/inactive and by request type
**So that** I can quickly find the request I'm looking for

**Priority:** P3
**Independent test:** Toggle the active filter; only matching rows remain
**Acceptance scenarios:** see ### US-8.6 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: All request endpoints MUST require a valid session (`authenticate` middleware).
- **FR-002**: Every request MUST have a `requestType` of `trip` or `maintenance`. Required fields depend on the type (see Request Types below).
- **FR-003**: `requesterId` MUST be set server-side from `req.user.id`; it MUST NOT be accepted from the client body.
- **FR-004**: `vehicleId`, `driverId`, and `destId` (when provided) MUST reference existing records; otherwise respond `400`.
- **FR-005**: `endDate`/`endTime` MUST NOT be earlier than `startDate`/`startTime`; otherwise respond `400`.
- **FR-006**: `numPeople` MUST be a positive integer for `trip` requests.
- **FR-007**: This feature MUST deliver request CRUD and a **single-view** requests UI in `Requests.vue` (dialog-based add/edit/delete). No sidebar/main split.
- **FR-008**: The vehicle's license, make, and model MUST be displayed in the form and rows, derived from `vehicleId` (not entered by the user, not stored on the request).
- **FR-009**: Driver and destination MUST be chosen through dropdown menus populated from `GET /drivers` and `GET /destinations`.
- **FR-010**: Date and time MUST be chosen through calendar/time pickers, not free-text.
- **FR-011**: Signed-out users MUST NOT have access to any `/requests` routes.
- **FR-012**: A user MUST NOT read, edit, or delete another user's request unless they are an administrator.
- **FR-013**: `currentlyActive` MUST default to `true` on creation.
- **FR-014**: `requestor_id` MUST automatically default to the signed-in user.

### Request Types

| Field         | `trip`                   | `maintenance`                         |
| ------------- | ------------------------ | ------------------------------------- |
| `vehicleId`   | Required                 | Required                              |
| `driverId`    | Required                 | nullable, optional                    |
| `destId`      | Required                 | Must be null / ignored                |
| `startDate`   | Required                 | nullable, optional                    |
| `startTime`   | Required                 | nullable, optional                    |
| `endDate`     | Required                 | nullable, optional (defaults to `startDate`)|
| `endTime`     | Required                 | nullable, optional                    |
| `numPeople`   | Required (>= 1)          | Must be null / ignored                |

---

## Assumptions

- Feature 1 auth and session handling MUST be merged to `dev` before implementing this feature.
- Features 4 (Vehicle), 6 (Destination), and 7 (Driver) expose list endpoints used to populate the dropdowns.
- Requests use **dialog-based** workflows (no split sidebar / main panel).
- Any signed-in user can create `trip` requests; only administrators can create `maintenance` requests. *(Confirm; see Open Questions.)*
- Users see only their own requests; administrators see all requests.

## Edge Cases

- Missing required field for the chosen request type → client block and/or `400`.
- `endDate`/`endTime` before start → `400`.
- `numPeople` zero, negative, or non-integer → `400`.
- Unknown `vehicleId`, `driverId`, or `destId` → `400`.
- Invalid `requestId` → `400`; request not found or not accessible → `404`.
- Non-admin attempts to create a `maintenance` request → `403`.
- Unauthenticated `Requests.vue` or `GET /requests` → redirect or `401`.
- Referenced vehicle, driver, or destination is later deleted → deletion behavior defined in Features 4/6/7; the Requests view MUST NOT crash on missing references.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A signed-in user can create (both types), view, edit, and delete requests on one screen.
- **SC-003**: A user cannot see or modify another user's requests (unless admin).
- **SC-004**: `npm test` passes for the request API and requests-view behavior.

---

## Data Ownership & Isolation

Requests are owned by the user who created them (`requesterId`).

| Rule                  | Requirement                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | `GET /requests` returns only requests where `requesterId = req.user.id`; administrators receive all requests.                                      |
| **Write scope**       | `PUT` and `DELETE` apply only when the request matches both `requestId` and `req.user.id`, unless the user is an administrator.                    |
| **Create scope**      | New requests are owned by `req.user.id`.                                                                                                           |
| **Cross-user access** | A non-admin requesting another user's request by id receives `404`.                                                                                |
| **Role restriction**  | A non-admin attempting to create a `maintenance` request receives `403`.                                                                           |
| **UI scope**          | The requests view shows only requests returned by `GET /requests` for the signed-in user.                                                          |
| **Implementation**    | Use a shared helper (e.g. `getAccessibleRequestOrNull(req, requestId)`) in `app/authorization/` — do not duplicate scope logic in controllers.     |

---

## API Requirements

| Method   | Endpoint               | Auth | Purpose                                  |
| -------- | ---------------------- | ---- | ---------------------------------------- |
| `GET`    | `/vehicles`            | Yes  | Fetch accessible vehicles 
| `GET`    | `/drivers`            | Yes  | Fetch accessible driver
| `GET`    | `/destinations`            | Yes  | Fetch accessible destintations  
| `GET`    | `/requests`            | Yes  | Fetch accessible requests                |
| `GET`    | `/requests/:requestId` | Yes  | Show request details                     |
| `POST`   | `/requests`            | Yes  | Create a request (`trip` or `maintenance`) |
| `PUT`    | `/requests/:requestId` | Yes  | Update a request                         |
| `DELETE` | `/requests/:requestId` | Yes  | Delete a request                         |

**Create trip request body:**

```json
{
  "requestType": "trip",
  "vehicleId": 12,
  "driverId": 3,
  "destId": 7,
  "startDate": "2026-11-10",
  "startTime": "09:00",
  "endDate": "2026-11-10",
  "endTime": "17:00",
  "numPeople": 6
}
```

**Create maintenance request body:**

```json
{
  "requestType": "maintenance",
  "vehicleId": 12,
  "startDate": "2026-11-15",
  "startTime": "08:00"
}
```

**Success response** (`200` / `201`):

```json
{
  "requestId": 41,
  "requestType": "trip",
  "requesterId": 5,
  "vehicle": { "vehicleId": 12, "license": "ABC-1234", "make": "Ford", "model": "Transit" },
  "driver": { "driverId": 3, "name": "Jane Doe" },
  "destination": { "destId": 7, "name": "State Capitol" },
  "startDate": "2026-11-10",
  "startTime": "09:00",
  "endDate": "2026-11-10",
  "endTime": "17:00",
  "numPeople": 6,
  "currentlyActive": true
}
```

**Delete success:** `204` with no body.

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.
**Unauthenticated:** `401`.
**Forbidden:** `403`.
**Not found:** `404`.
**Invalid request:** `400`.
**Server/connection error:** `500`.

**PUT request body:** same shape as create for the request's existing `requestType`. `requestType` and `requesterId` MUST NOT be changed by `PUT`.

---

## Screen Requirements [WORK HERE]

[the three fields on each request form, Car Model, Make, and License, act as search bars. They act as WHERE selects when querying the Vehicles table, and a series of vehicles that fulfill the search criteria is returned and given to the user in a single-select dropdown which updates the VehicleId with that vehicle's VIN]

### [Form: List Requests] Component Name `ListRequestForm.vue`
- Heading: **Requests**
- Primary action: List all requests. Each request should be separated into rows.
**Component** (`ListRequestForm.vue`) This will be in the admin landing page. There should be a switch that toggles between seeing the trip requests and the maintenance requests. 
- Search Bar: The form should also have a search bar for the admin to search for specific requests in the database.

### [Form: Trip Requests] Component Name `TripRequestForm.vue`

**Component** (`TripRequestForm.vue`) — embedded into User's Landing Page.

- Heading: **Requests**
- Primary action: **+ New request** opens a `<v-dialog>`. The dialog starts with a request-type selector (**Trip** / **Maintenance**) and shows the matching form. **Create** / **Cancel** buttons. Use class `oc-cta` on **Create** and **+ New request** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- **Trip form fields:** vehicle dropdown (shows license, make, model), driver dropdown, destination dropdown, start date + time pickers, end date + time pickers, number of people.

- Display requests as rows (e.g. `<v-list>` or table): each row shows the **request type**, **vehicle** (license, make, model), **date range**, and, for trips, **destination** and **driver**. Rows have icon actions:
  - **Edit** icon — opens edit `<v-dialog>` pre-filled with current values; **Save** / **Cancel**
  - **Delete** icon — opens confirmation `<v-dialog>`
- Icon-only row actions use `size="small"` and accessible `aria-label`s (**Edit request**, **Delete request**).
- **Filter controls:** an **Active only** toggle and a type selector (**All** / **Trip** / **Maintenance**) above the list.
- **Empty state:** **"No requests yet. Create a request."** when no accessible requests exist.
- **Loading state:** skeleton or progress indicator while requests, vehicles, drivers, and destinations are fetching.
- **Error state:** `<v-alert type="error">` for API failures.

### [Form: Maintenance Requests] Component Name `MaintenanceRequestForm.vue`

**Component** (`MaintenanceRequestForm.vue`) — embedded into Maintenance and Admin's Landing Page.
Maintenance's and Admin's landing page both have a toggle switch that lets them switch between the two components. You don't have to implement that, just know those pages will have both maintenance and trip requests.

- **Maintenance form fields:** vehicle dropdown (shows license, make, model), start date + time picker. _(Maintenance has no driver, destination, or rider-count fields.)_

**Implementation note:** one route/view for requests; request CRUD dialogs are child components or inline `<v-dialog>` blocks in `Requests.vue` unless the team splits presentational dialogs later. Trip request form will be added to the `User-Landing.vue`. Maintenance request form will be added to `Maintenacne-Landing.vue`. The admin will have a form that lists all requests and has a form slider. The slider will change the observable list from the Trip requests to the Maintenance requests that are in the database.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Key Entities

- **request**: a scheduled vehicle use, either a `trip` or a `maintenance` block.
- **requester**: the authenticated user who created the request.
- **admin**: authenticated administrator permitted to view and modify all requests and create maintenance requests.

---

## Data Model Requirements

### `requests` table

| Field             | Type            | Rules                                                              |
| ----------------- | --------------- | ------------------------------------------------------------------ |
| `requestId`       | INTEGER PK      | Auto-increment                                                     |
| `requestType`     | ENUM            | Required; `trip`, `maintenance` *(new — not in original model)*    |
| `requesterId`     | FK → `users`    | Required; set server-side                                          |
| `vehicleId`       | FK → `vehicles` | Required (both types)                                              |
| `driverId`        | FK → `drivers`  | Required for `trip`; NULLABLE overall                              |
| `destId`          | FK → `destinations` | Required for `trip`; NULLABLE overall                          |
| `startDate`       | DATE            | Required                                                           |
| `startTime`       | TIME            | Required for `trip`; NULLABLE for `maintenance`                    |
| `endDate`         | DATE            | Required for `trip`; NULLABLE for `maintenance` (defaults to start) |
| `endTime`         | TIME            | Required for `trip`; NULLABLE for `maintenance`                    |
| `numPeople`       | INTEGER         | Required (>= 1) for `trip`; NULLABLE for `maintenance`             |
| `currentlyActive` | BOOLEAN         | Required; default `true`                                           |

Type-dependent requirements are enforced in model/controller validation, not by database NOT NULL constraints.

---

## Acceptance Criteria (Gherkin)

### US-8.1 — Create a normal request

#### Scenario: User creates a trip request

- **Given** I am signed in
- **And** a vehicle, a driver, and a destination exist
- **When** I click **+ New request**
- **And** I select the type **Trip**
- **And** I choose a vehicle, a driver, and a destination from the dropdowns
- **And** I pick a start date/time and an end date/time from the calendars
- **And** I enter the number of people `6`
- **And** I confirm the dialog
- **Then** the API returns `201` with a request object containing `requestId`, `requestType`, `vehicle`, `driver`, `destination`, dates/times, and `numPeople`
- **And** the new request appears in the requests view
- **And** the add-request dialog closes

#### Scenario: Trip form shows vehicle details

- **Given** I am signed in
- **And** vehicle `ABC-1234` (Ford Transit) exists
- **When** I select that vehicle in the trip form
- **Then** I see its license, make, and model displayed

#### Scenario: User creates a trip request with a missing required field

- **Given** I am signed in
- **When** I open the new request dialog with type **Trip**
- **And** I leave the driver, destination, or any date empty
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"<field> is required."**
- **And** no API request is sent

#### Scenario: User creates a trip request with an end before the start

- **Given** I am signed in
- **When** I submit a trip request whose end date/time is before its start date/time
- **Then** the API returns `400` with `{ "message": "end must be after start." }`
- **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: User creates a trip request with an invalid number of people

- **Given** I am signed in
- **When** I submit a trip request with `numPeople` of `0`
- **Then** the API returns `400` with `{ "message": "number of people must be at least 1." }`
- **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: User creates a request referencing a nonexistent vehicle

- **Given** I am signed in
- **When** I `POST /requests` with a `vehicleId` that does not exist
- **Then** the API returns `400` with `{ "message": "vehicle does not exist." }`

---

### US-8.2 — Create a maintenance request

#### Scenario: Admin creates a maintenance request

- **Given** I am signed in as an admin
- **And** vehicle `ABC-1234` exists
- **When** I click **+ New request**
- **And** I select the type **Maintenance**
- **And** I choose vehicle `ABC-1234`
- **And** I pick a start date from the calendar
- **And** I confirm the dialog
- **Then** the API returns `201` with a request object whose `requestType` is `maintenance`
- **And** `driverId`, `destId`, and `numPeople` are null
- **And** the request appears in the requests view

#### Scenario: Maintenance form hides trip-only fields

- **Given** I am signed in as an admin
- **When** I select the type **Maintenance** in the new request dialog
- **Then** I see the vehicle dropdown and the start date/time picker
- **And** I do not see the driver, destination, or number-of-people fields

#### Scenario: Maintenance request without a start date

- **Given** I am signed in as an admin
- **When** I open the dialog with type **Maintenance** and leave the start date empty
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"start date is required."**
- **And** no API request is sent

#### Scenario: Non-admin cannot create a maintenance request

- **Given** I am signed in as a non-admin user
- **When** I `POST /requests` with `requestType` `maintenance`
- **Then** the API returns `403` with an unauthorized message

---

### US-8.3 — View requests

#### Scenario: Requests view loads with existing requests

- **Given** I am signed in
- **And** I own two requests
- **When** I navigate to the requests view
- **Then** both requests appear in the requests view
- **And** each row shows the request type, vehicle, and dates with edit and delete icon actions

#### Scenario: User does not see other users' requests

- **Given** I am signed in as a non-admin user
- **And** another user owns a request
- **When** I navigate to the requests view
- **Then** I do not see the other user's request

#### Scenario: Admin sees all requests

- **Given** I am signed in as an admin
- **And** several users own requests
- **When** I navigate to the requests view
- **Then** I see every user's requests

#### Scenario: No requests exist

- **Given** I am signed in
- **And** I have no requests
- **When** I navigate to the requests view
- **Then** I see **"No requests yet. Create a request."**

---

### US-8.4 — Manage request rows

#### Scenario: Request rows show edit and delete actions

- **Given** I am signed in
- **And** I own a request
- **When** I view the requests view
- **Then** the row shows an **Edit request** icon action
- **And** the row shows a **Delete request** icon action

---

### US-8.5 — Edit and delete requests

#### Scenario: User edits a request

- **Given** I am signed in
- **And** I own a trip request with `numPeople` `6`
- **When** I click the edit icon on that row
- **And** I change `numPeople` to `4` in the edit dialog
- **And** I confirm
- **Then** the API returns `200` with the updated request object
- **And** the requests view shows `4` people for that request

#### Scenario: User deletes a request

- **Given** I am signed in
- **And** I own a request
- **When** I click the delete icon on that row
- **And** I confirm the delete dialog
- **Then** the API returns `204`
- **And** the request is removed from the requests view

#### Scenario: User cannot edit another user's request

- **Given** I am signed in as a non-admin user
- **And** another user owns request `41`
- **When** I `PUT /requests/41`
- **Then** the API returns `404`

#### Scenario: User cannot delete another user's request

- **Given** I am signed in as a non-admin user
- **And** another user owns request `41`
- **When** I `DELETE /requests/41`
- **Then** the API returns `404`

#### Scenario: Admin edits any request

- **Given** I am signed in as an admin
- **And** another user owns request `41`
- **When** I `PUT /requests/41` with valid changes
- **Then** the API returns `200` with the updated request object

---

### US-8.6 — Filter requests

#### Scenario: Active-only filter

- **Given** I am signed in
- **And** I own one active request and one inactive request
- **When** I turn on the **Active only** toggle
- **Then** the list contains only the active request

#### Scenario: Request type filter

- **Given** I am signed in as an admin
- **And** a trip request and a maintenance request exist
- **When** I select **Maintenance** in the type selector
- **Then** the list contains only the maintenance request

---

### Authentication

#### Scenario: Unauthenticated user accesses the requests view

- **Given** I have no session in `localStorage`
- **When** I navigate to the requests view
- **Then** I am redirected to the login page

#### Scenario: Unauthenticated API request to requests

- **Given** I have no valid session token
- **When** I request `GET /requests`
- **Then** the API returns `401` with an unauthorized message

---

## Test Coverage Map

| Story  | Scenario                                                  | Test file                                                           | Test name                                                  |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| US-8.1 | User creates a trip request                               | `backend/tests/requests.test.js`, `frontend/tests/Requests.test.js` | `User creates a trip request`                              |
| US-8.1 | Trip form shows vehicle details                           | `frontend/tests/Requests.test.js`                                   | `Trip form shows vehicle details`                          |
| US-8.1 | User creates a trip request with a missing required field | `frontend/tests/Requests.test.js`                                   | `User creates a trip request with a missing required field` |
| US-8.1 | User creates a trip request with an end before the start  | `backend/tests/requests.test.js`, `frontend/tests/Requests.test.js` | `User creates a trip request with an end before the start` |
| US-8.1 | User creates a trip request with an invalid number of people | `backend/tests/requests.test.js`                                 | `User creates a trip request with an invalid number of people` |
| US-8.1 | User creates a request referencing a nonexistent vehicle  | `backend/tests/requests.test.js`                                    | `User creates a request referencing a nonexistent vehicle` |
| US-8.2 | Admin creates a maintenance request                       | `backend/tests/requests.test.js`, `frontend/tests/Requests.test.js` | `Admin creates a maintenance request`                      |
| US-8.2 | Maintenance form hides trip-only fields                   | `frontend/tests/Requests.test.js`                                   | `Maintenance form hides trip-only fields`                  |
| US-8.2 | Maintenance request without a start date                  | `frontend/tests/Requests.test.js`                                   | `Maintenance request without a start date`                 |
| US-8.2 | Non-admin cannot create a maintenance request             | `backend/tests/requests.test.js`                                    | `Non-admin cannot create a maintenance request`            |
| US-8.3 | Requests view loads with existing requests                | `backend/tests/requests.test.js`, `frontend/tests/Requests.test.js` | `Requests view loads with existing requests`               |
| US-8.3 | User does not see other users' requests                   | `backend/tests/requests.test.js`                                    | `User does not see other users' requests`                  |
| US-8.3 | Admin sees all requests                                   | `backend/tests/requests.test.js`                                    | `Admin sees all requests`                                  |
| US-8.3 | No requests exist                                         | `frontend/tests/Requests.test.js`                                   | `No requests exist`                                        |
| US-8.4 | Request rows show edit and delete actions                 | `frontend/tests/Requests.test.js`                                   | `Request rows show edit and delete actions`                |
| US-8.5 | User edits a request                                      | `backend/tests/requests.test.js`, `frontend/tests/Requests.test.js` | `User edits a request`                                     |
| US-8.5 | User deletes a request                                    | `backend/tests/requests.test.js`, `frontend/tests/Requests.test.js` | `User deletes a request`                                   |
| US-8.5 | User cannot edit another user's request                   | `backend/tests/requests.test.js`                                    | `User cannot edit another user's request`                  |
| US-8.5 | User cannot delete another user's request                 | `backend/tests/requests.test.js`                                    | `User cannot delete another user's request`                |
| US-8.5 | Admin edits any request                                   | `backend/tests/requests.test.js`                                    | `Admin edits any request`                                  |
| US-8.6 | Active-only filter                                        | `frontend/tests/Requests.test.js`                                   | `Active-only filter`                                       |
| US-8.6 | Request type filter                                       | `frontend/tests/Requests.test.js`                                   | `Request type filter`                                      |
| Auth   | Unauthenticated user accesses the requests view           | `frontend/tests/Requests.test.js`                                   | `Unauthenticated user accesses the requests view`          |
| Auth   | Unauthenticated API request to requests                   | `backend/tests/requests.test.js`                                    | `Unauthenticated API request to requests`                  |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 8 from @features/feature-8-Request-CRUD.md on branch `feature/8-Request-CRUD`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checks in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/data-model.md`, `features/reference/api.md`, `features/reference/behavior.md`

---

## Definition of Done

- [ ] Backend and frontend implemented per this spec (**FR-00N** satisfied)
- [ ] **Success Criteria (SC-00N)** met
- [ ] All mapped tests pass (`npm test`)
- [ ] Test Coverage Map complete
- [ ] `features/reference/data-model.md` updated (if schema changed)
- [ ] `features/reference/api.md` updated (if API changed)
- [ ] `features/reference/behavior.md` updated (if product rules changed)

---

## Out of Scope

- Vehicle, driver, destination, and user management (see Features 4, 7, 6, 13)
- Approval / denial workflow for requests
- Conflict detection for overlapping vehicle bookings (unless promoted from Open Questions)
- Drivers signing up for or accepting requests
- Recurring requests
- Email or push notifications
- `MenuBar` changes beyond basic sign-out
- `POST`/`GET`/`PUT`/`DELETE` anywhere that's not `/requests` or `/requests/:requestId`

---

## Open Questions (resolve before implementation)

