# Behavior & Rules Reference

**Living snapshot** of product rules currently enforced by the app.

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md`.

| File | Role |
|------|------|
| [api.md](./api.md) | Routes / payloads |
| [data-model.md](./data-model.md) | Tables / columns |
| **This file** | Ownership, sort, validation, UI rules |

| Rule | Enforcement | Introduced |
| --- | --- | --- |
| Email and password sign-in | `POST /api/login` with Basic auth. Unknown email → **401** `User not found!`. Wrong password → **401** `Invalid password!`. | Feature 1 |
| Create account | First name, last name, email, and password are required. Role is `user`. Duplicate email → **409** `Email already in use!` and no new session. | Feature 1 |
| Session lifetime | Server session expires after 24 hours. Login reuses a non-expired session for that user before issuing a new token. | Feature 1 |
| Logout | `POST /api/logout` deletes only the caller's current session, then the client clears `localStorage` `user` and returns to Login. | Feature 1 |
| Protected routes | `authenticate` requires `Authorization: Bearer <session token>`. Missing or expired token → **401** and the handler does not run. The client clears `user` and returns to Login. | Feature 1 |
| Signed-in screen | `/landing` shows only `This feature has not been implemented yet` for every role. | Feature 1 |
| Login screen | Route `/` (`login`) keeps Email, Password, **Login** (`oc-cta`), and **Create Account**. Success stores the payload in `localStorage` `user` and shows snackbar `Login successful!` on email login. | Feature 1 |
| Continue with Google | Secondary **Continue with Google** button. Email and Password are not required. The button uses `VITE_GOOGLE_CLIENT_ID` and Google Identity Services (`openid`, `email`, and `profile` only). The ID token is posted to `POST /api/google` and is not stored in `localStorage`. | Feature 2 |
| Google system of record | A new `googleSub` creates one user with role `user`, a null password, and the verified email and name. The app does not store a Google access token, refresh token, or password. Success JSON omits `password` and `googleSub`. | Feature 2 |
| Same Google account | A later sign-in for the same `googleSub` does not insert a second user. Session create-or-reuse follows Feature 1. | Feature 2 |
| Password account stays separate | Verified Google email that already belongs to a user with a password and no `googleSub` → **409** `Email already in use!`. That row is not changed and no session starts. | Feature 2 |
| Google-only account rejects password login | Email/password login when `password` is null → **401** `Invalid password!`. No session starts. | Feature 2 |
| Google failure and cancel | Missing ID token → **400** `Google sign-in failed.`. Invalid, expired, wrong-audience, or unverified token → **401** `Google sign-in failed.`. No given name or family name → **400** `Google did not provide a name.`. Cancel stays on Login with `Google sign-in was cancelled.` and no `user` in `localStorage`. | Feature 2 |
| Google client secret | `GOOGLE_CLIENT_SECRET` is read only on the server. It is not sent to the browser, included in API responses, or written to logs. | Feature 2 |
| Google session on protected routes | A Bearer token from `POST /api/google` authorizes protected routes the same way as an email/password session. | Feature 2 |
| MenuBar | Signed-in initials, name, and email come from `localStorage` `user`. **Logout** ends that session and returns to Login. Hidden on the Login route. **User Management** is shown only when `role` is `admin` and opens `/users`. **Areas** is shown only when `role` is `admin` and opens `/areas`. | Feature 1, Feature 3, Feature 13 |
| User list | An admin on `/users` sees every account's first name, last name, email, and role, ordered by last name A–Z. Password, `googleSub`, and tokens are not shown. | Feature 3 |
| Edit user | **Edit** opens the current values. **Save** sends first name, last name, email, and role (`user`, `driver`, `maintenance`, or `admin`), stays on `/users`, and shows `User updated.`. **Cancel** closes the dialog without saving. | Feature 3 |
| Admin cannot change own role | Saving the signed-in admin with a different role → **400** `You cannot change your own role.` The role stays `admin`. The same admin may still change their own name and email. | Feature 3 |
| Duplicate email on edit | Saving an email that belongs to a different user → **409** `Email already in use!`. That user is unchanged. | Feature 3 |
| Non-admin user management | Roles `user`, `driver`, and `maintenance` do not see **User Management**. Opening `/users` redirects to `/landing`. User APIs return **403** `Admin access required.` and do not return or change rows. | Feature 3 |
| Unknown user | `PUT /api/users/:id` for a missing id → **404** `User with id={id} not found.` | Feature 3 |
| Email change keeps the session | Updating a user's email writes the new email onto that user's session rows and does not replace the token. | Feature 3 |
| Driver reads require a session | `GET /api/vehicle-t3` returns `401` without a bearer token | Feature 7 |
| Only admins create, update, or delete drivers | Non-admin writes return `403` `{ "message": "Admin access required." }`. Drivers are not owned by a user | Feature 7 |
| Driver id must be an integer | Non-numeric `driver_id` returns `400` | Feature 7 |
| License status, expiration, and availability are required | Missing or blank values return `400`. Status and availability must be one of the allowed values | Feature 7 |
| A blank driver name is rejected | Whitespace-only `name` returns `400`. The drivers form blocks it before the request | Feature 7 |
| Drivers screen is admin-only | Signed-out users go to login. Signed-in non-admins go to `/landing` | Feature 7 |
| Find filters the list | The **Find** box keeps rows whose id, name, or license status contains the text | Feature 7 |
| Areas are admin-only | Roles `user`, `driver`, and `maintenance` do not see **Areas**. Opening `/areas` redirects to `/landing`. Area APIs return **403** `Forbidden` and do not return or change rows | Feature 13 |
| Area name and notice email | `name` is required, unique, and at most 30 characters. `noticeEmail` is required. A blank name or notice email is **400** `Area is incomplete!`. A duplicate name is **409** `Area name already in use!` and no second row is created | Feature 13 |
| Area list | An admin on `/areas` sees every area's name and notice email. **Create area** stays available when the list is empty. Opening a row shows **Save** and **Delete** | Feature 13 |
| Delete an unused area | Delete succeeds with `Area deleted.` and the row leaves the list. If a vehicle still has that `area_id`, delete returns **409** `Area is in use!` and the area remains | Feature 13 |
| Unknown area | An admin request for a missing area id returns **404** `Area not found!` | Feature 13 |
