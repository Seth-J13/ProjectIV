/**
 * Feature 10 — Vehicle Service Log
 * Spec: features/feature-10-Vehicle-Service-CRUD copy.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";
import { purgeExpiredVehicleLogs } from "../app/controllers/vehicleLog.controller.js";

const LOGS_PATH = "/api/vehicle-logs";
const VIN = "1HGCM82633A004352";

async function authHeader(role, label = role) {
  const user = await db.user.create({
    firstName: "Ada",
    lastName: label,
    email: `${label}@example.com`,
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

  return { user, headers: { Authorization: `Bearer ${token}` } };
}

async function seedVehicle() {
  await db.area.create({
    name: "North Campus",
    noticeEmail: "north@example.com",
  });
  const area = await db.area.findOne({ where: { name: "North Campus" } });

  await db.vehicle.create({
    vin: VIN,
    make: "Honda",
    model: "Accord",
    year: 2003,
    purchased_date: "2015-12-16",
    tag_exp_month: "2016-05-25",
    area_id: area.id,
    available: true,
    mileage: 0,
  });
}

function logBody(overrides = {}) {
  return {
    serviceDate: "2026-11-10",
    vin: VIN,
    description: "Replaced front brake pads",
    completed: true,
    ...overrides,
  };
}

describe("Feature 10 — Vehicle Service Log", () => {
  let maintenance;
  let admin;

  beforeEach(async () => {
    await syncTestDatabase();
    await seedVehicle();
    maintenance = await authHeader("maintenance", "maintenance");
    admin = await authHeader("admin", "admin");
  });

  describe("US-10.1 — Create Vehicle logs", () => {
    it("Admin creates a log", async () => {
      const response = await request(app).post(LOGS_PATH).set(admin.headers).send(logBody());

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        serviceDate: "2026-11-10",
        vin: VIN,
        description: "Replaced front brake pads",
        completed: true,
        creatorId: admin.user.id,
        ownerIds: [admin.user.id],
      });
    });

    it("Blank log", async () => {
      const response = await request(app).post(LOGS_PATH).set(maintenance.headers).send({
        serviceDate: "2026-11-10",
        vin: VIN,
        description: "   ",
        completed: true,
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Vehicle log is incomplete!" });

      const listed = await request(app).get(LOGS_PATH).set(maintenance.headers);
      expect(listed.body).toEqual([]);
    });
  });

  describe("US-10.2 — Vehicle logs Ownership permissions", () => {
    it("Owner assigns another owner", async () => {
      const created = await request(app).post(LOGS_PATH).set(maintenance.headers).send(logBody());
      const other = await authHeader("maintenance", "other-owner");

      const assigned = await request(app)
        .post(`${LOGS_PATH}/${created.body.id}/owners`)
        .set(maintenance.headers)
        .send({ userId: other.user.id });

      expect(assigned.status).toBe(200);
      expect(assigned.body.ownerIds).toEqual(expect.arrayContaining([maintenance.user.id, other.user.id]));

      const updated = await request(app)
        .put(`${LOGS_PATH}/${created.body.id}`)
        .set(other.headers)
        .send(logBody({ description: "Owner updated the pads" }));

      expect(updated.status).toBe(200);
      expect(updated.body.description).toBe("Owner updated the pads");
    });

    it("Non-owner cannot modify", async () => {
      const created = await request(app).post(LOGS_PATH).set(maintenance.headers).send(logBody());
      const stranger = await authHeader("maintenance", "stranger");

      const response = await request(app)
        .put(`${LOGS_PATH}/${created.body.id}`)
        .set(stranger.headers)
        .send(logBody({ description: "Should not save" }));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });

      const listed = await request(app).get(LOGS_PATH).set(maintenance.headers);
      expect(listed.body[0].description).toBe("Replaced front brake pads");
    });
  });

  describe("US-10.4 — Modify Vehicle Log", () => {
    it("Admin updates any log", async () => {
      const created = await request(app).post(LOGS_PATH).set(maintenance.headers).send(logBody());

      const response = await request(app)
        .put(`${LOGS_PATH}/${created.body.id}`)
        .set(admin.headers)
        .send(logBody({ completed: false }));

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(false);
      expect(response.body.creatorId).toBe(maintenance.user.id);
    });
  });

  describe("US-10.5 — Delete Vehicle Logs", () => {
    it("Log older than 18 months is removed", async () => {
      const created = await request(app)
        .post(LOGS_PATH)
        .set(maintenance.headers)
        .send(logBody({ serviceDate: "2020-01-01" }));

      expect(created.status).toBe(201);

      await purgeExpiredVehicleLogs();

      const listed = await request(app).get(LOGS_PATH).set(maintenance.headers);
      expect(listed.body.map((log) => log.id)).not.toContain(created.body.id);
    });

    it("Non-owner cannot delete", async () => {
      const created = await request(app).post(LOGS_PATH).set(maintenance.headers).send(logBody());
      const stranger = await authHeader("maintenance", "deleter");

      const response = await request(app)
        .delete(`${LOGS_PATH}/${created.body.id}`)
        .set(stranger.headers);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });

      const listed = await request(app).get(LOGS_PATH).set(maintenance.headers);
      expect(listed.body.map((log) => log.vin)).toContain(VIN);
    });
  });
});
