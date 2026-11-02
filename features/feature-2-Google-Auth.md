# Feature: Google Auth

**Feature ID:** 2
**Branch pattern:** `feature/2-google-auth`
**Status:** Ready
**Created:** 2026-10-27
**Input:** On the Login screen, a user can press Continue with Google so Google authenticates them and keeps their sign-in data, then this app starts the same kind of session as email login.
**Depends on:** [Feature 1 — User Auth & Session Management](./feature-1-User-Auth-&-Session-Management.md)

---

## User Stories

### US-2.1: Continue with Google

**As a** not signed-in user
**I want to** press **Continue with Google** on the Login screen
**So that** Google authenticates me, keeps my sign-in data, and I reach the signed-in screen with a session

**Priority:** P1
**Independent test:** Press **Continue with Google**, complete a verified Google confirmation, store `user` in `localStorage` with no password and no Google token, and see **"This feature has not been implemented yet"** on `/landing`.
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: Sign in again with the same Google account

**As a** user who already continued with Google
**I want to** press **Continue with Google** again
**So that** I get a session on the same account

**Priority:** P1
**Independent test:** Continue with Google for an existing `googleSub` and confirm one user row, a session token, and `/landing`.
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: Keep email/password accounts separate

**As a** user who already has an email and password account
**I want** Google sign-in to leave that account alone
**So that** another sign-in method cannot take over my account

**Priority:** P1
**Independent test:** Continue with Google using an email that already has a password and confirm **409** **"Email already in use!"** with no session and no change to that user.
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Stay signed out when Google does not confirm

**As a** not signed-in user
**I want to** remain on Login if I cancel Google or Google does not confirm me
**So that** I am signed in only after Google authentication succeeds

**Priority:** P2
**Independent test:** Cancel the Google prompt, or submit a token Google does not verify, and confirm the user stays on Login with no `user` in `localStorage`.
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria

### US-2.5: Authorize protected routes

**As a** user signed in with Google
**I want** protected backend routes to accept my session and reject a caller with no session
**So that** Google sign-in is what unlocks those routes

**Priority:** P1
**Independent test:** `POST /api/logout` with the Google session Bearer token succeeds; the same route with no Bearer token returns **401**.
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

---



## Requirements



### Functional Requirements

- **FR-001**: The Login screen MUST offer **Continue with Google** in addition to Feature 1 **Login** and **Create Account**. Email and Password stay optional for this action. This feature MUST leave Feature 1 email/password login, create account, logout, and session expiry in place.
- **FR-002**: **Continue with Google** MUST authenticate the person with Google. This app MUST NOT collect or store a Google password.
- **FR-003**: Google MUST remain the system of record for that sign-in. This app MUST store only Google's stable subject (`googleSub`), the email and name from the verified Google token, and a Feature 1 session. It MUST NOT store a Google access token, Google refresh token, or Google password, and the success JSON MUST NOT include those values or `googleSub`.
- **FR-004**: The backend Google login service (`POST /api/google`) MUST verify the Google ID token before it creates or updates a user or session. Verification MUST check the signature, issuer `https://accounts.google.com` or `accounts.google.com`, audience equal to `GOOGLE_CLIENT_ID`, expiration, and `email_verified` true. Email and name MUST come from that verified token.
- **FR-005**: The first successful confirmation for a new `googleSub` MUST create one user with role `user` and a null password, start a session, and return the same success payload as `POST /api/login`. The frontend MUST store that payload in `localStorage` under `user`, show snackbar **"Login successful!"**, and navigate to `/landing`, which still shows only **"This feature has not been implemented yet"**.
- **FR-006**: A later **Continue with Google** for the same `googleSub` MUST sign in that same user and MUST NOT insert a second user row. Session create-or-reuse MUST follow Feature 1 (reuse a non-expired session for that user before issuing a new token).
- **FR-007**: When the verified Google email already belongs to a user who has a password and no `googleSub`, the API MUST return **409** with message **"Email already in use!"**, MUST NOT start a session, and MUST NOT change that user.
- **FR-008**: A missing ID token MUST return **400** with message **"Google sign-in failed."** An invalid, expired, wrong-audience, or unverified-email token MUST return **401** with message **"Google sign-in failed."** Neither case starts a session.
- **FR-009**: If the user cancels or closes the Google prompt, the app MUST stay on Login, MUST NOT start a session, and MUST show **"Google sign-in was cancelled."**
- **FR-010**: Google authentication MUST request only the `openid`, `email`, and `profile` scopes. Those scopes supply the subject, verified email, and name. Sign-in data beyond that profile stays on Google's side.
- **FR-011**: After Google sign-in, refresh of `/landing` and **Logout** MUST behave as Feature 1. Logout MUST invalidate the current server session, clear `localStorage` `user`, and send the user to Login.
- **FR-012**: An account created by **Continue with Google** MUST have role `user`. This feature MUST NOT assign `driver`, `maintenance`, or `admin`.
- **FR-013**: When the verified token has no given name or no family name, the API MUST return **400** with message **"Google did not provide a name."** and MUST NOT create a user or a session.
- **FR-014**: Email/password **Login** for an account that has `googleSub` and a null password MUST return **401** with message **"Invalid password!"** and MUST NOT start a session.
- **FR-015**: The app MUST be linked to one Google Developer Console project through an OAuth 2.0 **Web application** client. The linking codes are `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Backend configuration holds both. The Login-page Google button MUST use that same client ID as `VITE_GOOGLE_CLIENT_ID`. Real values MUST NOT be committed. `GOOGLE_CLIENT_SECRET` MUST stay on the server and MUST NOT appear in frontend code, API responses, or logs.
- **FR-016**: The only backend Google login service is `POST /api/google`. It MUST load `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the server environment, verify the ID token with the client ID, and then create or reuse the Feature 1 session. It MUST NOT require a Bearer token.
- **FR-017**: Protected backend routes MUST authorize the caller with `authenticate` and `Authorization: Bearer <session token>`. A token issued by the Google login service MUST be accepted on those routes the same way as an email/password session. `POST /api/logout` MUST stay protected. A missing or expired Bearer token on a protected route MUST return **401** and MUST NOT run the handler. This feature MUST NOT add vehicle, request, or other new product routes.

