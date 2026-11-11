# Feature: User Management

**Feature ID:** 3
**Branch pattern:** `feature/3-user-management`
**Status:** Ready
**Created:** 2026-10-29
**Input:** An admin can open a user management page to view and edit user data.
**Depends on:**

- [Feature 1 — User Auth & Session Management](./feature-1-User-Auth-&-Session-Management.md)
- [Feature 2 — Google Auth](./feature-2-Google-Auth.md)

---

## User Stories

<<<<<<< HEAD:features/feature-13-User-Management.md
### US-13.1: View users
=======


### US-3.1: View users
>>>>>>> 9b20d21cf674d0398a8f715ca6271cfeb43c9244:features/feature-3-User-Management.md

**As an** admin
**I want to** open a user management page and see each account's data
**So that** I can tell who has an account and what role they have

**Priority:** P1
**Independent test:** Sign in as an admin, open `/users`, and see every account's first name, last name, email, and role, with no password.
**Acceptance scenarios:** see ### US-3.1 under Acceptance Criteria

### US-3.2: Edit user data

**As an** admin
**I want to** change a user's name, email, and role
**So that** account data stays correct

**Priority:** P1
**Independent test:** From `/users`, edit one user and confirm the list shows the new first name, last name, email, and role.
**Acceptance scenarios:** see ### US-3.2 under Acceptance Criteria

### US-3.3: Keep the page admin-only

**As a** user who is not an admin
**I want** user management to stay closed
**So that** I cannot view or change someone else's account

**Priority:** P1
**Independent test:** Sign in as a non-admin and confirm `/users` is not available and the user APIs reject the call.
**Acceptance scenarios:** see ### US-3.3 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: A signed-in user with role `admin` MUST be able to open route `/users` (route name `users`). The page heading MUST be **User Management**.
- **FR-002**: MenuBar MUST show a **User Management** link only when the signed-in user's role is `admin`. That link navigates to `/users`.
- **FR-003**: The page MUST list every user. Each row MUST show `firstName`, `lastName`, `email`, and `role`. The list MUST be ordered by `lastName` A–Z.
- **FR-004**: User data shown or returned by this feature MUST be only `id`, `firstName`, `lastName`, `email`, and `role`. Responses and the page MUST NOT include `password`, `googleSub`, a session token, or any other credential.
- **FR-005**: An admin MUST be able to edit one user's `firstName`, `lastName`, `email`, and `role` from this page. Role MUST be one of `user`, `driver`, `maintenance`, or `admin`. Save MUST stay on `/users` and the list MUST show the saved values.
- **FR-006**: Editable fields are required. An empty first name, last name, or email, or a role outside the four allowed values, MUST return **400** and MUST NOT change the user.
- **FR-007**: Saving an email that already belongs to a different user MUST return **409** with message **"Email already in use!"** and MUST NOT change the user.
- **FR-008**: An admin MUST NOT change their own role. That request MUST return **400** with message **"You cannot change your own role."** and MUST leave the role unchanged. The same admin MAY still update their own first name, last name, and email.
- **FR-009**: This feature MUST NOT set or clear `password` or `googleSub`, and MUST NOT create or delete a user or a session. Changing `email` MUST update that user's `sessions.email` values and MUST leave session tokens valid.
- **FR-010**: A signed-in user whose role is `user`, `driver`, or `maintenance` MUST NOT see **User Management**. Opening `/users` MUST redirect them to `/landing`. User APIs MUST return **403** with message **"Admin access required."** and MUST NOT return or change user rows.
- **FR-011**: A missing or expired Bearer token on a user API MUST return **401**. The frontend MUST clear the session and redirect to Login, the same as Feature 1.
- **FR-012**: An unknown user id on edit MUST return **404** with message **"User with id={id} not found."** and MUST NOT change any user.

---

## Assumptions

- Feature 1 is already available: email/password sign-in, sessions, `localStorage` `user` (including `role`), MenuBar, and `/landing`.
- Roles remain `user`, `driver`, `maintenance`, and `admin`. At least one admin account already exists.
- This feature reads and updates the Feature 1 `users` table. It does not replace Login, Create Account, or Logout.
- Accounts created by [Feature 2](./feature-2-Google-Auth.md) may have a null password and a `googleSub`. This page still lists and edits their name, email, and role, and does not show or change `googleSub` or password.
- "User data" in this feature means the account fields above. It does not mean vehicles, maintenance records, or registration requests.

---

## Edge Cases

- Non-admin opens `/users` -> redirect to `/landing`; no user list is shown
- Non-admin calls a user API -> **403** `"Admin access required."`; no rows returned or changed
- Missing or expired Bearer token -> **401**; frontend clears `user` and redirects to Login
- Empty first name, last name, or email -> **400**; user unchanged
- Role other than `user`, `driver`, `maintenance`, or `admin` -> **400**; user unchanged
- Email already used by another account -> **409** `"Email already in use!"`; user unchanged
- Admin changes their own role -> **400** `"You cannot change your own role."`; role unchanged
- Unknown user id -> **404** `"User with id={id} not found."`
- Edit does not include a password and does not return one

