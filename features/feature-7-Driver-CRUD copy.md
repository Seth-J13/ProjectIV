# Feature: Driver Crud

**Feature ID:** 8
**Branch pattern:** `feature/8-Driver-CRUD`
**Status:** {Draft | Ready | Shipped}
**Created:** 2026-10-26
**Input:** create, read, update, delete drivers
**Depends on:** [Feature 1 -- User Management](feature-1-User-Management.md),
[Feature 2 -- Google Auth](feature-2-Google-Auth.md), [Feature X -- ...](feature-X-...md), ... <-- (omit if none)
**Related:** `frontend/src/views/Drivers.vue`, `backend/app/routes/users.routes.js`,
`backend/app/routes/vehicle-t3.routes.js`

---

## User Stories

### US-7.1: Create drivers

**As a** signed-in admin user  
**I want to** create named drivers 
**So that** I can give admins a list of drivers to assign

**Priority:** P1  
**Independent test:** Open add-driver dialog, create a driver; it appears in the drivers view  
**Acceptance scenarios:** see ### US-7.1 under Acceptance Criteria

### US-7.2: View my drivers

**As a** signed-in admin user  
**I want to** see all of my drivers on one screen  
**So that** I can see

**Priority:** P1  
**Independent test:** Drivers loads a single driver of owned drivers (no sidebar split)  
**Acceptance scenarios:** see ### US-7.2 under Acceptance Criteria

### US-7.3: Manage driver rows

**As a** signed-in admin user  
**I want** each driver row to show **edit** and **delete** actions  
**So that** I can manage drivers without leaving the drivers view

**Priority:** P1  
**Independent test:** Each driver row exposes edit and delete icon actions, interact to open respective modals
**Acceptance scenarios:** see ### US-7.3 under Acceptance Criteria

### US-7.4: Rename and delete drivers

**As a** signed-in admin user  
**I want to** rename or delete a driver  
**So that** I can keep my workspace organized

**Priority:** P2  
**Independent test:** Rename and delete an owned driver from row actions; drivers view updates  
**Acceptance scenarios:** see ### US-7.4 under Acceptance Criteria

### US-7.5: Search drivers

**As a** signed-in admin user  
**I want** to search for drivers containing certain key characters
**So that** I can quickly find which driver I'm looking for

**Priority:** P2  
**Independent test:**
**Acceptance scenarios:** see ### US-7.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: All driver endpoints MUST require a valid session (`authenticate` middleware).
- **FR-002**: driver names MUST be trimmed before save; empty strings MUST be rejected.
- **FR-003**: This feature MUST deliver driver CRUD and a **single-view** drivers UI in `Drivers.vue` (dialog-based add/edit/delete). No sidebar/main split.
- **FR-004**: typing in the on-screen driver search bar updates the driver list with only drivers containing the search bar's content as a substring.
- **FR-005**: signed-out users MUST NOT have access to any `/vehicle-t3` routes

---

## Assumptions

- Feature 2 auth and session handling MUST be merged to `dev` before implementing this feature.
- Feature 1 User Management MUST be merged into 'dev' before implementing

## Edge Cases

- Empty or whitespace-only driver name → client block and/or `400`.
- Invalid `driver_id` → `400`; unowned driver → `404`.
- Unauthenticated `Drivers.vue` → redirect or `401`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: Signed-in admin can create, view, rename, and delete drivers on one screen.
- **SC-003**: Signed-in non-admin users cannot access this view
- **SC-004**: `npm test` passes for driver API and drivers-view behavior.

---

## Data Ownership & Isolation

Drivers are not owned by anybody; however, only administrator-role users are authorized to write/create on `drivers`

| Rule                  | Requirement                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | `GET /vehicle-t3` returns only drivers.                                                                                                          |
| **Write scope**       | `PUT` and `DELETE` apply only when the driver row matches both `id` and `req.user.id`.                                                        |
| **Create scope**      | New drivers owned by nobody.                                                                                                                  |
| **Cross-user access** | If an unauthorized user tries to `PUT`, `DELETE`, or `POST` drivers, respond with `403`.                                                      |
| **UI scope**          | The drivers view shows only drivers returned by `GET /vehicle-t3` for the signed-in admin.                                                       |
| **Implementation**    | Use a shared helper (e.g. `getAccessibleDriversOrNull(req, driver_id)`) in `app/authorization/` — do not duplicate scope logic in controllers. |

---

## API Requirements

| Method   | Endpoint             | Auth       | Purpose             |
| -------- | -------------------- | ---------- | ------------------- |
| `GET`    | `/vehicle-t3`           | Yes        | Fetch all drivers   |
| `GET`    | `/vehicle-t3/:driver_id` | Yes        | Show driver details |
| `POST`   | `/vehicle-t3`           | Yes, admin | Create a new driver |
| `PUT`    | `/vehicle-t3/:driver_id` | Yes, admin | Update a driver     |
| `DELETE` | `/vehicle-t3/:driver_id` | Yes, admin | Delete a driver     |

All endpoints except `GET` require **an administrator-role user** to access/operate. Non-admin user access returns `403`.

