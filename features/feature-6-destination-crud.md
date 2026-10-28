# Feature: Destination CRUD

**Feature ID:** 6
**Branch pattern:** `feature/6-destination-CRUD`
**Status:** Draft
**Created:** 2026-10-24
**Updated:** 2026-10-26
**Input:** Application must support the creation, reading, updating, and deleting of frequently-visited locations/destinations vehicle reservation requests are headed to.
**Depends on:** [Feature 1 -- User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md), [Feature 2 -- Google Auth](feature-2-Google-Auth.md)
**Related:** `frontend/src/views/DestinationList.vue`, `frontend/src/views/DestinationForm.vue`, `backend/app/routes/destination.routes.js`, `backend/app/routes/users.routes.js`

---

## User Stories

### US-6.1: View Current Destinations

**As a** authenticated user with administrator role
**I want to** see a list of all destinations
**So that** I know which destinations exist.

**Priority:** P1
**Independent test:** `DestinationList.vue` shows a list of destinations with one per row and their details.
**Acceptance scenarios:** see ### US-6.1 under Acceptance Criteria

### US-6.2: Destination Details

**As a** authenticated user with administrator role
**I want to** see the details of a selected destinations
**So that** I can know all its information.

**Priority:** P1
**Independent test:** destinations row in the list has a button which, when pressed, opens a `Details` modal containing a destination's information and current/future reservations headed to that area
**Acceptance scenarios:** see ### US-6.2 under Acceptance Criteria

### US-6.3: Add Destination

**As a** authenticated user with administrator role
**I want to** add destinations to my `Destinations` list
**So that** I can use it for stuff later.

**Priority:** P1
**Independent test:** Click **+ New Destination**, 'Create Destination' modal opens containing some fields which have proper form validation as defined under ## Screen Requirements
**Acceptance scenarios:** see ### US-6.3 under Acceptance Criteria

### US-6.4: Remove Destination

**As a** authenticated user with administrator role
**I want to** remove destinations to my `Destinations` list
**So that** I can manage relevant information and list size.

**Priority:** P2
**Independent test:** click trash-can icon in a given row in the Destinations list, modal with heading **Confirm Delete?** opens, clicking **Delete** button removes correct destination from list, destination in question no longer appears in the list
**Acceptance scenarios:** see ### US-6.4 under Acceptance Criteria

### US-6.5: Destinations Search Bar

**As a** authenticated user with administrator role
**I want to** search for destinations by name or by address
**So that** I don't have to scroll or paginate to find the destinations I want.

**Priority:** P2
**Independent test:** pressing `Previous` button shows the enrollments for the previous semester, pressing the `Next` button shows the enrollments for the next semester
**Acceptance scenarios:** see ### US-6.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements [THINK OF MORE POSSIBLE FR'S LATER]

**FR-001**: An authenticated admin user **MUST** be allowed to do CRUD operations on the `Destinations` table on `DestinationList.vue` or its relevant components
**FR-002**: Other authenticated users or unauthenticated visitors **MUST NOT** be allowed to do update or delete operations on the `Destinations` table on `DestinationList.vue`
**FR-003**: Any authenticated user **MUST** be able to perform `POST` on the `Destinations` table from relevant components.
**FR-004**: Any authenticated user **MUST** be allowed to perform `GET` on the `Destinations` table.
**FR-005**: `DestinationList.vue` **MUST** show a list of `Destinations` table entries.
**FR-006**: Authenticated admin users **MUST** be able to search list entries by city, state, zip, and/or name.
**FR-007**: Authenticated admin users **MUST** be able to sort list entries by city, state, zip, and/or name in both ascending and descending order.
**FR-008**: Authenticated admin users **MUST** be able to see the details of list entries in rows.
**FR-009**: The list of `Destinations` entries **MUST NOT** be displayed across more than one page.
**FR-010**: Each `Destinations` entry **MUST** display the end-date of the most recent `request` made including it, ignore future requests including it.
**FR-011**: Trying to add or save edits to a `Destinations` entry with any empty fields besides `Address Line 2` **MUST** cancel the add or save (but not close the dialog) and return an error saying `Missing fields: ` along with the empty fields.
**FR-012**: Trying to add or save edits to a `Destinations` entry with a `zip` formatted other than ##### or #####-#### (where # is a digit from 0-9) **MUST** return a `400` error saying `Zip code must be formatted like ##### or #####-####`.
**FR-013**: Displaying an error inside a create, update, or delete dialog **MUST NOT** close the dialog.
**FR-014**: Encountering a field/form/dialog error **MUST NOT** send the query to the `Destinations` table.

