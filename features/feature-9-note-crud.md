# Feature: Note CRUD

**Feature ID:** 9
**Branch pattern:** `feature/9-note-crud`
**Status:** Draft
**Created:** 2026-10-28
**Updated:** 2026-11-2
**Input:** Application must support the creation, reading, updating, and deleting of many request notes that can be attached to requests to denote different statuses of a future, active, or returned vehicle reservation.
**Depends on:** [Feature 1 -- User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md), [Feature 2 -- Google Auth](feature-2-Google-Auth.md), [Feature 8 -- Requests CRUD](feature-8-requests-crud.md), [Feature 13 -- User Management](feature-13-User-Management.md)
**Related:** `frontend/RequestDetails.vue`, `frontend/Maintenance.vue`, `frontend/components/NoteDetails.vue`, `frontend/components/NotesList.vue`, `frontend/tests/NoteForm.test.js`

---

## User Stories [INDEPENDENT TESTS BASED ON FIGMA UI]

### US-9.1: See Notes

**As a** authenticated user
**I want to** see every `note` attached to a `request` inside the request itself
**So that** I get more information about a vehicle reservation.

**Priority:** P1
**Independent test:** .
**Acceptance scenarios:** see ### US-9.1 under Acceptance Criteria

### US-9.2: Remove Notes

**As a** authenticated user
**I want to** remove `notes` attached to `requests` according to my `role` permissions
**So that** I can manage how much extra information is included on a `request`.

**Priority:** P1
**Independent test:** .
**Acceptance scenarios:** see ### US-9.2 under Acceptance Criteria

### US-9.3: Create Notes on Requests

**As a** authenticated user  
**I want to** add more than one `note` to a `request` according to my `role` permissions
**So that** I can add extra information to a `request`.

**Priority:** P1
**Independent test:** .
**Acceptance scenarios:** see ### US-9.3 under Acceptance Criteria

### US-9.4: Maintenance Requests

**As a** authenticated user
**I want to** create a `note` with a maintenance option turned on that automatically notified maintenance users
**So that** they can service vehicles swiftly.

**Priority:** P2
**Independent test:** .
**Acceptance scenarios:** see ### US-9.4 under Acceptance Criteria

### US-9.5: Edit Notes on Requests

**As a** authenticated user
**I want to** edit the `notes` attached to `requests` according to my `role` permissions
**So that** I can correct incorrect information.

**Priority:** P1
**Independent test:** .
**Acceptance scenarios:** see ### US-9.5 under Acceptance Criteria

### US-9.6: See Notes

**As a** authenticated user
**I want to** see a list of every `note` I've written
**So that** I can quickly access them.

**Priority:** P3
**Independent test:** .
**Acceptance scenarios:** see ### US-9.6 under Acceptance Criteria

---

## Requirements

### Functional Requirements

**FR-001**: Any authenticated user **MUST** be allowed to do CRUD operations on notes belonging to `requests` whose `requester_id` matches the user's `id`
**FR-002**: Authenticated admin users **MUST** be allowed to do CRUD operations on all notes.
**FR-003**: Any authenticated user **MUST** be able to perform `POST` on the `Notes` table from relevant components.
**FR-004**: Any authenticated user **MUST** be allowed to perform `GET` on the `Notes` table.
**FR-005**: The **Request Details** view **MUST** show a list of notes beneath the rest of the `request`'s information.
**FR-008**: Authenticated maintenance users **MUST** be able to see a list of notes whose `maintenance_request` bool is toggled on.
**FR-009**: The list of `notes` **MUST** be embedded in other screens rather than having a screen dedicated to it.
**FR-010**: The `NotesList` component **MUST** have a callback passed into it on implementation which filters its items dynamically.
**FR-011**: The `NotesList` component **MUST** allow `admin` role to create, read, update, and delete `notes`.
**FR-012**: The `NotesList` component **MUST** allow `maintenance` role to create, read, and update `notes` along with deleting `notes` _created by them_.
**FR-013**: The `NotesList` component **MUST** allow `user` and `driver` role to create and read `notes` along with updating and deleting `notes` _created by them_.
**FR-014**: `user` and `driver` roles **MUST NOT** be allowed to perform update and delete operations on `notes` not owned by them.
**FR-015**: The `NoteDetails` component **MUST** allow the user to perform different things based on roll access described in **Screen Requirements**.
**FR-016**: Displaying an error inside a create, update, or delete dialog **MUST NOT** close the dialog.
**FR-017**: Encountering a field/form/dialog error **MUST NOT** send the query to the `Notes` table.
**FR-018**: The `NotesList` component **MUST** be retrieved in batches of _at most_ `3` when arriving at the bottom of the list, or less if the final batch does not have `3` entries left to retrieve.
**FR-019**: The `NoteForm` component **MUST** be the only method on the frontend by which a user can create a note.
**FR-020**: The application **MUST NOT** have a whole view dedicated to Notes CRUD

