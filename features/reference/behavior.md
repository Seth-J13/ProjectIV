# Behavior & Rules Reference

**Living snapshot** of product rules currently in force.

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md`.


| File                             | Role                                  |
| -------------------------------- | ------------------------------------- |
| [api.md](./api.md)               | Routes / payloads                     |
| [data-model.md](./data-model.md) | Tables / columns                      |
| **This file**                    | Ownership, sort, validation, UI rules |


## Rules


| Rule                          | Enforcement                                                                                                                                                                                                | Introduced |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Sign-in is email and password | `POST /api/login` reads `Authorization: Basic`. Username login is not accepted.                                                                                                                            | Feature 1  |
| Unknown email                 | `401` `{ "message": "User not found!" }`. No session row.                                                                                                                                                  | Feature 1  |
| Wrong password                | `401` with message `"Invalid password!"`. No new session.                                                                                                                                                  | Feature 1  |
| Empty login credentials       | Request is rejected with `401` `"Email and password are required."`                                                                                                                                        | Feature 1  |
| Create account fields         | First name, last name, email, and password are required. Empty values return `400`. The client blocks submit with `"Required"`.                                                                            | Feature 1  |
| New account role              | Self-service create account always stores `role` `user`. The dialog cannot choose a role.                                                                                                                  | Feature 1  |
| Duplicate email               | `409` `"Email already in use!"`. No session is started and the existing password is unchanged. Match is case-insensitive.                                                                                  | Feature 1  |
| Password storage              | Bcrypt hash (10 rounds). Responses and `localStorage` `user` omit `password`.                                                                                                                              | Feature 1  |
| Session lifetime              | New login creates a session that expires 24 hours later. A non-expired session for that user is reused.                                                                                                    | Feature 1  |
| Login success                 | Frontend stores the response in `localStorage` `user`, shows snackbar `"Login successful!"`, and opens `/landing`.                                                                                         | Feature 1  |
| Create-account success        | Frontend stores `user` and opens `/landing`.                                                                                                                                                               | Feature 1  |
| Signed-in screen              | Every role uses `/landing` and sees only `"This feature has not been implemented yet"`.                                                                                                                    | Feature 1  |
| Refresh                       | `localStorage` `user` keeps the signed-in screen on `/landing` until logout. Missing `user` redirects to Login.                                                                                            | Feature 1  |
| Logout                        | `POST /api/logout` deletes only the bearer session. Frontend removes `user` and opens Login.                                                                                                               | Feature 1  |
| Protected API                 | Missing or expired bearer token returns `401` `"Unauthorized!"`. The frontend clears `user` and redirects to Login. A failed login or create-account response stays on Login and shows that API `message`. | Feature 1  |
| MenuBar                       | Signed-in chrome shows initials from first and last name. The menu shows that user’s name, email, and **Logout**. Hidden on Login.                                                                         | Feature 1  |
| Read scope                    | Login and create account return only that caller’s `id`, `email`, `firstName`, `lastName`, `role`, and `token`.                                                                                            | Feature 1  |
| Write scope                   | Login and create account insert a session for that user. Logout deletes only the presented token.                                                                                                          | Feature 1  |


