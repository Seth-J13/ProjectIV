/**
 * Feature 2 — Google Auth
 * Spec: features/feature-2-Google-Auth.md
 */
import { jest } from "@jest/globals";

process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";

globalThis.__googleClients = [];
globalThis.__googleVerifyCalls = [];
globalThis.__googleResult = undefined;

jest.unstable_mockModule("google-auth-library", () => ({
  OAuth2Client: class OAuth2Client {
    constructor(clientId, clientSecret) {
      globalThis.__googleClients.push({ clientId, clientSecret });
    }

    verifyIdToken(request) {
      globalThis.__googleVerifyCalls.push(request);
      const result = globalThis.__googleResult;

      if (result instanceof Error) {
        return Promise.reject(result);
      }

      if (result === undefined) {
        return Promise.reject(new Error("Google ID token verification was not stubbed."));
      }

      return Promise.resolve({
        getPayload: () => result,
      });
    }
  },
}), { virtual: true });

const { default: request } = await import("supertest");
const { default: app } = await import("../server.js");
const { default: db } = await import("../app/models/index.js");
const { syncTestDatabase } = await import("./helpers.js");

const CLIENT_ID = "test-google-client-id";
const CLIENT_SECRET = "test-google-client-secret";

function users() {
  if (!db.user) {
    throw new Error("Expected db.user to be registered.");
  }

  return db.user;
}

function sessions() {
  if (!db.session) {
    throw new Error("Expected db.session to be registered.");
  }

  return db.session;
}

function googleProfile(overrides = {}) {
  return {
    sub: "google-sub-ada",
    email: "ada@example.com",
    email_verified: true,
    given_name: "Ada",
    family_name: "Lovelace",
    iss: "https://accounts.google.com",
    aud: CLIENT_ID,
    ...overrides,
  };
}

function basicAuth(email, password) {
  return `Basic ${Buffer.from(`${email}:${password}`).toString("base64")}`;
}

function postGoogle(idToken, profile) {
  globalThis.__googleResult = profile;
  return request(app).post("/api/google").send(idToken === undefined ? {} : { idToken });
}

function registerPasswordAccount(overrides = {}) {
  return request(app)
    .post("/api/register")
    .send({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "a-valid-password",
      ...overrides,
    });
}