---

## Assumptions

- Feature 1, 2, 8, and 13 are already on `dev`

## Edge Cases

- POST `Notes` with the exact same `text` and `request_id` -> `409`
- no `Requests` exist but `Notes` exist -> don't render orphaned notes
- DELETE `Request` with attached `Notes` -> CASCADE DELETE so attached `Notes` are deleted too

## Success Criteria

**SC-001**: Every Gherkin scenario has at least one automated test before merge
**SC-002**: Administrator user can Create, Read, Update, or Delete from `Notes`
**SC-003**: Maintenance users can Create, Read, and Update from `Notes`
**SC-004**: User and Driver users can Create and Read from `Notes`
**SC-005**: User, Driver, and Maintenance users can only Delete `Notes` created by them
**SC-006**: npm test passes for `backend/tests/notes.test.js`, `frontend/tests/NotesList.test.js`, `frontend/tests/NoteDetails.test.js`, `frontend/tests/NoteForm.test.js`

---

## Data Ownership & Isolation

`Notes` are owned by both `users` and `requests` since a `user` has permissions on `notes` they write while `notes` are attached to a `request`.

| Rule                  | Requirement                                                                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | For all authenticated users (`GET /vehicle-t3/notes`, `GET /vehicle-t3/notes/:noteId`, `GET /vehicle-t3/notes/:requestId`, `GET /vehicle-t3/notes/:userId`)                               |
| **Write scope**       | User and Driver users can overwrite/update _their own_ `Notes` while Admin and Maintenance users can overwrite/update _all_ `notes` (`PUT /vehicle-t3/notes/:noteId`)                     |
| **Create scope**      | `POST /vehicle-t3/notes/` succeeds only when the row does not already exist.                                                                                                              |
| **Delete scope**      | User, Driver, and Maintenance users can delete _their own_ `Notes` while Admin users can delete _all_ `notes` (`DELETE /vehicle-t3/notes/:noteId`, `DELETE /vehicle-t3/notes/:requestId`) |
| **Cross-user access** | No user data should be included in responses from `notes`;                                                                                                                                |
| **UI scope**          | `NotesList.vue` shows data from `Notes` on a single component which can be retrieved in batches sorted.                                                                                   |
| **Later features**    | `NotesList.vue` will be included in the `RequestForm` located on the landing page in a later feature.                                                                                     |

---

## Key Entities

**User**: registered account (email, password, role, etc); has permission levels pertaining to `Notes` CRUD.
**Note**: Entity containing extraneous information attached to a `request`.

---

## API Requirements

Mount prefix: `/vehicle-t3`. Flat JSON (no `{ success, data }` envelope). Errors: `{ "message": "Human-readable explanation." }`. Authenticated writes send `Authorization: Bearer <token>`.

This feature uses the `Notes` endpoints below.
Auth surrounded by [brackets] is dependent on whether the operation is performed on a note the executing user wrote.

