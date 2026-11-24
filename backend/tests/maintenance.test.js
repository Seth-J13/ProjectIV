/**
 * Feature 5 — Maintenance Info CRUD
 * Spec: features/feature-5-Maintenance-Info-CRUD.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";

const BASE = "/api/vehicle-t3";
const sampleVin = "12345671234567123";

const sampleMaintenanceInfo = {
  make: "Honda",
  model: "Accord",
  year: 2014,
  fuel_type_id: 1,
  fuel_capacity: 30,
  oil_viscosity: "5W4",
  recommended_tire_psi: 35,
  tire_type: "P205/55R16 95H",
};

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
  return { Authorization: `Bearer ${token}` };
}

async function seedBasics() {
  await db.area.create({
    id: 5,
    name: "Engineering",
    noticeEmail: "engineering@example.com",
  });
  const fuel = await db.fuelType.create({ fuel_type: "87 Octane" });
  sampleMaintenanceInfo.fuel_type_id = fuel.fuel_id;

  await db.vehicle.create({
    vin: sampleVin,
    make: "Honda",
    model: "Accord",
    year: 2014,
    purchased_date: "2015-12-16",
    color: "White",
    license_plate_num: "ABC344",
    tag_exp_month: "2016-05-25",
    area_id: 5,
    most_recent_dest_id: null,
    available: true,
    mileage: 5000,
  });

  await db.maintenanceInfo.create({
    ...sampleMaintenanceInfo,
    fuel_type_id: fuel.fuel_id,
  });

  await db.request.create({
    requestId: 5,
    requestType: "maintenance",
    requesterId: 1,
    vehicleId: sampleVin,
  });
}

beforeEach(async () => {
  await syncTestDatabase();
  await seedBasics();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 5 — Maintenance Info CRUD", () => {
  describe("US-5.2 — User updates the car's mileage", () => {
    it("User clicks the `confirm` button", async () => {
      const admin = await authHeader("admin", "admin55");
      const res = await request(app)
        .put(`${BASE}/vehicles/${sampleVin}`)
        .set(admin)
        .send({ mileage: 5320 });

      expect(res.status).toBe(200);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-5.5 — User clicks the `Edit Maintenance Info` button", () => {
    it("User enters valid input for all fields", async () => {
      const admin = await authHeader("admin", "admin59a");
      const res = await request(app)
        .put(`${BASE}/maintenance-infos`)
        .query({ make: "Honda", model: "Accord", year: 2014 })
        .set(admin)
        .send(sampleMaintenanceInfo);

      expect(res.status).toBe(200);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User inputs a fuel type that doesn't exist", async () => {
      const admin = await authHeader("admin", "admin59b");
      const res = await request(app)
        .post(`${BASE}/fuels/`)
        .set(admin)
        .send({ fuel_type: "E85-Feature5" });

      expect(res.status).toBe(201);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User clicks confirms the `fuel type` and/or `make`, `year`, and `model`", async () => {
      const admin = await authHeader("admin", "admin59c");
      const fuelRes = await request(app)
        .post(`${BASE}/fuels/`)
        .set(admin)
        .send({ fuel_type: "ConfirmFuel-F5" });
      expect([200, 201]).toContain(fuelRes.status);

      const fuelId = fuelRes.body.fuel_id ?? fuelRes.body.id;

      const createMaint = await request(app)
        .post(`${BASE}/maintenance-info/`)
        .set(admin)
        .send({
          ...sampleMaintenanceInfo,
          make: "NewMake5",
          model: "NewModel5",
          year: 2020,
          fuel_type_id: fuelId,
        });
      expect(createMaint.status).toBe(201);
      expect(typeof createMaint.body.message).toBe("string");

      const updateMaint = await request(app)
        .put(`${BASE}/maintenance-infos`)
        .query({ make: "NewMake5", model: "NewModel5", year: 2020 })
        .set(admin)
        .send({
          ...sampleMaintenanceInfo,
          make: "NewMake5",
          model: "NewModel5",
          year: 2020,
          fuel_type_id: fuelId,
        });
      expect(updateMaint.status).toBe(200);

      const vehicleUpdate = await request(app)
        .put(`${BASE}/vehicles/${sampleVin}`)
        .set(admin)
        .send({
          make: "NewMake5",
          model: "NewModel5",
          year: 2020,
        });
      expect(vehicleUpdate.status).toBe(200);
      expect(typeof vehicleUpdate.body.message).toBe("string");
    });
  });

  describe("US-5.6 — User clicks the `Manage Fuels` button", () => {
    it("User clicks the `update` button on the `Edit Fuel` modal", async () => {
      const admin = await authHeader("admin", "admin510a");
      const created = await request(app)
        .post(`${BASE}/fuels/`)
        .set(admin)
        .send({ fuel_type: "ManageFuel-F5" });
      const fuelId = created.body.fuel_id ?? created.body.id;

      const res = await request(app)
        .put(`${BASE}/fuels/${fuelId}`)
        .set(admin)
        .send({ fuel_type: "ManageFuel-Updated" });

      expect(res.status).toBe(200);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User clicks the `Add` button on the `Add Fuel` modal", async () => {
      const maintenance = await authHeader("maintenance", "maint510b");
      const res = await request(app)
        .post(`${BASE}/fuels/`)
        .set(maintenance)
        .send({ fuel_type: "BrandNewFuel-F5" });

      expect(res.status).toBe(201);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User clicks the `Delete` button on the `View Fuel Management` modal", async () => {
      const admin = await authHeader("admin", "admin510c");
      const created = await request(app)
        .post(`${BASE}/fuels/`)
        .set(admin)
        .send({ fuel_type: "DeleteMe-F5" });
      const id = created.body.fuel_id ?? created.body.id;

      const res = await request(app).delete(`${BASE}/fuels/${id}`).set(admin);
      expect(res.status).toBe(200);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });
});
