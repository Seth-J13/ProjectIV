# Feature: Images CRUD

**Feature ID:** 11
**Branch pattern:** `feature/11-images-crud`
**Status:** Draft
**Created:** 2026-11-06
**Updated:** 2026-11-10
**Input:** Application must support the creation, reading, updating, and deleting of images paired with different tables in the application to assist in understanding data entities.
**Depends on:** [Feature 1 -- User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md), [Feature 2 -- Google Auth](feature-2-Google-Auth.md), [Feature 3 -- Area CRUD](feature-3-Area-CRUD.md), [Feature 8 -- Requests CRUD](feature-8-requests-crud.md), [Feature 9 -- Notes CRUD](feature-9-note-crud.md), [Feature 13 -- User Management](feature-13-User-Management.md)
**Related:** `frontend/Vehicles.vue`, `frontend/Maintenance.vue`, `frontend/components/NoteForm.vue`, `frontend/components/ImagesContainer.vue`, `frontend/components/ImagesDetails.vue`, `frontend/components/ImagesBox.vue`, `frontend/components/RequestForm.vue`, `backend/tests/noteimage.test.js`, `backend/tests/vehicleimage.test.js`, `backend/tests/areaimage.test.js`

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
**Independent test:** [write after getting confirmation about Area Forms component from Jalen]
**Acceptance scenarios:** see ### US-11.9 under Acceptance Criteria

### US-11.10: Delete AreaImage on Area listings

**As a** authenticated user with the `admin` or `maintenance` role
**I want to** remove a `AreaImage` from a `area`
**So that** I can replace incorrect `AreaImages`.

**Priority:** P1
**Independent test:** [write after getting confirmation about Area Forms component from Jalen]
**Acceptance scenarios:** see ### US-11.10 under Acceptance Criteria

### US-11.11: See AreaImage on Vehicle listing

**As a** authenticated user filling out the `RequestForm.vue` component
**I want to** see the `AreaImage` of my selected `area`
**So that** I know I've selected the correct `area`.

**Priority:** P1
**Independent test:** [write after getting confirmation about Area Forms component from Jalen]
**Acceptance scenarios:** see ### US-11.11 under Acceptance Criteria

---

## Requirements

### Functional Requirements

**FR-001**: Any authenticated user **MUST** be allowed to do Create, Read, and Delete operations on `NoteImages` attached to `notes` they are either in the process of making or that they are the creator of.
**FR-002**: Authenticated admin users **MUST** be allowed to do CRUD operations on all images attached to all entities.
**FR-003**: Any authenticated user **MUST** be able to perform `POST` on the image tables from each image type's respective forms as defined in the **Screen Requirements**.
**FR-004**: Any authenticated user **MUST** be allowed to reach all `GET` endpoints on any image table.
**FR-005**: The `ImagesContainer` component **MUST** provide methods for authenticated users to Create, Read, and Delete to and from the image table associated with the form it's embedded in.
**FR-006**: Displaying an error inside a create, update, or delete dialog **MUST NOT** close the dialog.
**FR-007**: The application **MUST** convert all uploaded images into `png` format and compress it so it is less than `10` Megabytes.
**FR-008**: The application **MUST** accept these MIME types only: `png`, `jpg`/`jpeg`, `tiff`/`tif`, `avif`, `webp`, or a `bmp`.
**FR-009**: The application **MUST NOT** have a whole view dedicated to Images CRUD.
**FR-010**: The application **MUST** reject all `PUT` requests, authenticated or not.

---

## Assumptions

- Features 1, 2, 3, 8, 9, and 13 are already on `dev`

## Edge Cases

- POST images with the exact same `image` and `[note]_id` -> `409`
- no `images` exist -> don't render orphaned images
- DELETE `[type]` with attached `[type]Images` -> CASCADE DELETE so attached `[type]Images` are deleted too
- Corrupted data in `[type]Image` entry -> `ImagesContainer` and `ImagesDetails` still show attempt to render image

## Success Criteria

**SC-001**: Every Gherkin scenario has at least one automated test before merge
**SC-002**: User/Driver/Maintenance/Admin users can Create and Read from all image tables
**SC-003**: User/Driver can only Delete images pertaining to entities they created
**SC-004**: Maintenance user can Delete images pertaining to entities marked as maintenance requests or that they created
**SC-005**: Admin users can Delete from all image tables.
**SC-006**: npm test passes for `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js`, `frontend/tests/ImageForm.test.js`

