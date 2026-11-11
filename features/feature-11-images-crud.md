# Feature: Images CRUD

**Feature ID:** 11
**Branch pattern:** `feature/11-images-crud`
**Status:** Draft
**Created:** 2026-11-06
**Updated:** 2026-11-11
**Input:** Application must support the creation, reading, and deleting of images paired with different tables in the application to assist in understanding data entities.
**Depends on:** [Feature 1 -- User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md), [Feature 2 -- Google Auth](feature-2-Google-Auth.md), [Feature 3 -- User Management](feature-3-User-Management.md), [Feature 8 -- Requests CRUD](feature-8-requests-crud.md), [Feature 9 -- Notes CRUD](feature-9-note-crud.md), [Feature 13 -- Area CRUD](feature-13-Area-CRUD.md)
**Related:** `frontend/src/views/Vehicles.vue`, `frontend/src/views/Maintenance.vue`, `frontend/src/views/Landing.vue`, `frontend/src/views/Areas.vue`, `frontend/src/components/NoteForm.vue`, `frontend/src/components/AreaForm.vue`, `frontend/src/components/ImagesContainer.vue`, `frontend/src/components/ImagesDetails.vue`, `frontend/src/components/ImagesBox.vue`, `frontend/src/components/ImagesTooltip.vue`, `frontend/src/components/RequestForm.vue`, `backend/app/models/noteImage.js`, `backend/app/models/vehicleImage.js`, `backend/app/models/areaImage.js`, `backend/app/controllers/noteImageController.js`, `backend/app/controllers/vehicleImageController.js`, `backend/app/controllers/areaImageController.js`, `backend/app/routes/noteImageRoutes.js`, `backend/app/routes/vehicleImageRoutes.js`, `backend/app/routes/areaImageRoutes.js`, `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js`, `frontend/tests/ImageForm.test.js`

---

## User Stories

