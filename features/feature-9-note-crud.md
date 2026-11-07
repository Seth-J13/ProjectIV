# Feature: Note CRUD

**Feature ID:** 9
**Branch pattern:** `feature/9-note-crud`
**Status:** Draft
**Created:** 2026-10-28
**Updated:** "2026-11-03"
**Input:** Application must support the creation, reading, updating, and deleting of many request notes that can be attached to requests to denote different statuses of a future, active, or returned vehicle reservation.
**Depends on:** [Feature 1 -- User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md), [Feature 2 -- Google Auth](feature-2-Google-Auth.md), [Feature 8 -- Requests CRUD](feature-8-requests-crud.md), [Feature 13 -- User Management](feature-13-User-Management.md), [Feature 10 -- Vehicle Service Log CRUD](feature-10-vehicle-service-log-crud.md)
**Related:** `frontend/RequestDetails.vue`, `frontend/Maintenance.vue`, `frontend/components/NotesList.vue`, `frontend/tests/NoteForm.test.js`, `frontend/tests/NoteDetails.test.js`

---

## User Stories

### US-9.1: See Notes on Requests

**As a** authenticated user
**I want to** see every `note` attached to a `request` inside the request itself
**So that** I get more information about a vehicle reservation.

**Priority:** P1
**Independent test:** On `Landing.vue`, see a request's notes in the embedded **Notes** list, and on `Maintenance.vue` see **Vehicle Maintenance Notes** for the selected vehicle; each list loads at most 3 notes at a time, pressing a card body opens that note, and pressing outside or **Close** dismisses it with nothing changed.
**Acceptance scenarios:** see ### US-9.1 under Acceptance Criteria

### US-9.2: Remove Notes

**As a** authenticated user
**I want to** remove `notes` attached to `requests` according to my `role` permissions
**So that** I can manage how much extra information is included on a `request`.

**Priority:** P1
**Independent test:** On a request I own, confirm **Delete** and see that note and its contributions removed and the next note loaded; from **Vehicle Maintenance Notes**, a maintenance or admin user confirming **Delete** also uploads that note's `text` as a vehicle service log.
**Acceptance scenarios:** see ### US-9.2 under Acceptance Criteria

### US-9.3: Create Notes

**As a** authenticated user  
**I want to** add more than one `note` to a `request` according to my `role` permissions
**So that** I can add extra information to a `request`.

**Priority:** P1
**Independent test:** Press **+ New Note** on a request form (`maintenance_request` false) or a maintenance form (`maintenance_request` true), submit a valid **Subject** and **Description**, and see `201`, the form close, the new note in the list, and a contribution with `created_note` true.
**Acceptance scenarios:** see ### US-9.3 under Acceptance Criteria

### US-9.4: Edit Notes

**As a** authenticated user
**I want to** edit the `notes` attached to `requests` according to my `role` permissions
**So that** I can correct incorrect information.

**Priority:** P1
**Independent test:** Press **Edit** on a note, submit valid changes with the **Edit** button, and see `200`, the form close, the updated note in the list, and a contribution with `created_note` true and today's `date`.
**Acceptance scenarios:** see ### US-9.4 under Acceptance Criteria

### US-9.5: Admin Notes Management

**As a** authenticated user
**I want to** perform management, sorting, grouping, and more on various `notes` lists
**So that** I can easily manage and modify `note` information.

**Priority:** P3
**Independent test:** As an admin, open a user's profile and see a **Notes List** of notes that user created and a **Notes List** of notes they contributed to, and create, read, update, or delete any note under the same form validation as the other stories.
**Acceptance scenarios:** see ### US-9.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

**FR-001**: Any authenticated user **MUST** be allowed to do CRUD operations on `notes` belonging to `requests` whose `requester_id` matches the user's `id`
**FR-002**: Authenticated admin users **MUST** be allowed to do CRUD operations on all `notes`.
**FR-003**: Any authenticated user **MUST** be able to perform `POST` on the `Notes` table from only `NoteForm`.
**FR-004**: Any authenticated user **MUST** be allowed to perform `GET` on the `Notes` table.
**FR-005**: The **Request Details** view **MUST** show a list of notes beneath the rest of the `request`'s information.
**FR-008**: Authenticated maintenance users **MUST** be able to see a list of `notes` whose `maintenance_request` bool is toggled on.
**FR-009**: The list of `notes` **MUST** be embedded in other screens rather than having a screen dedicated to it.
**FR-010**: The `NotesList` component **MUST** have a callback passed into it on implementation which filters its items dynamically.
**FR-011**: The `NotesList` and `NoteForm` components **MUST** behave differently based on what page they're embedded into, described in **Screen Requirements** and the **Acceptance Criteria**.
**FR-012**: Displaying an error inside a create, update, or delete dialog **MUST NOT** close the dialog.
**FR-013**: Encountering a field/form/dialog error **MUST NOT** send the query to the `Notes` table.
**FR-014**: The `NotesList` component **MUST** be retrieved in batches of _at most_ `3` when arriving at the bottom of the list, or less if the final batch does not have `3` entries left to retrieve.
**FR-015**: The application **MUST NOT** have a whole view dedicated to Notes CRUD.
**FR-016**: Any updates to a `Notes` entry **MUST** include the `id` of the `user` who updated the `note`.