describe("Feature 2 — Google Auth", () => {
  beforeEach(async () => {
    globalThis.__googleClients = [];
    globalThis.__googleVerifyCalls = [];
    globalThis.__googleResult = undefined;
    await syncTestDatabase();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe("US-2.1 — Continue with Google", () => {
    it("Sign-in data stays on Google", async () => {
      const response = await postGoogle("verified-id-token", googleProfile());

      expect(response.ok).toBe(true);
      expect(Object.keys(response.body).sort()).toEqual([
        "email",
        "firstName",
        "id",
        "lastName",
        "role",
        "token",
      ]);
      expect(response.body).toMatchObject({
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        role: "user",
      });
      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.token).not.toBe("verified-id-token");
      expect(JSON.stringify(response.body)).not.toContain(CLIENT_SECRET);

      const verification = JSON.stringify({
        clients: globalThis.__googleClients,
        calls: globalThis.__googleVerifyCalls,
      });
      expect(verification).toContain(CLIENT_ID);
      expect(globalThis.__googleVerifyCalls[0].idToken).toBe("verified-id-token");

      const account = await users().unscoped().findOne({ where: { email: "ada@example.com" } });
      expect(account.googleSub).toBe("google-sub-ada");
      expect(account.password).toBeNull();
      expect(account.role).toBe("user");
      expect(await users().count()).toBe(1);
    });

    it("Logging out a Google session", async () => {
      const created = await postGoogle("verified-id-token", googleProfile());
      expect(created.ok).toBe(true);

      const response = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${created.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Logged out successfully." });

      const reused = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${created.body.token}`);

      expect(reused.status).toBe(401);
      expect(await sessions().count({ where: { token: created.body.token } })).toBe(0);
    });
  });

  describe("US-2.2 — Sign in again with the same Google account", () => {
    it("Same Google account signs in again", async () => {
      const first = await postGoogle("verified-id-token", googleProfile());
      const second = await postGoogle("verified-id-token-again", googleProfile());

      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
      expect(second.body.id).toBe(first.body.id);
      expect(second.body.email).toBe("ada@example.com");
      expect(second.body.token).toBe(first.body.token);
      expect(second.body.password).toBeUndefined();
      expect(second.body.googleSub).toBeUndefined();
      expect(await users().count()).toBe(1);
      expect(await users().unscoped().findOne({ where: { googleSub: "google-sub-ada" } })).not.toBeNull();
    });
  });

  describe("US-2.3 — Keep email/password accounts separate", () => {
    it("Email already has a password account", async () => {
      const created = await registerPasswordAccount();
      expect(created.ok).toBe(true);

      const before = await users().unscoped().findOne({ where: { email: "ada@example.com" } });
      const sessionsBefore = await sessions().count();

      const response = await postGoogle(
        "google-id-token",
        googleProfile({ sub: "google-sub-other" })
      );

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: "Email already in use!" });

      const after = await users().unscoped().findOne({ where: { email: "ada@example.com" } });
      expect(after.password).toBe(before.password);
      expect(after.googleSub ?? null).toBeNull();
      expect(after.firstName).toBe(before.firstName);
      expect(after.lastName).toBe(before.lastName);
      expect(after.role).toBe(before.role);
      expect(await users().count()).toBe(1);
      expect(await sessions().count()).toBe(sessionsBefore);
    });

    it("Password login cannot open a Google account", async () => {
      const created = await postGoogle("verified-id-token", googleProfile());
      expect(created.ok).toBe(true);

      const response = await request(app)
        .post("/api/login")
        .set("Authorization", basicAuth("ada@example.com", "a-valid-password"));

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid password!" });
      expect(await sessions().count()).toBe(1);
    });
  });

  describe("US-2.4 — Stay signed out when Google does not confirm", () => {
    it("Google rejects the sign-in", async () => {
      const missing = await request(app).post("/api/google").send({});

      expect(missing.status).toBe(400);
      expect(missing.body).toEqual({ message: "Google sign-in failed." });

      const invalid = await postGoogle("not-a-google-token", new Error("Invalid token"));

      expect(invalid.status).toBe(401);
      expect(invalid.body).toEqual({ message: "Google sign-in failed." });

      const unverified = await postGoogle(
        "unverified-email-token",
        googleProfile({ email_verified: false, sub: "google-sub-unverified" })
      );

      expect(unverified.status).toBe(401);
      expect(unverified.body).toEqual({ message: "Google sign-in failed." });
      expect(await users().count()).toBe(0);
      expect(await sessions().count()).toBe(0);
    });

    it("Google account has no name", async () => {
      const missingGivenName = await postGoogle(
        "missing-given-name",
        googleProfile({ given_name: undefined, sub: "google-sub-no-given" })
      );

      expect(missingGivenName.status).toBe(400);
      expect(missingGivenName.body).toEqual({ message: "Google did not provide a name." });

      const missingFamilyName = await postGoogle(
        "missing-family-name",
        googleProfile({ family_name: "", sub: "google-sub-no-family", email: "noname@example.com" })
      );

      expect(missingFamilyName.status).toBe(400);
      expect(missingFamilyName.body).toEqual({ message: "Google did not provide a name." });
      expect(await users().count()).toBe(0);
      expect(await sessions().count()).toBe(0);
    });
  });

  describe("US-2.5 — Authorize protected routes", () => {
    it("Google session authorizes a protected route", async () => {
      const created = await postGoogle("verified-id-token", googleProfile());
      expect(created.ok).toBe(true);

      const response = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${created.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Logged out successfully." });

      const afterLogout = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${created.body.token}`);

      expect(afterLogout.status).toBe(401);
    });

    it("Protected route rejects a missing session", async () => {
      const created = await postGoogle("verified-id-token", googleProfile());
      expect(created.ok).toBe(true);

      const response = await request(app).post("/api/logout");

      expect(response.status).toBe(401);
      expect(response.body.token).toBeUndefined();

      const stillSignedIn = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${created.body.token}`);

      expect(stillSignedIn.status).toBe(200);
      expect(stillSignedIn.body).toEqual({ message: "Logged out successfully." });
    });
  });
});