**Create driver request body:**

```json
{
  "driver_id": "1",
  "license_status": "active",
  "license_exp_date": "08/2028",
  "availability": "available"
}
```

**drivers success response** (`200` / `201`):

```json
{
  "driver_id": "1",
  "license_status": "active",
  "license_exp_date": "08/2028",
  "availability": "available"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** `404`.
**Invalid Request:** `400`.
**Server/Connection Error:** `500`.
**Put driver request body:**

```json
{
  "driver_id": "1",
  "license_status": "active",
  "license_exp_date": "08/2028",
  "availability": "available"
}
```

## Screen Requirements

### [View: Drivers] — route name `drivers`

**Single Vue view** (`Drivers.vue`) — no sidebar / main-panel split.

**drivers view (this feature)**

- Heading: **Drivers**
- Primary action: **+ New driver** opens a `<v-dialog>` with a name `<v-text-field>` and **Create** / **Cancel**. Use class `oc-cta` on **Create** and **+ New driver** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Display interactive search bar named `Find` above any lists
- Display drivers as rows (e.g. `<v-list>` or table): each row shows the **driver name** and icon actions:
  - **Edit** icon — opens rename `<v-dialog>` pre-filled with current name; **Save** / **Cancel**
  - **Delete** icon — opens confirmation `<v-dialog>`
- Icon-only row actions use `size="small"` and accessible `aria-label`s (**Edit driver**, **Delete driver**).
- **Empty state:** **"No drivers yet. Create a driver."** when no drivers exist in the database.
- **Loading state:** skeleton or progress indicator while drivers are fetching.
- **Error state:** `<v-alert type="error">` for API failures.

**Implementation note:** one route/view for drivers; driver CRUD dialogs are child components or inline `<v-dialog>` blocks in `Drivers.vue` unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Key Entities

- **driver**: named item.
- **admin**: authenticated administrator user permitted to access all driver routes.
- **requester**: authenticated user permitted to only access `GET` driver routes.

---

## Data Model Requirements

### `drivers` table

| Field               | Type      | Rules                                                  |
| ------------------- | --------- | ------------------------------------------------------ |
| `driver_id`          | INT PK | Required; Unique;                   |
| `license_status`        | ENUM    | Required; `expired`, `active`, `suspended`, |
| `license_exp_date`   | date      | Required; |
| `availability` | ENUM      | Required; `available`, `not available`, `on call` |

---

## Acceptance Criteria (Gherkin)

### US-7.1 — Create drivers

#### Scenario: Admin creates a new driver

- **Given** I am signed in as an admin on the driver view
- **When** I click **+ New driver**
- **And** I enter license status `active`
- **And** I enter expiration date `05/2026`
- **And** I add availability `available`
- **And** I confirm the dialog
- **Then** the API returns `201` with a driver object containing `driver_id`, `license_status:'active'`, `license_exp_date:'05/2026'` and `availability:'available'`
- **And** driver_id, license_status, license_exp_date, and availability appears in the drivers view
- **And** the add-driver dialog closes

#### Scenario: Admin creates a driver with an empty name

- **Given** I am signed in as an admin on the driver view
- **When** I open the new driver dialog
- **And** I leave the name field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Driver name is required."**
- **And** no API request is sent

#### Scenario: Admin creates a driver with an empty license status

- **Given** I am signed in as an admin on the driver view
- **When** I open the new driver dialog
- **And** I leave the license status field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"license status is required."**
- **And** no API request is sent

#### Scenario: Admin creates a driver without license expiration date

- **Given** I am signed in as an admin on the driver view
- **When** I open the new driver dialog
- **And** I leave the license expiration date empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"license expiration date is required."**
- **And** no API request is sent

#### Scenario: Admin creates a driver without availability

- **Given** I am signed in as an admin on the driver view
- **When** I open the new driver dialog
- **And** I leave the availability empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"availability is required."**
- **And** no API request is sent


---

### US-7.2 — View all drivers


#### Scenario: No drivers exist

- **Given** I am signed in as an admin
- **And** no drivers exist
- **When** I navigate to the driver view
- **Then** I see **"No drivers yet. Create a driver."**

---

### US-7.3 — Manage driver rows

#### Scenario: driver rows show edit and delete actions

- **Given** I am signed in as an admin
- **And** the driver `1` exists
- **When** I view the drivers view
- **Then** the `1` row shows an **Edit driver** icon action
- **And** the `1` row shows a **Delete driver** icon action

---

### US-7.4 — Edit and delete drivers

#### Scenario: Admin edits a driver

- **Given** I am signed in as an admin
- **And** the driver `1` exists
- **When** I click the edit icon on the `1` row with the license status `suspended`
- **And** I change the license status to `active` in the rename dialog
- **And** I confirm
- **Then** the API returns `200` with the updated driver object
- **And** the drivers view shows `active` instead of `suspended`

#### Scenario: Admin deletes a driver

- **Given** I am signed in as an admin
- **And** the driver `1` exists
- **When** I click the delete icon on the `1` row
- **And** I confirm the delete dialog
- **Then** the API returns `204`
- **And** the driver is removed from the drivers view

---

### US-7.5 — Search drivers

#### Scenario: Search bar appears with drivers

- **Given** I am signed in as an admin
- **And** the driver `1` exists
- **When** I view the drivers view
- **Then** I see a search bar named `Find` above the drivers list
  returns

#### Scenario: No search bar appears with no drivers

- **Given** I am signed in as an admin
- **And** the driver `1` exists
- **When** I view the drivers view
- **Then** I see **"No drivers yet. Create a driver."**
- **And** I see no search bars in the view

#### Scenario: Admin types in driver search bar

- **Given** I am signed in as an admin
- **And** I am viewing the drivers view
- **And** the drivers license status `1, active`, `2, suspended`, `3, expired`, 
and `4, active` exist
- **When** I type `active` in the `Find` search bar
- **Then** the driver list updates to contain only the drivers `1` and `4`

#### Scenario: Admin types in driver search bar 2

- **Given** I am signed in as an admin
- **And** I am viewing the drivera view
- **And** the drivers license status `1, active`, `2, suspended`, `3, expired`, 
and `4, active` exist
- **When** I type `suspended` in the `Find` search bar
- **Then** the driver list updates to contain only the driver `2`

#### Scenario: Unauthenticated user accesses the drivers view

- **Given** I have no session in `localStorage`
- **When** I navigate to the drivers view
- **Then** I am redirected to the login page

#### Scenario: Unauthenticated API request to drivers

- **Given** I have no valid session token
- **When** I request `GET /vehicle-t3`
- **Then** the API returns `401` with an unauthorized message

---

## Test Coverage Map

| Story  | Scenario                                                       | Test file                                                         | Test name                                                        |
| ------ | -------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| US-7.1 | Admin creates a new driver                                     | `backend/tests/vehicle-t3.test.js`, `frontend/tests/Drivers.test.js` | `Admin creates a new driver`                                     |
| US-7.1 | Admin creates a driver with an empty name                      | `frontend/tests/Drivers.test.js`                                  | `Admin creates a driver with an empty name`                      |
| US-7.1 | Admin creates a driver with an empty license status               | `frontend/tests/Drivers.test.js`                                  | `Admin creates a driver with an empty license status`               |
| US-7.1 | Admin creates a driver without license expiration date                      | `frontend/tests/Drivers.test.js`                                  | `Admin creates a driver without license expiration`                        |
| US-7.1 | Admin creates a driver without availability          | `backend/tests/vehicle-t3.test.js`, `frontend/tests/Driver.test.js` | `Admin creates a driver without availability`            |
| US-7.1 | Admin creates a driver with an id that is improperly formatted | `backend/tests/vehicle-t3.test.js`, `frontend/tests/Drivers.test.js` | `Admin creates a driver with an id that is improperly formatted` |
| US-7.2 | Driver view loads with existing semesters                      | `backend/tests/vehicle-t3.test.js`, `frontend/tests/Drivers.test.js` | `Driver view loads with existing semesters`                      |
| US-7.2 | No drivers exist                                               | `frontend/tests/Drivers.test.js`                                  | `No drivers exist`                                               |
| US-7.3 | driver rows show edit and delete actions                       | `frontend/tests/Drivers.test.js`                                  | `driver rows show edit and delete actions`                       |
| US-7.4 | Admin edits a driver                                           | `backend/tests/vehicle-t3.test.js`, `frontend/tests/Drivers.test.js` | `Admin edits a driver`                                           |
| US-7.4 | Admin deletes a driver                                         | `backend/tests/vehicle-t3.test.js`, `frontend/tests/Drivers.test.js` | `Admin deletes a driver`                                         |
| US-7.5 | Search bar appears with drivers                                | `frontend/tests/Drivers.test.js`                                  | `Search bar appears with drivers`                                |
| US-7.5 | No search bar appears with no drivers                          | `frontend/tests/Drivers.test.js`                                  | `No search bar appears with no drivers`                          |
| US-7.5 | Admin types in driver search bar                               | `frontend/tests/Drivers.test.js`                                  | `Admin types in driver search bar`                               |
| US-7.5 | Admin types in driver search bar 2                             | `frontend/tests/Drivers.test.js`                                  | `Admin types in driver search bar 2`                             |
| US-7.5 | Unauthenticated user accesses the drivers view                 | `frontend/tests/Drivers.test.js`                                  | `Unauthenticated user accesses the drivers view`                 |
| US-7.5 | Unauthenticated API request to drivers                         | `backend/tests/vehicle-t3.test.js`                                   | `Unauthenticated API request to drivers`                         |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 7 from @features/feature-7-driver-management.md on branch `feature/7-driver-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checksemester in @features/framework.md.
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

- Faculty items (see `features/feature-4-faculty-management.md`)
- `MenuBar` beyond basic sign-out (full nav deferred if not needed)
- Drag-and-drop driver reordering
- Sharing drivers with other users
- `POST`/`GET`/`PUT`/`DELETE` anywhere that's not `/vehicle-t3/vehicle-t3` or `/vehicle-t3/:driver_id`

---

