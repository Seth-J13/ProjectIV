# Feature: Image CRUD

**Feature ID:** 11
**Branch pattern:** `feature/11-images-crud`
**Status:** Draft
**Created:** 2026-11-06
**Updated:** 2026-11-09
**Input:** Application must support the creation, reading, updating, and deleting of images paired with different tables in the application to assist in understanding data entities.
**Depends on:** [Feature 1 -- User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md), [Feature 2 -- Google Auth](feature-2-Google-Auth.md), [Feature 3 -- Area CRUD](feature-3-Area-CRUD.md), [Feature 6 -- Destination CRUD](feature-6-destination-crud.md), [Feature 8 -- Requests CRUD](feature-8-requests-crud.md), [Feature 13 -- User Management](feature-13-User-Management.md), [Feature 9 -- Images CRUD](feature-9-image-crud.md)
**Related:** `frontend/Vehicles.vue`, `frontend/Maintenance.vue`, `frontend/components/NoteDetails.vue`, `frontend/components/NoteDetails.vue`, `frontend/components/ImagesContainer.vue`, `frontend/components/ImagesDetails.vue`, `frontend/components/RequestForm.vue`

---

## User Stories

(note for AC's: max image size should be 25MB and will convert to JPEG before being stored as a blob in the DB)

### US-11.1: See VehicleImage on Vehicle listings

**As a** authenticated user with the `admin` or `maintenance` role
**I want to** see every `VehicleImage` attached to a `vehicle`
**So that** I know which `vehicle` I'm looking at.

**Priority:** P1
**Independent test:** On `Vehicles.vue`, hover over a `vehicle`'s listing, shows a popup above the cursor with the first `VehicleImage` containing the selected `vehicle`'s VIN, hovering over popup does not close popup, clicking on popup opens modal with scrollable list of `VehicleImages`, clicking **Close** or anywhere outside modal closes modal.
**Acceptance scenarios:** see ### US-11.1 under Acceptance Criteria

### US-11.2: Create VehicleImage on Vehicle listings

**As a** authenticated user with the `admin` or `maintenance` role
**I want to** add more than one `VehicleImage` to a `vehicle`
**So that** I can help others know what `vehicle` they're looking at.

**Priority:** P1
**Independent test:** On `Maintenance.vue`, press on the **Vehicle Images** container, press **+ New Image** on the **Vehicle Images** modal, option to choose between Google Drive or upload (system file-picker), uploaded image is _appended_ to `VehicleImages` table with the same VIN as the selected `vehicle`, and the **Vehicle Images** list inside the **Vehicle Images** modal reloads without the page reloading, clicking **Close** or anywhere outside modal closes modal.
**Acceptance scenarios:** see ### US-11.2 under Acceptance Criteria

### US-11.3: Delete VehicleImage on Vehicle listings

**As a** authenticated user with the `admin` or `maintenance` role
**I want to** remove a `VehicleImage` from a `vehicle`
**So that** I can replace incorrect `VehicleImages`.

**Priority:** P1
**Independent test:** On `Maintenance.vue`, press on the **Vehicle Images** container, opens the **Vehicle Images** modal, hover over a `VehicleImage`, `X` appears in top-right corner of `VehicleImage` which colors anything beneath it in negative color so it contrasts strongly and is easy to find, clicking `X` DELETEs the `VehicleImage` from both the displayed list and the `VehicleImages` table, `VehicleImage` list in the **Vehicle Images** modal refreshes without the page refreshing, clicking **Close** or anywhere outside modal closes modal.
**Acceptance scenarios:** see ### US-11.3 under Acceptance Criteria

### US-11.4: See NoteImage on Note details

**As a** authenticated user
**I want to** see every `NoteImage` attached to a `note`
**So that** I know more information about the note I'm looking at.

**Priority:** P1
**Independent test:** In the `NoteForm.vue` component in **Add** or **Edit** mode, **Drop or Upload Image Here** container shows grid of `NoteImages` entries containing the selected `note`'s id; clicking on a `NoteImage` in the container opens an extra modal whose content is only the `NoteImage` (closes if clicked out or hit `X` in top-right corner of `NoteImage` which looks like the `X` in US-11.3).
**Acceptance scenarios:** see ### US-11.4 under Acceptance Criteria

### US-11.5: Create NoteImage on Note details

**As a** authenticated user
**I want to** add more than one `NoteImage` to a `note`
**So that** I can give others more information about the note.

**Priority:** P1
**Independent test:** In the `NoteForm.vue` component in **Add** or **Edit** mode, **Drop or Upload Image Here** container creates a `NoteImage` table entry if a `png`/`apng`, `jpg`/`jpeg`, `tiff`/`tif`, `avif`, `webp`, or a `bmp` is dragged into it; clicking shows option to choose between Google Drive or upload (system file-picker), uploaded image is _appended_ to `NoteImage` table with the same `note_id` as the selected `note` **if and only if** the uploaded image is smaller than `25` Megabytes.
**Acceptance scenarios:** see ### US-11.5 under Acceptance Criteria

### US-11.6: Delete NoteImage on Note

**As a** authenticated user
**I want to** remove a `NoteImage` from a `note` according to my role permissions
**So that** I can replace incorrect `NoteImages`.

**Priority:** P1
**Independent test:** In the `NoteForm.vue` component in **Add** or **Edit** mode, `X` appears in top-right corner of `NoteImages` in the **Drop or Upload Image** container which colors anything beneath it in negative color so it contrasts strongly and is easy to find, clicking `X` DELETEs the `NoteImage` from both the container and the `NoteImages` table, `NoteImages` list in the container refreshes without the page refreshing.
**Acceptance scenarios:** see ### US-11.6 under Acceptance Criteria

### US-11.7: See VehicleImage on Request Form

**As a** authenticated user filling out the `RequestForm.vue` component
**I want to** see the `VehicleImage` of my selected `area`
**So that** I know I've selected the correct `vehicle`.

**Priority:** P1
**Independent test:** [write after getting confirmation about RequestForm component from Ethan]
**Acceptance scenarios:** see ### US-11.7 under Acceptance Criteria

### US-11.8: See AreaImage on Area listings

**As a** authenticated user with the `admin` or `maintenance` role
**I want to** see every `AreaImage` attached to a `area`
**So that** I know which `area` I'm looking at.

**Priority:** P1
**Independent test:** On `Areas.vue`, hover over a `area`'s listing, shows a popup above the cursor with the first `AreaImage` containing the selected `area`'s VIN, hovering over popup does not close popup, clicking on popup opens modal with scrollable list of `AreaImages`, clicking **Close** or anywhere outside modal closes modal.
**Acceptance scenarios:** see ### US-11.8 under Acceptance Criteria

### US-11.9: Create AreaImage on Area listings

**As a** authenticated user with the `admin` or `maintenance` role
**I want to** add more than one `AreaImage` to a `area`
**So that** I can help others know what `area` they're looking at.

**Priority:** P1
**Independent test:** On `Maintenance.vue`, press on the **Area Images** container, press **+ New Image** on the **Area Images** modal, option to choose between Google Drive or upload (system file-picker), uploaded image is _appended_ to `AreaImages` table with the same VIN as the selected `area`, and the **Area Images** list inside the **Area Images** modal reloads without the page reloading, clicking **Close** or anywhere outside modal closes modal.
**Acceptance scenarios:** see ### US-11.9 under Acceptance Criteria

### US-11.10: Delete AreaImage on Area listings

**As a** authenticated user with the `admin` or `maintenance` role
**I want to** remove a `AreaImage` from a `area`
**So that** I can replace incorrect `AreaImages`.

**Priority:** P1
**Independent test:** On `Maintenance.vue`, press on the **Area Images** container, opens the **Area Images** modal, hover over a `AreaImage`, `X` appears in top-right corner of `AreaImage` which colors anything beneath it in negative color so it contrasts strongly and is easy to find, clicking `X` DELETEs the `AreaImage` from both the displayed list and the `AreaImages` table, `AreaImage` list in the **Vehicle Images** modal refreshes without the page refreshing, clicking **Close** or anywhere outside modal closes modal.
**Acceptance scenarios:** see ### US-11.10 under Acceptance Criteria

### US-11.11: See AreaImage on Vehicle listing

**As a** authenticated user filling out the `RequestForm.vue` component
**I want to** see the `AreaImage` of my selected `area`
**So that** I know I've selected the correct `area`.

**Priority:** P1
**Independent test:** [write after getting confirmation about RequestForm component from Ethan]
**Acceptance scenarios:** see ### US-11.11 under Acceptance Criteria

---

## Requirements

### Functional Requirements

**FR-001**: Any authenticated user **MUST** be allowed to do CRUD operations on `images` belonging to `requests` whose `requester_id` matches the user's `id`
**FR-002**: Authenticated admin users **MUST** be allowed to do CRUD operations on all `images`.
**FR-003**: Any authenticated user **MUST** be able to perform `POST` on the `Images` table from only `ImageForm`.
**FR-004**: Any authenticated user **MUST** be allowed to perform `GET` on the `Images` table.
**FR-005**: The **Request Details** view **MUST** show a list of images beneath the rest of the `request`'s information.
**FR-008**: Authenticated maintenance users **MUST** be able to see a list of `images` whose `maintenance_request` bool is toggled on.
**FR-009**: The list of `images` **MUST** be embedded in other screens rather than having a screen dedicated to it.
**FR-010**: The `ImagesList` component **MUST** have a callback passed into it on implementation which filters its items dynamically.
**FR-011**: The `ImagesList` and `ImageForm` components **MUST** behave differently based on what page they're embedded into, described in **Screen Requirements** and the **Acceptance Criteria**.
**FR-012**: Displaying an error inside a create, update, or delete dialog **MUST NOT** close the dialog.
**FR-013**: Encountering a field/form/dialog error **MUST NOT** send the query to the `Images` table.
**FR-014**: The `ImagesList` component **MUST** be retrieved in batches of _at most_ `3` when arriving at the bottom of the list, or less if the final batch does not have `3` entries left to retrieve.
**FR-015**: The application **MUST NOT** have a whole view dedicated to Images CRUD.
**FR-016**: Any updates to a `Images` entry **MUST** include the `id` of the `user` who updated the `image`.

---

## Assumptions

- Feature 1, 2, 8, and 13 are already on `dev`

## Edge Cases

- POST `Images` with the exact same `text` and `request_id` -> `409`
- no `Requests` exist but `Images` exist -> don't render orphaned images
- DELETE `Request` with attached `Images` -> CASCADE DELETE so attached `Images` are deleted too
- Malformed date in `Images` entry -> `ImageForm` and `ImageDetails` for that entry default to today's date

## Success Criteria

**SC-001**: Every Gherkin scenario has at least one automated test before merge
**SC-002**: Administrator user can Create, Read, Update, or Delete from `Images`
**SC-003**: Maintenance users can Create, Read, and Update from `Images`
**SC-004**: User and Driver users can Create and Read from `Images`
**SC-005**: User, Driver, and Maintenance users can only Delete `Images` created by them
**SC-006**: npm test passes for `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js`, `frontend/tests/ImageForm.test.js`

---

## Data Ownership & Isolation

`Images` are owned by both `users` and `requests` since a `user` has permissions on `images` they write while `images` are attached to a `request`.

| Rule                  | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | Any authenticated user (`GET /vehicle-t3/images`, `GET /vehicle-t3/images/image/:imageId`, `GET /vehicle-t3/images/request/:requestId`, `GET /vehicle-t3/images/user/:userId`, `GET /vehicle-t3/images/contributors`, `GET /vehicle-t3/images/contributors/image/:imageId`, `GET /vehicle-t3/images/contributors/user/:userId`). `GET /vehicle-t3/images/user/:userId` returns the images that user has contributed to.                                                                               |
| **Write scope**       | `PUT /vehicle-t3/images/image/:imageId`. User and Driver may update images they created and images on requests whose `requester_id` is their id. Admin and Maintenance may update every image. The server records a contribution with `created_image` false and `contributor_id` taken from the signed-in user.                                                                                                                                                                                       |
| **Create scope**      | Any authenticated user may `POST /vehicle-t3/images/`. The same `request_id` and `text` returns `409`. The server adds a contribution with `created_image` true and `contributor_id` taken from the signed-in user. `POST /vehicle-t3/images/contributors` adds a contribution for that same user. A second contribution with `created_image` true on that `image_id` returns `409`.                                                                                                                  |
| **Delete scope**      | `DELETE /vehicle-t3/images/image/:imageId`. User and Driver may delete images they created and images on requests whose `requester_id` is their id. Maintenance may delete only images they created. Admin may delete any image, and may `DELETE /vehicle-t3/images/request/:requestId`. Deleting a image also deletes its contributions. `DELETE /vehicle-t3/images/contributors/contribution/:contributionId` and `DELETE /vehicle-t3/images/contributors/image/:imageId` use this same role split. |
| **Cross-user access** | Image and contribution responses may include `created_by` and `contributor_id`. They include no other user profile fields. `contributor_id` comes from the authenticated user, not the request body.                                                                                                                                                                                                                                                                                                  |
| **UI scope**          | `ImagesList.vue` is embedded on other screens. It shows `Images` in batches of at most 3, sorted by most recent `date`. This feature has no dedicated images view and no screen for contribution management.                                                                                                                                                                                                                                                                                          |
| **Later features**    | A confirmed delete on **Vehicle Maintenance Images** uploads that image's `text` to vehicle service logs in Feature 10. Image images are Feature 11.                                                                                                                                                                                                                                                                                                                                                  |

---

## Key Entities

**User**: registered account (email, password, role, etc); has permission levels pertaining to `Images` CRUD.
**Image**: Entity containing extraneous information attached to a `request`.

---

## API Requirements

Mount prefix: `/vehicle-t3`. Flat JSON (no `{ success, data }` envelope). Errors: `{ "message": "Human-readable explanation." }`. Authenticated writes send `Authorization: Bearer <token>`.

This feature uses the `[type]image` endpoints below.

`[type]` is a stand-in, not a path segment and not a JSON field. Replace every `[type]` in a path with the same one of `note`, `vehicle`, or `area`. The registered paths are concrete, for example `GET /vehicle-t3/noteimage/note/5`. A path whose `[type]` tokens differ, such as `GET /vehicle-t3/noteimage/vehicle/5`, is `404`. Any other word is `404`.

`GET /vehicle-t3/[type]image/:id` loads the image row whose own `id` is `:id`. `GET /vehicle-t3/[type]image/[type]/:[type]Id` loads every image attached to that parent. The static `[type]` segment between `image` and the parent id keeps those two `GET`s distinct. Register the parent route before `GET /:id`, and limit that segment to `note`, `vehicle`, or `area`.

Mount one image router three times: `/vehicle-t3/noteimage`, `/vehicle-t3/vehicleimage`, and `/vehicle-t3/areaimage`. The handler switches on `[type]` to choose the model and foreign key: `note` -> `NoteImage.note_id`, `vehicle` -> `VehicleImage.vehicle_id`, `area` -> `AreaImage.area_id`. The parent id can be one parameter, such as `:parentId`; the switch decides which column it filters.

| Method   | Endpoint                                   | Auth | Purpose                                                            |
| -------- | ------------------------------------------ | ---- | ------------------------------------------------------------------ |
| `GET`    | `/vehicle-t3/[type]image`                  | Yes  | List all images for that `[type]` in batches of at most `3`        |
| `POST`   | `/vehicle-t3/[type]image/`                 | Yes  | Create a new image for that `[type]`                               |
| `GET`    | `/vehicle-t3/[type]image/:id`              | Yes  | List information about the image with the `id` `:id`               |
| `GET`    | `/vehicle-t3/[type]image/[type]/:[type]Id` | Yes  | List all images attached to the parent whose `id` is `:[type]Id`   |
| `DELETE` | `/vehicle-t3/[type]image/[type]/:[type]Id` | Yes  | Delete all images attached to the parent whose `id` is `:[type]Id` |

**Unauthenticated write:** (`401`) login error
**Unauthorized write:** (`403`) forbidden

**The [type] placeholder in the below API responses behaves the same as the [type] placeholder in the above table and paragraphs.**

Corrupted images can be uploaded and retrieved, the end user is responsible for uploading valid files.

### Read [type]Images (`GET /vehicle-t3/[type]image`)

**Success:** (`200`): the next batch of at most `3` `[type]Images`, sorted by the most recent `date`. `offset` is the number of `[type]Images` already retrieved. Missing `offset` -> `offset` defaults to `0`. Fewer than `3` `[type]Images` in the array means that batch is the last one. `[]` means no `[type]Images` remain.

`GET /vehicle-t3/[type]images?offset=0`

```json
[
  {
    "id": 4,
    "image": 0x89504E470D0A1A0A0000000D49484452000000010000000108020000009077
53DE0000000C4944415408D763F8CFC000000301010018DD8DB00000000049454E44AE426082,
    "date": 2026-11-09,
    "[type]_id": 5
  },
  {
    "id": 3,
    "image": 0x89504E470D0A1A0A0000000D40484452000000010000000108020000009077
53DE0000000C4944415408D763F8CFC000000301010008DDFFB00123000050454E44AE426082,
    "date": 2026-11-08,
    "[type]_id": 8
  },
  {
    "id": 2,
    "image": 0x89504E470D0A1A0A0000000D49484452000000010000000108020000009077
53DE0000000C4944415408D763F8CFC000000301010018DD8DB00000000049454E44AE426082,
    "date": 2026-11-02,
    "[type]_id": 2
  }
]
```

`GET /vehicle-t3/images?offset=3` returns the next batch. The last batch is shorter than `3`:

```json
[
  {
    "id": 1,
    "image": 0x89504E400D0A1A0A000FFF0D40484452000000010000000108021111119077
53DE0000000C4944415408D763F8CFC000000301010008DDFFB00123000050454E44AE426082,
    "date": 2026-10-30,
    "[type]_id": 1
  }
]
```

**Server error:** (`500`) `{ "message": "…" }`.

### Read Image details (`GET /vehicle-t3/images/image/:imageId`)

**Success:** (`200`): `image` details

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
      "image_id": 3,
      "contributor_id": 99,
      "created_image": true,
      "date": "2026-11-02"
    },
    {
      "id": 2,
      "image_id": 3,
      "contributor_id": 54321,
      "created_image": false,
      "date": "2026-11-03"
    }
  ]
}
```

**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Read Images on a Request (`GET /vehicle-t3/images/request/:requestId`)

**Success:** (`200`): array with all `images` belonging to that `request`

```json
[
  {
    "id": 2,
    "reason": "test2",
    "maintenance_request": false,
    "request_id": 6,
    "text": "this is an extremely long image text. I chose TEXT as the data type because someone's image might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
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

**Not found:** (`404`) `{ "message": "This request <requestId> doesn't have any images" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Read a user's image history (`GET /vehicle-t3/images/user/:userId`)

**Success:** (`200`): array with all `images` `contributed` to by a `user`

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
    "text": "this is an extremely long image text. I chose TEXT as the data type because someone's image might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
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

**Not found:** (`404`) `{ "message": "This user <userId> hasn't contributed to any images" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Add Image (`POST /vehicle-t3/images`)

**Request body:** (fields the add request sends):

```json
{
  "reason": "test",
  "maintenance_request": false,
  "request_id": 5,
  "text": "this is an extremely long image text. I chose TEXT as the data type because someone's image might contain many more than 255 characters. TEXT is a valid data type, and it can be stored in SQL as VARCHAR('max'). Sequelize should handle that automatically."
}
```

**Success:** (`201`): `contribution` generation

```json
{
  "image_id": 1,
  "contributor_id": 12345,
  "created_image": true,
  "date": "2026-11-02"
}
```

Missing `maintenance_request` -> `maintenance_request` defaults to `false`
Missing `reason`, `request_id`, `text` -> `400` bad request.
Duplicate `request_id` and `text` (combined) -> `409` conflict.

**Server error:** (`500`) `{ "message": "…" }`.

### Overwrite Image (`PUT /vehicle-t3/images/image/:imageId`)

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
  "image_id": 3,
  "contributor_id": 54321,
  "created_image": false,
  "date": "2026-11-03"
}
```

Missing `maintenance_request` -> `maintenance_request` defaults to `false`
Missing `reason`, `request_id`, `text` -> `400` bad request.
Duplicate `request_id` and `text` (combined) -> `409` conflict.

**Unauthorized:** (`403`) Forbidden
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Image (`DELETE /vehicle-t3/images/image/:imageId`)

**Success:** (`204`)
**Unauthorized:** (`403`) Forbidden
**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Request Images (`DELETE /vehicle-t3/images/request/:requestId`)

**Success:** (`204`)
**Not found:** (`404`) `{ "message": "No images on request=<requestId>" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Read Contributions (`GET /vehicle-t3/images/contributors`)

**Success:** (`200`): array with all `contributions`

```json
[
  {
    "id": 1,
    "contributor_id": 99,
    "image_id": 3,
    "created_image": true,
    "date": "2026-11-02"
  },
  {
    "id": 2,
    "contributor_id": 54321,
    "image_id": 3,
    "created_image": false,
    "date": "2026-11-03"
  },
  {
    "id": 3,
    "contributor_id": 12345,
    "image_id": 2,
    "created_image": true,
    "date": "2026-11-07"
  },
  {
    "id": 4,
    "contributor_id": 99,
    "image_id": 3,
    "created_image": false,
    "date": "2026-11-09"
  },
  ...
]
```

**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Add Contribution (`POST /vehicle-t3/images/contributors`)

**Request body:** (fields the add request sends):

```json
{
  "image_id": 3,
  "created_image": true,
  "date": "2026-11-09"
}
```

**Success:** (`201`)

```json
{
  "id": 9,
  "contributor_id": 7,
  "image_id": 3,
  "created_image": true,
  "date": "2026-11-09"
}
```

Missing `date` -> `date` defaults to current date
Missing `image_id`, `contributor_id`, `created_image` -> `400` bad request.
Two contributions on the same `image_id` being `true` -> `409` conflict.

**Server error:** (`500`) `{ "message": "…" }`.

### Read Contributions from Image (`GET /vehicle-t3/images/contributors/image/:imageId`)

**Success:** (`200`): array with all `contributions` belonging to that `image`

```json
[
  {
    "id": 3,
    "contributor_id": 12345,
    "image_id": 2,
    "created_image": true,
    "date": "2026-11-07"
  },
  {
    "id": 12,
    "contributor_id": 99,
    "image_id": 2,
    "created_image": false,
    "date": "2026-12-19"
  }
]
```

**Not found:** (`404`) `{ "message": "This image <imageId> doesn't have any contributions" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Get Contributions by a User (`GET /vehicle-t3/images/contributors/user/:userId`)

**Success:** (`200`): array with all `contributions` by a `user`

(where :userId is `54321`)

```json
[
  {
    "id": 2,
    "contributor_id": 54321,
    "image_id": 3,
    "created_image": false,
    "date": "2026-11-03"
  },
  {
    "id": 5,
    "image_id": 3,
    "contributor_id": 54321,
    "created_image": false,
    "date": "2026-11-03"
  }
]
```

**Not found:** (`404`) `{ "message": "This user <userId> hasn't contributed to any images" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Contribution (`DELETE /vehicle-t3/images/contributors/contribution/:contributionId`)

**Success:** (`204`)
**Unauthorized:** (`403`) Forbidden
**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Remove Request Images (`DELETE /vehicle-t3/images/contributors/image/:imageId`)

**Success:** (`204`)
**Not found:** (`404`) `{ "message": "No contributions on image=<imageId>" }`
**Server error:** (`500`) `{ "message": "…" }`.

Quoted messages that tests must match:

| Situation        | Status | `message`                                                                           |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `GET` success    | 200    | <response from GET>                                                                 |
| `PUT` success    | 200    | <new/updated entry details>                                                         |
| `POST` success   | 201    | `New image created with id=<id>`                                                    |
| `DELETE` success | 204    | <empty response>                                                                    |
| Bad Request      | 400    | `Malformed request. Please make sure everything in the form is properly formatted!` |
| Login Error      | 401    | `Please sign in. If you think this is a mistake, contact your system administrator` |
| Forbidden        | 403    | `Please contact a system administrator for assistance.`                             |
| Not Found        | 404    | `No image` (or `contributor`) `was found for id=<id>`                               |
| Conflict         | 409    | `Image` (or `contributor`) `with these details already exists!`                     |

---

## Screen Requirements

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

### Images List Component

- Container: <v-list>
- Heading: [varies based on embed location]
- Primary action: **+ New Image** when on **Embed** mode (embedded on Forms), not present when in **List** mode (for a display list). Opens a `<ImageForm>` component named **Image Form** Use class `oc-cta` on **+ New Image**, **Image Form** component, and **Add** button (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Pressing with list item body opens <ImageDetails> component named **Image** using class `oc-cta` on **Image**.
- Display interactive search bar in **List** mode named `Search`. Used to search `image` title and text content.
- Display `images` as <v-card> items inside rows separated by a horizontal line each. The following columns should be in each card:
  **Image ID** -- The identifying number of the `image` ("#`id`")
  **Request ID** -- The identifying number of the `request` the `image` is attached to ("R: `request_id`")
  **Subject** -- The first 20 characters of the `image` `reason` (if 20 exist) followed by ellipsis ("this is not a mainte...")
  **Actions** -- **Edit** and **Delete** icons shown which open interaction/confirmation <v-dialogs> to perform their respective operations
- Row cards are displayed in the list in batches of `3` at a time. Scrolling down inside the container loads the next batch beneath the current one.
- List entries are, by default, sorted by the most recently created (`date`)

- Empty state in **List** mode: **No images.**
- Empty state in **Embed** mode: **No images. ** followed by the **+ New Image** button.
- Loading state: skeleton or progress indicator while enrollments are fetching.
- Error state: `<v-alert type="error">` for API failures.

### Image Form Component

The `Image` Form contains the following information:

- **Request ID** -- "Request ID: " followed by the `request_id` of the `request` the `image` is/will-be attached to
- **Date** -- `MM/DD/YYYY` format of the _earliest_ `Contribution` tied to this image.

Primary Action: Fill out a form with the following fields (auto-filled if in **Edit** mode):

- **Subject** -- accepts string of length 254 or less; trim whitespaces in beginning/end; sent to backend as `reason`.
- **Description** -- `TEXT` input; sent to the backend as `text`.
- **Drop or Upload Image Here** -- eventually allows users to upload images to their images. Implement this frame, but don't add functionality until Feature 11.

**Edit State**

- Header: **Edit Image**
- **Cancel** button clears all fields in the current form and closes the component, sending no request to the backend.
- **Save** first checks for validation as per these requirements and the Acceptance Critera, then changes the button text into a spinning load as it `PUT`s the form data into the `Images` entry currently being edited. As soon as a response is received from the backend, **Save** button text becomes **Save** again and component closes.
- **Last updated on** -- `MM/DD/YYYY` format of the date from the most recent `Contribution` tied to this `image`

**Add State**

- Header: **Add Image**
- **Cancel** button clears all fields in the current form and closes the component
- **Add** first checks for validation as per these requirements and the Acceptance Critera, then changes the button text into a spinning load as it `POST`s the form data into the `Images` entry currently being edited. As soon as a response is received from the backend, **Add** button text becomes **Add** again and component closes.

**Implementation image:** no view or frontend-route for `Images`; `Images` dialogs are child components or inline `<v-dialog>` blocks in other views, embedded unless the team splits presentational dialogs later.

### Image Details Component

The `Image` Details contain the following information:

Header: **Image**
Body:

- **Request ID** -- "Request ID: " followed by the `request_id` of the `request` the `image` is attached to
- **Date** -- `MM/DD/YYYY` format of the date the `image` was written/last-updated on.
- **Subject** -- the reason a `image` was submitted.
- **Description** -- Textual details of the image.
- **Image(s)** -- eventually will be images a user uploaded to their image. Implement this frame, but don't add functionality until Feature 11.
- **Last updated on** -- `MM/DD/YYYY` format of the date from the most recent `Contribution` tied to this `image`
- **Close** -- closes the dialog

**Implementation image:** no view or frontend-route for `Images`; `Images` dialogs are child components or inline `<v-dialog>` blocks in other views, embedded unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Data Model Requirements

This feature uses different image tables where each entry has a foreign key to the item it belongs to. Sequelize also stores `createdAt` / `updatedAt`.

### `NoteImage` table

| Field     | Type                    | Rules                                      |
| --------- | ----------------------- | ------------------------------------------ |
| `id`      | INTEGER; AUTO-INCREMENT | Primary Key, NOT NULL                      |
| `image`   | BLOB                    | Required                                   |
| `date`    | DATE                    | Derived from image metadata (or generated) |
| `note_id` | INTEGER, FOREIGN KEY    | Required                                   |

### `VehicleImage` table

| Field        | Type                    | Rules                                      |
| ------------ | ----------------------- | ------------------------------------------ |
| `id`         | INTEGER; AUTO-INCREMENT | Primary Key, NOT NULL                      |
| `image`      | BLOB                    | Required                                   |
| `date`       | DATE                    | Derived from image metadata (or generated) |
| `vehicle_id` | INTEGER, FOREIGN KEY    | Required                                   |

### `AreaImage` table

| Field     | Type                    | Rules                                      |
| --------- | ----------------------- | ------------------------------------------ |
| `id`      | INTEGER; AUTO-INCREMENT | Primary Key, NOT NULL                      |
| `image`   | BLOB                    | Required                                   |
| `date`    | DATE                    | Derived from image metadata (or generated) |
| `area_id` | INTEGER, FOREIGN KEY    | Required                                   |

### Associations

- `Notes` hasMany `NoteImage`
- `NoteImage` belongsTo `Notes`

- `Vehicles` hasMany `VehicleImage`
- `VehicleImage` belongsTo `Vehicles`

- `Areas` hasMany `AreaImage`
- `AreaImage` belongsTo `Areas`

---

## Acceptance Criteria (Gherkin)

### US-11.1: See Images

#### Scenario: Landing View Request Form Image List Embed

**Given** I am an authenticated user
**When** I navigate to `Landing.vue`
**Then** I can see the **Images List** component in **Embed** mode embedded at the bottom of any **Request Form** on the page with the title **Images**.

#### Scenario: Vehicle Maintenance Image List Embed

**Given** I am an authenticated user with `maintenance` or `admin` role on `Vehicles.vue`
**When** I press the wrench list icon to navigate to `Maintenance.vue`
**Then** I can see the **Images List** component in **Embed** mode embedded at the bottom of `Maintenance.vue` titled **Vehicle Maintenance Images**
**And** the **Vehicle Maintenance Images** list contains every `image` that both has `maintenance_request` set to `true` and has the same `request_id` as any `request` containing the same `vehicle_id` as the `vin` of the `area` selected to get to `Maintenance.vue`.

#### Scenario: More than 3 Images in a Image List

**Given** I am an authenticated user
**When** I view a **Images List** in **List** or **Embed** mode
**And** I reach the bottom of the **Images List**
**Then** the **Images List** tries to `GET` and display another batch of 3 images without refreshing the whole page
**And** they overflowing with a scroll bar inside the <v-list> rather than expanding the page.

#### Scenario: Less than 3 list items left to GET

**Given** I am an authenticated user
**When** I view a **Images List** in **List** or **Embed** mode
**And** I reach the bottom of the **Images List**
**And** the batch of list items is smaller 3
**Then** the **Images List** does not try to retrieve any more `images`.

#### Scenario: Press on list item body

**Given** I am an authenticated user
**When** I press on the body (not action icons) of a **Images List** list item
**Then** the **Image** details dialog opens holding the correct information from that selected `image`.

#### Scenario: Press on list item action icon

**Given** I am an authenticated user
**When** I press an action icon on a **Images List** list item
**Then** that action is performed in accordance with later **Acceptance Criteria**.

#### Scenario: Press anywhere outside Image dialog

**Given** I am an authenticated user with any <v-dialog> open from interacting with **Images List** list items
**When** I press anywhere outside the dialog
**Or** I press the **Close** button
**Then** the **Image** dialog closes and nothing is changed.

### US-11.2: Remove Images

#### Scenario: User selects Delete icon on Images List item

**Given** I am an authenticated user viewing a **Images List** belonging to a request I own
**When** I select the **Delete** icon on a list item row's **Actions** section
**Then** I see a confirmation dialog titled **Delete** appear with two options: **Cancel** and **Delete**.

#### Scenario: User cancels Delete

**Given** I am an authenticated user viewing the **Delete Confirmation** dialog
**When** I select the **Cancel** button
**Then** the confirmation dialog closes and nothing else happens.

#### Scenario: User confirms Delete

**Given** I am an authenticated user viewing the **Delete Confirmation** dialog
**When** I select the **Delete** button
**Then** the selected `image` is removed from the `Images` table
**And** the confirmation dialog closes
**And** the selected `image` no longer appears in the **Images List**
**And** all `Contributiors` entries tied to this `image` are deleted as well.
**And** a load request is made to the `Images` table to get the next `image` in the table that is not the same as the ones already present in the **Images List**.

#### Scenario: Maintenance deletes from Maintenance Requests Images List

**Given** I am an authenticated user with `maintenance` or `admin` role on `Maintenance.vue`
**When** I confirm **Delete** on a `image` from the **Vehicle Maintenance Images** list
**Then** I can see the **Images List** component in **Embed** mode embedded at the bottom of `Maintenance.vue` titled **Vehicle Maintenance Images**
**Then** the selected `image` is removed from the `Images` table
**And** the confirmation dialog closes
**And** the selected `image` no longer appears in the **Images List**
**And** a load request is made to the `Images` table to get the next `image` in the table that is not the same as the ones already present in the **Images List**
**And** a `vehicle service log` is created with the `text` content of the deleted `image` and uploaded to the `vehicle service logs` table as per **Feature 10**.

### US-11.3: Create Images

#### Scenario: Press New Image from Request form

**Given** I am viewing a **Images List** in **Embed** mode
**When** I press the **+ New Image**
**Then** I see the `ImageForm` component open in **Add** mode with `maintenance_request` toggled to `false`.

#### Scenario: Press New Image from Maintenance Request form

**Given** I am viewing a **Images List** in **Embed** mode
**When** I press the **+ New Image**
**Then** I see the `ImageForm` component open in **Add** mode with `maintenance_request` toggled to `true`.

#### Scenario: Press Cancel from Request form (add)

**Given** I am viewing the **Add Image** dialog
**When** I press the **Cancel** button
**Then** the fields within the `ImageForm` component are cleared
**And** I no longer see the `ImageForm` component on screen.

#### Scenario: Press outside ImageForm component (add)

**Given** I am viewing the `ImageForm` component in **Add** mode
**When** I press anywhere outside the `ImageForm` component
**Then** the fields within the `ImageForm` component are cleared
**And** I no longer see the `ImageForm` component on screen.

#### Scenario: Send add request with invalid form data

**Given** I have filled out any field in the `ImageForm` component in **Add** mode with invalid form data as per the **Screen Requirements**
**When** I press the **Add** button
**Then** beneath each field containing invalid form data, I see an error with a human-readable explanation of how the data is malformed
**And** no request is sent.

#### Scenario: Send add request with a missing required field

**Given** I have filled out all the fields in the `ImageForm` component in **Add** mode except for **Subject**
**When** I press the **Add** button
**Then** I see an error beneath **Subject** that says `Required`
**And** no request is sent.

#### Scenario: Send add request with valid form data

**Given** I have filled out all the fields in the `ImageForm` component in **Add** mode with valid form data as per the **Screen Requirements**
**When** I press the **Add** button
**Then** I receive a `201` response code
**And** the fields within the `ImageForm` component are cleared
**And** I no longer see the `ImageForm` component on screen.
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen with the `201` response message
**And** an entry gets logged in the `Contributors` table with my ID as the `contributor_id`, the new `image` as the `image_id`, `created_image` set to true, and today's date as the `date`
**And** the **Images List** reloads without requiring a page reload
**And** the new `image` is added as an entry in the `Images` table
**And** the success message box gets destroyed automatically after `3` seconds.

#### Scenario: Signed out user makes add request

**Given** I am an unauthenticated user
**When** I send a `POST` request to the `Images` table with or without valid data
**Then** I receive a `401` response code and message.

### US-11.4: Edit Images

#### Scenario: Press Edit icon on Images List item

**Given** I am viewing a **Images List** in **Embed** mode
**When** I press the **Edit** icon on a list item row's **Actions** section
**Then** I see the `ImageForm` component open in **Edit** mode with the form information already filled out.

#### Scenario: Press Edit icon from Maintenance Request list

**Given** I am viewing a **Images List** in **Embed** mode
**When** I press the **Edit** icon on a list item row's **Actions** section
**Then** I see the `ImageForm` component open in **Edit** mode with the form information already filled out.

#### Scenario: Press Cancel from Request form (edit)

**Given** I am viewing the **Edit Image** dialog
**When** I press the **Cancel** button
**Then** the fields within the `ImageForm` component are cleared
**And** I no longer see the `ImageForm` component on screen.

#### Scenario: Press outside ImageForm component (edit)

**Given** I am viewing the `ImageForm` component in **Edit** mode
**When** I press anywhere outside the `ImageForm` component
**Then** the fields within the `ImageForm` component are cleared
**And** I no longer see the `ImageForm` component on screen.

#### Scenario: Send edit request with invalid form data

**Given** I have filled out any field in the `ImageForm` component in **Edit** mode with invalid form data as per the **Screen Requirements**
**When** I press the **Save** button
**Then** beneath each field containing invalid form data, I see an error with a human-readable explanation of how the data is malformed
**And** no request is sent.

#### Scenario: Send edit request with a missing required field

**Given** I have filled out all the fields in the `ImageForm` component in **Edit** mode except for **Subject**
**When** I press the **Save** button
**Then** I see an error beneath **Subject** that says `Required`
**And** no request is sent.

#### Scenario: Send edit request with valid form data

**Given** I have filled out all the fields in the `ImageForm` component in **Edit** mode with valid form data as per the **Screen Requirements**
**When** I press the **Edit** button
**Then** I receive a `200` response code
**And** the fields within the `ImageForm` component are cleared
**And** I no longer see the `ImageForm` component on screen.
**And** a success message appears in a small, closable, elevated `div` at the bottom of the screen with the `200` response message
**And** an entry gets logged in the `Contributors` table with my ID as the `contributor_id`, the new `image` as the `image_id`, `created_image` set to true, and today's date as the `date`
**And** the **Images List** reloads without requiring a page reload
**And** the changes to the `image` are reflected in its entry in the `Images` table
**And** the success message box gets destroyed automatically after `3` seconds.

#### Scenario: Signed out user makes edit request

**Given** I am an unauthenticated user
**When** I send a `PUT` request to the `Images` table with or without valid data
**Then** I receive a `401` response code and message.

### US-11.5: Admin Images Management

#### Scenario: View Image Creation List for User Management

**Given** I am an authenticated user with the `admin` role
**When** I view a `user`'s profile as described in **Feature 13**
**Then** I see a **Images List** component embedded at the bottom of the profile page
**And** the list contains every `image` created by that user.

#### Scenario: View Image Contribution List for User Management

**Given** I am an authenticated user with the `admin` role
**When** I view a `user`'s profile as described in **Feature 13**
**Then** I see a **Images List** component embedded at the bottom of the profile page
**And** the list contains every `image` that user has contributed to.

#### Scenario: Admin super-permissions on any list

**Given** I am viewing any `image` or **Image List**, including ones I didn't create
**When** I try to create, read, update, or delete it or items on it
**Then** I am allowed to
**And** form validation rules hold consistent like in previous **Acceptance Criteria**.

---

## Test Coverage Map

Each scenario above must map to at least one automated test. `it` names must match the Gherkin **Scenario** titles exactly.

| Story   | Scenario                                                  | Test file                                                           | Test name                                                   |
| ------- | --------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| US-11.1 | Landing View Request Form Image List Embed                | `frontend/tests/ImagesList.test.js`                                 | `Landing View Request Form Image List Embed`                |
| US-11.1 | Vehicle Maintenance Image List Embed                      | `frontend/tests/ImagesList.test.js`                                 | `Vehicle Maintenance Image List Embed`                      |
| US-11.1 | More than 3 Images in a Image List                        | `frontend/tests/ImagesList.test.js`                                 | `More than 3 Images in a Image List`                        |
| US-11.1 | Less than 3 list items left to GET                        | `frontend/tests/ImagesList.test.js`                                 | `Less than 3 list items left to GET`                        |
| US-11.1 | Press on list item body                                   | `frontend/tests/ImagesList.test.js`                                 | `Press on list item body`                                   |
| US-11.1 | Press on list item action icon                            | `frontend/tests/ImagesList.test.js`                                 | `Press on list item action icon`                            |
| US-11.1 | Press anywhere outside Image dialog                       | `frontend/tests/ImagesList.test.js`                                 | `Press anywhere outside Image dialog`                       |
| US-11.2 | User selects Delete icon on Images List item              | `frontend/tests/ImagesList.test.js`                                 | `User selects Delete icon on Images List item`              |
| US-11.2 | User cancels Delete                                       | `frontend/tests/ImagesList.test.js`                                 | `User cancels Delete`                                       |
| US-11.2 | User confirms Delete                                      | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `User confirms Delete`                                      |
| US-11.2 | Maintenance deletes from Maintenance Requests Images List | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Maintenance deletes from Maintenance Requests Images List` |
| US-11.3 | Press New Image from Request form                         | `frontend/tests/ImagesList.test.js`                                 | `Press New Image from Request form`                         |
| US-11.3 | Press New Image from Maintenance Request form             | `frontend/tests/ImagesList.test.js`                                 | `Press New Image from Maintenance Request form`             |
| US-11.3 | Press Cancel from Request form (add)                      | `frontend/tests/ImagesList.test.js`                                 | `Press Cancel from Request form (add)`                      |
| US-11.3 | Press outside ImageForm component (add)                   | `frontend/tests/ImageForm.test.js`                                  | `Press outside ImageForm component (add)`                   |
| US-11.3 | Send add request with invalid form data                   | `frontend/tests/ImageForm.test.js`                                  | `Send add request with invalid form data`                   |
| US-11.3 | Send add request with a missing required field            | `frontend/tests/ImageForm.test.js`                                  | `Send add request with a missing required field`            |
| US-11.3 | Send add request with valid form data                     | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Send add request with valid form data`                     |
| US-11.3 | Signed out user makes add request                         | `backend/tests/images.test.js`                                      | `Signed out user makes add request`                         |
| US-11.4 | Press Edit icon on Images List item                       | `frontend/tests/ImagesList.test.js`                                 | `Press Edit icon on Images List item`                       |
| US-11.4 | Press Edit icon from Maintenance Request list             | `frontend/tests/ImagesList.test.js`                                 | `Press Edit icon from Maintenance Request list`             |
| US-11.4 | Press Cancel from Request form (edit)                     | `frontend/tests/ImagesList.test.js`                                 | `Press Cancel from Request form (edit)`                     |
| US-11.4 | Press outside ImageForm component (edit)                  | `frontend/tests/ImageForm.test.js`                                  | `Press outside ImageForm component (edit)`                  |
| US-11.4 | Send edit request with invalid form data                  | `frontend/tests/ImageForm.test.js`                                  | `Send edit request with invalid form data`                  |
| US-11.4 | Send edit request with a missing required field           | `frontend/tests/ImageForm.test.js`                                  | `Send edit request with a missing required field`           |
| US-11.4 | Send edit request with valid form data                    | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Send edit request with valid form data`                    |
| US-11.4 | Signed out user makes edit request                        | `backend/tests/images.test.js`                                      | `Signed out user makes edit request`                        |
| US-11.5 | View Image Creation List for User Management              | `frontend/tests/ImagesList.test.js`                                 | `View Image Creation List for User Management`              |
| US-11.5 | View Image Contribution List for User Management          | `frontend/tests/ImagesList.test.js`                                 | `View Image Contribution List for User Management`          |
| US-11.5 | Admin super-permissions on any list                       | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Admin super-permissions on any list`                       |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 9 from @features/feature-9-image-crud.md on branch `feature/9-image-crud`.

Follow layer order in @features/framework.md (models -> routes -> backend tests -> frontend -> frontend tests).
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
- UI-related Contributions CRUD (contribution info is stored in backend and used to display/filter images in images lists)

---

## Defer to Feature 10

- `Vehicle Service Logs` table CRUD, files, operations, etc
- `Vehicle Service Logs` table and the files needed for it

## Defer to Feature 11

- `Image` image drag & drop / file-picker functionality and storage

## Defer to Feature 12

- `ImageForm` integration into `Requests` creation/edit form
