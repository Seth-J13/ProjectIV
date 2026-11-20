/**
 * Feature 12 — Landing Vue
 * Spec: features/feature-12-Landing-Vue.md
 *
 * Landing reuses the Feature 8 API (`/api/vehicles`, `/api/requests`).
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";

const REQUESTS_PATH = "/api/requests";
const VEHICLES_PATH = "/api/vehicles";

function isoDay(offsetDays) {
  const day = new Date();
  day.setDate(day.getDate() + offsetDays);
  return day.toLocaleDateString("en-CA");
}

// Started yesterday and ends tomorrow, so the request is in use right now.
function tripBody(overrides = {}) {
  return {
    requestType: "trip",
    vehicleId: "12",
    driverId: 3,
    destId: 7,
    startDate: isoDay(-1),
    startTime: "",
    endDate: isoDay(1),
    endTime: "",
    numPeople: 4,
    ...overrides,
  };
}

function maintenanceBody(overrides = {}) {
  return {
    requestType: "maintenance",
    vehicleId: "12",
    startDate: isoDay(-1),
    startTime: "",
    ...overrides,
  };
}

async function signIn(role, username = role) {
  const user = await db.user.create({
    firstName: "Ada",
    lastName: username,
    email: `${username}@example.com`,
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

function requestIds(body) {
  return (Array.isArray(body) ? body : []).map((row) => row.requestId);
}

async function seedCatalog() {
  await db.area.create({ id: 1, name: "Campus", noticeEmail: "campus@example.com" });
  await db.vehicle.create({
    vin: "12",
    make: "Ford",
    model: "Transit",
    year: 2024,
    purchased_date: "2024-01-01",
    license_plate_num: "ABC-1234",
    tag_exp_month: "2026-12-01",
    area_id: 1,
    available: true,
  });
  await db.vehicle.create({
    vin: "34",
    make: "Toyota",
    model: "Camry",
    year: 2022,
    purchased_date: "2022-01-01",
    license_plate_num: "XYZ-9876",
    tag_exp_month: "2026-12-01",
    area_id: 1,
    available: true,
  });
  await db.driver.create({
    driver_id: 3,
    name: "Jane Doe",
    license_status: "active",
    license_exp_date: "08/2028",
    availability: "available",
  });
  await db.destination.create({
    id: 7,
    zip: "68508",
    city: "Lincoln",
    state: "Nebraska",
    addr_line_1: "1445 K Street",
    dest_name: "State Capitol",
  });
}

describe("Feature 12 — Landing Vue", () => {
  beforeEach(async () => {
    await syncTestDatabase();
    await seedCatalog();
  });

  describe("US-12.1 — View Available Vehicles", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      const reserver = await signIn("user", "reserver");
      const viewer = await signIn("driver", "viewer");
      await request(app).post(REQUESTS_PATH).set(reserver.headers).send(tripBody());
      // Booked three weeks ahead: reserved, but the vehicle is not in use yet.
      await request(app)
        .post(REQUESTS_PATH)
        .set(reserver.headers)
        .send(tripBody({ vehicleId: "34", startDate: isoDay(20), endDate: isoDay(21) }));

      const response = await request(app).get(VEHICLES_PATH).set(viewer.headers);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        expect.objectContaining({
          vehicleId: "12",
          license: "ABC-1234",
          make: "Ford",
          model: "Transit",
          year: 2024,
          available: true,
          inUse: true,
        }),
        expect.objectContaining({
          vehicleId: "34",
          license: "XYZ-9876",
          make: "Toyota",
          model: "Camry",
          year: 2022,
          available: true,
          inUse: false,
        }),
      ]);
    });

  });

  describe("US-12.3 — View Vehicles Currently in Service", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      const admin = await signIn("admin", "boss");
      const mechanic = await signIn("maintenance", "mechanic");
      const worker = await signIn("user", "worker");
      const driver = await signIn("driver", "pilot");

      const adminService = await request(app)
        .post(REQUESTS_PATH)
        .set(admin.headers)
        .send(maintenanceBody());
      const workerTrip = await request(app)
        .post(REQUESTS_PATH)
        .set(worker.headers)
        .send(tripBody({ vehicleId: "34" }));
      const mechanicTrip = await request(app)
        .post(REQUESTS_PATH)
        .set(mechanic.headers)
        .send(tripBody({ vehicleId: "34" }));

      const mechanicView = await request(app).get(REQUESTS_PATH).set(mechanic.headers);
      const driverView = await request(app).get(REQUESTS_PATH).set(driver.headers);

      expect(mechanicView.status).toBe(200);
      expect(requestIds(mechanicView.body)).toEqual(
        expect.arrayContaining([adminService.body.requestId, mechanicTrip.body.requestId])
      );
      expect(requestIds(mechanicView.body)).not.toContain(workerTrip.body.requestId);

      expect(driverView.status).toBe(200);
      expect(requestIds(driverView.body)).toEqual([]);
    });
  });

  describe("US-12.5 — View `TripRequestVorm.vue` component", () => {
    it("User correctly fills out the `TripRequestVorm.vue`", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { user, headers } = await signIn(role, `${role}-trip`);
        const response = await request(app)
          .post(REQUESTS_PATH)
          .set(headers)
          .send(tripBody({ requesterId: 99999 }));

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          requestType: "trip",
          requesterId: user.id,
          numPeople: 4,
        });
        expect(response.body.requestId).toBeDefined();
      }
    });

    it("User incorrectly fills out the `TripRequestVorm.vue`", async () => {
      const { headers } = await signIn("user", "worker");
      const response = await request(app)
        .post(REQUESTS_PATH)
        .set(headers)
        .send({ requestType: "trip", vehicleId: "12" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "driver is required." });
    });
  });

  describe("US-12.6 — View `MaintenanceRequestVorm.vue` component", () => {
    it("User correctly fills out the `MaintenanceRequestVorm.vue`", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { headers } = await signIn(role, `${role}-service`);
        const response = await request(app)
          .post(REQUESTS_PATH)
          .set(headers)
          .send(maintenanceBody());

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ requestType: "maintenance", vehicleId: "12" });
        expect(response.body.requestId).toBeDefined();
      }
    });

    it("User incorrectly fills out the `MaintenanceRequestVorm.vue`", async () => {
      const { headers } = await signIn("maintenance", "mechanic");
      const response = await request(app)
        .post(REQUESTS_PATH)
        .set(headers)
        .send({ requestType: "maintenance" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "vehicle is required." });
    });
  });

  describe("US-12.7 — View `Reserved Vehicles`", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      const admin = await signIn("admin", "boss");
      const first = await signIn("user", "ada");
      const second = await signIn("driver", "ben");
      const firstTrip = await request(app)
        .post(REQUESTS_PATH)
        .set(first.headers)
        .send(tripBody());
      const secondTrip = await request(app)
        .post(REQUESTS_PATH)
        .set(second.headers)
        .send(tripBody({ vehicleId: "34" }));

      const response = await request(app).get(REQUESTS_PATH).set(admin.headers);

      expect(response.status).toBe(200);
      expect(requestIds(response.body)).toEqual(
        expect.arrayContaining([firstTrip.body.requestId, secondTrip.body.requestId])
      );
    });
  });
});