---

## Data Ownership & Isolation

Each image is owned by its respective type. That is, a `NoteImage` is owned by a `note` while an `AreaImage` is owned by an `area`.

| Rule                  | Requirement                                                                                                                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | Any authenticated user can (`GET /vehicle-t3/[type]image`,`GET /vehicle-t3/[type]image/:id`,`GET /vehicle-t3/[type]image/[type]/:[type]Id`).                                                                                                                                 |
| **Write scope**       | All overwriting requests are automatically rejected. Images must be deleted and re-uploaded to correct wrong data                                                                                                                                                            |
| **Create scope**      | Any authenticated user may `POST /vehicle-t3/[type]image/`, but it must be performed through either the `ImagesContainer.vue` or `ImagesDetails.vue` component. The same `[type]_id` and `image` combined returns `409`.                                                     |
| **Delete scope**      | `DELETE /vehicle-t3/[type]image/:id` (individual) and `DELETE /vehicle-t3/[type]image/[type]/:[type]Id` (bulk). User, Driver, Maintenance may delete images on `notes` they created and any image on `notes` marked as maintenance requests. Admin may delete **any** image. |
| **Cross-user access** | Image responses may not include any user data.                                                                                                                                                                                                                               |
| **UI scope**          | `ImagesContainer.vue` and `ImagesDetails.vue` are embedded on other screens/components. They show images sorted by most recent `date`. This feature has no dedicated images router page.                                                                                     |

---

## Key Entities

**User**: registered account (email, password, role, etc); has permission levels pertaining to images CRUD.

**Image** [type]s:

- **NoteImage**: Entity containing visual and date information attached to a `note`.
- **VehicleImage**: Entity containing visual and date information attached to a `vehicle`.
- **AreaImage**: Entity containing visual and date information attached to an `area`.

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
| `DELETE` | `/vehicle-t3/[type]image/:id`              | Yes  | Delete the image with the `id` `:id`                               |
| `GET`    | `/vehicle-t3/[type]image/[type]/:[type]Id` | Yes  | List all images attached to the parent whose `id` is `:[type]Id`   |
| `DELETE` | `/vehicle-t3/[type]image/[type]/:[type]Id` | Yes  | Delete all images attached to the parent whose `id` is `:[type]Id` |

**Unauthenticated write:** (`401`) login error
**Unauthorized write:** (`403`) forbidden

**The [type] placeholder in the below API responses behaves the same as the [type] placeholder in the above table and paragraphs.** No instance of [type] in a string or as part of a path is actually implemented as [type], but is instead repeated one of the following: `note`, `vehicle`, or `area`.

Corrupted images can be uploaded and retrieved, the end user is responsible for uploading valid files.

### Read [type]Images (`GET /vehicle-t3/[type]image`)

**Success:** (`200`): the next batch of at most `3` `[type]Images`, sorted by the most recent `date`. `offset` is the number of `[type]Images` already retrieved. Missing `offset` -> `offset` defaults to `0`. Fewer than `3` `[type]Images` in the array means that batch is the last one. `[]` means no `[type]Images` remain. `offset` greater than number of existing entries -> return error saying `Fewer than [offset] [type] images exist` (where [offset] is whatever value is passed as the `offset`)

`GET /vehicle-t3/[type]images?offset=12`

```json
[
  {
    "id": 4,
    "image": 0x89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE0000000C4944415408D763F8CFC000000301010018DD8DB00000000049454E44AE426082,
    "date": 2026-11-09,
    "[type]_id": 5
  },
  {
    "id": 3,
    "image": 0x89504E470D0A1A0A0000000D4048445200000001000000010802000000907753DE0000000C4944415408D763F8CFC000000301010008DDFFB00123000050454E44AE426082,
    "date": 2026-11-08,
    "[type]_id": 8
  },
  {
    "id": 2,
    "image": 0x89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE0000000C4944415408D763F8CFC000000301010018DD8DB00000000049454E44AE426082,
    "date": 2026-11-02,
    "[type]_id": 2
  }
]
```

`GET /vehicle-t3/images?offset=15` returns the next batch. The last batch is shorter than `3`:

```json
[
  {
    "id": 1,
    "image": 0x89504E400D0A1A0A000FFF0D4048445200000001000000010802111111907753DE0000000C4944415408D763F8CFC000000301010008DDFFB00123000050454E44AE426082,
    "date": 2026-10-30,
    "[type]_id": 1
  }
]
```

