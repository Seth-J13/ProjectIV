# Feature: Area

**Feature ID:** 3
**Branch pattern:** `feature/3-area`
**Status:** Draft
**Created:** 2026-11-11
**Input:** An admin needs to create, read, update, and delete areas. An area is the record formerly called a department.
**Depends on:** [Feature 1 — User Auth & Session Management](feature-1-User-Auth-&-Session-Management.md)

---

## User Stories

### US-3.1: Create an area

**As an** admin
**I want to** create an area with a name and a notice email
**So that** vehicles and destinations can belong to that area

**Priority:** P1
**Independent test:** Sign in as admin, save an area with a unique name and a notice email, and see that area on the list.
**Acceptance scenarios:** see ### US-3.1 under Acceptance Criteria

### US-3.2: Read areas

**As an** admin
**I want to** view every area
**So that** I can see the name and notice email for each area

**Priority:** P1
**Independent test:** Sign in as admin, open Areas, and see the name and notice email of an existing area.
**Acceptance scenarios:** see ### US-3.2 under Acceptance Criteria

### US-3.3: Update an area

**As an** admin
**I want to** change an area’s name or notice email
**So that** the directory stays correct

**Priority:** P1
**Independent test:** Sign in as admin, change an area’s notice email, and see the saved notice email on the list.
**Acceptance scenarios:** see ### US-3.3 under Acceptance Criteria

### US-3.4: Delete an area

**As an** admin
**I want to** delete an area that nothing still uses
**So that** deleted areas leave the directory

**Priority:** P2
**Independent test:** Sign in as admin, delete an area that no vehicle or destination references, and that area is gone from the list.
**Acceptance scenarios:** see ### US-3.4 under Acceptance Criteria

### US-3.5: Block other roles

**As the** application
**I want to** refuse area changes from anyone who is not an admin
**So that** only an admin maintains the area directory

**Priority:** P1
**Independent test:** Sign in as maintenance, driver, or user and open `/areas`. The area list is not shown.
**Acceptance scenarios:** see ### US-3.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: An admin MUST be able to create an area.
- **FR-002**: An area MUST contain a unique `name` of at most 30 characters and a `noticeEmail`. `logo` is optional.
- **FR-003**: An admin MUST be able to list every area and open one area by id.
- **FR-004**: An admin MUST be able to update an area’s `name`, `noticeEmail`, and `logo`.
- **FR-005**: An admin MUST be able to delete an area that no vehicle and no destination references.
- **FR-006**: A delete MUST fail when a vehicle or a destination still references that area, and the area MUST remain.
- **FR-007**: Creating an area with a name that already exists MUST return **409** with message **"Area name already in use!"** and MUST NOT create a second row.
- **FR-008**: A missing `name` or `noticeEmail` MUST return **400** with message **"Area is incomplete!"**.
- **FR-009**: Roles `user`, `driver`, and `maintenance` MUST receive **403** with message **"Forbidden"** on every area route.
- **FR-010**: An admin requesting an unknown area id MUST receive **404** with message **"Area not found!"**.

---

## Assumptions

- Feature 1 auth is already specified. The caller is signed in and has a role.
- Roles are `user`, `driver`, `maintenance`, and `admin`.
- This feature owns the **Area** record from the ERD (the renamed Department): `id`, `name`, `logo`, `notice_email`.
- A vehicle stores `area_id`, and a destination stores `area_id`. This feature does not create vehicles or destinations.
- The **Areas** menu entry is added by this feature and is visible only to `admin`.

---

## Edge Cases

- Blank name or notice email on create or update → **400** `"Area is incomplete!"`
- Duplicate area name → **409** `"Area name already in use!"`
- Unknown area id → **404** `"Area not found!"`
- `user`, `driver`, or `maintenance` calls an area route or opens `/areas` → **403** `"Forbidden"`
- Delete an area that a vehicle or destination still references → **409** `"Area is in use!"` and the area remains
- Missing or expired token → **401**, handled by Feature 1

