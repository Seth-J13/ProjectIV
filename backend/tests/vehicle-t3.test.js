/**
 * Feature 7 — Driver Crud
 * Spec: features/feature-7-Driver-CRUD.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";

const DRIVERS_PATH = "/api/vehicle-t3";

const activeDriver = {
  driver_id: 1,
  license_status: "active",
  license_exp_date: "05/2026",
  availability: "available",
};

async function authHeader(role) {
  if (!db.user || !db.session) {
    return { Authorization: `Bearer ${role}-token` };
  }

  const user = await db.user.create({
    fName: "Ada",
    lName: role === "admin" ? "Admin" : "Requester",
    email: `${role}@example.com`,
    username: role,
    password: "hashed-password",
    role,
  });
  const token = jwt.sign({ id: user.id }, authConfig.secret, { expiresIn: 86400 });

  await db.session.create({
    token,
    email: user.email,
    userId: user.id,
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return { Authorization: `Bearer ${token}` };
}

describe("Feature 7 — Driver Crud", () => {
  let admin;

  async function signInAdmin() {
    await syncTestDatabase();
    admin = await authHeader("admin");
  }

  describe("US-7.1 — Create drivers", () => {
    beforeEach(signInAdmin);
    it("Admin creates a new driver", async () => {
      const response = await request(app).post(DRIVERS_PATH).set(admin).send(activeDriver);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        license_status: "active",
        license_exp_date: "05/2026",
        availability: "available",
      });
      expect([1, "1"]).toContain(response.body.driver_id);
    });

    it("Admin creates a driver without availability", async () => {
      const response = await request(app)
        .post(DRIVERS_PATH)
        .set(admin)
        .send({
          driver_id: 1,
          license_status: "active",
          license_exp_date: "05/2026",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
      expect(response.body.message.trim().length).toBeGreaterThan(0);
    });

    it("Admin creates a driver with an id that is improperly formatted", async () => {
      const response = await request(app)
        .post(DRIVERS_PATH)
        .set(admin)
        .send({
          ...activeDriver,
          driver_id: "abc",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
      expect(response.body.message.trim().length).toBeGreaterThan(0);
    });
  });

  describe("US-7.4 — Edit and delete drivers", () => {
    beforeEach(signInAdmin);

    it("Admin edits a driver", async () => {
      await request(app)
        .post(DRIVERS_PATH)
        .set(admin)
        .send({
          driver_id: 1,
          license_status: "suspended",
          license_exp_date: "05/2026",
          availability: "available",
        });

      const response = await request(app)
        .put(`${DRIVERS_PATH}/1`)
        .set(admin)
        .send({
          driver_id: 1,
          license_status: "active",
          license_exp_date: "05/2026",
          availability: "available",
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        license_status: "active",
        license_exp_date: "05/2026",
        availability: "available",
      });
    });

    it("Admin deletes a driver", async () => {
      await request(app).post(DRIVERS_PATH).set(admin).send(activeDriver);

      const response = await request(app).delete(`${DRIVERS_PATH}/1`).set(admin);

      expect(response.status).toBe(204);

      const listed = await request(app).get(DRIVERS_PATH).set(admin);
      const ids = (listed.body ?? []).map((driver) => String(driver.driver_id));
      expect(ids).not.toContain("1");
    });
  });

  describe("US-7.5 — Search drivers", () => {
    it("Unauthenticated API request to drivers", async () => {
      const response = await request(app).get(DRIVERS_PATH);

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringMatching(/unauthorized/i),
        })
      );
    });
  });
});