**Server error:** (`500`) `{ "message": "…" }`.

### Read [type]Image from id (`GET /vehicle-t3/[type]image/:id`)

**Success:** (`200`): `[type]image` details

(where `:id` is 3)

```json
{
  "id": 3,
  "image": 0x89504E400D0A1A0A000FFF0D4048445200000001000000010802111111907753DE0000000C4944415408D763F8CFC000000301010008DDFFB00123000050454E44AE426082,
  "date": 2026-10-30,
  "[type]_id": 8
}
```

**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

### Add [type]Image (`POST /vehicle-t3/[type]image/`)

**Request body:** (fields the add request sends):

```json
{
  "image": 0x89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE01230000C4944415408D763FFFFC000000301010018DD8DB00000000049454E44AE426082,
  "date": 2026-11-02,
  "[type]_id": 2
}
```

Missing `image` or `[type]_id` -> `400` bad request
Missing `date` -> try to extract image creation date from metadata.
No `date` to extract from metadata -> auto-fill `date` with the current date
Duplicate `image` and `[note]_id` (combined) -> `409` conflict.

**Server error:** (`500`) `{ "message": "…" }`.

### Read [type]Images from a [type] (`GET /vehicle-t3/[type]image/[type]/:[type]Id`)

**Success:** (`200`): array with all `images` belonging to that `request`

(where `:[type]Id` is `5`)

```json
[
  {
    "id": 9,
    "image": 0x89504E47078A1A0A0000000D4948445200000001000000010123456780907753DE0000000C4944415401D763F8CFC000000301010018DD8DB00000000049454E44AE426082,
    "date": 2026-11-12,
    "[type]_id": 5
  },
  {
    "id": 7,
    "image": 0x89504E470D0A1A0A0000000D4048445200000001000000010802000000907753DE0000000C4944415408D763F8CFC000000301010008DABCDEFGABCDEFG0454E44AE426082,
    "date": 2026-11-10,
    "[type]_id": 5
  }
]
```

**Not found:** (`404`) `{ "message": "This [type] <:[type]Id> doesn't have any images" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Remove all [type]Images from [type] (`DELETE /vehicle-t3/[type]image/[type]/:[type]Id`)

**Success:** (`204`)
**Unauthorized:** (`403`) Forbidden
**Not found:** (`404`) `{ "message": "This [type] <:[type]Id> doesn't have any images" }`
**Server error:** (`500`) `{ "message": "…" }`.

### Remove all [type]Images with id (`DELETE /vehicle-t3/[type]image/:id`)

**Success:** (`204`)
**Unauthorized:** (`403`) Forbidden
**Not found:** (`404`)
**Server error:** (`500`) `{ "message": "…" }`.

Quoted messages that tests must match if no other message is specified:

| Situation        | Status | `message`                                                                           |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `GET` success    | 200    | <response from GET>                                                                 |
| `PUT` recognized | 403    | `PUT and overwriting requests are not allowed to image entries`                     |
| `POST` success   | 201    | `New image created with id=<id>`                                                    |
| `DELETE` success | 204    | <empty response>                                                                    |
| Bad Request      | 400    | `Malformed request. Please make sure everything in the form is properly formatted!` |
| Login Error      | 401    | `Please sign in. If you think this is a mistake, contact your system administrator` |
| Forbidden        | 403    | `Please contact a system administrator for assistance.`                             |
| Not Found        | 404    | `No image was found for id=<id>`                                                    |
| Conflict         | 409    | `Image with these details already exists!`                                          |

---

## Screen Requirements [RESUME HERE WHEN CONTINUING]

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

### ImagesContainer Component

- Container: tonal <v-card> w/ dashed outline
- Heading: [in center of card]
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

### ImagesDetails Component

The `Image` Form contains the following information:

- Container: <v->
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

### ImagesBox Component

The `Image` Form contains the following information:

- Container: <v-card>
- Heading: [no header]
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

**Implementation image:** no page or frontend-route for `Images`; `Images` dialogs are child components or inline `<v-dialog>` blocks in other views, embedded unless the team splits presentational dialogs later.

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

**Implementation image:** no page or frontend-route for `Images`; `Images` dialogs are child components or inline `<v-dialog>` blocks in other views, embedded unless the team splits presentational dialogs later.

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