| Method   | Endpoint                       | Auth                      | Purpose                                                               |
| -------- | ------------------------------ | ------------------------- | --------------------------------------------------------------------- |
| `GET`    | `/vehicle-t3/notes`            | Yes                       | List all notes                                                        |
| `POST`   | `/vehicle-t3/notes/`           | Yes                       | Add a note                                                            |
| `GET`    | `/vehicle-t3/notes/:noteId`    | Yes                       | List the details of the note with the id `:noteId`                    |
| `GET`    | `/vehicle-t3/notes/:requestId` | Yes                       | List all the notes attached to the `request` with the id `:requestId` |
| `GET`    | `/vehicle-t3/notes/:userId`    | Yes                       | List all notes written by the user with the id `:userId`              |
| `PUT`    | `/vehicle-t3/notes/:noteId`    | Yes, [Admin, Maintenance] | Overwrite the details of the `note` with the id `:noteId`             |
| `DELETE` | `/vehicle-t3/note/:noteId`     | Yes, [Admin]              | Remove the note with the id `:noteId`                                 |
| `DELETE` | `/vehicle-t3/note/:requestId`  | Yes, [Admin]              | Remove all notes with the request_id `:requestId`                     |

**Unauthenticated write:** (`401`) login error
**Unauthorized write:** (`403`) forbidden

### Read Notes (`GET /vehicle-t3/notes`)

**Success:** (`200`): array with all notes

```json
[
  {
    "id": 1,
    "reason": "test",
    "maintenance_request": false,
    "request_id": 5,
    "date": 2026-11-2,
    "name": "b sto",
    "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
  },
  {
    "id": 2,
    "reason": "test2",
    "maintenance_request": true,
    "request_id": 6,
    "date": 2026-11-2,
    "name": "a stockton",
    "text": "this is another extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
  },
  ...
]
```

**Server error:** (`500`) `{ "message": "…" }`.

### Read Note details (`GET /vehicle-t3/notes/:noteId`)

**Success:** (`200`): note details

```json
{
  "id": 1,
  "reason": "test",
  "maintenance_request": false,
  "request_id": 5,
  "date": 2026-11-2,
  "name": "b sto",
  "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
}
```

**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Read Notes on a Request (`GET /vehicle-t3/notes/:requestId`)

**Success:** (`200`): array with all notes belonging to that request

```json
[
  {
    "id": 2,
    "reason": "test",
    "maintenance_request": false,
    "request_id": 6,
    "date": 2026-11-2,
    "name": "a stockton",
    "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
  },
  {
    "id": 3,
    "reason": "test3",
    "maintenance_request": false,
    "request_id": 6,
    "date": 2026-11-3,
    "name": "b sto",
    "text": "this is not a maintenance request."
  },
  ...
]
```