---

## Assumptions

- Feature 1, 2, 8, and 13 are already on `dev`

## Edge Cases

- POST `Notes` with the exact same `text` and `request_id` -> `409`
- no `Requests` exist but `Notes` exist -> don't render orphaned notes
- DELETE `Request` with attached `Notes` -> CASCADE DELETE so attached `Notes` are deleted too
- Malformed date in `Notes` entry -> `NoteForm` and `NoteDetails` for that entry default to today's date

## Success Criteria

**SC-001**: Every Gherkin scenario has at least one automated test before merge
**SC-002**: Administrator user can Create, Read, Update, or Delete from `Notes`
**SC-003**: Maintenance users can Create, Read, and Update from `Notes`
**SC-004**: User and Driver users can Create and Read from `Notes`
**SC-005**: User, Driver, and Maintenance users can only Delete `Notes` created by them
**SC-006**: npm test passes for `backend/tests/notes.test.js`, `frontend/tests/NotesList.test.js`, `frontend/tests/NoteForm.test.js`

---

## Data Ownership & Isolation

`Notes` are owned by both `users` and `requests` since a `user` has permissions on `notes` they write while `notes` are attached to a `request`.

| Rule                  | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | Any authenticated user (`GET /vehicle-t3/notes`, `GET /vehicle-t3/notes/note/:noteId`, `GET /vehicle-t3/notes/request/:requestId`, `GET /vehicle-t3/notes/user/:userId`, `GET /vehicle-t3/notes/contributors`, `GET /vehicle-t3/notes/contributors/note/:noteId`, `GET /vehicle-t3/notes/contributors/user/:userId`). `GET /vehicle-t3/notes/user/:userId` returns the notes that user has contributed to.                                                                               |
| **Write scope**       | `PUT /vehicle-t3/notes/note/:noteId`. User and Driver may update notes they created and notes on requests whose `requester_id` is their id. Admin and Maintenance may update every note. The server records a contribution with `created_note` false and `contributor_id` taken from the signed-in user.                                                                                                                                                                                 |
| **Create scope**      | Any authenticated user may `POST /vehicle-t3/notes/`. The same `request_id` and `text` returns `409`. The server adds a contribution with `created_note` true and `contributor_id` taken from the signed-in user. `POST /vehicle-t3/notes/contributors` adds a contribution for that same user. A second contribution with `created_note` true on that `note_id` returns `409`.                                                                                                          |
| **Delete scope**      | `DELETE /vehicle-t3/notes/note/:noteId`. User and Driver may delete notes they created and notes on requests whose `requester_id` is their id. Maintenance may delete only notes they created. Admin may delete any note, and may `DELETE /vehicle-t3/notes/request/:requestId`. Deleting a note also deletes its contributions. `DELETE /vehicle-t3/notes/contributors/contribution/:contributionId` and `DELETE /vehicle-t3/notes/contributors/note/:noteId` use this same role split. |
| **Cross-user access** | Note and contribution responses may include `created_by` and `contributor_id`. They include no other user profile fields. `contributor_id` comes from the authenticated user, not the request body.                                                                                                                                                                                                                                                                                      |
| **UI scope**          | `NotesList.vue` is embedded on other screens. It shows `Notes` in batches of at most 3, sorted by most recent `date`. This feature has no dedicated notes view and no screen for contribution management.                                                                                                                                                                                                                                                                                |
| **Later features**    | A confirmed delete on **Vehicle Maintenance Notes** uploads that note's `text` to vehicle service logs in Feature 10. Note images are Feature 11.                                                                                                                                                                                                                                                                                                                                        |

---

## Key Entities

**User**: registered account (email, password, role, etc); has permission levels pertaining to `Notes` CRUD.
**Note**: Entity containing extraneous information attached to a `request`.

---

## API Requirements

Mount prefix: `/vehicle-t3`. Flat JSON (no `{ success, data }` envelope). Errors: `{ "message": "Human-readable explanation." }`. Authenticated writes send `Authorization: Bearer <token>`.

This feature uses the `Notes` endpoints below.

