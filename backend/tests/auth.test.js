/**
 * Feature 1 — User Auth & Session Management
 * Spec: features/feature-1-User-Auth-&-Session-Management.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { syncTestDatabase } from "./helpers.js";

const PASSWORD = "a-valid-password";

function basicAuth(email, password) {
  return `Basic ${Buffer.from(`${email}:${password}`).toString("base64")}`;
}

function registerAccount(overrides = {}) {
  return request(app)
    .post("/api/register")
    .send({
      firstName: "Danny",
      lastName: "Devito",
      email: "DDevito@example.com",
      password: PASSWORD,
      ...overrides,
    });
}

function login(email, password) {
  return request(app).post("/api/login").set("Authorization", basicAuth(email, password));
}

describe("Feature 1 — User Auth & Session Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe("US-1.1 — Sign in", () => {
    it("Bad email", async () => {
      const response = await login("nobody@example.com", PASSWORD);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "User not found!" });
    });

    it("Bad password", async () => {
      const email = "exists@example.com";
      const created = await registerAccount({ email });

      expect(created.ok).toBe(true);
      expect(created.body.password).toBeUndefined();

      const response = await login(email, "wrong-password");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid password!" });
    });
  });

  describe("US-1.3 — Sign out", () => {
    it("Logging out", async () => {
      const first = await registerAccount({ email: "logout-a@example.com" });
      const second = await registerAccount({
        email: "logout-b@example.com",
        firstName: "Other",
        lastName: "Account",
      });

      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
      expect(first.body.token).toEqual(expect.any(String));
      expect(second.body.token).toEqual(expect.any(String));
      expect(first.body.password).toBeUndefined();
      expect(second.body.password).toBeUndefined();

      const response = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${first.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Logged out successfully." });

      const reused = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${first.body.token}`);

      expect(reused.status).toBe(401);
      expect(reused.body.token).toBeUndefined();

      const otherSession = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${second.body.token}`);

      expect(otherSession.status).toBe(200);
      expect(otherSession.body).toEqual({ message: "Logged out successfully." });
    });
  });

  describe("US-1.4 — Create account", () => {
    it("Email already in use", async () => {
      const email = "taken@example.com";
      const created = await registerAccount({
        email,
        password: "first-password-1",
      });

      expect(created.ok).toBe(true);
      expect(created.body).toMatchObject({
        email,
        firstName: "Danny",
        lastName: "Devito",
        role: "user",
      });
      expect(created.body.token).toEqual(expect.any(String));
      expect(created.body.password).toBeUndefined();

      const duplicate = await registerAccount({
        email,
        firstName: "Other",
        lastName: "Person",
        password: "second-password-2",
      });

      expect(duplicate.status).toBe(409);
      expect(duplicate.body).toEqual({ message: "Email already in use!" });

      const replaced = await login(email, "second-password-2");
      expect(replaced.status).toBe(401);
      expect(replaced.body).toEqual({ message: "Invalid password!" });

      const original = await login(email, "first-password-1");
      expect(original.ok).toBe(true);
      expect(original.body).toMatchObject({ email, role: "user" });
      expect(original.body.token).toEqual(expect.any(String));
      expect(original.body.password).toBeUndefined();
    });
  });
});