---

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: An admin can create an area and see it on the list with its name and notice email.
- **SC-003**: An admin can read the area list.
- **SC-004**: An admin can update an area and the list shows the saved values.
- **SC-005**: An admin can delete an unused area and it disappears from the list.
- **SC-006**: A maintenance user, a driver, and a user cannot use the area directory.

---

## Data Ownership & Isolation

Areas are organization records, not private user rows. Only an admin may create, read, update, or delete them.


| Rule | Requirement |
| ---- | ----------- |
| **Read scope** | Role `admin` may list every area and open any area by id. |
| **Create scope** | Role `admin` may insert one area. The name must be unique. |
| **Write scope** | Role `admin` may update or delete an area by id. |
| **Other roles** | Roles `user`, `driver`, and `maintenance` receive **403** and do not see **Areas**. |
| **Unknown area** | An admin asking for a missing area id receives **404**. |
| **Delete guard** | An area referenced by a vehicle or a destination is not deleted. |


## API Requirements


| Method | Endpoint | Auth | Purpose |
| ------ | -------- | ---- | ------- |
| `POST` | `/api/areas` | Bearer, `admin` | Create an area |
| `GET` | `/api/areas` | Bearer, `admin` | List areas |
| `GET` | `/api/areas/:id` | Bearer, `admin` | Read one area |
| `PUT` | `/api/areas/:id` | Bearer, `admin` | Update an area |
| `DELETE` | `/api/areas/:id` | Bearer, `admin` | Delete an unused area |


**Create and update body:**

```json
{
  "name": "North Campus",
  "noticeEmail": "north@example.com"
}
```

`logo` may be omitted. `name` is the ERD column `name` (`varchar(30)`, unique). `noticeEmail` is the ERD column `notice_email`.

**Success response** (`201` on create, `200` on read and update):

```json
{
  "id": 1,
  "name": "North Campus",
  "noticeEmail": "north@example.com",
  "logo": null
}
```

**Delete success:** `{ "message": "Area deleted." }`

**Error response:** `{ "message": "Human-readable explanation." }`

Quoted messages that tests must match:


| Situation | Status | `message` |
| --------- | ------ | --------- |
| Missing or expired token | 401 | `Unauthorized` |
| Role is `user`, `driver`, or `maintenance` | 403 | `Forbidden` |
| Unknown area id | 404 | `Area not found!` |
| Name already used | 409 | `Area name already in use!` |
| Area still referenced | 409 | `Area is in use!` |
| Name or notice email missing | 400 | `Area is incomplete!` |


---

## Key Entities

- **Area**: the organization unit formerly called Department. It has a unique name, an optional logo, and a notice email. A vehicle and a destination may point at one area.
- **User**: the signed-in account from Feature 1. Only role `admin` uses this feature.

---

## Screen Requirements

### [View: Areas] — route name `areas` (`/areas`)

- Shown only to `admin`
- Heading: **Areas**
- Table columns: **Name**, **Notice email**
- An empty list still shows the heading and **Create area**
- **Create area** opens a dialog with **Name** and **Notice email** (both required). **Logo** is optional
- Opening a row shows **Save** and **Delete**
- **Save** writes the edited fields and the list shows the saved values
- **Delete** removes the row when the area is unused
- **Error:** shows the API `message`, including **"Area is incomplete!"**, **"Area name already in use!"**, **"Area is in use!"**, and **"Area not found!"**

### App chrome

- `admin` sees **Areas**, which opens `areas`
- `user`, `driver`, and `maintenance` do not see **Areas**. Opening `/areas` directly shows no areas

---

## Data Model Requirements

This feature **owns** `areas`. It does not create `area_images`, `vehicles`, or `destinations`.

### `areas` table


| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment. ERD `id` |
| `name` | STRING(30) | Required, unique. ERD `name` |
| `logo` | BLOB | Optional. ERD `logo` |
| `noticeEmail` | STRING(255) | Required. ERD `notice_email` |


### Associations

- `Vehicle` belongsTo `Area` through `areaId` (owned by the vehicle feature)
- `Destination` belongsTo `Area` through `areaId` (owned by the destination feature)
- `Area` hasMany `AreaImage` (owned by a later feature)

---

## Acceptance Criteria (Gherkin)

