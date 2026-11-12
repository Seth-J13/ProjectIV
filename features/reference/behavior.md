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
| Protected routes | `authenticate` requires `Authorization: Bearer <session token>`. Missing or expired token → **401** and the handler does not run. | Feature 1 |
| Signed-in screen | `/landing` shows only `This feature has not been implemented yet` for every role. | Feature 1 |
| Login screen | Route `/` (`login`) keeps Email, Password, **Login** (`oc-cta`), and **Create Account**. Success stores the payload in `localStorage` `user` and shows snackbar `Login successful!` on email login. | Feature 1 |
| Continue with Google | Secondary **Continue with Google** button. Email and Password are not required. The button uses `VITE_GOOGLE_CLIENT_ID` and Google Identity Services (`openid`, `email`, and `profile` only). The ID token is posted to `POST /api/google` and is not stored in `localStorage`. | Feature 2 |
| Google system of record | A new `googleSub` creates one user with role `user`, a null password, and the verified email and name. The app does not store a Google access token, refresh token, or password. Success JSON omits `password` and `googleSub`. | Feature 2 |
| Same Google account | A later sign-in for the same `googleSub` does not insert a second user. Session create-or-reuse follows Feature 1. | Feature 2 |
| Password account stays separate | Verified Google email that already belongs to a user with a password and no `googleSub` → **409** `Email already in use!`. That row is not changed and no session starts. | Feature 2 |
| Google-only account rejects password login | Email/password login when `password` is null → **401** `Invalid password!`. No session starts. | Feature 2 |
| Google failure and cancel | Missing ID token → **400** `Google sign-in failed.`. Invalid, expired, wrong-audience, or unverified token → **401** `Google sign-in failed.`. No given name or family name → **400** `Google did not provide a name.`. Cancel stays on Login with `Google sign-in was cancelled.` and no `user` in `localStorage`. | Feature 2 |
| Google client secret | `GOOGLE_CLIENT_SECRET` is read only on the server. It is not sent to the browser, included in API responses, or written to logs. | Feature 2 |
| Google session on protected routes | A Bearer token from `POST /api/google` authorizes `POST /api/logout` the same way as an email/password session. | Feature 2 |
| MenuBar | Signed-in initials, name, and email come from `localStorage` `user`. **Logout** ends that session and returns to Login. Hidden on the Login route. | Feature 1 |
