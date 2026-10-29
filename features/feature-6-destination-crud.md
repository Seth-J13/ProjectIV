# Feature: Destination CRUD

**Feature ID:** 6
**Branch pattern:** `feature/6-destination-CRUD`
**Status:** Ready
**Created:** 2026-10-24
**Updated:** 2026-10-28
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

### US-6.6: Edit Destination

**As a** authenticated user with administrator role
**I want to** edit destinations from my `Destinations` list
**So that** I can correct incorrect information.

**Priority:** P1
**Independent test:** Click **Edit** icon in a `Destinations` list entry, 'Update Destination' modal opens containing some fields which have proper form validation as defined under ## Screen Requirements
**Acceptance scenarios:** see ### US-6.6 under Acceptance Criteria

---

## Requirements

### Functional Requirements

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
**FR-015**: The list of `Destinations` entries **MUST** be retrieved in batches of _at most_ `5` when arriving at the bottom of the page, or less if the final batch does not have `5` entries left to retrieve.

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

## Screen Requirements

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

### Destinations view

- Heading: **Manage Destinations**
- Primary action: **+ New Destination** opens a `<DestinationForm>` component named **Destination Form** Use class `oc-cta` on **Create**, **+ New Destination**, and **Destination Form** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Display interactive search bar named `Search` above any lists with a clearable `<v-select>` beside it to switch between destination search attributes as defined by the list columns below
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
- Rows are displayed in the list in batches of `5` at a time. Scrolling down loads the next batch beneath the current one.
- List entries are, by default, sorted by the most recent `last_visited_on` (excluding future)
- **Top ↑** displayed upon arriving at the bottom of the page. Pressing this button scrolls to the top but does not clear the destinations list

- Empty state: **"No destinations yet. Add a destination to view its details."** when no destinations exist in the database.
- Loading state: skeleton or progress indicator while enrollments are fetching.
- Error state: `<v-alert type="error">` for API failures.

### Destination Form Component

Primary Action: Fill out a form with the following fields:
**Name** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**Street Address** -- accepts a string of length 254 or less; trim whitespaces in beginning/end
**Address Line 2** -- accepts a string of length 254 or less; trim whitespaces in beginning/end; nullable
**City** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**State** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**Zip Code** -- accepts numeric string of exactly length 5 or 10 in format ##### or, if more than 5 numbers typed in, add hyphen automatically so format becomes #####-####. Typing anything other than numbers will not updated the input field

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
**Then** I am allowed to see the **Manage Destinations** list described in Screen Requirements with everything on it.

#### Scenario: Other role views DestinationList

**Given** I am an authenticated user with a role other than `admin`
**When** I navigate to `DestinationList.vue`
**Then** I am immediately redirected to the landing page.

### US-6.2: Destination Details

#### Scenario: No entries exist in Destinations table

**Given** I am viewing the **Manage Destinations** list
**When** the `Destinations` table is empty
**Then** I see text inside the **Manage Destinations** list saying `"No destinations yet. Add a destination to view its details."`

#### Scenario: Less than 5 entries exist in Destinations table

**Given** I am viewing the **Manage Destinations** list
**When** there exist between `1` and `5` (inclusive) entries in the `Destinations` table
**Then** I can see every existing row and its details as per the Screen Requirements.

#### Scenario: More than 5 entries exist in Destinations table

**Given** I am viewing the **Manage Destinations** list
**When** there exist more than `5` entries in the `Destinations` table
**Then** I can see the first `5` entries of the `Destinations` table and their details listed
**And** I can scroll to the bottom of the page to automatically load the next `5` entries of the `Destinations` table into the list.

#### Scenario: Back to Top button hidden when at top of page

**Given** I am viewing the **Manage Destinations** list
**When** I am viewing the top of the page
**Then** I cannot see the **Top ↑** button.

#### Scenario: Back to Top button shown when scrolling down

**Given** I am viewing the **Manage Destinations** list
**When** I scroll down on the view
**Then** I can see the **Top ↑** button.

#### Scenario: Press Back to Top button

**Given** I am viewing the **Manage Destinations** list
**When** I press the **Top ↑** button
**Then** I scroll to the top of the page
**And** the **Manage Destinations** list is entirely unaffected.

### US-6.3: Add Destination

#### Scenario: Press New Destination

**Given** I am viewing the **Manage Destinations** list
**When** I press the **+ New Destination**
**Then** I see the `DestinationForm` component open in Add mode

#### Scenario: Press outside DestinationForm component (add)

**Given** I am viewing the `DestinationForm` component in Add mode
**When** I press anywhere outside the `DestinationForm` component
**Then** the fields within the `DestinationForm` component are cleared
**And** I no longer see the `DestinationForm` component on screen

#### Scenario: Send add request with invalid form data

