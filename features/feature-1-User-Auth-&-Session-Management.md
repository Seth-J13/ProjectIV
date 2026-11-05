# Feature: User Auth & Session Management

**Feature ID:** 1
**Branch pattern:** `feature/1-user-auth`
**Status:** Ready
**Created:** 2026-10-25 **Input:** A user can create an account, log in, stay signed in, and log out of the vehicle registration app.

---

## User Stories

### US-1.1: Sign in

**As a** not signed-in user
**I want to** press Login with a valid email and password
**So that** I reach a signed-in screen with an active session

**Priority:** P1
**Independent test:** Sign in with valid credentials, store `user` in `localStorage`, and see **"This feature has not been implemented yet"**.
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria

### US-1.2: Stay signed in across page loads

**As a** signed-in user
**I want** my session to persist when I open the signed-in screen and when I refresh it
**So that** I do not have to sign in again

**Priority:** P1
**Independent test:** With a valid `localStorage` session, open `/landing` and refresh — no re-login prompt, and the placeholder message is still shown.
**Acceptance scenarios:** see ### US-1.2 under Acceptance Criteria

### US-1.3: Sign out

**As a** signed-in user
**I want to** sign out
**So that** no one else can use my account on a shared device

**Priority:** P2
**Independent test:** Sign out clears the server session and `localStorage`; user lands on Login.
**Acceptance scenarios:** see ### US-1.3 under Acceptance Criteria

### US-1.4: Create account

**As a** not signed-in user
**I want to** be able to create an account
**So that** I can sign in

**Priority:** P1
**Independent test:** Press Create Account, fill credentials in the dialog, then confirm a session exists and the placeholder message is shown.
**Acceptance scenarios:** see ### US-1.4 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: Users MUST authenticate with **email** + **password** (not username login; not password-only).
- **FR-002**: Successful login MUST create a server session and return a token and `role`; the frontend MUST store the payload in `localStorage` under `user` and navigate to `/landing`.
- **FR-003**: A valid session MUST persist on `/landing` across refresh until expiry or logout. After refresh, the screen MUST still show **"This feature has not been implemented yet"**.
- **FR-004**: Logout MUST invalidate the current server session, clear `localStorage` `user`, and send the user to Login.
- **FR-005**: Unknown or unused email on login MUST return **401** with message **"User not found!"**.
- **FR-006**: Wrong password for an existing email MUST return **401** with message **"Invalid password!"**.
- **FR-007**: Missing or expired token on a protected API MUST return **401**; the frontend MUST clear the session and redirect to Login.
- **FR-008**: Create account MUST require first name, last name, email, and password; on success it MUST create that user with role `user`, start a session, store `user` in `localStorage`, and navigate to `/landing`.
- **FR-009**: Create account with an email that already exists MUST return **409** with message **"Email already in use!"** and MUST NOT start a session.
- **FR-010**: Every signed-in user MUST open the same route, `/landing`. That screen MUST show only the placeholder **"This feature has not been implemented yet"**. It MUST NOT change by role.

---

## Assumptions

- The vehicle registration app shell (Vue 3 frontend, Express API mounted at `/api`, MySQL) already exists in this repo.
- Login identifier is **email**, matching `users.email`.
- Roles are `user`, `driver`, `maintenance`, and `admin` (User, Driver, Maintenance, and Admin). Self-service create account always sets `user`. Driver, Maintenance, and Admin accounts already exist for sign-in tests; the dialog cannot choose a role.
- `/landing` is the only signed-in route. This feature does not implement the Landing Page. Every role sees the same placeholder there.

---

## Edge Cases

- Unknown email on login → **401** `"User not found!"`
- Wrong password on login → **401** `"Invalid password!"`
- Empty email or password on login → request blocked or **401** with a clear message
- Missing or expired Bearer token on protected API → **401**; frontend clears `user` and redirects to Login
- Duplicate email on create account → **409** `"Email already in use!"`; user stays on Login and is not signed in
- Empty required field on create account → request blocked with a clear message

---

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A user can log in with email and password and receive a session token.
- **SC-003**: A signed-in user can log out and is returned to Login with no remaining local session.
- **SC-004**: A valid session survives refresh of `/landing` until logout or expiry, and the placeholder message stays on screen.
- **SC-005**: A new user can create an account, land on `/landing` with a session, and see **"This feature has not been implemented yet"**.
- **SC-006**: A User, a Driver, a Maintenance account, and an Admin each land on `/landing` and see the same placeholder message.

---

## Data Ownership & Isolation

Feature 1 starts and ends the caller’s own session and creates only the caller’s own account. It does not return another user’s profile or token.