**Not found:** (`404`) `{ "message": "This request <requestId> doesn't have any notes" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Read Notes from a User (`GET /vehicle-t3/notes/:userId`)

**Success:** (`200`): array with all notes written by a user

```json
[
  {
    "id": 1,
    "reason": "test",
    "maintenance_request": false,
    "request_id": 6,
    "date": 2026-11-2,
    "name": "b sto",
    "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
  },
  {
    "id": 3,
    "reason": "test3",
    "maintenance_request": false,
    "request_id": 6,
    "date": 2026-11-3,
    "name": "b sto",
    "text": "this is not a maintenance request."
  },
  ...
]
```

**Not found:** (`404`) `{ "message": "This user <userId> doesn't have any notes" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Add Note (`POST /vehicle-t3/notes`)

**Request body:** (fields the add request sends):

```json
{
  "reason": "test",
  "maintenance_request": false,
  "request_id": 5,
  "name": "a stockton",
  "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
}
```

Missing `maintenance_request` → `maintenance_request` defaults to `false`
Missing `reason`, `request_id`, `name`, `text` → `400` bad request.
Duplicate `request_id` and `text` (combined) → `409` conflict.

**Success:** (`201`)
**Server error:** (`500`) `{ "message": "…" }`.

### Overwrite Note (`PUT /vehicle-t3/notes/:noteId)

**Request body:** (fields the update request sends):

```json
{
  "id": 3,
  "reason": "test3",
  "maintenance_request": true,
  "request_id": 6,
  "date": 2026-11-3,
  "name": "b sto",
  "text": "well well well..."
}
```

Missing `maintenance_request` → `maintenance_request` defaults to `false`
Missing `reason`, `request_id`, `name`, `text` → `400` bad request.
Duplicate `request_id` and `text` (combined) → `409` conflict.

**Success:** (`200`) (PUT)
**Unauthorized:** (`403`) Forbidden
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Note (`DELETE /vehicle-t3/notes/:noteId)

**Success:** (`204`)
**Unauthorized:** (`403`) Forbidden
**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Request Notes (`DELETE /vehicle-t3/notes/:requestId)

**Success:** (`204`)
**Not found:** (`404`) `{ "message": "No notes on request=<requestId>" }`
**Server error:** (`500`) `{ "message": "…" }`.

Quoted messages that tests must match:

| Situation        | Status | `message`                                                                           |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `GET` success    | 200    | <response from GET>                                                                 |
| `PUT` success    | 200    | <new/updated entry details>                                                         |
| `POST` success   | 201    | `New note created with id=<id>`                                                     |
| `DELETE` success | 204    | <empty response>                                                                    |
| Bad Request      | 400    | `Malformed request. Please make sure everything in the form is properly formatted!` |
| Login Error      | 401    | `Please sign in. If you think this is a mistake, contact your system administrator` |
| Forbidden        | 403    | `Please contact a system administrator for assistance.`                             |
| Not Found        | 404    | `No note was found for id=<id>`                                                     |
| Conflict         | 409    | `Note with this address already exists!`                                            |

---

## Screen Requirements [RESUME FROM HERE WHEN CONTINUING]

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

### Notes view

- Heading: **Manage Notes**
- Primary action: **+ New Note** opens a `<NoteForm>` component named **Note Form** Use class `oc-cta` on **Create**, **+ New Note**, and **Note Form** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Display interactive search bar named `Search` above any lists with a clearable `<v-select>` beside it to switch between note search attributes as defined by the list columns below
- Display notes as rows (e.g. `<v-list>` or table). The following columns should be in the list:
  **Name** -- The name of the address (`dest_name`)
  **Street Address** -- The address typed into map applications (`addr_line_1`)
  **Address Line 2** -- Address line 2 (`addr_line_2`); render empty if left null
  **City** -- The city the note is in (`city`)
  **State** -- The state the note is in (or country if not in US) (`state`)
  **Zip Code** -- Note Zip Code (`zip`)
  **Visited** -- The date of the most recent `request` containing this note id
- Each row contains **Edit** and **Delete** icons — opens confirmation `<v-dialog>`
- Icon-only row action uses `size="small"` and accessible `aria-label` (**Edit**) and (**Delete**).
- Rows are displayed in the list in batches of `5` at a time. Scrolling down loads the next batch beneath the current one.
- List entries are, by default, sorted by the most recent `last_visited_on` (excluding future)
- **Top ↑** displayed upon arriving at the bottom of the page. Pressing this button scrolls to the top but does not clear the notes list

- Empty state: **"No notes yet. Add a note to view its details."** when no notes exist in the database.
- Loading state: skeleton or progress indicator while enrollments are fetching.
- Error state: `<v-alert type="error">` for API failures.

### Note Form Component

Primary Action: Fill out a form with the following fields:
**Name** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**Street Address** -- accepts a string of length 254 or less; trim whitespaces in beginning/end
**Address Line 2** -- accepts a string of length 254 or less; trim whitespaces in beginning/end; nullable
**City** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**State** -- accepts string of length 254 or less; trim whitespaces in beginning/end
**Zip Code** -- accepts numeric string of exactly length 5 or 10 in format ##### or, if more than 5 numbers typed in, add hyphen automatically so format becomes #####-####. Typing anything other than numbers will not updated the input field

**Edit State**

- Header: **Edit Note**
- **Cancel** button clears all fields in the current form and closes the component
- **Save** first checks for validation as per these requirements and the Acceptance Critera, then changes the button text into a spinning load as it `PUT`s the form data into the `Notes` entry currently being edited. As soon as a response is received from the backend, **Save** button text becomes **Save** again and component closes.

**Add State**

- Header: **Add Note**
- **Cancel** button clears all fields in the current form and closes the component
- **Save** first checks for validation as per these requirements and the Acceptance Critera, then changes the button text into a spinning load as it `POST`s the form data into the `Notes` entry currently being edited. As soon as a response is received from the backend, **Add** button text becomes **Add** again and component closes.

**Implementation note:** one route/view for `Notes`; `Notes` dialogs are child components or inline `<v-dialog>` blocks in `NoteList.vue` unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Data Model Requirements

This feature uses a `Notes` table where each entry has an `id` used by other tables as a foreign key. Sequelize also stores `createdAt` / `updatedAt`.

### `Notes` table

| Field                 | Type                    | Rules       |
| --------------------- | ----------------------- | ----------- |
| `id`                  | INTEGER; AUTO-INCREMENT | Primary Key |
| `reason`              | VARCHAR(50)             | Required    |
| `maintenance_request` | BOOLEAN                 | Required    |
| `request_id`          | INTEGER, FOREIGN KEY    | Required    |
| `created_by`          | INTEGER, FOREIGN KEY    | Required    |
| `date`                | DATE                    | Required    |
| `text`                | TEXT                    | Required    |

### Associations

- `request` hasMany `Notes`
- `Notes` belongsTo `request`

---

## Acceptance Criteria (Gherkin)

### US-9.1: View Current Notes

#### Scenario: Admin views NoteList

**Given** I am an authenticated admin user
**When** I navigate to `NoteList.vue`
**Then** I am allowed to see the **Manage Notes** list described in Screen Requirements with everything on it.

#### Scenario: Other role views NoteList

**Given** I am an authenticated user with a role other than `admin`
**When** I navigate to `NoteList.vue`
**Then** I am immediately redirected to the landing page.

### US-9.2: Note Details

#### Scenario: No entries exist in Notes table

**Given** I am viewing the **Manage Notes** list
**When** the `Notes` table is empty
**Then** I see text inside the **Manage Notes** list saying `"No notes yet. Add a note to view its details."`

#### Scenario: Less than 5 entries exist in Notes table

**Given** I am viewing the **Manage Notes** list
**When** there exist between `1` and `5` (inclusive) entries in the `Notes` table
**Then** I can see every existing row and its details as per the Screen Requirements.

#### Scenario: More than 5 entries exist in Notes table

**Given** I am viewing the **Manage Notes** list
**When** there exist more than `5` entries in the `Notes` table
**Then** I can see the first `5` entries of the `Notes` table and their details listed
**And** I can scroll to the bottom of the page to automatically load the next `5` entries of the `Notes` table into the list.

#### Scenario: Back to Top button hidden when at top of page

**Given** I am viewing the **Manage Notes** list
**When** I am viewing the top of the page
**Then** I cannot see the **Top ↑** button.

#### Scenario: Back to Top button shown when scrolling down

**Given** I am viewing the **Manage Notes** list
**When** I scroll down on the view
**Then** I can see the **Top ↑** button.

#### Scenario: Press Back to Top button

**Given** I am viewing the **Manage Notes** list
**When** I press the **Top ↑** button
**Then** I scroll to the top of the page
**And** the **Manage Notes** list is entirely unaffected.

### US-9.3: Add Note

#### Scenario: Press New Note

**Given** I am viewing the **Manage Notes** list
**When** I press the **+ New Note**
**Then** I see the `NoteForm` component open in Add mode

#### Scenario: Press outside NoteForm component (add)

**Given** I am viewing the `NoteForm` component in Add mode
**When** I press anywhere outside the `NoteForm` component
**Then** the fields within the `NoteForm` component are cleared
**And** I no longer see the `NoteForm` component on screen

#### Scenario: Send add request with invalid form data

**Given** I have filled out any field in the `NoteForm` component in Add mode with invalid form data as per the Screen Requirements
**When** I press the **Add** button
**Then** beneath each field containing invalid form data, I see an error with a human-readable explanation of how the data is malformed
**And** no request is sent

#### Scenario: Send add request with a missing required field

**Given** I have filled out all the fields in the `NoteForm` component in Add mode except for **Zip**
**When** I press the **Add** button
**Then** I see an error beneath **Zip** that says `Required`
**And** no request is sent

#### Scenario: Send add request with valid form data

**Given** I have filled out all the fields in the `NoteForm` component in Add mode except for **Address Line 2** with valid form data as per the Screen Requirements
**When** I press the **Add** button
**Then** I receive a `201` response code
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen with the `201` response message
**And** the message box gets destroyed automatically after `3` seconds
**And** the **Manage Notes** list reloads without requiring a page reload

#### Scenario: Signed out user makes add request

**Given** I am an unauthenticated user
**When** I send a `POST` request to the `Notes` table with or without valid data
**Then** I receive a `401` response code and message

### US-9.4: Remove Note

#### Scenario: Press Delete icon

**Given** I am viewing the **Manage Notes** list
**When** I press the **Delete** icon
**Then** a **Delete Note** dialog appears

#### Scenario: Press outside Delete confirmation dialog

**Given** I am viewing the **Delete Note** dialog
**When** I press anywhere outside the **Delete Note** dialog
**Then** the **Delete Note** dialog closes
**And** no request is sent

#### Scenario: Press Cancel inside Delete confirmation dialog

**Given** I am viewing the **Delete Note** dialog
**When** I press the **Cancel** button
**Then** the **Delete Note** dialog closes
**And** no request is sent

#### Scenario: Press Delete inside Delete confirmation dialog

**Given** I am viewing the **Delete Note** dialog
**When** I press the **Delete** button
**Then** the **Delete Note** dialog closes
**And** the selected note no longer exists in the table
**And** I receive a `204` status code
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen saying `"Successfully deleted Note!"`
**And** the message box gets destroyed automatically after `3` seconds
**And** the **Manage Notes** list reloads without requiring a page reload

### US-9.5: Notes Search Bar

#### Scenario: No rendering Search Bar when no notes exist

**Given** I am viewing the **Manage Note** list
**When** no entries exist in the `Notes` table
**Then** I do not see a search bar in the view

#### Scenario: Search Bar rendering when notes exist

**Given** I am viewing the **Manage Note** list
**When** entries exist in the `Notes` table
**Then** I see a search bar in the view

#### Scenario: No search attribute selected

**Given** I leave the search-attribute selection of the search bar empty
**When** I type in the search bar
**Then** the **Manage Note** list items reactively filter based on whether the content of the search bar is found as a substring in the notes' **Name**.

#### Scenario: Search attribute selected

**Given** I select **City** in the search-attribute selection of the search bar
**When** I type in the search bar
**Then** the **Manage Note** list items reactively filter based on whether the content of the search bar is found as a substring in the notes' **City** attribute.

### US-9.6: Edit Note

#### Scenario: Press Edit icon

**Given** I am viewing the **Manage Notes** list
**When** I press the **Edit** icon on a note
**Then** I see the `NoteForm` component open in Edit mode
**And** the input fields of the `NoteForm` component contain the correct details of the selected note

#### Scenario: Press outside NoteForm component (edit)

**Given** I am viewing the `NoteForm` component in Edit mode
**When** I press anywhere outside the `NoteForm` component
**Then** the fields within the `NoteForm` component are cleared
**And** I no longer see the `NoteForm` component on screen

#### Scenario: Send edit request with invalid form data

**Given** I have filled out any field in the `NoteForm` component in Edit mode with invalid form data as per the Screen Requirements
**When** I press the **Save** button
**Then** beneath each field containing invalid form data, I see an error with a human-readable explanation of how the data is malformed
**And** no request is sent

#### Scenario: Send edit request with a missing required field

**Given** I have filled out all the fields in the `NoteForm` component in Edit mode except for **Zip**
**When** I press the **Save** button
**Then** I see an error beneath **Zip** that says `Required`
**And** no request is sent

#### Scenario: Send edit request with valid form data

**Given** I have filled out all the fields in the `NoteForm` component in Add mode except for **Address Line 2** with valid form data as per the Screen Requirements
**When** I press the **Save** button
**Then** I receive a `201` response code
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen with the `201` response message
**And** the message box gets destroyed automatically after `3` seconds
**And** the **Manage Notes** list reloads without requiring a page reload

#### Scenario: Non-admin user makes update request

**Given** I am any authenticated non-admin user
**When** I send a `PUT` request to the `Notes` table with or without valid data
**Then** I receive a `403` response code and message

---

## Test Coverage Map

Each scenario above must map to at least one automated test. `it` names must match the Gherkin **Scenario** titles exactly.

| Story  | Scenario                                        | Test file                                                        | Test name                                         |
| ------ | ----------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| US-9.1 | Admin views NoteList                            | `frontend/tests/NoteList.test.js`                                | `Admin views NoteList`                            |
| US-9.1 | Other role views NoteList                       | `frontend/tests/NoteList.test.js`                                | `Other role views NoteList`                       |
| US-9.2 | No entries exist in Notes table                 | `frontend/tests/NoteList.test.js`                                | `No entries exist in Notes table`                 |
| US-9.2 | Less than 5 entries exist in Notes table        | `frontend/tests/NoteList.test.js`                                | `Less than 5 entries exist in Notes table`        |
| US-9.2 | More than 5 entries exist in Notes table        | `frontend/tests/NoteList.test.js`                                | `More than 5 entries exist in Notes table`        |
| US-9.2 | Back to Top button hidden when at top of page   | `frontend/tests/NoteList.test.js`                                | `Back to Top button hidden when at top of page`   |
| US-9.2 | Back to Top button shown when scrolling down    | `frontend/tests/NoteList.test.js`                                | `Back to Top button shown when scrolling down`    |
| US-9.2 | Press Back to Top button                        | `frontend/tests/NoteList.test.js`                                | `Press Back to Top button`                        |
| US-9.3 | Press New Note                                  | `frontend/tests/NoteList.test.js`                                | `Press New Note`                                  |
| US-9.3 | Press outside NoteForm component (add)          | `frontend/tests/NoteForm.test.js`                                | `Press outside NoteForm component (add)`          |
| US-9.3 | Send add request with invalid form data         | `frontend/tests/NoteForm.test.js`                                | `Send add request with invalid form data`         |
| US-9.3 | Send add request with a missing required field  | `frontend/tests/NoteForm.test.js`                                | `Send add request with a missing required field`  |
| US-9.3 | Send add request with valid form data           | `backend/tests/notes.test.js`, `frontend/tests/NoteList.test.js` | `Send add request with valid form data`           |
| US-9.3 | Signed out user makes add request               | `backend/tests/notes.test.js`                                    | `Signed out user makes add request`               |
| US-9.4 | Press Delete icon                               | `frontend/tests/NoteList.test.js`                                | `Press Delete icon`                               |
| US-9.4 | Press outside Delete confirmation dialog        | `frontend/tests/NoteList.test.js`                                | `Press outside Delete confirmation dialog`        |
| US-9.4 | Press Cancel inside Delete confirmation dialog  | `frontend/tests/NoteList.test.js`                                | `Press Cancel inside Delete confirmation dialog`  |
| US-9.4 | Press Delete inside Delete confirmation dialog  | `backend/tests/notes.test.js`, `frontend/tests/NoteList.test.js` | `Press Delete inside Delete confirmation dialog`  |
| US-9.5 | No rendering Search Bar when no notes exist     | `frontend/tests/NoteList.test.js`                                | `No rendering Search Bar when no notes exist`     |
| US-9.5 | Search Bar rendering when notes exist           | `frontend/tests/NoteList.test.js`                                | `Search Bar rendering when notes exist`           |
| US-9.5 | No search attribute selected                    | `frontend/tests/NoteList.test.js`                                | `No search attribute selected`                    |
| US-9.5 | Search attribute selected                       | `frontend/tests/NoteList.test.js`                                | `Search attribute selected`                       |
| US-9.6 | Press Edit icon                                 | `frontend/tests/NoteList.test.js`                                | `Press Edit icon`                                 |
| US-9.6 | Press outside NoteForm component (edit)         | `frontend/tests/NoteForm.test.js`                                | `Press outside NoteForm component (edit)`         |
| US-9.6 | Send edit request with invalid form data        | `frontend/tests/NoteForm.test.js`                                | `Send edit request with invalid form data`        |
| US-9.6 | Send edit request with a missing required field | `frontend/tests/NoteForm.test.js`                                | `Send edit request with a missing required field` |
| US-9.6 | Send edit request with valid form data          | `backend/tests/notes.test.js`, `frontend/tests/NoteList.test.js` | `Send edit request with valid form data`          |
| US-9.6 | Non-admin user makes update request             | `backend/tests/notes.test.js`                                    | `Non-admin user makes update request`             |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 6 from @features/feature-6-note-crud.md on branch `feature/6-note-crud`.

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
- `NoteForm` integration into `Requests` creation/edit form

## Defer to Feature 11

- Note Images