| Method   | Endpoint                                                      | Auth       | Purpose                                                                   |
| -------- | ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| `GET`    | `/vehicle-t3/notes`                                           | Yes        | List all `notes`                                                          |
| `POST`   | `/vehicle-t3/notes/`                                          | Yes        | Add a `note`                                                              |
| `GET`    | `/vehicle-t3/notes/note/:noteId`                              | Yes        | List the details of the `note` with the `id` `:noteId`                    |
| `GET`    | `/vehicle-t3/notes/request/:requestId`                        | Yes        | List all the `notes` attached to the `request` with the `id` `:requestId` |
| `GET`    | `/vehicle-t3/notes/user/:userId`                              | Yes, admin | List all `notes` contributed to by the `user` with the `id` `:userId`     |
| `PUT`    | `/vehicle-t3/notes/note/:noteId`                              | Yes        | Overwrite the details of the `note` with the `id` `:noteId`               |
| `DELETE` | `/vehicle-t3/notes/note/:noteId`                              | Yes        | Remove the `note` with the `id` `:noteId`                                 |
| `DELETE` | `/vehicle-t3/notes/request/:requestId`                        | Yes        | Remove all `notes` with the `request_id` `:requestId`                     |
| `GET`    | `/vehicle-t3/notes/contributors`                              | Yes, admin | List all `note` `contributions`                                           |
| `POST`   | `/vehicle-t3/notes/contributors`                              | Yes        | Add a `note` `contribution`                                               |
| `GET`    | `/vehicle-t3/notes/contributors/note/:noteId`                 | Yes, admin | List the `contributions` for the `note` with the `id` `:noteId`           |
| `GET`    | `/vehicle-t3/notes/contributors/user/:userId`                 | Yes, admin | List all `contributions` created by the user with the `id` `:userId`      |
| `DELETE` | `/vehicle-t3/notes/contributors/contribution/:contributionId` | Yes, admin | Remove the `contribution` with the `id` `:contributionId`                 |
| `DELETE` | `/vehicle-t3/notes/contributors/note/:noteId`                 | Yes        | Remove all `contributions` with the `note_id` `:noteId`                   |

**Unauthenticated write:** (`401`) login error
**Unauthorized write:** (`403`) forbidden

### Read Notes (`GET /vehicle-t3/notes`)

**Success:** (`200`): the next batch of at most `3` `notes`, sorted by the most recent `date`. `offset` is the number of `notes` already retrieved. Missing `offset` → `offset` defaults to `0`. Fewer than `3` `notes` in the array means that batch is the last one. `[]` means no `notes` remain.

`GET /vehicle-t3/notes?offset=0`

```json
[
  {
    "id": 1,
    "reason": "test",
    "maintenance_request": false,
    "request_id": 5,
    "created_by": 12345,
    "date": "2026-11-02",
    "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
  },
  {
    "id": 2,
    "reason": "test2",
    "maintenance_request": true,
    "request_id": 6,
    "created_by": 54321,
    "date": "2026-11-02",
    "text": "this is another extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
  },
  {
    "id": 3,
    "reason": "test3",
    "maintenance_request": true,
    "request_id": 6,
    "created_by": 99,
    "date": "2026-11-03",
    "text": "well well well..."
  }
]
```

`GET /vehicle-t3/notes?offset=3` returns the next batch. The last batch is shorter than `3`:

```json
[
  {
    "id": 4,
    "reason": "test4",
    "maintenance_request": false,
    "request_id": 5,
    "created_by": 12345,
    "date": "2026-10-25",
    "text": "this is the last note."
  }
]
```

**Server error:** (`500`) `{ "message": "…" }`.

### Read Note details (`GET /vehicle-t3/notes/note/:noteId`)

**Success:** (`200`): `note` details

```json
{
  "id": 3,
  "reason": "test3",
  "maintenance_request": true,
  "request_id": 6,
  "text": "well well well...",
  "contributors": [
    {
      "id": 1,
      "note_id": 3,
      "contributor_id": 99,
      "created_note": true,
      "date": "2026-11-02"
    },
    {
      "id": 2,
      "note_id": 3,
      "contributor_id": 54321,
      "created_note": false,
      "date": "2026-11-03"
    }
  ]
}
```

**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Read Notes on a Request (`GET /vehicle-t3/notes/request/:requestId`)

**Success:** (`200`): array with all `notes` belonging to that `request`

```json
[
  {
    "id": 2,
    "reason": "test2",
    "maintenance_request": false,
    "request_id": 6,
    "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
  },
  {
    "id": 3,
    "reason": "test3",
    "maintenance_request": true,
    "request_id": 6,
    "text": "this is not a maintenance request."
  },
  ...
]
```