### US-3.1 — Create an area

#### Scenario: Admin creates an area

- **Given** I am signed in as `admin`
- **When** I open **Areas** and press **Create area**
- **And** I enter a name and a notice email
- **And** I save
- **Then** the list shows that area with that name and notice email

#### Scenario: Duplicate area name

- **Given** I am signed in as `admin`
- **And** an area already has the name **"North Campus"**
- **When** I create another area named **"North Campus"**
- **Then** I see **"Area name already in use!"**
- **And** a second area is not created

#### Scenario: Blank area

- **Given** I am signed in as `admin`
- **When** I press **Create area** and save with the name or notice email empty
- **Then** I see **"Area is incomplete!"**
- **And** no area is added

### US-3.2 — Read areas

#### Scenario: Admin reads the list

- **Given** I am signed in as `admin`
- **And** an area exists
- **When** I open **Areas**
- **Then** I see that area’s name and notice email

### US-3.3 — Update an area

#### Scenario: Admin updates an area

- **Given** I am signed in as `admin`
- **And** an area exists
- **When** I change the notice email and save
- **Then** the list shows the new notice email

### US-3.4 — Delete an area

#### Scenario: Admin deletes an unused area

- **Given** I am signed in as `admin`
- **And** an area exists that no vehicle and no destination references
- **When** I delete that area
- **Then** it does not appear on the list

#### Scenario: Area still in use

- **Given** I am signed in as `admin`
- **And** a vehicle or a destination references an area
- **When** I delete that area
- **Then** I see **"Area is in use!"**
- **And** the area remains on the list

### US-3.5 — Block other roles

#### Scenario: Maintenance cannot open areas

- **Given** I am signed in as `maintenance`
- **When** I go to `/areas`
- **Then** I do not see the area list

#### Scenario: Driver cannot open areas

- **Given** I am signed in as `driver`
- **When** I go to `/areas`
- **Then** I do not see the area list

---

## Test Coverage Map

Each scenario above must map to at least one automated test.


| Story | Scenario | Test file | Test name |
| ----- | -------- | --------- | --------- |
| US-3.1 | Admin creates an area | `frontend/tests/Area.test.js` | `it("Admin creates an area")` |
| US-3.1 | Duplicate area name | `backend/tests/area.test.js` | `it("Duplicate area name")` |
| US-3.1 | Blank area | `backend/tests/area.test.js` | `it("Blank area")` |
| US-3.2 | Admin reads the list | `frontend/tests/Area.test.js` | `it("Admin reads the list")` |
| US-3.3 | Admin updates an area | `frontend/tests/Area.test.js` | `it("Admin updates an area")` |
| US-3.4 | Admin deletes an unused area | `backend/tests/area.test.js` | `it("Admin deletes an unused area")` |
| US-3.4 | Area still in use | `backend/tests/area.test.js` | `it("Area still in use")` |
| US-3.5 | Maintenance cannot open areas | `frontend/tests/Area.test.js` | `it("Maintenance cannot open areas")` |
| US-3.5 | Driver cannot open areas | `frontend/tests/Area.test.js` | `it("Driver cannot open areas")` |


## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 3 from @features/feature-3-departmentCRUD.md on branch `feature/3-area`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior listed under Out of Scope.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

## Definition of Done

- [ ] Backend and frontend implemented per this spec (**FR-00N** satisfied)
- [ ] **Success Criteria (SC-00N)** met
- [ ] All mapped tests pass (`npm test`)
- [ ] Test Coverage Map complete
- [ ] Test traceability (file headers, nested `describe` / `it`, audit commands in this spec)
- [ ] `features/reference/data-model.md` updated (if schema changed)
- [ ] `features/reference/api.md` updated (if API changed)
- [ ] `features/reference/behavior.md` updated (if product rules changed)

---

## Out of Scope

- Area images (`area_images`: image, date, and `area_id`)
- Creating, editing, or listing vehicles and destinations
- Vehicle service logs, requests, notes, and maintenance specifications
- Login, create account, logout, and the landing-page placeholder
- Password reset, email verification, profile editing, and Google sign-in