---

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: An admin can open `/users` and see every account's first name, last name, email, and role.
- **SC-003**: An admin can edit those fields, and the list shows the saved values.
- **SC-004**: A user, driver, or maintenance account cannot open the page or change user data.
- **SC-005**: Passwords, Google subjects, and session tokens are never shown or returned.

---

## Data Ownership & Isolation

Feature 3 lets an admin read and update account fields for any user. It does not reveal credentials or another user's session.

| Rule                  | Requirement                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | An admin may list every user. Each record is `id`, `firstName`, `lastName`, `email`, and `role` only.                              |
| **Write scope**       | An admin may update those fields on any user. The admin's own role cannot be changed. `password` and `googleSub` stay as they are. |
| **Create scope**      | This feature does not insert users, sessions, vehicles, or requests.                                                               |
| **Cross-user access** | A non-admin receives **403** and no user data. A missing user id returns **404**. Passwords and tokens are never returned.         |
| **UI scope**          | **User Management** is visible and reachable only for role `admin`. `/landing` is unchanged for every other role.                  |

---

## Key Entities

- **User**: Feature 1 account. This feature lists and edits first name, last name, email, and role. Password and Google subject stay hidden.
- **Session**: Feature 1 record. This feature does not list or delete sessions. An email change updates the matching `sessions.email` values and keeps the token.

---

## API Requirements

| Method | Endpoint         | Auth                        | Purpose                                 |
| ------ | ---------------- | --------------------------- | --------------------------------------- |
| `GET`  | `/api/users`     | Yes (`Bearer` token, admin) | List every user's account fields        |
| `PUT`  | `/api/users/:id` | Yes (`Bearer` token, admin) | Update one user's name, email, and role |

**List success:** a JSON array, no envelope, ordered by `lastName` A–Z. Example item:

```json
{
  "id": 1,
  "firstName": "Danny",
  "lastName": "Devito",
  "email": "DDevito@example.com",
  "role": "user"
}
```

**Update request body:**

```json
{
  "firstName": "Danny",
  "lastName": "Devito",
  "email": "DDevito@example.com",
  "role": "driver"
}
```

**Update success:** the same flat user object as a list item, with the saved values. Status **200**.

**Error response:** `{ "message": "Human-readable explanation." }`

Quoted messages that tests must match:

| Situation                             | Status | `message`                          |
| ------------------------------------- | ------ | ---------------------------------- |
| Signed in, role is not `admin`        | 403    | `Admin access required.`           |
| Email already belongs to another user | 409    | `Email already in use!`            |
| Admin changes their own role          | 400    | `You cannot change your own role.` |
| User id does not exist                | 404    | `User with id={id} not found.`     |

Missing or expired Bearer token remains Feature 1 **401**.

---

## Screen Requirements

### [View: User Management] — route name `users` (`/users`)

- Heading: **User Management**
- Shown only to a signed-in admin
- One row per user, ordered by `lastName` A–Z, with **First name**, **Last name**, **Email**, and **Role**
- No password field, password value, token, or Google subject
- Each row has **Edit**, which opens a dialog filled with that user's current values
- Dialog fields: **First name**, **Last name**, **Email**, and **Role** (choices `user`, `driver`, `maintenance`, `admin`)
- Dialog primary action: **Save**
- **Cancel** closes the dialog and does not save
- **Save success:** snackbar **"User updated."**, dialog closes, the list shows the new values, and the route stays `users`
- **Error:** show the API `message` (including **"Email already in use!"** and **"You cannot change your own role."**) and keep the dialog open

### App chrome — `MenuBar`

- When `role` is `admin`: show **User Management**, which navigates to route `users`
- When `role` is `user`, `driver`, or `maintenance`: do not show **User Management**
- Logout stays as specified in Feature 1

### Other routes

- A signed-in non-admin who opens `/users` is redirected to `/landing`
- A visitor with no session who opens `/users` is redirected to Login

---

## Data Model Requirements

This feature does **not** add tables or columns. It uses `users` and `sessions` from Feature 1.

### Fields this feature may change

| Field       | Rules                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `firstName` | Required on update                                                                             |
| `lastName`  | Required on update                                                                             |
| `email`     | Required, unique. Also written to that user's `sessions.email`                                 |
| `role`      | Required; `user`, `driver`, `maintenance`, or `admin`. The caller's own role cannot be changed |

`password` and `googleSub` are not accepted in the update body and are not modified.

### Associations