---

## Assumptions

- Feature 1 and Feature 2 are already on `dev`

## Edge Cases

- POST `Destinations` with the same `city`, `state`, `zip`, and `address` (combined) -> `409`
- no `Requests` exist but destinations exist -> don't render anything relating to requests
- GET `Destinations` that hasn't been visited yet -> shows "not visited"

## Success Criteria

**SC-001**: Every Gherkin scenario has at least one automated test before merge
**SC-002**: Administrator user can Create, Read, Update, or Delete from `Destinations`
**SC-003**: User, Driver, and Maintenance users can Create and Read (but not Update or Delete) from `Destinations`
**SC-004**: npm test passes for `backend/tests/destinations.test.js`, `frontend/tests/DestinationList.test.js`, and `frontend/tests/DestinationForm.test.js`

---

## Data Ownership & Isolation

Destinations are not owned by anything or anyone.

| Rule                  | Requirement                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | For all authenticated users (`GET /vehicle-t3/destinations` and `GET /vehicle-t3/destinations/:destinationId`)                          |
| **Write scope**       | Only authenticated admins can overwrite/update `Destinations` (`PUT /vehicle-t3/destinations/:destinationId`)                           |
| **Create scope**      | `POST /vehicle-t3/destinations/:destinationId*` succeeds only when the row does not already exist and `:destinationId === req.user.id`. |
| **Cross-user access** | No user data should be included in responses from `Destinations`                                                                        |
| **UI scope**          | `DestinationList.vue` shows data from `Destinations` on a single page which can be sorted and searched.                                 |
| **Later features**    | `DestinationList.vue` will include recently-visited data from the `request` which most recently included it                             |

---

## Key Entities

**User**: registered account (email, password, role, etc); has permission levels pertaining to `Destinations` CRUD.
**Destination**: Entity containing information used to relate a `request` to a real world location.

---

## API Requirements

Mount prefix: `/vehicle-t3`. Flat JSON (no `{ success, data }` envelope). Errors: `{ "message": "Human-readable explanation." }`. Authenticated writes send `Authorization: Bearer <token>`.

This feature uses the `Destinations` endpoints below.

| Method   | Endpoint                                  | Auth       | Purpose                                                               |
| -------- | ----------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `GET`    | `/vehicle-t3/destinations`                | Yes        | List all destinations                                                 |
| `POST`   | `/vehicle-t3/destinations/`               | Yes        | Add a destination                                                     |
| `GET`    | `/vehicle-t3/destinations/:destinationId` | Yes        | List the details of the destination with the id `:destinationId`      |
| `PUT`    | `/vehicle-t3/destinations/:destinationId` | Yes, Admin | Overwrite the details of the destination with the id `:destinationId` |
| `DELETE` | `/vehicle-t3/destinations/:destinationId` | Yes, Admin | Remove the destination with the id `:destinationId`                   |

**Unauthenticated write:** `401` login error
**Unauthorized write:** `403` forbidden

### Read Destinations (`GET /vehicle-t3/destinations`)

**Success** (`200`): array with all destinations