**Given** I have filled out any field in the `DestinationForm` component in Add mode with invalid form data as per the Screen Requirements
**When** I press the **Add** button
**Then** beneath each field containing invalid form data, I see an error with a human-readable explanation of how the data is malformed
**And** no request is sent

#### Scenario: Send add request with a missing required field

**Given** I have filled out all the fields in the `DestinationForm` component in Add mode except for **Zip**
**When** I press the **Add** button
**Then** I see an error beneath **Zip** that says `Required`
**And** no request is sent

#### Scenario: Send add request with valid form data

**Given** I have filled out all the fields in the `DestinationForm` component in Add mode except for **Address Line 2** with valid form data as per the Screen Requirements
**When** I press the **Add** button
**Then** I receive a `201` response code
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen with the `201` response message
**And** the message box gets destroyed automatically after `3` seconds
**And** the **Manage Destinations** list reloads without requiring a page reload

#### Scenario: Signed out user makes add request

**Given** I am an unauthenticated user
**When** I send a `POST` request to the `Destinations` table with or without valid data
**Then** I receive a `401` response code and message

### US-6.4: Remove Destination

#### Scenario: Press Delete icon

**Given** I am viewing the **Manage Destinations** list
**When** I press the **Delete** icon
**Then** a **Delete Destination** dialog appears

#### Scenario: Press outside Delete confirmation dialog

**Given** I am viewing the **Delete Destination** dialog
**When** I press anywhere outside the **Delete Destination** dialog
**Then** the **Delete Destination** dialog closes
**And** no request is sent

#### Scenario: Press Cancel inside Delete confirmation dialog

**Given** I am viewing the **Delete Destination** dialog
**When** I press the **Cancel** button
**Then** the **Delete Destination** dialog closes
**And** no request is sent

#### Scenario: Press Delete inside Delete confirmation dialog

**Given** I am viewing the **Delete Destination** dialog
**When** I press the **Delete** button
**Then** the **Delete Destination** dialog closes
**And** the selected destination no longer exists in the table
**And** I receive a `204` status code
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen saying `"Successfully deleted Destination!"`
**And** the message box gets destroyed automatically after `3` seconds
**And** the **Manage Destinations** list reloads without requiring a page reload

### US-6.5: Destinations Search Bar

#### Scenario: No rendering Search Bar when no destinations exist

**Given** I am viewing the **Manage Destination** list
**When** no entries exist in the `Destinations` table
**Then** I do not see a search bar in the view

#### Scenario: Search Bar rendering when destinations exist

**Given** I am viewing the **Manage Destination** list
**When** entries exist in the `Destinations` table
**Then** I see a search bar in the view

#### Scenario: No search attribute selected

**Given** I leave the search-attribute selection of the search bar empty
**When** I type in the search bar
**Then** the **Manage Destination** list items reactively filter based on whether the content of the search bar is found as a substring in the destinations' **Name**.

#### Scenario: Search attribute selected

**Given** I select **City** in the search-attribute selection of the search bar
**When** I type in the search bar
**Then** the **Manage Destination** list items reactively filter based on whether the content of the search bar is found as a substring in the destinations' **City** attribute.

### US-6.6: Edit Destination

#### Scenario: Press Edit icon

**Given** I am viewing the **Manage Destinations** list
**When** I press the **Edit** icon on a destination
**Then** I see the `DestinationForm` component open in Edit mode
**And** the input fields of the `DestinationForm` component contain the correct details of the selected destination

#### Scenario: Press outside DestinationForm component (edit)

**Given** I am viewing the `DestinationForm` component in Edit mode
**When** I press anywhere outside the `DestinationForm` component
**Then** the fields within the `DestinationForm` component are cleared
**And** I no longer see the `DestinationForm` component on screen

#### Scenario: Send edit request with invalid form data

**Given** I have filled out any field in the `DestinationForm` component in Edit mode with invalid form data as per the Screen Requirements
**When** I press the **Save** button
**Then** beneath each field containing invalid form data, I see an error with a human-readable explanation of how the data is malformed
**And** no request is sent

#### Scenario: Send edit request with a missing required field

**Given** I have filled out all the fields in the `DestinationForm` component in Edit mode except for **Zip**
**When** I press the **Save** button
**Then** I see an error beneath **Zip** that says `Required`
**And** no request is sent

#### Scenario: Send edit request with valid form data

**Given** I have filled out all the fields in the `DestinationForm` component in Add mode except for **Address Line 2** with valid form data as per the Screen Requirements
**When** I press the **Save** button
**Then** I receive a `201` response code
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen with the `201` response message
**And** the message box gets destroyed automatically after `3` seconds
**And** the **Manage Destinations** list reloads without requiring a page reload

#### Scenario: Non-admin user makes update request

**Given** I am any authenticated non-admin user
**When** I send a `PUT` request to the `Destinations` table with or without valid data
**Then** I receive a `403` response code and message

---

## Test Coverage Map