| Rule                  | Requirement                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | Login and create-account success return **only** the authenticating user’s profile fields and token.                                          |
| **Write scope**       | Login creates a `sessions` row for that user. Logout deletes **only** the caller’s current session.                                           |
| **Create scope**      | Create account inserts one `users` row and one `sessions` row for that new user. This feature does not create vehicle or request rows.        |
| **Cross-user access** | No endpoint in this feature returns another user’s password or session token.                                                                 |
| **UI scope**          | MenuBar shows the signed-in user’s initials, name, and email from `localStorage` `user`. `/landing` shows the same placeholder to every role. |
| **Later features**    | Vehicle and request APIs must never expose another user’s private vehicles or requests. Cross-user → `404` (not `403`).                       |


## API Requirements


| Method | Endpoint        | Auth                      | Purpose                               |
| ------ | --------------- | ------------------------- | ------------------------------------- |
| `POST` | `/api/register` | No                        | Create an account and a session       |
| `POST` | `/api/login`    | No (Basic email:password) | Sign in and create or reuse a session |
| `POST` | `/api/logout`   | Yes (`Bearer` token)      | End the caller’s current session      |


**Login:** `Authorization: Basic <base64(email:password)>`. JSON body is not required for credential check.

**Create account request body:**

```json
{
  "firstName": "Danny",
  "lastName": "Devito",
  "email": "DDevito@example.com",
  "password": "a-valid-password"
}
```

**Login and create-account success response** (flat JSON, no envelope; never include `password`):

```json
{
  "id": 1,
  "email": "DDevito@example.com",
  "firstName": "Danny",
  "lastName": "Devito",
  "role": "user",
  "token": "<session-token>"
}
```

**Logout success:** `{ "message": "Logged out successfully." }`

**Error response:** `{ "message": "Human-readable explanation." }`

Quoted messages that tests must match:


| Situation            | Status | `message`               |
| -------------------- | ------ | ----------------------- |
| Unknown email        | 401    | `User not found!`       |
| Wrong password       | 401    | `Invalid password!`     |
| Email already in use | 409    | `Email already in use!` |


---

## Key Entities

- **User**: account (first name, last name, email, password hash, role) created by this feature; used to verify credentials. Role is `user`, `driver`, `maintenance`, or `admin`. This feature stores `role` and does not render different screens from it.
- **Session**: server-side record tying a client `token` to a user; expires after 24 hours.

---

## Screen Requirements

### [View: Login] — route name `login` (`/`)

- Heading: **Login**
- Fields: **Email**, **Password** (both required)
- Primary action: **Login**
- **Create Account** opens a dialog on this screen (this feature)
- Dialog fields: **First name**, **Last name**, **Email**, **Password** (all required)
- Dialog primary action: **Create Account**
- **Error:** shows the API `message` (including **"User not found!"**, **"Invalid password!"**, and **"Email already in use!"**)
- **Login success:** store payload in `localStorage` `user`, snackbar **"Login successful!"**, navigate to route `landing`
- **Create-account success:** store payload in `localStorage` `user`, navigate to route `landing`

### [View: Placeholder] — route name `landing` (`/landing`)

- One route for every signed-in account, whether the role is `user`, `driver`, `maintenance`, or `admin`
- The only content is the text **"This feature has not been implemented yet"**
- Shown after login, after create account, and after refresh
- The Landing Page is not built on this route in this feature

### App chrome — `MenuBar`

- When signed in: avatar (initials from first + last name). Opening it shows name, email, and **Logout**
- **Logout** runs logout, then lands on `login`

---

## Data Model Requirements

This feature **owns** `users` and `sessions`.

### `users` table


| Field       | Type       | Rules                                                                             |
| ----------- | ---------- | --------------------------------------------------------------------------------- |
| `id`        | INTEGER PK | Auto-increment                                                                    |
| `firstName` | STRING     | Required                                                                          |
| `lastName`  | STRING     | Required                                                                          |
| `email`     | STRING     | Required, unique; login identifier                                                |
| `password`  | STRING     | Required; bcrypt hash only — never store plaintext                                |
| `role`      | STRING     | Required; `user`, `driver`, `maintenance`, or `admin`. Create account sets `user` |


### `sessions` table


| Field            | Type       | Rules                                          |
| ---------------- | ---------- | ---------------------------------------------- |
| `sessionId`      | INTEGER PK | Auto-increment                                 |
| `token`          | STRING     | Required, unique; value returned to the client |
| `email`          | STRING     | Required                                       |
| `expirationDate` | DATE       | Required; 24 hours from login                  |
| `userId`         | INTEGER FK | Required; references `users.id`                |


### Associations

- `User` hasMany `Session`
- `Session` belongsTo `User`

---

## Acceptance Criteria (Gherkin)

### US-1.1 — Sign in

#### Scenario: Admin signs in

- **Given** I am on the Login page
- **And** an account exists with role `admin`
- **When** I enter that email and password and press Login
- **Then** I am signed in
- **And** I land on `/landing`
- **And** I see **"This feature has not been implemented yet"**

