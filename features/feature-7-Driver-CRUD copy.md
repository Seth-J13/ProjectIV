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

### US-8.1: Create drivers

**As a** signed-in admin user  
**I want to** create named drivers 
**So that** I can give admins a list of drivers to assign

**Priority:** P1  
**Independent test:** Open add-course dialog, create a driver; it appears in the drivers view  
**Acceptance scenarios:** see ### US-8.1 under Acceptance Criteria

### US-8.2: View my drivers

**As a** signed-in admin user  
**I want to** see all of my drivers on one screen  
**So that** I can see

**Priority:** P1  
**Independent test:** Drivers loads a single driver of owned drivers (no sidebar split)  
**Acceptance scenarios:** see ### US-8.2 under Acceptance Criteria

### US-8.3: Manage driver rows

**As a** signed-in admin user  
**I want** each driver row to show **edit** and **delete** actions  
**So that** I can manage drivers without leaving the drivers view

**Priority:** P1  
**Independent test:** Each driver row exposes edit and delete icon actions, interact to open respective modals
**Acceptance scenarios:** see ### US-8.3 under Acceptance Criteria

### US-8.4: Rename and delete drivers

**As a** signed-in admin user  
**I want to** rename or delete a driver  
**So that** I can keep my workspace organized

**Priority:** P2  
**Independent test:** Rename and delete an owned driver from row actions; drivers view updates  
**Acceptance scenarios:** see ### US-8.4 under Acceptance Criteria

### US-8.5: Search Courses

**As a** signed-in admin user  
**I want** to search for drivers containing certain key characters
**So that** I can quickly find which course I'm looking for

**Priority:** P2  
**Independent test:**
**Acceptance scenarios:** see ### US-8.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: All driver endpoints MUST require a valid session (`authenticate` middleware).
- **FR-002**: driver names MUST be trimmed before save; empty strings MUST be rejected.
- **FR-003**: This feature MUST deliver driver CRUD and a **single-view** drivers UI in `Drivers.vue` (dialog-based add/edit/delete). No sidebar/main split.
- **FR-004**: typing in the on-screen course search bar updates the driver list with only drivers containing the search bar's content as a substring.
- **FR-005**: signed-out users MUST NOT have access to any `/vehicle-t3` routes

---

## Assumptions

- Feature 2 auth and session handling MUST be merged to `dev` before implementing this feature.
- Feature 1 User Management MUST be merged into 'dev' before implementing

## Edge Cases

- Empty or whitespace-only course name → client block and/or `400`.
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
| **Read scope**        | `GET /driver-t3` returns only drivers.                                                                                                          |
| **Write scope**       | `PUT` and `DELETE` apply only when the driver row matches both `id` and `req.user.id`.                                                        |
| **Create scope**      | New drivers owned by nobody.                                                                                                                  |
| **Cross-user access** | If an unauthorized user tries to `PUT`, `DELETE`, or `POST` drivers, respond with `403`.                                                      |
| **UI scope**          | The drivers view shows only drivers returned by `GET /driver-t3` for the signed-in admin.                                                       |
| **Implementation**    | Use a shared helper (e.g. `getAccessibleCoursesOrNull(req, driver_id)`) in `app/authorization/` — do not duplicate scope logic in controllers. |

---

## API Requirements

| Method   | Endpoint             | Auth       | Purpose             |
| -------- | -------------------- | ---------- | ------------------- |
| `GET`    | `/driver-t3`           | Yes        | Fetch all drivers   |
| `GET`    | `/driver-t3/:driver_id` | Yes        | Show driver details |
| `POST`   | `/driver-t3`           | Yes, admin | Create a new driver |
| `PUT`    | `/driver-t3/:driver_id` | Yes, admin | Update a driver     |
| `DELETE` | `/driver-t3/:driver_id` | Yes, admin | Delete a driver     |

All endpoints except `GET` require **an administrator-role user** to access/operate. Non-admin user access returns `403`.

**Create driver request body:**

```json
{
  "driver_id": "1",
  "license_status": "active",
  "license_exp_date": "08/2028",
  "availability": "any time"
}
```

**drivers success response** (`200` / `201`):

