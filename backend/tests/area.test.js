/**
 * Feature 13 — Area
 * Spec: features/feature-13-Area-CRUD.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";

const AREAS_PATH = "/api/areas";

async function authHeader(role) {
  const user = await db.user.create({
    firstName: "Ada",
    lastName: role === "admin" ? "Admin" : "Requester",
    email: `${role}@example.com`,
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

async function createNorthCampus(admin) {
  const response = await request(app).post(AREAS_PATH).set(admin).send({
    name: "North Campus",
    noticeEmail: "north@example.com",
  });

  expect(response.status).toBe(201);
  return response.body;
}

describe("Feature 13 — Area", () => {
  let admin;

  beforeEach(async () => {
    await syncTestDatabase();
    admin = await authHeader("admin");
  });

  describe("US-13.1 — Create an area", () => {
    it("Duplicate area name", async () => {
      await createNorthCampus(admin);

      const response = await request(app).post(AREAS_PATH).set(admin).send({
        name: "North Campus",
        noticeEmail: "other@example.com",
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: "Area name already in use!" });

      const listed = await request(app).get(AREAS_PATH).set(admin);
      expect(listed.body).toHaveLength(1);
    });

    it("Blank area", async () => {
      const response = await request(app).post(AREAS_PATH).set(admin).send({
        name: "   ",
        noticeEmail: "north@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Area is incomplete!" });

      const listed = await request(app).get(AREAS_PATH).set(admin);
      expect(listed.body).toEqual([]);
    });
  });

  describe("US-13.4 — Delete an area", () => {
    it("Admin deletes an unused area", async () => {
      const area = await createNorthCampus(admin);

      const response = await request(app).delete(`${AREAS_PATH}/${area.id}`).set(admin);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Area deleted." });

      const listed = await request(app).get(AREAS_PATH).set(admin);
      expect(listed.body.map((item) => item.name)).not.toContain("North Campus");
    });

    it("Area still in use", async () => {
      const area = await createNorthCampus(admin);
    
      await db.vehicle.create({
        vin: "1HGCM82633A004352",
        make: "Honda",
        model: "Accord",
        year: 2014,
        purchased_date: "2015-12-16",
        license_plate_num: "ABC344",
        tag_exp_month: "2026-05-25",
        area_id: area.id,   // must be the area you just created
        available: true,
      });
    
      const response = await request(app).delete(`${AREAS_PATH}/${area.id}`).set(admin);
    
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: "Area is in use!" });
    
      const listed = await request(app).get(AREAS_PATH).set(admin);
      expect(listed.body.map((item) => item.name)).toContain("North Campus");
    });
  });

  describe("US-13.5 — Block other roles", () => {
    it("rejects user, driver, and maintenance", async () => {
      const area = await createNorthCampus(admin);

      for (const role of ["user", "driver", "maintenance"]) {
        const headers = await authHeader(role);
        const listed = await request(app).get(AREAS_PATH).set(headers);
        const removed = await request(app).delete(`${AREAS_PATH}/${area.id}`).set(headers);

        expect(listed.status).toBe(403);
        expect(listed.body).toEqual({ message: "Forbidden" });
        expect(removed.status).toBe(403);
        expect(removed.body).toEqual({ message: "Forbidden" });
      }

      const stillThere = await request(app).get(AREAS_PATH).set(admin);
      expect(stillThere.body).toHaveLength(1);
    });
  });
});
