/**
 * Feature 3 — User Management
 * Spec: features/feature-3-User-Management.md
 */
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../server.js";
import db from "../app/models/index.js";
import { syncTestDatabase } from "./helpers.js";

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

async function seedUser(overrides = {}) {
  const plainPassword = Object.prototype.hasOwnProperty.call(overrides, "password")
    ? overrides.password
    : "a-valid-password";
  const password = plainPassword == null ? null : await bcrypt.hash(plainPassword, 10);

  return users().create({
    firstName: "Amy",
    lastName: "Adams",
    email: "amy@example.com",
    role: "user",
    ...overrides,
    password,
  });
}

async function seedSession(user) {
  const token = `session-${user.id}`;

  await sessions().create({
    token,
    email: user.email,
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    userId: user.id,
  });

  return token;
}

function updateUser(token, id, body) {
  const call = request(app).put(`/api/users/${id}`).send(body);

  if (token) {
    call.set("Authorization", `Bearer ${token}`);
  }

  return call;
}

describe("Feature 3 — User Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe("US-3.2 — Edit user data", () => {
    it("Email already in use", async () => {
      const admin = await seedUser({
        firstName: "Ann",
        lastName: "Admin",
        email: "admin@example.com",
        role: "admin",
      });
      const adminToken = await seedSession(admin);
      const first = await seedUser({
        firstName: "Amy",
        lastName: "Adams",
        email: "amy@example.com",
        role: "user",
      });
      await seedUser({
        firstName: "Zoe",
        lastName: "Zimmer",
        email: "zoe@example.com",
        role: "driver",
      });
      const before = await users().unscoped().findByPk(first.id);

      const response = await updateUser(adminToken, first.id, {
        firstName: "Changed",
        lastName: "Name",
        email: "zoe@example.com",
        role: "maintenance",
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: "Email already in use!" });

      const after = await users().unscoped().findByPk(first.id);
      expect(after.firstName).toBe(before.firstName);
      expect(after.lastName).toBe(before.lastName);
      expect(after.email).toBe(before.email);
      expect(after.role).toBe(before.role);
      expect(after.password).toBe(before.password);
    });

    it("Admin cannot change own role", async () => {
      const admin = await seedUser({
        firstName: "Ann",
        lastName: "Admin",
        email: "admin@example.com",
        role: "admin",
      });
      const adminToken = await seedSession(admin);

      const response = await updateUser(adminToken, admin.id, {
        firstName: "Ann",
        lastName: "Admin",
        email: "admin@example.com",
        role: "driver",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "You cannot change your own role." });

      const after = await users().unscoped().findByPk(admin.id);
      expect(after.role).toBe("admin");
    });
  });

  describe("US-3.3 — Keep the page admin-only", () => {
    it("Non-admin cannot edit a user", async () => {
      const caller = await seedUser({
        firstName: "Uma",
        lastName: "User",
        email: "uma@example.com",
        role: "user",
      });
      const callerToken = await seedSession(caller);
      const other = await seedUser({
        firstName: "Zoe",
        lastName: "Zimmer",
        email: "zoe@example.com",
        role: "driver",
      });
      const before = await users().unscoped().findByPk(other.id);

      const response = await updateUser(callerToken, other.id, {
        firstName: "Changed",
        lastName: "Name",
        email: "changed@example.com",
        role: "maintenance",
      });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin access required." });

      const after = await users().unscoped().findByPk(other.id);
      expect(after.firstName).toBe(before.firstName);
      expect(after.lastName).toBe(before.lastName);
      expect(after.email).toBe(before.email);
      expect(after.role).toBe(before.role);
      expect(after.password).toBe(before.password);
    });

    it("Missing session cannot view users", async () => {
      await seedUser({
        firstName: "Amy",
        lastName: "Adams",
        email: "amy@example.com",
        role: "user",
      });

      const response = await request(app).get("/api/users");

      expect(response.status).toBe(401);
      expect(JSON.stringify(response.body)).not.toContain("amy@example.com");
      expect(JSON.stringify(response.body)).not.toContain("password");
    });
  });
});