```json
{
  "driver_id": "1",
  "license_status": "active",
  "license_exp_date": "08/2028",
  "availability": "any time"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** `404`.
**Invalid Request:** `400`.
**Server/Connection Error:** `500`.
**Put course request body:**

```json
{
  "driver_id": "1",
  "license_status": "active",
  "license_exp_date": "08/2028",
  "availability": "any time"
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

**Implementation note:** one route/view for drivers; course CRUD dialogs are child components or inline `<v-dialog>` blocks in `Drivers.vue` unless the team splits presentational dialogs later.

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
| `availability` | ENUM      | Required; `yes`, `no` |

---

## Acceptance Criteria (Gherkin)

### US-8.1 — Create drivers

#### Scenario: Admin creates a new driver

- **Given** I am signed in as an admin on the driver view
- **When** I click **+ New driver**
- **And** I enter license status `active`
- **And** I enter expiration date `05/2026`
- **And** I add availability `yes`
- **And** I confirm the dialog
- **Then** the API returns `201` with a driver object containing `driver_id`, `license_status`, `license_exp_date` and `availability`
- **And** driver_id, license_status, license_exp_date, and availability appears in the drivers view
- **And** the add-driver dialog closes

#### Scenario: Admin creates a course with an empty name

- **Given** I am signed in as an admin on the course view
- **When** I open the new course dialog
- **And** I leave the name field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"course name is required."**
- **And** no API request is sent

#### Scenario: Admin creates a course with an empty description

- **Given** I am signed in as an admin on the course view
- **When** I open the new course dialog
- **And** I leave the description field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"description is required."**
- **And** no API request is sent

#### Scenario: Admin creates a course without semester

- **Given** I am signed in as an admin on the course view
- **When** I open the new course dialog
- **And** I leave the semester empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"semester is required."**
- **And** no API request is sent

#### Scenario: Admin creates a course with a name that is too long

- **Given** I am signed in as an admin on the course view
- **When** I submit a course id longer than 9 characters
- **Then** the API returns `400` with `{ "message": "course name must be 9 characters." }`
- **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: Admin creates a course with an id that is improperly formatted

- **Given** I am signed in as an admin on the course view
- **When** I submit a course name that does not follow the XXXX-#### convention (XXXX being a 4-letter department title) and #### being 4 integers
- **Then** the API returns `400` with `{ "message": "course name must be of the form XXXX-#### (e.g. CMSC-4321)." }`
- **And** the error is displayed in a `<v-alert type="error">`

---

### US-3.2 — View all courses

#### Scenario: Course view loads with existing semesters

- **Given** I am signed in as an admin
- **And** the courses `CMSC-4321` and `ARTS-3214` exist
- **When** I navigate to the courses view
- **Then** both courses appear in the courses view
- **And** each row shows the course name with edit and delete icon actions

#### Scenario: No courses exist

- **Given** I am signed in as an admin
- **And** no courses exist
- **When** I navigate to the course view
- **Then** I see **"No courses yet. Create a course."**

---

### US-3.3 — Manage course rows

#### Scenario: course rows show edit and delete actions

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I view the courses view
- **Then** the `CMSC-4321` row shows an **Edit course** icon action
- **And** the `CMSC-4321` row shows a **Delete course** icon action

---

### US-3.4 — Edit and delete courses

#### Scenario: Admin edits a course

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I click the edit icon on the `CMSC-4321` row
- **And** I change the name to `ARTS-4321` in the rename dialog
- **And** I confirm
- **Then** the API returns `200` with the updated course object
- **And** the courses view shows `ARTS-4321` instead of `CMSC-4321`

#### Scenario: Admin deletes a course

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I click the delete icon on the `CMSC-4321` row
- **And** I confirm the delete dialog
- **Then** the API returns `204`
- **And** the course is removed from the courses view

---

### US-3.5 — Search courses

#### Scenario: Search bar appears with courses

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I view the courses view
- **Then** I see a search bar named `Find` above the courses list
  returns

#### Scenario: No search bar appears with no courses

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I view the courses view
- **Then** I see **"No courses yet. Create a course."**
- **And** I see no search bars in the view

#### Scenario: Admin types in course search bar

- **Given** I am signed in as an admin
- **And** I am viewing the courses view
- **And** the courses `CMSC-4321`, `ARTS-3214`, `BIBL-3421`, and `CMSC-1324` exist
- **When** I type `CMSC` in the `Find` search bar
- **Then** the course list updates to contain only the courses `CMSC-4321` and `CMSC-1324`

#### Scenario: Admin types in course search bar 2

- **Given** I am signed in as an admin
- **And** I am viewing the courses view
- **And** the courses `CMSC-4321`, `ARTS-3214`, `BIBL-4321`, and `CMSC-1324` exist
- **When** I type `4321` in the `Find` search bar
- **Then** the course list updates to contain only the courses `CMSC-4321` and `BIBL-4321`

#### Scenario: Unauthenticated user accesses the courses view

- **Given** I have no session in `localStorage`
- **When** I navigate to the courses view
- **Then** I am redirected to the login page

#### Scenario: Unauthenticated API request to courses

- **Given** I have no valid session token
- **When** I request `GET /course-t3`
- **Then** the API returns `401` with an unauthorized message

---

## Test Coverage Map

| Story  | Scenario                                                       | Test file                                                         | Test name                                                        |
| ------ | -------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| US-3.1 | Admin creates a new course                                     | `backend/tests/course-t3.test.js`, `frontend/tests/Courses.test.js` | `Admin creates a new course`                                     |
| US-3.1 | Admin creates a course with an empty name                      | `frontend/tests/Courses.test.js`                                  | `Admin creates a course with an empty name`                      |
| US-3.1 | Admin creates a course with an empty description               | `frontend/tests/Courses.test.js`                                  | `Admin creates a course with an empty description`               |
| US-3.1 | Admin creates a course without semester                        | `frontend/tests/Courses.test.js`                                  | `Admin creates a course without semester`                        |
| US-3.1 | Admin creates a course with a name that is too long            | `backend/tests/course-t3.test.js`, `frontend/tests/Courses.test.js` | `Admin creates a course with a name that is too long`            |
| US-3.1 | Admin creates a course with an id that is improperly formatted | `backend/tests/course-t3.test.js`, `frontend/tests/Courses.test.js` | `Admin creates a course with an id that is improperly formatted` |
| US-3.2 | Course view loads with existing semesters                      | `backend/tests/course-t3.test.js`, `frontend/tests/Courses.test.js` | `Course view loads with existing semesters`                      |
| US-3.2 | No courses exist                                               | `frontend/tests/Courses.test.js`                                  | `No courses exist`                                               |
| US-3.3 | course rows show edit and delete actions                       | `frontend/tests/Courses.test.js`                                  | `course rows show edit and delete actions`                       |
| US-3.4 | Admin edits a course                                           | `backend/tests/course-t3.test.js`, `frontend/tests/Courses.test.js` | `Admin edits a course`                                           |
| US-3.4 | Admin deletes a course                                         | `backend/tests/course-t3.test.js`, `frontend/tests/Courses.test.js` | `Admin deletes a course`                                         |
| US-3.5 | Search bar appears with courses                                | `frontend/tests/Courses.test.js`                                  | `Search bar appears with courses`                                |
| US-3.5 | No search bar appears with no courses                          | `frontend/tests/Courses.test.js`                                  | `No search bar appears with no courses`                          |
| US-3.5 | Admin types in course search bar                               | `frontend/tests/Courses.test.js`                                  | `Admin types in course search bar`                               |
| US-3.5 | Admin types in course search bar 2                             | `frontend/tests/Courses.test.js`                                  | `Admin types in course search bar 2`                             |
| US-3.5 | Unauthenticated user accesses the courses view                 | `frontend/tests/Courses.test.js`                                  | `Unauthenticated user accesses the courses view`                 |
| US-3.5 | Unauthenticated API request to courses                         | `backend/tests/course-t3.test.js`                                   | `Unauthenticated API request to courses`                         |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 3 from @features/feature-3-course-management.md on branch `feature/3-course-management`.

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
- Drag-and-drop course reordering
- Sharing courses with other users
- `POST`/`GET`/`PUT`/`DELETE` anywhere that's not `/course-t3/course-t3` or `/course-t3/:courseId`

---

## Delivered to Feature 5

The following are intentionally deferred to the next feature spec:

- `sections` table and associations