```json
[
  {
    "id": 1,
    "zip": "12345-0001",
    "city": "Omaha",
    "state": "Nebraska",
    "addr_line_1": "69420 Appleberry Lane",
    "addr_line_2": null,
    "dest_name": "ur mom's house",
    "last_visited": "2026-10-25"
  },
  {
    "id": 2,
    "zip": "54321-9999",
    "city": "Orlando",
    "state": "California",
    "addr_line_1": "11111 Still-Appleberry Lane",
    "addr_line_2": "P.O. Box 351",
    "dest_name": "ur dad's house",
    "last_visited": "2026-9-25"
  },
  ...
]
```

**Server error:** `500` `{ "message": "…" }`.

### Add Destination (`POST /vehicle-t3/destinations`)

**Request body** (fields the add request sends):

```json
{
  "zip": "12345-0001",
  "city": "Omaha",
  "state": "Nebraska",
  "addr_line_1": "69420 Appleberry Lane",
  "addr_line_2": null,
  "dest_name": "ur mom's house"
}
```

Missing `zip`, `city`, `state`, `addr_line_1`, `dest_name` → `400` bad request.
Duplicate combination `zip`, `city`, `state`, `addr_line_1`, `addr_line_2` → `409` conflict.

**Success** (`201`)
**Server error:** `500` `{ "message": "…" }`.

### Remove Destination (`DELETE /vehicle-t3/destinations/:destinationId)

**Success** (`204`)
**Not found:** `404`
**Server error:** `500` `{ "message": "…" }`.

Quoted messages that tests must match:

| Situation        | Status | `message`                                                                           |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `GET` success    | 200    | <response from GET>                                                                 |
| `POST` success   | 201    | `New destination created with id=<id>`                                              |
| `DELETE` success | 204    | <empty response>                                                                    |
| Bad Request      | 400    | `Malformed request. Please make sure everything in the form is properly formatted!` |
| Login Error      | 401    | `Please sign in. If you think this is a mistake, contact your system administrator` |
| Forbidden        | 403    | `Please contact a system administrator for assistance.`                             |
| Not Found        | 404    | `No destination was found for id=<id>`                                              |
| Conflict         | 409    | `Destination with this address already exists!`                                     |

---

## Screen Requirements [CONTINUE FROM HERE WHEN RETURNING]

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

### Destinations view

- Heading: **Manage Destinations**
- Primary action: **+ New Destination** opens a `<DestinationForm>` component named **Destination Form** Use class `oc-cta` on **Create**, **+ New Destination**, and **Destination Form** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Display interactive search bar named `Search` above any lists
- Display destinations as rows (e.g. `<v-list>` or table). The following columns should be in the list:
  **Name** -- The name of the address (`dest_name`)
  **Street Address** -- The address typed into map applications (`addr_line_1`)
  **Address Line 2** -- Address line 2 (`addr_line_2`); render empty if left null
  **City** -- The city the destination is in (`city`)
  **State** -- The state the destination is in (or country if not in US) (`state`)
  **Zip Code** -- Destination Zip Code (`zip`)
  **Visited** -- The date of the most recent `request` containing this destination id
  - Each row contains **Edit** and **Delete** icons — opens confirmation `<v-dialog>`
- Icon-only row action uses `size="small"` and accessible `aria-label` (**Edit**) and (**Delete**).
  **Empty state:** **"No destinations yet. Add a destination."** when no destinations exist in the database.
  **Loading state:** skeleton or progress indicator while enrollments are fetching.
  **Error state:** `<v-alert type="error">` for API failures.

### Destination Form Component

Primary Action: Fill out a form with the following fields:
**Name** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**Street Address** -- accepts a string of length 254 or less; trim whitespaces in beginning/end
**Address Line 2** -- accepts a string of length 254 or less; trim whitespaces in beginning/end; nullable
**City** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**State** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**Zip Code** -- accepts numeric string of exactly length 5 or 10 in format ##### or, if more than 5 numbers typed in, add - automatically so format becomes #####-####

**Edit State**

- Header: **Edit Destination**
- **Cancel** button clears all fields in the current form and closes the component
- **Save** first checks for validation as per these requirements and the Acceptance Critera, then changes the button text into a spinning load as it `PUT`s the form data into the `Destinations` entry currently being edited. As soon as a response is received from the backend, **Save** button text becomes **Save** again and component closes.