(note for AC's: max image size is `25` Megabytes; convert to `png` and compress a file over `10` Megabytes to less than `10` Megabytes before storing the blob)

### US-11.1: See VehicleImage on Vehicle listings

**As an** authenticated user with the `admin` or `maintenance` role
**I want to** see every `VehicleImage` attached to a `vehicle`
**So that** I know which `vehicle` I'm looking at.

**Priority:** P1
**Independent test:** On `Vehicles.vue`, hover a `vehicle` list item for `1` second and an `ImagesTooltip` shows that vehicle's first `VehicleImage` with a thick white border, stays open when the cursor moves onto it, and follows the cursor horizontally but not vertically; pressing the tooltip opens a modal whose `ImagesDetails` lists that vehicle's `VehicleImages`, and pressing **X** or outside the modal closes it.
**Acceptance scenarios:** see ### US-11.1 under Acceptance Criteria

### US-11.2: Create VehicleImage on Vehicle listings

**As an** authenticated user with the `admin` or `maintenance` role
**I want to** add more than one `VehicleImage` to a `vehicle`
**So that** I can help others know what `vehicle` they're looking at.

**Priority:** P1
**Independent test:** On `Maintenance.vue`, dragging an allowed image under `25` Megabytes onto the **Vehicle Images** `ImagesContainer` appends a `VehicleImage` with that vehicle's `vehicle_id` after converting it to `png`; pressing inside the container but not on an image offers **From Cloud** and **From Computer**.
**Acceptance scenarios:** see ### US-11.2 under Acceptance Criteria

### US-11.3: Delete VehicleImage on Vehicle listings

**As an** authenticated user with the `admin` or `maintenance` role
**I want to** remove a `VehicleImage` from a `vehicle`
**So that** I can replace incorrect `VehicleImages`.

**Priority:** P1
**Independent test:** On `Maintenance.vue`, the **X** on a `VehicleImage` inside the **Vehicle Images** `ImagesContainer` colors what is beneath it in negative color, and pressing it `DELETE`s that image only and refreshes the grid without a page reload; pressing **X** on the expanded image closes the overlay.
**Acceptance scenarios:** see ### US-11.3 under Acceptance Criteria

### US-11.4: See NoteImage on Note details

**As an** authenticated user
**I want to** see every `NoteImage` attached to a `note`
**So that** I know more information about the note I'm looking at.

**Priority:** P1
**Independent test:** In `NoteForm.vue` in **Add** or **Edit** mode, **Drop or Upload Image Here** shows a grid of `ImagesDetails` for `NoteImages` with that `note`'s `note_id`; pressing **Image Content** opens an expanded overlay with that image's `date`, and pressing outside it or **X** closes the overlay.
**Acceptance scenarios:** see ### US-11.4 under Acceptance Criteria

### US-11.5: Create NoteImage on Note details

**As an** authenticated user
**I want to** add more than one `NoteImage` to a `note`
**So that** I can give others more information about the note.

**Priority:** P1
**Independent test:** In `NoteForm.vue` in **Add** or **Edit** mode, dragging a `png`/`apng`, `jpg`/`jpeg`, `tiff`/`tif`, `avif`, `webp`, or `bmp` under `25` Megabytes into **Drop or Upload Image Here** appends a `NoteImage` with that `note`'s `note_id`; pressing inside the container but not on an image offers **From Cloud** and **From Computer**.
**Acceptance scenarios:** see ### US-11.5 under Acceptance Criteria

### US-11.6: Delete NoteImage on Note

**As an** authenticated user
**I want to** remove a `NoteImage` from a `note` according to my role permissions
**So that** I can replace incorrect `NoteImages`.

**Priority:** P1
**Independent test:** In `NoteForm.vue` in **Add** or **Edit** mode, **X** on a `NoteImage` inside `ImagesContainer` colors what is beneath it in negative color; pressing **X** `DELETE`s that `NoteImage` only and the grid refreshes without a page reload.
**Acceptance scenarios:** see ### US-11.6 under Acceptance Criteria

### US-11.7: See VehicleImage on Request Form

**As an** authenticated user filling out the `RequestForm.vue` component
**I want to** see the `VehicleImage` of my selected `vehicle`
**So that** I know I've selected the correct `vehicle`.

**Priority:** P1
**Independent test:** On `Landing.vue`, select a `vehicle` in `RequestForm.vue` and an `ImagesBox` titled **Image(s)** shows an `ImagesDetails` of that vehicle's `VehicleImages`; **<** and **>** step through those images, and no control in the box sends a `DELETE`.
**Acceptance scenarios:** see ### US-11.7 under Acceptance Criteria

### US-11.8: See AreaImage on Area listings

**As an** authenticated user with the `admin` or `maintenance` role
**I want to** see every `AreaImage` attached to an `area`
**So that** I know which `area` I'm looking at.

**Priority:** P1
**Independent test:** On `Areas.vue`, hover an `area` list item for `1` second and an `ImagesTooltip` shows that area's first `AreaImage` with a thick white border, stays open when the cursor moves onto it, and follows the cursor horizontally but not vertically; pressing the tooltip opens a modal whose `ImagesDetails` lists that area's `AreaImages`, and pressing **X** or outside the modal closes it.
**Acceptance scenarios:** see ### US-11.8 under Acceptance Criteria

### US-11.9: Create AreaImage on Area listings

**As an** authenticated user with the `admin` or `maintenance` role
**I want to** add more than one `AreaImage` to an `area`
**So that** I can help others know what `area` they're looking at.

**Priority:** P1
**Independent test:** In `AreaForm.vue` in **Add** or **Edit** mode, dragging a `png`/`apng`, `jpg`/`jpeg`, `tiff`/`tif`, `avif`, `webp`, or `bmp` under `25` Megabytes into **Drop or Upload Image Here** appends an `AreaImage` with that `area`'s `area_id`; pressing inside the container but not on an image offers **From Cloud** and **From Computer**.
**Acceptance scenarios:** see ### US-11.9 under Acceptance Criteria

### US-11.10: Delete AreaImage on Area listings

**As an** authenticated user with the `admin` or `maintenance` role
**I want to** remove an `AreaImage` from an `area`
**So that** I can replace incorrect `AreaImages`.

**Priority:** P1
**Independent test:** In `AreaForm.vue` in **Add** or **Edit** mode, **X** on an `AreaImage` inside `ImagesContainer` colors what is beneath it in negative color; pressing **X** `DELETE`s that `AreaImage` only and the grid refreshes without a page reload.
**Acceptance scenarios:** see ### US-11.10 under Acceptance Criteria

### US-11.11: See AreaImage on Request Form

**As an** authenticated user filling out the `RequestForm.vue` component
**I want to** see the `AreaImage` of my selected `area`
**So that** I know I've selected the correct `area`.

**Priority:** P1
**Independent test:** On `RequestForm.vue`, select an `area` and an `ImagesBox` titled **Image(s)** shows an `ImagesDetails` of that area's `AreaImages`; **<** and **>** step through those images, and no control in the box sends a `DELETE`.
**Acceptance scenarios:** see ### US-11.11 under Acceptance Criteria

---

## Requirements

### Functional Requirements

**FR-001**: Any authenticated user **MUST** be allowed to Create, Read, and Delete `NoteImages` on `notes` they are making or that they created. An authenticated `maintenance` user **MUST** also be allowed to Delete a `NoteImage` on a `note` marked as a maintenance request.
**FR-002**: An authenticated `admin` **MUST** be allowed to Create, Read, and Delete every image. This feature has no update operation.
**FR-003**: An authenticated `admin` or `maintenance` user **MUST** be able to `POST` and `DELETE` `VehicleImages` from `Maintenance.vue` and `AreaImages` from `AreaForm.vue`. Any authenticated user **MUST** be able to `POST` `NoteImages` from `NoteForm.vue` on a `note` they are making or that they created.
**FR-004**: Any authenticated user **MUST** be allowed to reach all `GET` endpoints on any image table.
**FR-005**: The `ImagesContainer` component **MUST** provide methods for authenticated users to Create, Read, and Delete to and from the image table associated with the form it's embedded in.
**FR-006**: Displaying an error inside a create or delete dialog **MUST NOT** close the dialog.
**FR-007**: The application **MUST** convert all uploaded images into `png` format and compress it so it is less than `10` Megabytes.
**FR-008**: The application **MUST** accept these MIME types only: `png`/`apng`, `jpg`/`jpeg`, `tiff`/`tif`, `avif`, `webp`, or `bmp`.
**FR-009**: The application **MUST NOT** have a whole view dedicated to Images CRUD.
**FR-010**: The application **MUST** reject all `PUT` requests, authenticated or not.
**FR-011**: The application **MUST NOT** accept file uploads of more than `25` Megabytes.

---

## Assumptions

- Features 1, 2, 3, 8, 9, and 13 are already on `dev`

## Edge Cases

- POST images with the exact same `image` and `[type]_id` -> `409`
- no `images` exist -> don't render orphaned images
- DELETE `[type]` with attached `[type]Images` -> CASCADE DELETE so attached `[type]Images` are deleted too
- Corrupted data in `[type]Image` entry -> `ImagesContainer` and `ImagesDetails` still show attempt to render image

## Success Criteria

**SC-001**: Every Gherkin scenario has at least one automated test before merge
**SC-002**: Any authenticated user can Read every image table and can Create `NoteImages` on `notes` they are making or created. An `admin` or `maintenance` user can Create `VehicleImages` and `AreaImages`.
**SC-003**: A `user` or `driver` can Delete only `NoteImages` on `notes` they created.
**SC-004**: A `maintenance` user can Delete `NoteImages` they created or `NoteImages` on a maintenance request, and can Delete `VehicleImages` and `AreaImages`.
**SC-005**: Admin users can Delete from all image tables.
**SC-006**: npm test passes for `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js`, `frontend/tests/ImageForm.test.js`

---

## Data Ownership & Isolation

Each image is owned by its parent. A `NoteImage` is owned by a `note`, a `VehicleImage` by a `vehicle`, and an `AreaImage` by an `area`.

| Rule                  | Requirement                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | Any authenticated user can (`GET /vehicle-t3/[type]image`,`GET /vehicle-t3/[type]image/:id`,`GET /vehicle-t3/[type]image/[type]/:[type]Id`).                                                                                                                                                                                                                     |
| **Write scope**       | All overwriting requests are automatically rejected. Images must be deleted and re-uploaded to correct wrong data                                                                                                                                                                                                                                                |
| **Create scope**      | `POST /vehicle-t3/[type]image/` is sent from `ImagesContainer.vue`. A `VehicleImage` or `AreaImage` create is limited to an `admin` or `maintenance` user. A `NoteImage` create is limited to a `note` the user is making or created. The same `[type]_id` and `image` combined returns `409`.                                                                   |
| **Delete scope**      | `DELETE /vehicle-t3/[type]image/:id` and `DELETE /vehicle-t3/[type]image/[type]/:[type]Id`. A `user` or `driver` may delete `NoteImages` only on `notes` they created. A `maintenance` user may delete `NoteImages` they created or `NoteImages` on a maintenance request, and may delete `VehicleImages` and `AreaImages`. An `admin` may delete **any** image. |
| **Cross-user access** | Image responses may not include any user data.                                                                                                                                                                                                                                                                                                                   |
| **UI scope**          | `ImagesContainer.vue`, `ImagesBox.vue`, and `ImagesDetails.vue` are embedded on other components. `ImagesTooltip.vue` is embedded in another screen. They show images sorted by most recent `date`. This feature has no dedicated images page.                                                                                                                   |

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

**Success:** (`200`): the next batch of at most `3` `[type]Images`, sorted by the most recent `date`. `offset` is the number of `[type]Images` already retrieved. Missing `offset` -> `offset` defaults to `0`. Fewer than `3` `[type]Images` in the array means that batch is the last one. `[]` means no `[type]Images` remain. `offset` greater than the number of existing entries -> `400` `{ "message": "Fewer than [offset] [type] images exist" }` (where `[offset]` is the `offset` value)

`GET /vehicle-t3/[type]image?offset=12`

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

`GET /vehicle-t3/[type]image?offset=15` returns the next batch. The last batch is shorter than `3`:

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

**Not found:** (`404`) `{ "message": "No image was found for id=<id>" }`
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

**Success:** (`201`) `{ "message": "New image created with id=<id>" }`
Missing `image` or `[type]_id` -> `400` bad request
Missing `date` -> try to extract image creation date from metadata.
No `date` to extract from metadata -> auto-fill `date` with the current date
Duplicate `image` and `[type]_id` (combined) -> `409` conflict.

**Server error:** (`500`) `{ "message": "…" }`.

### Read [type]Images from a [type] (`GET /vehicle-t3/[type]image/[type]/:[type]Id`)

**Success:** (`200`): array of every image belonging to that `[type]`, sorted by the most recent `date`

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

### Remove one [type]Image (`DELETE /vehicle-t3/[type]image/:id`)

**Success:** (`204`)
**Unauthorized:** (`403`) Forbidden
**Not found:** (`404`) `{ "message": "No image was found for id=<id>" }`
**Server error:** (`500`) `{ "message": "…" }`.

Quoted messages that tests must match if no other message is specified:

| Situation        | Status | `message`                                                                           |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `GET` success    | 200    |                                                                                     |
| `PUT` recognized | 403    | `PUT and overwriting requests are not allowed to image entries`                     |
| `POST` success   | 201    | `New image created with id=<id>`                                                    |
| `DELETE` success | 204    |                                                                                     |
| Bad Request      | 400    | `Malformed request. Please make sure everything in the form is properly formatted!` |
| Login Error      | 401    | `Please sign in. If you think this is a mistake, contact your system administrator` |
| Forbidden        | 403    | `Please contact a system administrator for assistance.`                             |
| Not Found        | 404    | `No image was found for id=<id>`                                                    |
| Conflict         | 409    | `Image with these details already exists!`                                          |

---

## Screen Requirements

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

imagesTooltip shows on hover with list items
imagesBox shows after selecting list item on forms.
imagesDetails contained inside imagesContainer and imagesBox

### ImagesContainer Component

- Container: tonal w/ dashed outline
- Heading: [in center of card]
- Primary action: **Drop or Upload Image Here** inside container. **ImagesDetails** components each containing their own image associated with the viewed entity displayed in a grid inside container. Use class `oc-cta` on whole container (per [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc)).
- Dragging an image file into the container auto `POST`s a new `[type]Image` entry based on where the component is embedded.
- Pressing inside container (but not in an image) presents two options.
  - **From Cloud** -- w/ `oc-cta` class. Include **Google OAuth integration** for authentication. Modal has tabbed interface for **Google Drive**, **Dropbox**, and **OneDrive**, with a file browser for selection. Support drag-and-drop for local files, validate **file size** and **type** according to **FR-008** and **FR-011**, and allow multiple file uploads with a progress bar. Use slots for UI customization and ensure the modal has proper focus trapping and accessibility. Pressing outside this dialog emphasizes the dialog, requiring to hit an `X` in the top-right corner to close it.
  - **From Computer** -- System file-picker dialog. Validate **file size** and **type** according to **FR-008** and **FR-011**, and allow multiple file uploads. Ensure the system dialog has proper focus trapping and accessibility.
- Empty state in **ImagesContainer**: **Drop or Upload Image Here**
- Loading state: skeleton or progress indicator while images are fetching.
- Error state: `<v-alert type="error">` for API failures.

**Implementation Notes:**

- Grid **ImagesDetails** components are separated by about `25`px of space horizontally and `25`px of space vertically.
- Grid expands vertically downward when horizontal row limit is reached (dependent on space inside container).
- Overflow requires scroll bar.
- uploaded images are converted to `png`
- an uploaded image larger than `10` Megabytes is compressed to less than `10` Megabytes before it is stored as a blob

### ImagesDetails Component

- Container: w/ dashed outline
- Heading: [when expanded, show date of currently-viewed image above expanded image]
- Primary action: Press left arrow and right arrow to navigate through list of images inside component. Press on image to expand it in center of screen. Press `X` on expanded image (or press outside it) to close. Use class `oc-cta` on whole container (per [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc)).
- Wrap `[type]Images` in a L/R navigable list. The items below hold no text, labels are just the names of the elements:
  - **Image Content** -- The image rendered inside the square container; clicking on **Image Content** opens a larger modal overlaying the screen with an expanded version of the selected `[type]Image`. Remove options from context menu related to saving the image.
  - **X** -- An `X` in the top-right corner of each image container coloring anything beneath it in negative color so it contrasts strongly and is easy to find. Only shown on expanded images or **if** the parent **ImagesDetails** component is embedded in an entity's creation/editing form/modal. Pressing this on the expanded `[type]Image` modal closes that modal. Pressing this on an image inside the **Image Content** sends a `DELETE` request for that image **only** if this component is embedded in an **ImagesContainer** on the entity's edit/add form/page (for example, `NoteImages` on `NoteForm.vue` in **Add** or **Edit** mode, `VehicleImages` on `Maintenance.vue`, and `AreaImages` on `AreaForm.vue`).
  - **<** -- A `<` vertical-center and horizontal-left of each expanded image coloring anything beneath it in negative color so it contrasts strongly and is easy to find. Pressing this navigates to the previous image in the list (unless it's the 0th index).
  - **>** -- A `>` vertical-center and horizontal-right of each expanded image coloring anything beneath it in negative color so it contrasts strongly and is easy to find. Pressing this navigates to the next image in the list (unless it's the final index).

- Empty state in **ImagesDetails**: **No images**
- Loading state: skeleton or progress indicator while images are fetching.
- Error state: `<v-alert type="error">` for API failures.

### ImagesBox Component

- Container: <v-card>
- Heading: **Image(s)**
- Primary action: Wrap an **ImagesDetails** component containing all images associated with the item this component is embedded in (or referencing). Dashed lines border. Use class `oc-cta` (per [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc)).

**Implementation Note:** This component wraps **ImagesDetails**, but **ImagesDetails** should still be interactable inside it. This is because **ImagesDetails**'s behavior changes depending on what it's embedded inside of. **ImagesDetails** should not allow users to `DELETE` anything when embedded inside **ImagesBox**

### ImagesTooltip Component

- Container: tooltip: <v-tooltip>; modal: <v-card>
- Heading: [no header]
- Primary action: Hover over a `vehicle` or `area` list item for `1` second to show that item's first image in a small but visible tooltip with a thick white border. The tooltip remains open if the cursor moves onto it, and it follows the cursor horizontally but not vertically. Use class `oc-cta` (per [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc)).
- Pressing the tooltip opens a modal containing an **ImagesDetails** component that lists every image associated with that item.
  - Pressing outside modal closes modal
  - Pressing on `X` in top right of modal closes modal

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
| `vehicle_id` | INTEGER, FOREIGN KEY    | Required; references `Vehicles.vin`        |

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

### US-11.1: See VehicleImage on Vehicle listings

#### Scenario: Hover a vehicle listing

**Given** I am an authenticated user with the `admin` or `maintenance` role on `Vehicles.vue`
**When** I hover a `vehicle` list item for `1` second
**Then** an `ImagesTooltip` shows that vehicle's first `VehicleImage`
**And** the tooltip has a thick white border and class `oc-cta`
**And** the tooltip follows the cursor horizontally but not vertically
**And** moving the cursor onto the tooltip leaves it open.

#### Scenario: Press the vehicle image tooltip

**Given** the `ImagesTooltip` for a `vehicle` is open
**When** I press the tooltip
**Then** a modal opens whose `ImagesDetails` lists every `VehicleImage` for that `vehicle_id` from `GET /vehicle-t3/vehicleimage/vehicle/:vehicleId`
**And** pressing **Image Content** expands that image in the center of the screen with its `date` above it
**And** **<** shows the previous image unless this is the first image
**And** **>** shows the next image unless this is the last image
**And** the image context menu has no option to save the image
**And** the image list scrolls inside the modal instead of expanding the page.

#### Scenario: Close the vehicle image modal

**Given** the vehicle image modal is open
**When** I press outside the modal or I press **X** on the modal
**Then** the modal closes and no `VehicleImage` is deleted.

#### Scenario: Vehicle has no images

**Given** I am an authenticated user with the `admin` or `maintenance` role
**When** I `GET /vehicle-t3/vehicleimage/vehicle/:vehicleId` for a `vehicle` with no images
**Then** I receive `404` `{ "message": "This vehicle <:vehicleId> doesn't have any images" }`.

### US-11.2: Create VehicleImage on Vehicle listings

#### Scenario: Drag a valid image onto Vehicle Images

**Given** I am an authenticated user with the `admin` or `maintenance` role viewing the **Vehicle Images** `ImagesContainer` on `Maintenance.vue`
**When** I drag a `png`/`apng`, `jpg`/`jpeg`, `tiff`/`tif`, `avif`, `webp`, or `bmp` under `25` Megabytes into the container
**Then** a `POST /vehicle-t3/vehicleimage/` is sent
**And** I receive `201` `{ "message": "New image created with id=<id>" }`
**And** the stored image is `png` and is attached with that vehicle's `vehicle_id`
**And** an image larger than `10` Megabytes is compressed to less than `10` Megabytes before it is stored
**And** a missing `date` is taken from the image metadata, or from today's date when the metadata has none
**And** the grid reloads without a page reload.

#### Scenario: Press inside the Vehicle Images container

**Given** I am viewing the **Vehicle Images** `ImagesContainer`
**When** I press inside the container but not on an image
**Then** I see **From Cloud** and **From Computer**
**And** **From Cloud** has class `oc-cta`.

#### Scenario: Upload from the cloud

**Given** the **From Cloud** dialog is open
**When** I choose one or more allowed files from **Google Drive**, **Dropbox**, or **OneDrive**
**Then** each file is checked against the allowed types and the `25` Megabyte limit
**And** a progress bar shows the uploads
**And** a valid file is `POST`ed to `/vehicle-t3/vehicleimage/`
**And** pressing outside the dialog emphasizes it
**And** pressing **X** in the top-right of the dialog closes it.

#### Scenario: Upload from the computer

**Given** I pressed **From Computer**
**When** I choose one or more allowed files in the system file picker
**Then** each file is checked against the allowed types and the `25` Megabyte limit
**And** a valid file is `POST`ed to `/vehicle-t3/vehicleimage/`.

#### Scenario: Reject an invalid vehicle image

**Given** I am choosing a file for the **Vehicle Images** `ImagesContainer`
**When** the file is over `25` Megabytes or is not an allowed type
**Then** I see a `<v-alert type="error">`
**And** no `POST` is sent
**And** the upload dialog stays open.

#### Scenario: Duplicate vehicle image

**Given** a `VehicleImage` already exists with an `image` and `vehicle_id`
**When** I send a `POST /vehicle-t3/vehicleimage/` with that same `image` and `vehicle_id`
**Then** I receive `409` `{ "message": "Image with these details already exists!" }`.

#### Scenario: Vehicle image request is missing a required field

**Given** I am authenticated and the vehicle image is missing `image` or `vehicle_id`
**When** I send a `POST /vehicle-t3/vehicleimage/`
**Then** I receive `400` `{ "message": "Malformed request. Please make sure everything in the form is properly formatted!" }`.

#### Scenario: Signed out user uploads a vehicle image

**Given** I am an unauthenticated user
**When** I send a `POST /vehicle-t3/vehicleimage/`
**Then** I receive `401` `{ "message": "Please sign in. If you think this is a mistake, contact your system administrator" }`.

#### Scenario: Overwrite a vehicle image

**Given** I am an authenticated user
**When** I send a `PUT` request for a `VehicleImage`
**Then** I receive `403` `{ "message": "PUT and overwriting requests are not allowed to image entries" }`.

### US-11.3: Delete VehicleImage on Vehicle listings

#### Scenario: Show delete on a vehicle image

**Given** I am an authenticated user with the `admin` or `maintenance` role viewing a `VehicleImage` inside the **Vehicle Images** `ImagesContainer` on `Maintenance.vue`
**When** the image is shown
**Then** **X** appears in its top-right corner and colors what is beneath it in negative color.

#### Scenario: Delete one vehicle image

**Given** **X** is shown on a `VehicleImage` inside that `ImagesContainer`
**When** I press **X**
**Then** a `DELETE /vehicle-t3/vehicleimage/:id` is sent for that image only
**And** I receive `204` with an empty body
**And** that image is gone from the grid
**And** the grid refreshes without a page reload.

#### Scenario: Close an expanded vehicle image

**Given** a `VehicleImage` is expanded
**When** I press **X** on the expanded image or I press outside it
**Then** the overlay closes and no `DELETE` is sent.

#### Scenario: Admin deletes any vehicle image

**Given** I am an authenticated user with the `admin` role
**When** I `DELETE /vehicle-t3/vehicleimage/:id` for a `VehicleImage` I did not create
**Then** I receive `204` with an empty body.

#### Scenario: Signed out user deletes a vehicle image

**Given** I am an unauthenticated user
**When** I send a `DELETE /vehicle-t3/vehicleimage/:id`
**Then** I receive `401` `{ "message": "Please sign in. If you think this is a mistake, contact your system administrator" }`.

#### Scenario: Delete a missing vehicle image

**Given** I am an authenticated user with the `admin` or `maintenance` role
**When** I `DELETE /vehicle-t3/vehicleimage/:id` and no image has that `id`
**Then** I receive `404` `{ "message": "No image was found for id=<id>" }`.

### US-11.4: See NoteImage on Note details

#### Scenario: Note form shows its images

**Given** I am an authenticated user viewing `NoteForm.vue` in **Add** or **Edit** mode
**When** the note has `NoteImages`
**Then** **Drop or Upload Image Here** shows a grid of `ImagesDetails` for `NoteImages` with that `note`'s `note_id`
**And** the grid items are about `25`px apart
**And** the grid scrolls inside the container instead of expanding the page
**And** the images come from `GET /vehicle-t3/noteimage/note/:noteId`.

#### Scenario: Expand a note image

**Given** a `NoteImage` is shown in that grid
**When** I press **Image Content**
**Then** the image expands in the center of the screen with its `date` above it
**And** **<** and **>** move through that note's images and stop at the first and last image
**And** the image context menu has no option to save the image.

#### Scenario: Close an expanded note image

**Given** a `NoteImage` is expanded
**When** I press outside the overlay or I press **X** on the expanded image
**Then** the overlay closes and no `DELETE` is sent.

#### Scenario: Note has no images

**Given** I am viewing `NoteForm.vue` for a `note` with no `NoteImages`
**When** the container finishes loading
**Then** the `ImagesContainer` shows **Drop or Upload Image Here**
**And** `ImagesDetails` shows **No images**
**And** `GET /vehicle-t3/noteimage/note/:noteId` returns `404` `{ "message": "This note <:noteId> doesn't have any images" }`.

### US-11.5: Create NoteImage on Note details

#### Scenario: Drag a valid image onto a note

**Given** I am an authenticated user viewing `NoteForm.vue` in **Add** or **Edit** mode for a `note` I am creating or that I created
**When** I drag a `png`/`apng`, `jpg`/`jpeg`, `tiff`/`tif`, `avif`, `webp`, or `bmp` under `25` Megabytes into **Drop or Upload Image Here**
**Then** a `POST /vehicle-t3/noteimage/` is sent
**And** I receive `201` `{ "message": "New image created with id=<id>" }`
**And** the stored image is `png` and is attached with that note's `note_id`
**And** an image larger than `10` Megabytes is compressed to less than `10` Megabytes before it is stored
**And** the grid reloads without a page reload.

#### Scenario: Press inside the note image container

**Given** I am viewing the note's `ImagesContainer`
**When** I press inside the container but not on an image
**Then** I see **From Cloud** and **From Computer**.

#### Scenario: Reject an invalid note image

**Given** I am choosing a file for the note's `ImagesContainer`
**When** the file is over `25` Megabytes or is not an allowed type
**Then** I see a `<v-alert type="error">`
**And** no `POST` is sent
**And** the upload dialog stays open.

#### Scenario: Duplicate note image

**Given** a `NoteImage` already exists with an `image` and `note_id`
**When** I send a `POST /vehicle-t3/noteimage/` with that same `image` and `note_id`
**Then** I receive `409` `{ "message": "Image with these details already exists!" }`.

#### Scenario: Note image request is missing a required field

**Given** I am authenticated and the note image is missing `image` or `note_id`
**When** I send a `POST /vehicle-t3/noteimage/`
**Then** I receive `400` `{ "message": "Malformed request. Please make sure everything in the form is properly formatted!" }`.

#### Scenario: Signed out user uploads a note image

**Given** I am an unauthenticated user
**When** I send a `POST /vehicle-t3/noteimage/`
**Then** I receive `401` `{ "message": "Please sign in. If you think this is a mistake, contact your system administrator" }`.

#### Scenario: Overwrite a note image

**Given** I am an authenticated user
**When** I send a `PUT` request for a `NoteImage`
**Then** I receive `403` `{ "message": "PUT and overwriting requests are not allowed to image entries" }`.

### US-11.6: Delete NoteImage on Note

#### Scenario: Delete a note image from the note form

**Given** I am an authenticated user viewing `NoteForm.vue` in **Add** or **Edit** mode for a `note` I am creating or that I created
**When** I press **X** on a `NoteImage` inside the `ImagesContainer`
**Then** **X** colors what is beneath it in negative color
**And** a `DELETE /vehicle-t3/noteimage/:id` is sent for that image only
**And** I receive `204` with an empty body
**And** the grid refreshes without a page reload.

#### Scenario: User or driver deletes someone else's note image

**Given** I am an authenticated user with the `user` or `driver` role
**When** I `DELETE /vehicle-t3/noteimage/:id` for a `NoteImage` on a `note` I did not create
**Then** I receive `403` `{ "message": "Please contact a system administrator for assistance." }`.

#### Scenario: Maintenance deletes a note image

**Given** I am an authenticated user with the `maintenance` role
**When** I `DELETE /vehicle-t3/noteimage/:id` for a `NoteImage` I created or for a `NoteImage` on a maintenance request
**Then** I receive `204` with an empty body.

#### Scenario: Admin deletes any note image

**Given** I am an authenticated user with the `admin` role
**When** I `DELETE /vehicle-t3/noteimage/:id` for any `NoteImage`
**Then** I receive `204` with an empty body.

#### Scenario: Close an expanded note image without deleting

**Given** a `NoteImage` is expanded from `NoteForm.vue`
**When** I press **X** on the expanded image
**Then** the overlay closes and no `DELETE` is sent.

### US-11.7: See VehicleImage on Request Form

#### Scenario: Selected vehicle shows its images

**Given** I am an authenticated user on `Landing.vue` filling out `RequestForm.vue`
**When** I select a `vehicle`
**Then** an `ImagesBox` titled **Image(s)** shows an `ImagesDetails` of that vehicle's `VehicleImages`
**And** the images come from `GET /vehicle-t3/vehicleimage/vehicle/:vehicleId`
**And** pressing **Image Content** expands the image
**And** **<** and **>** step through that vehicle's images.

#### Scenario: Request form does not delete vehicle images

**Given** the `ImagesBox` for the selected `vehicle` is showing
**When** I press a control inside that box, including **X** on an expanded image
**Then** no `DELETE` is sent.

### US-11.8: See AreaImage on Area listings

#### Scenario: Hover an area listing

**Given** I am an authenticated user with the `admin` or `maintenance` role on `Areas.vue`
**When** I hover an `area` list item for `1` second
**Then** an `ImagesTooltip` shows that area's first `AreaImage`
**And** the tooltip has a thick white border and class `oc-cta`
**And** the tooltip follows the cursor horizontally but not vertically
**And** moving the cursor onto the tooltip leaves it open.

#### Scenario: Press the area image tooltip

**Given** the `ImagesTooltip` for an `area` is open
**When** I press the tooltip
**Then** a modal opens whose `ImagesDetails` lists every `AreaImage` for that `area_id` from `GET /vehicle-t3/areaimage/area/:areaId`
**And** pressing **Image Content** expands that image with its `date` above it
**And** **<** and **>** step through that area's images and stop at the first and last image.

#### Scenario: Close the area image modal

**Given** the area image modal is open
**When** I press outside the modal or I press **X** on the modal
**Then** the modal closes and no `AreaImage` is deleted.

#### Scenario: Area has no images

**Given** I am an authenticated user with the `admin` or `maintenance` role
**When** I `GET /vehicle-t3/areaimage/area/:areaId` for an `area` with no images
**Then** I receive `404` `{ "message": "This area <:areaId> doesn't have any images" }`.

### US-11.9: Create AreaImage on Area listings

#### Scenario: Drag a valid image onto an area

**Given** I am an authenticated user with the `admin` or `maintenance` role viewing `AreaForm.vue` in **Add** or **Edit** mode
**When** I drag a `png`/`apng`, `jpg`/`jpeg`, `tiff`/`tif`, `avif`, `webp`, or `bmp` under `25` Megabytes into **Drop or Upload Image Here**
**Then** a `POST /vehicle-t3/areaimage/` is sent
**And** I receive `201` `{ "message": "New image created with id=<id>" }`
**And** the stored image is `png` and is attached with that area's `area_id`
**And** an image larger than `10` Megabytes is compressed to less than `10` Megabytes before it is stored
**And** the grid reloads without a page reload.

#### Scenario: Press inside the area image container

**Given** I am viewing the area's `ImagesContainer`
**When** I press inside the container but not on an image
**Then** I see **From Cloud** and **From Computer**.

#### Scenario: Reject an invalid area image

**Given** I am choosing a file for the area's `ImagesContainer`
**When** the file is over `25` Megabytes or is not an allowed type
**Then** I see a `<v-alert type="error">`
**And** no `POST` is sent
**And** the upload dialog stays open.

#### Scenario: Duplicate area image

**Given** an `AreaImage` already exists with an `image` and `area_id`
**When** I send a `POST /vehicle-t3/areaimage/` with that same `image` and `area_id`
**Then** I receive `409` `{ "message": "Image with these details already exists!" }`.

#### Scenario: Signed out user uploads an area image

**Given** I am an unauthenticated user
**When** I send a `POST /vehicle-t3/areaimage/`
**Then** I receive `401` `{ "message": "Please sign in. If you think this is a mistake, contact your system administrator" }`.

#### Scenario: Overwrite an area image

**Given** I am an authenticated user
**When** I send a `PUT` request for an `AreaImage`
**Then** I receive `403` `{ "message": "PUT and overwriting requests are not allowed to image entries" }`.

### US-11.10: Delete AreaImage on Area listings

#### Scenario: Delete one area image

**Given** I am an authenticated user with the `admin` or `maintenance` role viewing `AreaForm.vue` in **Add** or **Edit** mode
**When** I press **X** on an `AreaImage` inside the `ImagesContainer`
**Then** **X** colors what is beneath it in negative color
**And** a `DELETE /vehicle-t3/areaimage/:id` is sent for that image only
**And** I receive `204` with an empty body
**And** the grid refreshes without a page reload.

#### Scenario: Close an expanded area image

**Given** an `AreaImage` is expanded from `AreaForm.vue`
**When** I press **X** on the expanded image or I press outside it
**Then** the overlay closes and no `DELETE` is sent.

#### Scenario: Admin deletes any area image

**Given** I am an authenticated user with the `admin` role
**When** I `DELETE /vehicle-t3/areaimage/:id` for an `AreaImage` I did not create
**Then** I receive `204` with an empty body.

#### Scenario: Signed out user deletes an area image

**Given** I am an unauthenticated user
**When** I send a `DELETE /vehicle-t3/areaimage/:id`
**Then** I receive `401` `{ "message": "Please sign in. If you think this is a mistake, contact your system administrator" }`.

### US-11.11: See AreaImage on Request Form

#### Scenario: Selected area shows its images

**Given** I am an authenticated user filling out `RequestForm.vue`
**When** I select an `area`
**Then** an `ImagesBox` titled **Image(s)** shows an `ImagesDetails` of that area's `AreaImages`
**And** the images come from `GET /vehicle-t3/areaimage/area/:areaId`
**And** pressing **Image Content** expands the image
**And** **<** and **>** step through that area's images.

#### Scenario: Request form does not delete area images

**Given** the `ImagesBox` for the selected `area` is showing
**When** I press a control inside that box, including **X** on an expanded image
**Then** no `DELETE` is sent.

---

## Test Coverage Map

Each scenario above must map to at least one automated test. `it` names must match the Gherkin **Scenario** titles exactly.

| Story    | Scenario                                          | Test file                                                           | Test name                                           |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| US-11.1  | Hover a vehicle listing                           | `frontend/tests/ImagesList.test.js`                                 | `Hover a vehicle listing`                           |
| US-11.1  | Press the vehicle image tooltip                   | `frontend/tests/ImagesList.test.js`                                 | `Press the vehicle image tooltip`                   |
| US-11.1  | Close the vehicle image modal                     | `frontend/tests/ImagesList.test.js`                                 | `Close the vehicle image modal`                     |
| US-11.1  | Vehicle has no images                             | `backend/tests/images.test.js`                                      | `Vehicle has no images`                             |
| US-11.2  | Drag a valid image onto Vehicle Images            | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Drag a valid image onto Vehicle Images`            |
| US-11.2  | Press inside the Vehicle Images container         | `frontend/tests/ImagesList.test.js`                                 | `Press inside the Vehicle Images container`         |
| US-11.2  | Upload from the cloud                             | `frontend/tests/ImagesList.test.js`                                 | `Upload from the cloud`                             |
| US-11.2  | Upload from the computer                          | `frontend/tests/ImagesList.test.js`                                 | `Upload from the computer`                          |
| US-11.2  | Reject an invalid vehicle image                   | `frontend/tests/ImageForm.test.js`                                  | `Reject an invalid vehicle image`                   |
| US-11.2  | Duplicate vehicle image                           | `backend/tests/images.test.js`                                      | `Duplicate vehicle image`                           |
| US-11.2  | Vehicle image request is missing a required field | `backend/tests/images.test.js`                                      | `Vehicle image request is missing a required field` |
| US-11.2  | Signed out user uploads a vehicle image           | `backend/tests/images.test.js`                                      | `Signed out user uploads a vehicle image`           |
| US-11.2  | Overwrite a vehicle image                         | `backend/tests/images.test.js`                                      | `Overwrite a vehicle image`                         |
| US-11.3  | Show delete on a vehicle image                    | `frontend/tests/ImagesList.test.js`                                 | `Show delete on a vehicle image`                    |
| US-11.3  | Delete one vehicle image                          | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Delete one vehicle image`                          |
| US-11.3  | Close an expanded vehicle image                   | `frontend/tests/ImagesList.test.js`                                 | `Close an expanded vehicle image`                   |
| US-11.3  | Admin deletes any vehicle image                   | `backend/tests/images.test.js`                                      | `Admin deletes any vehicle image`                   |
| US-11.3  | Signed out user deletes a vehicle image           | `backend/tests/images.test.js`                                      | `Signed out user deletes a vehicle image`           |
| US-11.3  | Delete a missing vehicle image                    | `backend/tests/images.test.js`                                      | `Delete a missing vehicle image`                    |
| US-11.4  | Note form shows its images                        | `frontend/tests/ImagesList.test.js`                                 | `Note form shows its images`                        |
| US-11.4  | Expand a note image                               | `frontend/tests/ImagesList.test.js`                                 | `Expand a note image`                               |
| US-11.4  | Close an expanded note image                      | `frontend/tests/ImagesList.test.js`                                 | `Close an expanded note image`                      |
| US-11.4  | Note has no images                                | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Note has no images`                                |
| US-11.5  | Drag a valid image onto a note                    | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Drag a valid image onto a note`                    |
| US-11.5  | Press inside the note image container             | `frontend/tests/ImagesList.test.js`                                 | `Press inside the note image container`             |
| US-11.5  | Reject an invalid note image                      | `frontend/tests/ImageForm.test.js`                                  | `Reject an invalid note image`                      |
| US-11.5  | Duplicate note image                              | `backend/tests/images.test.js`                                      | `Duplicate note image`                              |
| US-11.5  | Note image request is missing a required field    | `backend/tests/images.test.js`                                      | `Note image request is missing a required field`    |
| US-11.5  | Signed out user uploads a note image              | `backend/tests/images.test.js`                                      | `Signed out user uploads a note image`              |
| US-11.5  | Overwrite a note image                            | `backend/tests/images.test.js`                                      | `Overwrite a note image`                            |
| US-11.6  | Delete a note image from the note form            | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Delete a note image from the note form`            |
| US-11.6  | User or driver deletes someone else's note image  | `backend/tests/images.test.js`                                      | `User or driver deletes someone else's note image`  |
| US-11.6  | Maintenance deletes a note image                  | `backend/tests/images.test.js`                                      | `Maintenance deletes a note image`                  |
| US-11.6  | Admin deletes any note image                      | `backend/tests/images.test.js`                                      | `Admin deletes any note image`                      |
| US-11.6  | Close an expanded note image without deleting     | `frontend/tests/ImagesList.test.js`                                 | `Close an expanded note image without deleting`     |
| US-11.7  | Selected vehicle shows its images                 | `frontend/tests/ImagesList.test.js`                                 | `Selected vehicle shows its images`                 |
| US-11.7  | Request form does not delete vehicle images       | `frontend/tests/ImagesList.test.js`                                 | `Request form does not delete vehicle images`       |
| US-11.8  | Hover an area listing                             | `frontend/tests/ImagesList.test.js`                                 | `Hover an area listing`                             |
| US-11.8  | Press the area image tooltip                      | `frontend/tests/ImagesList.test.js`                                 | `Press the area image tooltip`                      |
| US-11.8  | Close the area image modal                        | `frontend/tests/ImagesList.test.js`                                 | `Close the area image modal`                        |
| US-11.8  | Area has no images                                | `backend/tests/images.test.js`                                      | `Area has no images`                                |
| US-11.9  | Drag a valid image onto an area                   | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Drag a valid image onto an area`                   |
| US-11.9  | Press inside the area image container             | `frontend/tests/ImagesList.test.js`                                 | `Press inside the area image container`             |
| US-11.9  | Reject an invalid area image                      | `frontend/tests/ImageForm.test.js`                                  | `Reject an invalid area image`                      |
| US-11.9  | Duplicate area image                              | `backend/tests/images.test.js`                                      | `Duplicate area image`                              |
| US-11.9  | Signed out user uploads an area image             | `backend/tests/images.test.js`                                      | `Signed out user uploads an area image`             |
| US-11.9  | Overwrite an area image                           | `backend/tests/images.test.js`                                      | `Overwrite an area image`                           |
| US-11.10 | Delete one area image                             | `backend/tests/images.test.js`, `frontend/tests/ImagesList.test.js` | `Delete one area image`                             |
| US-11.10 | Close an expanded area image                      | `frontend/tests/ImagesList.test.js`                                 | `Close an expanded area image`                      |
| US-11.10 | Admin deletes any area image                      | `backend/tests/images.test.js`                                      | `Admin deletes any area image`                      |
| US-11.10 | Signed out user deletes an area image             | `backend/tests/images.test.js`                                      | `Signed out user deletes an area image`             |
| US-11.11 | Selected area shows its images                    | `frontend/tests/ImagesList.test.js`                                 | `Selected area shows its images`                    |
| US-11.11 | Request form does not delete area images          | `frontend/tests/ImagesList.test.js`                                 | `Request form does not delete area images`          |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 11 from @features/feature-11-images-crud.md on branch `feature/11-images-crud`.

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

---

## Defer to Feature 12

- `Landing View` full functionality