- Unchanged from Feature 1: `User` hasMany `Session`, `Session` belongsTo `User`.

---

## Acceptance Criteria (Gherkin)

<<<<<<< HEAD:features/feature-13-User-Management.md
### US-13.1 — View users
=======


### US-3.1 — View users
>>>>>>> 9b20d21cf674d0398a8f715ca6271cfeb43c9244:features/feature-3-User-Management.md

#### Scenario: Admin opens user management

- **Given** I am signed in as an admin
- **And** at least one other account exists
- **When** I open **User Management**
- **Then** I land on `/users`
- **And** I see each account's first name, last name, email, and role
- **And** I do not see a password

#### Scenario: Refresh user management

- **Given** I am signed in as an admin on `/users`
- **When** I refresh the page
- **Then** I remain on `/users`
- **And** I still see each account's first name, last name, email, and role

<<<<<<< HEAD:features/feature-13-User-Management.md
### US-13.2 — Edit user data
=======


### US-3.2 — Edit user data
>>>>>>> 9b20d21cf674d0398a8f715ca6271cfeb43c9244:features/feature-3-User-Management.md

#### Scenario: Admin edits a user

- **Given** I am signed in as an admin on `/users`
- **And** another account is listed
- **When** I press **Edit** on that account
- **And** I change the first name, last name, email, and role
- **And** I press **Save**
- **Then** I see **"User updated."**
- **And** the list shows the new first name, last name, email, and role
- **And** I remain on `/users`

#### Scenario: Email already in use

- **Given** I am signed in as an admin
- **And** two accounts exist with different emails
- **When** I save the first account with the second account's email
- **Then** the response is **409** with message **"Email already in use!"**
- **And** the first account is unchanged

#### Scenario: Admin cannot change own role

- **Given** I am signed in as an admin
- **When** I save my own account with a role other than `admin`
- **Then** the response is **400** with message **"You cannot change your own role."**
- **And** my role is still `admin`

<<<<<<< HEAD:features/feature-13-User-Management.md
### US-13.3 — Keep the page admin-only
=======


### US-3.3 — Keep the page admin-only
>>>>>>> 9b20d21cf674d0398a8f715ca6271cfeb43c9244:features/feature-3-User-Management.md

#### Scenario: Non-admin cannot open user management

- **Given** I am signed in with a role other than `admin`
- **Then** I do not see **User Management**
- **When** I open `/users`
- **Then** I am redirected to `/landing`
- **And** I do not see the user list

#### Scenario: Non-admin cannot edit a user

- **Given** I am signed in with a role other than `admin`
- **And** another account exists
- **When** I update that account through the user API
- **Then** the response is **403** with message **"Admin access required."**
- **And** that account is unchanged

#### Scenario: Missing session cannot view users

- **Given** I have no session token
- **When** I request the user list
- **Then** the response is **401**
- **And** no user data is returned

---

## Test Coverage Map

Each scenario above must map to at least one automated test.

| Story   | Scenario                              | Test file                               | Test name                                     |
| ------- | ------------------------------------- | --------------------------------------- | --------------------------------------------- |
| US-3.1 | Admin opens user management           | `frontend/tests/UserManagement.test.js` | `it("Admin opens user management")`           |
| US-3.1 | Refresh user management               | `frontend/tests/UserManagement.test.js` | `it("Refresh user management")`               |
| US-3.2 | Admin edits a user                    | `frontend/tests/UserManagement.test.js` | `it("Admin edits a user")`                    |
| US-3.2 | Email already in use                  | `backend/tests/users.test.js`           | `it("Email already in use")`                  |
| US-3.2 | Admin cannot change own role          | `backend/tests/users.test.js`           | `it("Admin cannot change own role")`          |
| US-3.3 | Non-admin cannot open user management | `frontend/tests/UserManagement.test.js` | `it("Non-admin cannot open user management")` |
| US-3.3 | Non-admin cannot edit a user          | `backend/tests/users.test.js`           | `it("Non-admin cannot edit a user")`          |
| US-3.3 | Missing session cannot view users     | `backend/tests/users.test.js`           | `it("Missing session cannot view users")`     |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 3 from @features/feature-3-User-Management.md on branch `feature/3-user-management`.

Follow layer order in @features/framework.md (models -> routes -> backend tests -> frontend -> frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior listed under Out of Scope.
Leave Feature 1 login, create account, logout, and /landing behavior in place.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/behavior.md`

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

- Creating accounts (Feature 1 **Create Account** and Feature 2 **Continue with Google**)
- Deleting users
- Setting, resetting, or viewing passwords
- Showing or editing `googleSub`
- Listing, revoking, or deleting sessions, other than keeping `sessions.email` in sync when an email changes
- Vehicle records and registration requests
- A user editing their own account from a non-admin profile screen
- Changing `/landing` content by role