#### Scenario: User signs in

- **Given** I am on the Login page
- **And** an account exists with role `user`
- **When** I enter that email and password and press Login
- **Then** I am signed in
- **And** I land on `/landing`
- **And** I see **"This feature has not been implemented yet"**

#### Scenario: Driver signs in

- **Given** I am on the Login page
- **And** an account exists with role `driver`
- **When** I enter that email and password and press Login
- **Then** I am signed in
- **And** I land on `/landing`
- **And** I see **"This feature has not been implemented yet"**

#### Scenario: Maintenance signs in

- **Given** I am on the Login page
- **And** an account exists with role `maintenance`
- **When** I enter that email and password and press Login
- **Then** I am signed in
- **And** I land on `/landing`
- **And** I see **"This feature has not been implemented yet"**

#### Scenario: Bad email

- **Given** I am on the Login page
- **When** I fill out an unused or wrong email and a password
- **And** I press **Login**
- **Then** I see the message **"User not found!"**
- **And** I remain on Login
- **And** I am not signed in

#### Scenario: Bad password

- **Given** I am on the Login page
- **When** I fill out an existing email and an invalid password
- **And** I press **Login**
- **Then** I see the message **"Invalid password!"**
- **And** I remain on Login
- **And** I am not signed in

### US-1.2 — Stay signed in across page loads

#### Scenario: Opening the signed-in screen

- **Given** I have a valid session
- **When** I open `/landing`
- **Then** I remain logged in
- **And** I see **"This feature has not been implemented yet"**

#### Scenario: Refresh pages

- **Given** I have a valid session on `/landing`
- **When** I refresh the page
- **Then** I remain logged in
- **And** I do not have to sign in again
- **And** I see **"This feature has not been implemented yet"**

### US-1.3 — Sign out

#### Scenario: Logging out

- **Given** I have a valid session
- **When** I press the profile circle
- **And** I click **Logout**
- **Then** I am logged out of the user session
- **And** I am redirected to the Login page

### US-1.4 — Create account

#### Scenario: Creating new account

- **Given** I am on the Login page
- **When** I press the **Create Account** button
- **And** I fill all textboxes
- **And** I click **Create Account**
- **Then** I am logged into the new account
- **And** that account has role `user`
- **And** I am redirected to `/landing`
- **And** I see **"This feature has not been implemented yet"**

#### Scenario: Email already in use

- **Given** I am on the Login page
- **And** an account already exists with an email
- **When** I press **Create Account**
- **And** I submit that same email with a first name, last name, and password
- **Then** I see the message **"Email already in use!"**
- **And** I remain on Login
- **And** I am not signed in

---

## Test Coverage Map

Each scenario above must map to at least one automated test.


| Story  | Scenario                     | Test file                      | Test name                            |
| ------ | ---------------------------- | ------------------------------ | ------------------------------------ |
| US-1.1 | Admin signs in               | `frontend/tests/Login.test.js` | `it("Admin signs in")`               |
| US-1.1 | User signs in                | `frontend/tests/Login.test.js` | `it("User signs in")`                |
| US-1.1 | Driver signs in              | `frontend/tests/Login.test.js` | `it("Driver signs in")`              |
| US-1.1 | Maintenance signs in         | `frontend/tests/Login.test.js` | `it("Maintenance signs in")`         |
| US-1.1 | Bad email                    | `backend/tests/auth.test.js`   | `it("Bad email")`                    |
| US-1.1 | Bad password                 | `backend/tests/auth.test.js`   | `it("Bad password")`                 |
| US-1.2 | Opening the signed-in screen | `frontend/tests/Login.test.js` | `it("Opening the signed-in screen")` |
| US-1.2 | Refresh pages                | `frontend/tests/Login.test.js` | `it("Refresh pages")`                |
| US-1.3 | Logging out                  | `backend/tests/auth.test.js`   | `it("Logging out")`                  |
| US-1.4 | Creating new account         | `frontend/tests/Login.test.js` | `it("Creating new account")`         |
| US-1.4 | Email already in use         | `backend/tests/auth.test.js`   | `it("Email already in use")`         |


## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 1 from @features/feature-1-User-Auth-&-Session-Management.md on branch `feature/1-user-auth`.

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

- Vehicle records: create, edit, delete, and listing real vehicle data
- Registration requests: create, edit, delete, and listing real request data
- Admin directory of users or sessions, and any admin-only user or session API
- The Landing Page, including any content that changes by role
- Separate routes per role, including `/requests`, `/vehicles`, and an enrollments page
- Choosing `driver`, `maintenance`, or `admin` from the Create Account dialog
- Password reset, email verification, and profile editing
- Google sign-in ([Feature 2](./feature-2-Google-Auth.md))