---



## Assumptions

- Feature 1 is already available: email/password **Login**, **Create Account**, server sessions, `localStorage` `user`, **Logout**, and `/landing` with the placeholder **"This feature has not been implemented yet"**.
- **Continue with Google** is an additional action on that same Login screen (`/`, route name `login`).
- Google holds the person's sign-in credentials and Google account profile. This app keeps a user row and a Feature 1 session so MenuBar, logout, and `/landing` keep working. The password column stays empty for accounts created here.
- The Google button, login service, and route checks use the client ID and client secret from the [Google Developer Console](#google-developer-console) section. The client secret stays on the server.
- Automated tests substitute Google's ID token verification. They do not call Google's network. Tests set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to placeholders.
- Vehicle records, registration requests, the Landing Page, and every other product area stay out of scope, the same as Feature 1.

---



## Google Developer Console

Link this app to Google before the Login button can obtain an ID token.

1. Create one project in Google Developer Console (Google Cloud Console).
2. Configure the OAuth consent screen with only the `openid`, `email`, and `profile` scopes.
3. Create an OAuth 2.0 Client ID of type **Web application**.
4. Add the frontend origin as an authorized JavaScript origin. In dev that origin is `http://localhost:8082`.
5. Copy the two codes from that client into environment configuration. Do not commit real values.


| Code                   | Where it is stored                                                               | What it links                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Backend `GOOGLE_CLIENT_ID` and frontend `VITE_GOOGLE_CLIENT_ID` (the same value) | The Google button on Login, and the audience check in the backend login service                     |
| `GOOGLE_CLIENT_SECRET` | Backend `GOOGLE_CLIENT_SECRET` only                                              | The same OAuth client, on the server. The login service loads it and never sends it to the browser. |


Put placeholders in `backend/.env.example` and `backend/.env.test.example`. Put the client ID placeholder in `frontend/.env.example` as `VITE_GOOGLE_CLIENT_ID`. The ID token check uses `GOOGLE_CLIENT_ID`. The secret is server-only configuration from that same client.

---



## Edge Cases

- User cancels the Google prompt → stay on Login, no session, **"Google sign-in was cancelled."**
- Missing ID token → **400** `"Google sign-in failed."`
- Invalid, expired, wrong-audience, or unverified Google token → **401** `"Google sign-in failed."`
- Verified token with no given name or no family name → **400** `"Google did not provide a name."`; no user row and no session
- Verified email already used by an email/password account → **409** `"Email already in use!"`; that user row is unchanged
- Email/password **Login** on a Google-only account → **401** `"Invalid password!"`
- Same `googleSub` signs in again → one user row; session reused or created per Feature 1
- Expired app session after Google sign-in → Feature 1 **401** handling; frontend clears `user` and redirects to Login
- Protected route with no Bearer token, or with a token the Google login service did not issue and Feature 1 does not recognize → **401**; the handler does not run

---



## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A user can press **Continue with Google**, receive a session token, and land on `/landing` with the placeholder. This app has no password and no Google token stored for that account.
- **SC-003**: The same Google account signs in again to the same user and does not create a second account.
- **SC-004**: Cancel and failed Google confirmation leave the user on Login with no session.
- **SC-005**: A verified Google email that already has a password account does not change that account and does not start a session.
- **SC-006**: A Google session survives refresh of `/landing`, and **Logout** returns the user to Login with no remaining local session.
- **SC-007**: A user who continued with Google sees the same `/landing` placeholder as an email/password user.
- **SC-008**: A Bearer token from the Google login service authorizes `POST /api/logout`. That route with no Bearer token returns **401**.

---



## Data Ownership & Isolation

Feature 2 starts a session for the person Google just verified, or creates that person's own user row when the Google subject is new. Google holds the sign-in credentials. This feature does not read or write another user's account.


| Rule                  | Requirement                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Read scope**        | Success returns **only** the authenticating user's profile fields and app session token. The payload matches Feature 1 login and omits `password` and `googleSub`. |
| **Write scope**       | A new `googleSub` inserts one `users` row and one `sessions` row. A known `googleSub` only starts or reuses that user's session.                                   |
| **Create scope**      | The new user has role `user`, a null password, and `googleSub` from the verified token. This feature does not create vehicle or request rows.                      |
| **Cross-user access** | A Google email that already belongs to a password account does not attach `googleSub` to that row, does not change it, and does not receive its token.             |
| **UI scope**          | Login shows **Continue with Google**. After success, MenuBar and `/landing` behave as Feature 1 for this user.                                                     |
| **Google scope**      | Only `openid`, `email`, and `profile`. Sign-in credentials stay at Google.                                                                                         |


---



## Key Entities

- **Google identity**: subject, verified email, given name, and family name confirmed by Google. Google stores the credential. This app stores the subject link and the name and email taken from the verified token.
- **User**: Feature 1 account, extended for this feature. A Google-created user has `googleSub`, role `user`, and no password. Email/password users are unchanged.
- **Session**: Feature 1 server-side record tying a client `token` to a user; expires after 24 hours. Google sign-in uses this session. It does not use a Google token as the app session.

---



## API Requirements


| Method | Endpoint      | Auth | Purpose                                                                                         |
| ------ | ------------- | ---- | ----------------------------------------------------------------------------------------------- |
| `POST` | `/api/google` | No   | Backend Google login service: verify a Google ID token, then create or reuse a user and session |


**Request body:**

```json
{
  "idToken": "<google-id-token>"
}
```

**Success response** (same flat shape as `POST /api/login`; never include `password`, `googleSub`, or any Google token):

```json
{
  "id": 1,
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "role": "user",
  "token": "<session-token>"
}
```

**Error response:** `{ "message": "Human-readable explanation." }`

Quoted messages that tests must match:


| Situation                                             | Status | `message`                        |
| ----------------------------------------------------- | ------ | -------------------------------- |
| Missing ID token                                      | 400    | `Google sign-in failed.`         |
| Invalid, expired, wrong audience, or unverified email | 401    | `Google sign-in failed.`         |
| Verified token missing given name or family name      | 400    | `Google did not provide a name.` |
| Email already belongs to a password account           | 409    | `Email already in use!`          |
| Email/password login on a Google-only account         | 401    | `Invalid password!`              |


Email/password login on a Google-only account is still `POST /api/login` from Feature 1. This feature adds the **401** outcome for a null password.

**Route authorization.** `authenticate` reads `Authorization: Bearer <session token>`, checks the Feature 1 session, and sets the caller. The Google login service is public. Protected routes accept a session token from email/password login or from `POST /api/google`.


| Method | Endpoint        | Auth                         | This feature                                                                                    |
| ------ | --------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `POST` | `/api/google`   | No                           | Google login service. Must not use `authenticate`.                                              |
| `POST` | `/api/login`    | No                           | Feature 1. Unchanged.                                                                           |
| `POST` | `/api/register` | No                           | Feature 1. Unchanged.                                                                           |
| `POST` | `/api/logout`   | Yes (`Bearer` session token) | Protected. A Google-issued session token MUST authorize it. Missing or expired token → **401**. |


---



## Screen Requirements



### [View: Login] — route name `login` (`/`)

- Feature 1 heading, **Email**, **Password**, **Login**, and **Create Account** stay as specified in Feature 1.
- Google button on this Login page, labeled **Continue with Google**, configured with `VITE_GOOGLE_CLIENT_ID` from the Google Developer Console client. **Login** remains the primary email/password action (`oc-cta`). **Continue with Google** uses the secondary button treatment in `ui-style-system.mdc`.
- **Continue with Google** does not require Email or Password and does not open the Create Account dialog.
- The button starts Google's sign-in prompt. The app sends the returned ID token to the backend login service `POST /api/google`. It does not store that ID token in `localStorage`.
- **Success:** store the payload in `localStorage` `user`, snackbar **"Login successful!"**, navigate to route `landing`.
- **Cancel:** stay on Login and show **"Google sign-in was cancelled."**
- **Error:** show the API `message` (**"Google sign-in failed."**, **"Google did not provide a name."**, **"Email already in use!"**). Stay on Login. Do not store `user`.



### [View: Placeholder] — route name `landing` (`/landing`)

- Unchanged from Feature 1. The only content is **"This feature has not been implemented yet"**.
- Shown after **Continue with Google** and after refresh of a Google session.



### App chrome — `MenuBar`

- Unchanged from Feature 1. A Google-created user's initials, name, and email come from `localStorage` `user`.
- **Logout** runs Feature 1 logout, then lands on `login`.

---



## Data Model Requirements

This feature **extends** `users` from Feature 1. It uses the existing `sessions` table and does not add columns to `sessions`.

### `users` table (delta)


| Field       | Type   | Rules                                                                                                                                                  |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `googleSub` | STRING | Nullable, unique when set. Google `sub` from the verified token. Required for accounts created by this feature.                                        |
| `password`  | STRING | Required for email/password accounts. Null for accounts created by **Continue with Google**. Bcrypt hash only when set. Never store a Google password. |


`email` stays required and unique. A Google-created row still stores the verified email so MenuBar and Feature 1 session lookup by email keep working.

### Associations

- Unchanged from Feature 1: `User` hasMany `Session`, `Session` belongsTo `User`.

---



## Acceptance Criteria (Gherkin)



### US-2.1 — Continue with Google



#### Scenario: New Google user signs in

- **Given** I am on the Login page
- **And** no account exists for the Google account I will confirm
- **When** I press **Continue with Google**
- **And** Google confirms a verified email, first name, and last name
- **Then** I am signed in
- **And** that account has role `user`
- **And** I land on `/landing`
- **And** I see **"This feature has not been implemented yet"**



#### Scenario: Sign-in data stays on Google

- **Given** Google has confirmed a new verified account
- **When** this app accepts that confirmation
- **Then** the stored account has a `googleSub` and no password
- **And** the response includes a session token
- **And** the response includes no password and no Google token



#### Scenario: Refresh after Google sign-in

- **Given** I signed in with **Continue with Google**
- **And** I am on `/landing`
- **When** I refresh the page
- **Then** I remain logged in
- **And** I see **"This feature has not been implemented yet"**



#### Scenario: Logging out a Google session

- **Given** I have a valid session from **Continue with Google**
- **When** I press the profile circle
- **And** I click **Logout**
- **Then** I am logged out of the user session
- **And** I am redirected to the Login page



### US-2.2 — Sign in again with the same Google account



#### Scenario: Same Google account signs in again

- **Given** I am on the Login page
- **And** an account already exists for my Google subject
- **When** I press **Continue with Google**
- **And** Google confirms that same account
- **Then** I am signed in to that same account
- **And** no second account is created
- **And** I land on `/landing`
- **And** I see **"This feature has not been implemented yet"**



### US-2.3 — Keep email/password accounts separate



#### Scenario: Email already has a password account

- **Given** I am on the Login page
- **And** an account already exists for an email with a password and no `googleSub`
- **When** I press **Continue with Google**
- **And** Google confirms that same email
- **Then** I see the message **"Email already in use!"**
- **And** I remain on Login
- **And** I am not signed in
- **And** that account is unchanged



#### Scenario: Password login cannot open a Google account

- **Given** I am on the Login page
- **And** an account was created with **Continue with Google**
- **When** I enter that email and a password and press **Login**
- **Then** I see the message **"Invalid password!"**
- **And** I remain on Login
- **And** I am not signed in



### US-2.4 — Stay signed out when Google does not confirm



#### Scenario: User cancels Google

- **Given** I am on the Login page
- **When** I press **Continue with Google**
- **And** I cancel the Google prompt
- **Then** I see the message **"Google sign-in was cancelled."**
- **And** I remain on Login
- **And** I am not signed in



#### Scenario: Google rejects the sign-in

- **Given** I am on the Login page
- **When** I press **Continue with Google**
- **And** Google does not confirm a verified account
- **Then** I see the message **"Google sign-in failed."**
- **And** I remain on Login
- **And** I am not signed in



#### Scenario: Google account has no name

- **Given** I am on the Login page
- **When** I press **Continue with Google**
- **And** Google confirms a verified email with no first name or no last name
- **Then** I see the message **"Google did not provide a name."**
- **And** I remain on Login
- **And** I am not signed in



### US-2.5 — Authorize protected routes



#### Scenario: Google session authorizes a protected route

- **Given** I have a valid session from **Continue with Google**
- **When** I call `POST /api/logout` with `Authorization: Bearer` set to that session token
- **Then** the route authorizes the call
- **And** I am logged out of the user session



#### Scenario: Protected route rejects a missing session

- **Given** I am not signed in
- **When** I call `POST /api/logout` with no Bearer token
- **Then** the response is **401**
- **And** the route does not log anyone out

---



## Test Coverage Map

Each scenario above must map to at least one automated test. Tests substitute Google's ID token verification and do not call Google's network.


| Story  | Scenario                                    | Test file                           | Test name                                           |
| ------ | ------------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| US-2.1 | New Google user signs in                    | `frontend/tests/GoogleAuth.test.js` | `it("New Google user signs in")`                    |
| US-2.1 | Sign-in data stays on Google                | `backend/tests/googleAuth.test.js`  | `it("Sign-in data stays on Google")`                |
| US-2.1 | Refresh after Google sign-in                | `frontend/tests/GoogleAuth.test.js` | `it("Refresh after Google sign-in")`                |
| US-2.1 | Logging out a Google session                | `backend/tests/googleAuth.test.js`  | `it("Logging out a Google session")`                |
| US-2.2 | Same Google account signs in again          | `backend/tests/googleAuth.test.js`  | `it("Same Google account signs in again")`          |
| US-2.3 | Email already has a password account        | `backend/tests/googleAuth.test.js`  | `it("Email already has a password account")`        |
| US-2.3 | Password login cannot open a Google account | `backend/tests/googleAuth.test.js`  | `it("Password login cannot open a Google account")` |
| US-2.4 | User cancels Google                         | `frontend/tests/GoogleAuth.test.js` | `it("User cancels Google")`                         |
| US-2.4 | Google rejects the sign-in                  | `backend/tests/googleAuth.test.js`  | `it("Google rejects the sign-in")`                  |
| US-2.4 | Google account has no name                  | `backend/tests/googleAuth.test.js`  | `it("Google account has no name")`                  |
| US-2.5 | Google session authorizes a protected route | `backend/tests/googleAuth.test.js`  | `it("Google session authorizes a protected route")` |
| US-2.5 | Protected route rejects a missing session   | `backend/tests/googleAuth.test.js`  | `it("Protected route rejects a missing session")`   |


`it("Google rejects the sign-in")` covers a missing ID token (**400**) and an invalid or unverified token (**401**). Both use **"Google sign-in failed."**

---



## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 2 from @features/feature-2-Google-Auth.md on branch `feature/2-google-auth`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior listed under Out of Scope.
Leave Feature 1 email/password login, create account, logout, and /landing behavior in place.
Link the app with the Google Developer Console client ID and client secret through environment variables. Do not commit real secrets.
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
- Choosing `driver`, `maintenance`, or `admin` from Create Account or from Google sign-in
- Password reset, email verification of an address this app sends, and profile editing
- Linking **Continue with Google** onto an existing email/password account
- Replacing Feature 1 email/password **Login**, **Create Account**, or **Logout**
- Google Drive, Gmail, Calendar, or any Google scope beyond `openid`, `email`, and `profile`
- Storing vehicle, request, or other app records at Google
- New protected product routes beyond Feature 1 `POST /api/logout`
- Committing real `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` values