**Add State**

- Header: **Add Destination**
- **Cancel** button clears all fields in the current form and closes the component
- **Save** first checks for validation as per these requirements and the Acceptance Critera, then changes the button text into a spinning load as it `POST`s the form data into the `Destinations` entry currently being edited. As soon as a response is received from the backend, **Add** button text becomes **Add** again and component closes.

**Implementation note:** one route/view for `Destinations`; `Destinations` dialogs are child components or inline `<v-dialog>` blocks in `DestinationList.vue` unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Data Model Requirements

This feature uses a `Destinations` table where each entry has an `id` used by other tables as a foreign key. Sequelize also stores `createdAt` / `updatedAt`.

### `Destinations` table

| Field             | Type                    | Rules                               |
| ----------------- | ----------------------- | ----------------------------------- |
| `id`              | INTEGER; AUTO-INCREMENT | Primary Key                         |
| `zip`             | VARCHAR(10)             | Required (some ZIPs are #####-####) |
| `city`            | VARCHAR(255)            | Required                            |
| `state`           | VARCHAR(255)            | Required                            |
| `addr_line_1`     | VARCHAR(255)            | Required                            |
| `addr_line_2`     | VARCHAR(255)            | Nullable                            |
| `dest_name`       | VARCHAR(255)            | Required                            |
| `last_visited_on` | DATE                    | Nullable                            |

### Associations

(_The ERD is wrong in this. Requests can only have one destination, but a destination can have multiple vehicle requests going to it at once_.)

- `Destinations` hasMany `request`s
- `request` belongsTo `Destinations`

---

## Acceptance Criteria (Gherkin)

### US-6.1: View Current Destinations

#### Scenario: Admin views DestinationList

**Given** I am an authenticated admin user
**When** I navigate to `DestinationList.vue`
**Then** I am allowed to see the **Manage Destinations** list described in Screen Requirements with everything on it

### US-6.2: Destination Details

#### Scenario: PUT to Destinations is rejected

**Given** I am signed in as a student
**When** I send any `PUT` request
**Then** the API returns 405 with `{ "message": "Enrollments are dropped, not edited" }`

### US-6.3: Add Destination

#### Scenario: PUT to Destinations is rejected

**Given** I am signed in as a student
**When** I send any `PUT` request
**Then** the API returns 405 with `{ "message": "Enrollments are dropped, not edited" }`

### US-6.4: Remove Destination

#### Scenario: PUT to Destinations is rejected

**Given** I am signed in as a student
**When** I send any `PUT` request
**Then** the API returns 405 with `{ "message": "Enrollments are dropped, not edited" }`

### US-6.5: Destinations Search Bar

#### Scenario: PUT to Destinations is rejected

**Given** I am signed in as a student
**When** I send any `PUT` request
**Then** the API returns 405 with `{ "message": "Enrollments are dropped, not edited" }`

### US-6.6: No editing enrollments

#### Scenario: PUT to Destinations is rejected

**Given** I am signed in as a student
**When** I send any `PUT` request
**Then** the API returns 405 with `{ "message": "Enrollments are dropped, not edited" }`

---

## Test Coverage Map

Each scenario above must map to at least one automated test. `it` names must match the Gherkin **Scenario** titles exactly.

| Story  | Scenario                                        | Test file                                                                     | Test name                                         |
| ------ | ----------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| US-6.1 | view enrollment list with no enrollments        | `frontend/tests/EnrollmentList.test.js`                                       | `view enrollment list with no enrollments`        |
| US-6.1 | view enrollment list with enrollments           | `backend/tests/destinations.test.js`, `frontend/tests/EnrollmentList.test.js` | `view enrollment list with enrollments`           |
| US-6.1 | view only enrollments matching semesterId       | `backend/tests/destinations.test.js`, `frontend/tests/EnrollmentList.test.js` | `view only enrollments matching semesterId`       |
| US-6.1 | student cannot fetch another user's enrollments | `backend/tests/destinations.test.js`, `frontend/tests/EnrollmentList.test.js` | `student cannot fetch another user's enrollments` |
| US-6.2 | view enrollment details                         | `frontend/tests/EnrollmentList.test.js`                                       | `view enrollment details`                         |
| US-6.3 | Open add enrollment modal                       | `frontend/tests/EnrollmentList.test.js`                                       | `Open add enrollment modal`                       |
| US-6.3 | Use course combobox                             | `frontend/tests/EnrollmentList.test.js`                                       | `Use course combobox`                             |
| US-6.3 | Confirm course combobox                         | `frontend/tests/EnrollmentList.test.js`                                       | `Confirm course combobox`                         |
| US-6.3 | Use section combobox                            | `frontend/tests/EnrollmentList.test.js`                                       | `Use section combobox`                            |
| US-6.3 | Confirm section combobox                        | `frontend/tests/EnrollmentList.test.js`                                       | `Confirm section combobox`                        |
| US-6.3 | Create valid enrollment                         | `backend/tests/destinations.test.js`, `frontend/tests/EnrollmentList.test.js` | `Create valid enrollment`                         |
| US-6.3 | Create an enrollment with an empty course       | `frontend/tests/EnrollmentList.test.js`                                       | `Create an enrollment with an empty course`       |
| US-6.3 | Create an enrollment with an empty section      | `frontend/tests/EnrollmentList.test.js`                                       | `Create an enrollment with an empty section`      |
| US-6.3 | Create an enrollment with duplicate data        | `frontend/tests/EnrollmentList.test.js`                                       | `Create an enrollment with duplicate data`        |
| US-6.3 | Create enrollment with improper course ID       | `frontend/tests/EnrollmentList.test.js`                                       | `Create enrollment with improper course ID`       |
| US-6.3 | Create enrollment with improper section ID      | `frontend/tests/EnrollmentList.test.js`                                       | `Create enrollment with improper section ID`      |
| US-6.4 | Select enrollment delete icon                   | `frontend/tests/EnrollmentList.test.js`                                       | `Select enrollment delete icon`                   |
| US-6.4 | Confirm delete icon                             | `backend/tests/destinations.test.js`, `frontend/tests/EnrollmentList.test.js` | `Confirm delete icon`                             |
| US-6.4 | Cancel delete                                   | `frontend/tests/EnrollmentList.test.js`                                       | `Cancel delete`                                   |
| US-6.5 | EnrollmentList First Landing                    | `backend/tests/destinations.test.js`, `frontend/tests/EnrollmentList.test.js` | `EnrollmentList First Landing`                    |
| US-6.5 | EnrollmentList Return Landing                   | `frontend/tests/EnrollmentList.test.js`                                       | `EnrollmentList Return Landing`                   |
| US-6.5 | Navigate Semesters order forward                | `frontend/tests/EnrollmentList.test.js`                                       | `Navigate Semesters order forward`                |
| US-6.5 | Navigate Semesters order backward               | `frontend/tests/EnrollmentList.test.js`                                       | `Navigate Semesters order backward`               |
| US-6.5 | Navigate Semesters combobox typing              | `frontend/tests/EnrollmentList.test.js`                                       | `Navigate Semesters combobox typing`              |
| US-6.5 | Navigate Semesters combobox select              | `frontend/tests/EnrollmentList.test.js`                                       | `Navigate Semesters combobox select`              |
| US-6.6 | PUT to Destinations is rejected                 | `backend/tests/destinations.test.js`                                          | `PUT to Destinations is rejected`                 |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 6 from @features/feature-6-enrollment-management.md on branch `feature/6-enrollment-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

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

-
- ***

## Defer to Feature 7

Student course listing (management, `REST`, `API`'s, views, components, student course catalog/browse)

---

## Defer to Feature 8

Student section listing (management, `REST`, `API`'s, views, components, browse/list sections as a student)