**Not found:** (`404`) `{ "message": "This request <requestId> doesn't have any notes" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Read a user's note history (`GET /vehicle-t3/notes/user/:userId`)

**Success:** (`200`): array with all `notes` `contributed` to by a `user`

(where :userId is `54321`)

```json
[
  {
    "id": 2,
    "reason": "test2",
    "maintenance_request": false,
    "request_id": 6,
    "date": "2026-11-02",
    "created_by": 54321,
    "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
  },
  {
    "id": 3,
    "reason": "test3",
    "maintenance_request": true,
    "request_id": 6,
    "date": "2026-11-02",
    "created_by": 99,
    "text": "well well well..."
  }
  ...
]
```

**Not found:** (`404`) `{ "message": "This user <userId> hasn't contributed to any notes" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Add Note (`POST /vehicle-t3/notes`)

**Request body:** (fields the add request sends):

```json
{
  "reason": "test",
  "maintenance_request": false,
  "request_id": 5,
  "text": "this is an extremely long note text. I chose TEXT as the data type because someone's note might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
}
```

**Success:** (`201`): `contribution` generation

```json
{
  "note_id": 1,
  "contributor_id": 12345,
  "created_note": true,
  "date": "2026-11-02"
}
```

Missing `maintenance_request` → `maintenance_request` defaults to `false`
Missing `reason`, `request_id`, `text` → `400` bad request.
Duplicate `request_id` and `text` (combined) → `409` conflict.

**Server error:** (`500`) `{ "message": "…" }`.

### Overwrite Note (`PUT /vehicle-t3/notes/note/:noteId`)

**Request body:** (fields the update request sends):

```json
{
  "id": 3,
  "reason": "test3",
  "maintenance_request": false,
  "request_id": 6,
  "text": "well well well..."
}
```

**Success:** (`200`): `contribution` generation

```json
{
  "id": 3,
  "note_id": 3,
  "contributor_id": 54321,
  "created_note": false,
  "date": "2026-11-03"
}
```

Missing `maintenance_request` → `maintenance_request` defaults to `false`
Missing `reason`, `request_id`, `text` → `400` bad request.
Duplicate `request_id` and `text` (combined) → `409` conflict.

**Unauthorized:** (`403`) Forbidden
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Note (`DELETE /vehicle-t3/notes/note/:noteId`)

**Success:** (`204`)
**Unauthorized:** (`403`) Forbidden
**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Request Notes (`DELETE /vehicle-t3/notes/request/:requestId`)

**Success:** (`204`)
**Not found:** (`404`) `{ "message": "No notes on request=<requestId>" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Read Contributions (`GET /vehicle-t3/notes/contributors`)

**Success:** (`200`): array with all `contributions`

```json
[
  {
    "id": 1,
    "contributor_id": 99,
    "note_id": 3,
    "created_note": true,
    "date": "2026-11-02"
  },
  {
    "id": 2,
    "contributor_id": 54321,
    "note_id": 3,
    "created_note": false,
    "date": "2026-11-03"
  },
  {
    "id": 3,
    "contributor_id": 12345,
    "note_id": 2,
    "created_note": true,
    "date": "2026-11-07"
  },
  {
    "id": 4,
    "contributor_id": 99,
    "note_id": 3,
    "created_note": false,
    "date": "2026-11-09"
  },
  ...
]
```

**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Add Contribution (`POST /vehicle-t3/notes/contributors`)

**Request body:** (fields the add request sends):

```json
{
  "note_id": 3,
  "created_note": true,
  "date": "2026-11-09"
}
```

**Success:** (`201`)

```json
{
  "id": 9,
  "contributor_id": 7,
  "note_id": 3,
  "created_note": true,
  "date": "2026-11-09"
}
```

Missing `date` → `date` defaults to current date
Missing `note_id`, `contributor_id`, `created_note` → `400` bad request.
Two contributions on the same `note_id` being `true` → `409` conflict.

**Server error:** (`500`) `{ "message": "…" }`.

### Read Contributions from Note (`GET /vehicle-t3/notes/contributors/note/:noteId`)

**Success:** (`200`): array with all `contributions` belonging to that `note`

```json
[
  {
    "id": 3,
    "contributor_id": 12345,
    "note_id": 2,
    "created_note": true,
    "date": "2026-11-07"
  },
  {
    "id": 12,
    "contributor_id": 99,
    "note_id": 2,
    "created_note": false,
    "date": "2026-12-19"
  }
]
```

**Not found:** (`404`) `{ "message": "This note <noteId> doesn't have any contributions" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Get Contributions by a User (`GET /vehicle-t3/notes/contributors/user/:userId`)

**Success:** (`200`): array with all `contributions` by a `user`

(where :userId is `54321`)

```json
[
  {
    "id": 2,
    "contributor_id": 54321,
    "note_id": 3,
    "created_note": false,
    "date": "2026-11-03"
  },
  {
    "id": 5,
    "note_id": 3,
    "contributor_id": 54321,
    "created_note": false,
    "date": "2026-11-03"
  }
]
```

**Not found:** (`404`) `{ "message": "This user <userId> hasn't contributed to any notes" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Contribution (`DELETE /vehicle-t3/notes/contributors/contribution/:contributionId`)

**Success:** (`204`)
**Unauthorized:** (`403`) Forbidden
**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Request Notes (`DELETE /vehicle-t3/notes/contributors/note/:noteId`)

**Success:** (`204`)
**Not found:** (`404`) `{ "message": "No contributions on note=<noteId>" }`
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
| Not Found        | 404    | `No note` (or `contributor`) `was found for id=<id>`                                |
| Conflict         | 409    | `Note` (or `contributor`) `with these details already exists!`                      |

---

## Screen Requirements

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

### Notes List Component

- Container: <v-list>
- Heading: [varies based on embed location]
- Primary action: **+ New Note** when on **Embed** mode (embedded on Forms), not present when in **List** mode (for a display list). Opens a `<NoteForm>` component named **Note Form** Use class `oc-cta` on **+ New Note**, **Note Form** component, and **Add** button (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Pressing with list item body opens <NoteDetails> component named **Note** using class `oc-cta` on **Note**.
- Display interactive search bar in **List** mode named `Search`. Used to search `note` title and text content.
- Display `notes` as <v-card> items inside rows separated by a horizontal line each. The following columns should be in each card:
  **Note ID** -- The identifying number of the `note` ("#`id`")
  **Request ID** -- The identifying number of the `request` the `note` is attached to ("R: `request_id`")
  **Subject** -- The first 20 characters of the `note` `reason` (if 20 exist) followed by ellipsis ("this is not a mainte...")
  **Actions** -- **Edit** and **Delete** icons shown which open interaction/confirmation <v-dialogs> to perform their respective operations
- Row cards are displayed in the list in batches of `3` at a time. Scrolling down inside the container loads the next batch beneath the current one.
- List entries are, by default, sorted by the most recently created (`date`)

- Empty state in **List** mode: **No notes.**
- Empty state in **Embed** mode: **No notes. ** followed by the **+ New Note** button.
- Loading state: skeleton or progress indicator while enrollments are fetching.
- Error state: `<v-alert type="error">` for API failures.

### Note Form Component

The `Note` Form contains the following information:

- **Request ID** -- "Request ID: " followed by the `request_id` of the `request` the `note` is/will-be attached to
- **Date** -- `MM/DD/YYYY` format of the _earliest_ `Contribution` tied to this note.

Primary Action: Fill out a form with the following fields (auto-filled if in **Edit** mode):

- **Subject** -- accepts string of length 254 or less; trim whitespaces in beginning/end; sent to backend as `reason`.
- **Description** -- `TEXT` input; sent to the backend as `text`.
- **Drop or Upload Image Here** -- eventually allows users to upload images to their notes. Implement this frame, but don't add functionality until Feature 11.

**Edit State**

- Header: **Edit Note**
- **Cancel** button clears all fields in the current form and closes the component, sending no request to the backend.
- **Save** first checks for validation as per these requirements and the Acceptance Critera, then changes the button text into a spinning load as it `PUT`s the form data into the `Notes` entry currently being edited. As soon as a response is received from the backend, **Save** button text becomes **Save** again and component closes.
- **Last updated on** -- `MM/DD/YYYY` format of the date from the most recent `Contribution` tied to this `note`

**Add State**

- Header: **Add Note**
- **Cancel** button clears all fields in the current form and closes the component
- **Add** first checks for validation as per these requirements and the Acceptance Critera, then changes the button text into a spinning load as it `POST`s the form data into the `Notes` entry currently being edited. As soon as a response is received from the backend, **Add** button text becomes **Add** again and component closes.

**Implementation note:** no view or frontend-route for `Notes`; `Notes` dialogs are child components or inline `<v-dialog>` blocks in other views, embedded unless the team splits presentational dialogs later.

### Note Details Component

The `Note` Details contain the following information:

Header: **Note**
Body:

- **Request ID** -- "Request ID: " followed by the `request_id` of the `request` the `note` is attached to
- **Date** -- `MM/DD/YYYY` format of the date the `note` was written/last-updated on.
- **Subject** -- the reason a `note` was submitted.
- **Description** -- Textual details of the note.
- **Image(s)** -- eventually will be images a user uploaded to their note. Implement this frame, but don't add functionality until Feature 11.
- **Last updated on** -- `MM/DD/YYYY` format of the date from the most recent `Contribution` tied to this `note`
- **Close** -- closes the dialog

**Implementation note:** no view or frontend-route for `Notes`; `Notes` dialogs are child components or inline `<v-dialog>` blocks in other views, embedded unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Data Model Requirements

This feature uses a `Notes` table where each entry has an `id` used by other tables as a foreign key. Sequelize also stores `createdAt` / `updatedAt`.

### `Notes` table

| Field                 | Type                    | Rules                 |
| --------------------- | ----------------------- | --------------------- |
| `id`                  | INTEGER; AUTO-INCREMENT | Primary Key, NOT NULL |
| `reason`              | VARCHAR(255)            | Required              |
| `maintenance_request` | BOOLEAN                 | Required              |
| `request_id`          | INTEGER, FOREIGN KEY    | Required              |
| `text`                | TEXT                    | Required              |

### `Contributors` table

| Field            | Type                    | Rules                 |
| ---------------- | ----------------------- | --------------------- |
| `id`             | INTEGER; AUTO-INCREMENT | Primary Key, NOT NULL |
| `note_id`        | INTEGER; FOREIGN KEY    | Required              |
| `contributor_id` | INTEGER; FOREIGN KEY    | Required              |
| `created_note`   | BOOLEAN                 | Required              |
| `date`           | DATE                    | Required              |

### Associations

- `Requests` hasMany `Notes`
- `Notes` belongsTo `Requests`
- `Notes` belongsTo `Users`

- `Notes` hasMany `Contibutors`
- `Contributors` belongsTo `Notes`
- `Contributors` belongsTo `Users`

---

## Acceptance Criteria (Gherkin)

### US-9.1: See Notes

#### Scenario: Landing View Request Form Note List Embed

**Given** I am an authenticated user
**When** I navigate to `Landing.vue`
**Then** I can see the **Notes List** component in **Embed** mode embedded at the bottom of any **Request Form** on the page with the title **Notes**.

#### Scenario: Vehicle Maintenance Note List Embed

**Given** I am an authenticated user with `maintenance` or `admin` role on `Vehicles.vue`
**When** I press the wrench list icon to navigate to `Maintenance.vue`
**Then** I can see the **Notes List** component in **Embed** mode embedded at the bottom of `Maintenance.vue` titled **Vehicle Maintenance Notes**
**And** the **Vehicle Maintenance Notes** list contains every `note` that both has `maintenance_request` set to `true` and has the same `request_id` as any `request` containing the same `vehicle_id` as the `vin` of the `vehicle` selected to get to `Maintenance.vue`.

#### Scenario: More than 3 Notes in a Note List

**Given** I am an authenticated user
**When** I view a **Notes List** in **List** or **Embed** mode
**And** I reach the bottom of the **Notes List**
**Then** the **Notes List** tries to `GET` and display another batch of 3 notes without refreshing the whole page
**And** they overflowing with a scroll bar inside the <v-list> rather than expanding the page.

#### Scenario: Less than 3 list items left to GET

**Given** I am an authenticated user
**When** I view a **Notes List** in **List** or **Embed** mode
**And** I reach the bottom of the **Notes List**
**And** the batch of list items is smaller 3
**Then** the **Notes List** does not try to retrieve any more `notes`.

#### Scenario: Press on list item body

**Given** I am an authenticated user
**When** I press on the body (not action icons) of a **Notes List** list item
**Then** the **Note** details dialog opens holding the correct information from that selected `note`.

#### Scenario: Press on list item action icon

**Given** I am an authenticated user
**When** I press an action icon on a **Notes List** list item
**Then** that action is performed in accordance with later **Acceptance Criteria**.

#### Scenario: Press anywhere outside Note dialog

**Given** I am an authenticated user with any <v-dialog> open from interacting with **Notes List** list items
**When** I press anywhere outside the dialog
**Or** I press the **Close** button
**Then** the **Note** dialog closes and nothing is changed.

### US-9.2: Remove Notes

#### Scenario: User selects Delete icon on Notes List item

**Given** I am an authenticated user viewing a **Notes List** belonging to a request I own
**When** I select the **Delete** icon on a list item row's **Actions** section
**Then** I see a confirmation dialog titled **Delete** appear with two options: **Cancel** and **Delete**.

#### Scenario: User cancels Delete

**Given** I am an authenticated user viewing the **Delete Confirmation** dialog
**When** I select the **Cancel** button
**Then** the confirmation dialog closes and nothing else happens.

#### Scenario: User confirms Delete

**Given** I am an authenticated user viewing the **Delete Confirmation** dialog
**When** I select the **Delete** button
**Then** the selected `note` is removed from the `Notes` table
**And** the confirmation dialog closes
**And** the selected `note` no longer appears in the **Notes List**
**And** all `Contributiors` entries tied to this `note` are deleted as well.
**And** a load request is made to the `Notes` table to get the next `note` in the table that is not the same as the ones already present in the **Notes List**.

#### Scenario: Maintenance deletes from Maintenance Requests Notes List

**Given** I am an authenticated user with `maintenance` or `admin` role on `Maintenance.vue`
**When** I confirm **Delete** on a `note` from the **Vehicle Maintenance Notes** list
**Then** I can see the **Notes List** component in **Embed** mode embedded at the bottom of `Maintenance.vue` titled **Vehicle Maintenance Notes**
**Then** the selected `note` is removed from the `Notes` table
**And** the confirmation dialog closes
**And** the selected `note` no longer appears in the **Notes List**
**And** a load request is made to the `Notes` table to get the next `note` in the table that is not the same as the ones already present in the **Notes List**
**And** a `vehicle service log` is created with the `text` content of the deleted `note` and uploaded to the `vehicle service logs` table as per **Feature 10**.

### US-9.3: Create Notes

#### Scenario: Press New Note from Request form

**Given** I am viewing a **Notes List** in **Embed** mode
**When** I press the **+ New Note**
**Then** I see the `NoteForm` component open in **Add** mode with `maintenance_request` toggled to `false`.

#### Scenario: Press New Note from Maintenance Request form

**Given** I am viewing a **Notes List** in **Embed** mode
**When** I press the **+ New Note**
**Then** I see the `NoteForm` component open in **Add** mode with `maintenance_request` toggled to `true`.

#### Scenario: Press Cancel from Request form (add)

**Given** I am viewing the **Add Note** dialog
**When** I press the **Cancel** button
**Then** the fields within the `NoteForm` component are cleared
**And** I no longer see the `NoteForm` component on screen.

#### Scenario: Press outside NoteForm component (add)

**Given** I am viewing the `NoteForm` component in **Add** mode
**When** I press anywhere outside the `NoteForm` component
**Then** the fields within the `NoteForm` component are cleared
**And** I no longer see the `NoteForm` component on screen.

#### Scenario: Send add request with invalid form data

**Given** I have filled out any field in the `NoteForm` component in **Add** mode with invalid form data as per the **Screen Requirements**
**When** I press the **Add** button
**Then** beneath each field containing invalid form data, I see an error with a human-readable explanation of how the data is malformed
**And** no request is sent.

#### Scenario: Send add request with a missing required field

**Given** I have filled out all the fields in the `NoteForm` component in **Add** mode except for **Subject**
**When** I press the **Add** button
**Then** I see an error beneath **Subject** that says `Required`
**And** no request is sent.

#### Scenario: Send add request with valid form data

**Given** I have filled out all the fields in the `NoteForm` component in **Add** mode with valid form data as per the **Screen Requirements**
**When** I press the **Add** button
**Then** I receive a `201` response code
**And** the fields within the `NoteForm` component are cleared
**And** I no longer see the `NoteForm` component on screen.
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen with the `201` response message
**And** an entry gets logged in the `Contributors` table with my ID as the `contributor_id`, the new `note` as the `note_id`, `created_note` set to true, and today's date as the `date`
**And** the **Notes List** reloads without requiring a page reload
**And** the new `note` is added as an entry in the `Notes` table
**And** the success message box gets destroyed automatically after `3` seconds.

#### Scenario: Signed out user makes add request

**Given** I am an unauthenticated user
**When** I send a `POST` request to the `Notes` table with or without valid data
**Then** I receive a `401` response code and message.

### US-9.4: Edit Notes

#### Scenario: Press Edit icon on Notes List item

**Given** I am viewing a **Notes List** in **Embed** mode
**When** I press the **Edit** icon on a list item row's **Actions** section
**Then** I see the `NoteForm` component open in **Edit** mode with the form information already filled out.

#### Scenario: Press Edit icon from Maintenance Request list

**Given** I am viewing a **Notes List** in **Embed** mode
**When** I press the **Edit** icon on a list item row's **Actions** section
**Then** I see the `NoteForm` component open in **Edit** mode with the form information already filled out.

#### Scenario: Press Cancel from Request form (edit)

**Given** I am viewing the **Edit Note** dialog
**When** I press the **Cancel** button
**Then** the fields within the `NoteForm` component are cleared
**And** I no longer see the `NoteForm` component on screen.

#### Scenario: Press outside NoteForm component (edit)

**Given** I am viewing the `NoteForm` component in **Edit** mode
**When** I press anywhere outside the `NoteForm` component
**Then** the fields within the `NoteForm` component are cleared
**And** I no longer see the `NoteForm` component on screen.

#### Scenario: Send edit request with invalid form data

**Given** I have filled out any field in the `NoteForm` component in **Edit** mode with invalid form data as per the **Screen Requirements**
**When** I press the **Save** button
**Then** beneath each field containing invalid form data, I see an error with a human-readable explanation of how the data is malformed
**And** no request is sent.

#### Scenario: Send edit request with a missing required field

**Given** I have filled out all the fields in the `NoteForm` component in **Edit** mode except for **Subject**
**When** I press the **Save** button
**Then** I see an error beneath **Subject** that says `Required`
**And** no request is sent.

#### Scenario: Send edit request with valid form data

**Given** I have filled out all the fields in the `NoteForm` component in **Edit** mode with valid form data as per the **Screen Requirements**
**When** I press the **Edit** button
**Then** I receive a `200` response code
**And** the fields within the `NoteForm` component are cleared
**And** I no longer see the `NoteForm` component on screen.
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen with the `200` response message
**And** an entry gets logged in the `Contributors` table with my ID as the `contributor_id`, the new `note` as the `note_id`, `created_note` set to true, and today's date as the `date`
**And** the **Notes List** reloads without requiring a page reload
**And** the changes to the `note` are reflected in its entry in the `Notes` table
**And** the success message box gets destroyed automatically after `3` seconds.

#### Scenario: Signed out user makes edit request

**Given** I am an unauthenticated user
**When** I send a `PUT` request to the `Notes` table with or without valid data
**Then** I receive a `401` response code and message.

### US-9.5: Admin Notes Management

#### Scenario: View Note Creation List for User Management

**Given** I am an authenticated user with the `admin` role
**When** I view a `user`'s profile as described in **Feature 13**
**Then** I see a **Notes List** component embedded at the bottom of the profile page
**And** the list contains every `note` created by that user.

#### Scenario: View Note Contribution List for User Management

**Given** I am an authenticated user with the `admin` role
**When** I view a `user`'s profile as described in **Feature 13**
**Then** I see a **Notes List** component embedded at the bottom of the profile page
**And** the list contains every `note` that user has contributed to.

#### Scenario: Admin super-permissions on any list

**Given** I am viewing any `note` or **Note List**, including ones I didn't create
**When** I try to create, read, update, or delete it or items on it
**Then** I am allowed to
**And** form validation rules hold consistent like in previous **Acceptance Criteria**.

---

## Test Coverage Map

Each scenario above must map to at least one automated test. `it` names must match the Gherkin **Scenario** titles exactly.

| Story  | Scenario                                                 | Test file                                                         | Test name                                                  |
| ------ | -------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| US-9.1 | Landing View Request Form Note List Embed                | `frontend/tests/NotesList.test.js`                                | `Landing View Request Form Note List Embed`                |
| US-9.1 | Vehicle Maintenance Note List Embed                      | `frontend/tests/NotesList.test.js`                                | `Vehicle Maintenance Note List Embed`                      |
| US-9.1 | More than 3 Notes in a Note List                         | `frontend/tests/NotesList.test.js`                                | `More than 3 Notes in a Note List`                         |
| US-9.1 | Less than 3 list items left to GET                       | `frontend/tests/NotesList.test.js`                                | `Less than 3 list items left to GET`                       |
| US-9.1 | Press on list item body                                  | `frontend/tests/NotesList.test.js`                                | `Press on list item body`                                  |
| US-9.1 | Press on list item action icon                           | `frontend/tests/NotesList.test.js`                                | `Press on list item action icon`                           |
| US-9.1 | Press anywhere outside Note dialog                       | `frontend/tests/NotesList.test.js`                                | `Press anywhere outside Note dialog`                       |
| US-9.2 | User selects Delete icon on Notes List item              | `frontend/tests/NotesList.test.js`                                | `User selects Delete icon on Notes List item`              |
| US-9.2 | User cancels Delete                                      | `frontend/tests/NotesList.test.js`                                | `User cancels Delete`                                      |
| US-9.2 | User confirms Delete                                     | `backend/tests/notes.test.js`, `frontend/tests/NotesList.test.js` | `User confirms Delete`                                     |
| US-9.2 | Maintenance deletes from Maintenance Requests Notes List | `backend/tests/notes.test.js`, `frontend/tests/NotesList.test.js` | `Maintenance deletes from Maintenance Requests Notes List` |
| US-9.3 | Press New Note from Request form                         | `frontend/tests/NotesList.test.js`                                | `Press New Note from Request form`                         |
| US-9.3 | Press New Note from Maintenance Request form             | `frontend/tests/NotesList.test.js`                                | `Press New Note from Maintenance Request form`             |
| US-9.3 | Press Cancel from Request form (add)                     | `frontend/tests/NotesList.test.js`                                | `Press Cancel from Request form (add)`                     |
| US-9.3 | Press outside NoteForm component (add)                   | `frontend/tests/NoteForm.test.js`                                 | `Press outside NoteForm component (add)`                   |
| US-9.3 | Send add request with invalid form data                  | `frontend/tests/NoteForm.test.js`                                 | `Send add request with invalid form data`                  |
| US-9.3 | Send add request with a missing required field           | `frontend/tests/NoteForm.test.js`                                 | `Send add request with a missing required field`           |
| US-9.3 | Send add request with valid form data                    | `backend/tests/notes.test.js`, `frontend/tests/NotesList.test.js` | `Send add request with valid form data`                    |
| US-9.3 | Signed out user makes add request                        | `backend/tests/notes.test.js`                                     | `Signed out user makes add request`                        |
| US-9.4 | Press Edit icon on Notes List item                       | `frontend/tests/NotesList.test.js`                                | `Press Edit icon on Notes List item`                       |
| US-9.4 | Press Edit icon from Maintenance Request list            | `frontend/tests/NotesList.test.js`                                | `Press Edit icon from Maintenance Request list`            |
| US-9.4 | Press Cancel from Request form (edit)                    | `frontend/tests/NotesList.test.js`                                | `Press Cancel from Request form (edit)`                    |
| US-9.4 | Press outside NoteForm component (edit)                  | `frontend/tests/NoteForm.test.js`                                 | `Press outside NoteForm component (edit)`                  |
| US-9.4 | Send edit request with invalid form data                 | `frontend/tests/NoteForm.test.js`                                 | `Send edit request with invalid form data`                 |
| US-9.4 | Send edit request with a missing required field          | `frontend/tests/NoteForm.test.js`                                 | `Send edit request with a missing required field`          |
| US-9.4 | Send edit request with valid form data                   | `backend/tests/notes.test.js`, `frontend/tests/NotesList.test.js` | `Send edit request with valid form data`                   |
| US-9.4 | Signed out user makes edit request                       | `backend/tests/notes.test.js`                                     | `Signed out user makes edit request`                       |
| US-9.5 | View Note Creation List for User Management              | `frontend/tests/NotesList.test.js`                                | `View Note Creation List for User Management`              |
| US-9.5 | View Note Contribution List for User Management          | `frontend/tests/NotesList.test.js`                                | `View Note Contribution List for User Management`          |
| US-9.5 | Admin super-permissions on any list                      | `backend/tests/notes.test.js`, `frontend/tests/NotesList.test.js` | `Admin super-permissions on any list`                      |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 9 from @features/feature-9-note-crud.md on branch `feature/9-note-crud`.

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
- UI-related Contributions CRUD (contribution info is stored in backend and used to display/filter notes in notes lists)

---

## Defer to Feature 10

- `Vehicle Service Logs` table CRUD, files, operations, etc
- `Vehicle Service Logs` table and the files needed for it

## Defer to Feature 11

- `Note` image drag & drop / file-picker functionality and storage

## Defer to Feature 12

- `NoteForm` integration into `Requests` creation/edit form
