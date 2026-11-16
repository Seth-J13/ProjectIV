/**
 * Feature 4 — Vehicle CRUD
 * Spec: features/feature-4-Vehicle-CRUD.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";

const BASE = "/api/vehicle-t3";

const validVehicle = {
  vin: "12345671234567123",
  make: "Honda",
  model: "Accord",
  year: 2014,
  purchased_date: "2015/12/16",
  color: "White",
  license_plate_num: "ABC344",
  tag_exp_month: "2016/5/25",
  area_id: 5,
  most_recent_dest_id: null,
  available: 1,
  mileage: 0,
};

const validMaintenanceInfo = {
  make: "Honda",
  model: "Accord",
  year: 2014,
  fuel_type_id: 2,
  fuel_capacity: 30,
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

async function seedArea(id = 5, name = "Engineering") {
  const existing = await db.area.findByPk(id);
  if (existing) {
    return existing;
  }

  return db.area.create({
    id,
    name,
    noticeEmail: `${name.toLowerCase()}@example.com`,
  });
}

async function seedDefaultFuel() {
  const existing = await db.fuelType.findOne({ where: { fuel_type: "87 Octane" } });
  if (existing) {
    return existing;
  }
  return db.fuelType.create({ fuel_type: "87 Octane" });
}

beforeEach(async () => {
  await syncTestDatabase();
  await seedArea(5, "Engineering");
  await seedArea(6, "Facilities");
  await seedDefaultFuel();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 4 — Vehicle CRUD", () => {
  describe("US-4.1 — Add a new vehicle as a `admin` role", () => {
    it("User inputs a missing `make`, `model`, `year`, and `fuel type`", async () => {
      const admin = await authHeader("admin", "admin41");

      const fuelRes = await request(app)
        .post(`${BASE}/fuels/`)
        .set(admin)
        .send({ fuel_type: "E85-Unique-US41" });

      expect(fuelRes.status).toBe(201);
      expect(fuelRes.body.message).toMatch(/Successfully.*fuel/i);

      const fuelId = fuelRes.body.fuel_id;

      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "NewMake41", model: "NewModel41", year: 2020 })
        .set(admin)
        .send({
          ...validMaintenanceInfo,
          make: "NewMake41",
          model: "NewModel41",
          year: 2020,
          fuel_type_id: fuelId,
        });

      expect(maintRes.status).toBe(201);
      expect(maintRes.body.message).toBe("Successfully created maintenance-info.");

      const vehicleRes = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin: "11111111111111111",
          make: "NewMake41",
          model: "NewModel41",
          year: 2020,
          license_plate_num: "NEW41A",
        });

      expect(vehicleRes.status).toBe(201);
      expect(vehicleRes.body.message).toBe("Successfully created vehicle.");
    });

    it("User inputs a `make`, `model`, and `year` into the comboboxes that doesn't exist", async () => {
      const admin = await authHeader("admin", "admin41b");
      const fuelList = await request(app).get(`${BASE}/fuels/`).set(admin);
      expect(fuelList.status).toBe(200);
      const existingFuelId = fuelList.body?.[0]?.fuel_id;

      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "NewMake41b", model: "NewModel41b", year: 2021 })
        .set(admin)
        .send({
          ...validMaintenanceInfo,
          make: "NewMake41b",
          model: "NewModel41b",
          year: 2021,
          fuel_type_id: existingFuelId,
        });

      expect(maintRes.status).toBe(201);
      expect(maintRes.body.message).toBe("Successfully created maintenance-info.");

      const vehicleRes = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin: "22222222222222222",
          make: "NewMake41b",
          model: "NewModel41b",
          year: 2021,
          license_plate_num: "NEW41B",
        });

      expect(vehicleRes.status).toBe(201);
      expect(vehicleRes.body.message).toBe("Successfully created vehicle.");
    });

    it("User inputs a `fuel type` into the combobox that doesn't exist", async () => {
      const admin = await authHeader("admin", "admin41c");

      const fuelRes = await request(app)
        .post(`${BASE}/fuels/`)
        .set(admin)
        .send({ fuel_type: "BioDiesel-US41" });

      expect(fuelRes.status).toBe(201);
      expect(fuelRes.body.message).toMatch(/Successfully.*fuel/i);

      const vehicleRes = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin: "33333333333333333",
          license_plate_num: "NEW41C",
        });

      expect(vehicleRes.status).toBe(201);
      expect(vehicleRes.body.message).toBe("Successfully created vehicle.");
    });

    it("User inputs valid information into the `Add Vehicle` modal", async () => {
      const admin = await authHeader("admin", "admin41d");
      const res = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin: "44444444444444444",
          license_plate_num: "VAL41A",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully created vehicle.");
    });

    it("User inputs valid information into the `Add Vehicle` modal but a record already exists", async () => {
      const admin = await authHeader("admin", "admin41e");
      const payload = {
        ...validVehicle,
        vin: "55555555555555555",
        license_plate_num: "DUP41A",
      };

      const first = await request(app).put(`${BASE}/vehicles/`).set(admin).send(payload);
      expect([201, 409]).toContain(first.status);

      const second = await request(app).put(`${BASE}/vehicles/`).set(admin).send(payload);
      expect(second.status).toBe(409);
      expect(typeof second.body.message).toBe("string");
      expect(second.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.2 — Add a new vehicle as a `maintenance` role", () => {
    it("User inputs valid information into the `Add Vehicle` modal", async () => {
      const maintenance = await authHeader("maintenance", "maint42a");
      const res = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(maintenance)
        .send({
          ...validVehicle,
          vin: "66666666666666666",
          license_plate_num: "VAL42A",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully created vehicle.");
    });

    it("User inputs valid information into the `Add Vehicle` modal but a record already exists", async () => {
      const maintenance = await authHeader("maintenance", "maint42b");
      const payload = {
        ...validVehicle,
        vin: "77777777777777777",
        license_plate_num: "DUP42A",
      };

      await request(app).put(`${BASE}/vehicles/`).set(maintenance).send(payload);

      const second = await request(app).put(`${BASE}/vehicles/`).set(maintenance).send(payload);
      expect(second.status).toBe(409);
      expect(typeof second.body.message).toBe("string");
      expect(second.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.3 — Edit a vehicle as a `maintenance` or `admin` role", () => {
    it("User inputs a `make`, `model`, and `year` into the comboboxes that doesn't exist", async () => {
      const admin = await authHeader("admin", "admin43a");
      const vin = "88888888888888888";
      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "EDT43A",
        });

      const fuelList = await request(app).get(`${BASE}/fuels/`).set(admin);
      const fuelId = fuelList.body?.[0]?.fuel_id;

      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "EditMake43", model: "EditModel43", year: 2019 })
        .set(admin)
        .send({
          ...validMaintenanceInfo,
          make: "EditMake43",
          model: "EditModel43",
          year: 2019,
          fuel_type_id: fuelId,
        });

      expect(maintRes.status).toBe(201);
      expect(maintRes.body.message).toBe("Successfully created maintenance-info.");

      const updateRes = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(admin)
        .send({
          make: "EditMake43",
          model: "EditModel43",
          year: 2019,
          purchased_date: "2015/12/16",
          color: "Blue",
          license_plate_num: "EDT43A",
          tag_exp_month: "2016/5/25",
          area_id: 5,
          available: 1,
        });

      expect(updateRes.status).toBe(201);
      expect(updateRes.body.message).toBe("Successfully updated vehicle.");
    });

    it("User inputs valid information into the `Edit Vehicle` modal", async () => {
      const admin = await authHeader("admin", "admin43b");
      const vin = "99999999999999999";
      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "EDT43B",
        });

      const res = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(admin)
        .send({
          make: "Honda",
          model: "Accord",
          year: 2014,
          purchased_date: "2015/12/16",
          color: "Black",
          license_plate_num: "EDT43B",
          tag_exp_month: "2016/5/25",
          area_id: 5,
          available: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully updated vehicle.");
    });

    it("Valid `Edit Vehicle` input duplicates another VIN's license plate", async () => {
      const admin = await authHeader("admin", "admin43c");
      const vin = "10101010101010101";

      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "EDT43C",
        });

      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin: "12121212121212121",
          license_plate_num: "TAKEN43",
        });

      const res = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(admin)
        .send({
          make: "Honda",
          model: "Accord",
          year: 2014,
          purchased_date: "2015/12/16",
          color: "White",
          license_plate_num: "TAKEN43",
          tag_exp_month: "2016/5/25",
          area_id: 5,
          available: 1,
        });

      expect(res.status).toBe(409);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.4 — Delete a vehicle as a `maintenance` or `admin` role", () => {
    it("User clicks the delete icon button", async () => {
      const admin = await authHeader("admin", "admin44a");
      const vin = "13131313131313131";

      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "DEL44A",
        });

      const del = await request(app).delete(`${BASE}/vehicles/${vin}`).set(admin);
      expect(del.status).toBe(200);

      const missing = await request(app).get(`${BASE}/vehicles/${vin}`).set(admin);
      expect(missing.status).toBe(404);
    });

    it("User clicks the delete icon button but no vehicle exists in the database", async () => {
      const admin = await authHeader("admin", "admin44b");
      const res = await request(app).delete(`${BASE}/vehicles/00000000000000000`).set(admin);
      expect(res.status).toBe(404);
      expect(typeof res.body.message).toBe("string");
    });
  });

  describe("US-4.9 — Confirm create new `maintenance-info` as a `maintenance` or `admin`", () => {
    it("User clicks the `confirm` button with `Confirm Create New Fuel Type` modal open", async () => {
      const admin = await authHeader("admin", "admin49");

      const fuelRes = await request(app)
        .post(`${BASE}/fuels/`)
        .set(admin)
        .send({ fuel_type: "ConfirmFuel49" });

      expect(fuelRes.status).toBe(201);
      expect(fuelRes.body.message).toMatch(/Successfully.*fuel/i);

      const fuelId = fuelRes.body.fuel_id;

      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "ConfirmMake49", model: "ConfirmModel49", year: 2018 })
        .set(admin)
        .send({
          ...validMaintenanceInfo,
          make: "ConfirmMake49",
          model: "ConfirmModel49",
          year: 2018,
          fuel_type_id: fuelId,
        });

      expect(maintRes.status).toBe(201);
      expect(maintRes.body.message).toBe("Successfully created maintenance-info.");

      const vehicleRes = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(admin)
        .send({
          ...validVehicle,
          vin: "14141414141414141",
          make: "ConfirmMake49",
          model: "ConfirmModel49",
          year: 2018,
          license_plate_num: "CNF49A",
        });

      expect(vehicleRes.status).toBe(201);
      expect(vehicleRes.body.message).toBe("Successfully created vehicle.");
    });
  });
});