Each scenario above must map to at least one automated test. `it` names must match the Gherkin **Scenario** titles exactly.

| Story  | Scenario                                           | Test file                                                                      | Test name                                            |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| US-6.1 | Admin views DestinationList                        | `frontend/tests/DestinationList.test.js`                                       | `Admin views DestinationList`                        |
| US-6.1 | Other role views DestinationList                   | `frontend/tests/DestinationList.test.js`                                       | `Other role views DestinationList`                   |
| US-6.2 | No entries exist in Destinations table             | `frontend/tests/DestinationList.test.js`                                       | `No entries exist in Destinations table`             |
| US-6.2 | Less than 5 entries exist in Destinations table    | `frontend/tests/DestinationList.test.js`                                       | `Less than 5 entries exist in Destinations table`    |
| US-6.2 | More than 5 entries exist in Destinations table    | `frontend/tests/DestinationList.test.js`                                       | `More than 5 entries exist in Destinations table`    |
| US-6.2 | Back to Top button hidden when at top of page      | `frontend/tests/DestinationList.test.js`                                       | `Back to Top button hidden when at top of page`      |
| US-6.2 | Back to Top button shown when scrolling down       | `frontend/tests/DestinationList.test.js`                                       | `Back to Top button shown when scrolling down`       |
| US-6.2 | Press Back to Top button                           | `frontend/tests/DestinationList.test.js`                                       | `Press Back to Top button`                           |
| US-6.3 | Press New Destination                              | `frontend/tests/DestinationList.test.js`                                       | `Press New Destination`                              |
| US-6.3 | Press outside DestinationForm component (add)      | `frontend/tests/DestinationForm.test.js`                                       | `Press outside DestinationForm component (add)`      |
| US-6.3 | Send add request with invalid form data            | `frontend/tests/DestinationForm.test.js`                                       | `Send add request with invalid form data`            |
| US-6.3 | Send add request with a missing required field     | `frontend/tests/DestinationForm.test.js`                                       | `Send add request with a missing required field`     |
| US-6.3 | Send add request with valid form data              | `backend/tests/destinations.test.js`, `frontend/tests/DestinationList.test.js` | `Send add request with valid form data`              |
| US-6.3 | Signed out user makes add request                  | `backend/tests/destinations.test.js`                                           | `Signed out user makes add request`                  |
| US-6.4 | Press Delete icon                                  | `frontend/tests/DestinationList.test.js`                                       | `Press Delete icon`                                  |
| US-6.4 | Press outside Delete confirmation dialog           | `frontend/tests/DestinationList.test.js`                                       | `Press outside Delete confirmation dialog`           |
| US-6.4 | Press Cancel inside Delete confirmation dialog     | `frontend/tests/DestinationList.test.js`                                       | `Press Cancel inside Delete confirmation dialog`     |
| US-6.4 | Press Delete inside Delete confirmation dialog     | `backend/tests/destinations.test.js`, `frontend/tests/DestinationList.test.js` | `Press Delete inside Delete confirmation dialog`     |
| US-6.5 | No rendering Search Bar when no destinations exist | `frontend/tests/DestinationList.test.js`                                       | `No rendering Search Bar when no destinations exist` |
| US-6.5 | Search Bar rendering when destinations exist       | `frontend/tests/DestinationList.test.js`                                       | `Search Bar rendering when destinations exist`       |
| US-6.5 | No search attribute selected                       | `frontend/tests/DestinationList.test.js`                                       | `No search attribute selected`                       |
| US-6.5 | Search attribute selected                          | `frontend/tests/DestinationList.test.js`                                       | `Search attribute selected`                          |
| US-6.6 | Press Edit icon                                    | `frontend/tests/DestinationList.test.js`                                       | `Press Edit icon`                                    |
| US-6.6 | Press outside DestinationForm component (edit)     | `frontend/tests/DestinationForm.test.js`                                       | `Press outside DestinationForm component (edit)`     |
| US-6.6 | Send edit request with invalid form data           | `frontend/tests/DestinationForm.test.js`                                       | `Send edit request with invalid form data`           |
| US-6.6 | Send edit request with a missing required field    | `frontend/tests/DestinationForm.test.js`                                       | `Send edit request with a missing required field`    |
| US-6.6 | Send edit request with valid form data             | `backend/tests/destinations.test.js`, `frontend/tests/DestinationList.test.js` | `Send edit request with valid form data`             |
| US-6.6 | Non-admin user makes update request                | `backend/tests/destinations.test.js`                                           | `Non-admin user makes update request`                |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 6 from @features/feature-6-destination-crud.md on branch `feature/6-destination-crud`.

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

- User role management (only read the role in this feature)

---

## Defer to Feature 8

- `Requests` table Create, Update, and Delete, files, operations, etc
- `Requests` table and the files needed for it
- `DestinationForm` integration into `Requests` creation/edit form

## Defer to Feature 11

- Destination Images
