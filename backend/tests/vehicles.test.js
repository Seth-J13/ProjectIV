/**
 * Feature 4 — Vehicle CRUD
 * Spec: features/feature-4-Vehicle-CRUD.md
 */
import request from "supertest";
import app from "../server.js";
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
  department: "Engineering",
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

/**
 * Auth tokens for admin / maintenance sessions once Feature 1 auth is wired.
 * Controllers must reject missing/wrong-role tokens with 401 Unauthorized user.
 */
const adminAuth = { Authorization: "Bearer admin-test-token" };
const maintenanceAuth = { Authorization: "Bearer maintenance-test-token" };

beforeAll(async () => {
  await syncTestDatabase();
});

describe("Feature 4 — Vehicle CRUD", () => {
  describe("US-4.1 — Add a new vehicle as a `admin` role", () => {
    it("User inputs a `make`, `model`, and `year` that doesn't exist and a `fuel type` that doesn't exist into the comboboxes", async () => {
      const fuelRes = await request(app)
        .post(`${BASE}/fuels/`)
        .set(adminAuth)
        .send({ fuel_type: "E85-Unique-US41" });

      expect(fuelRes.status).toBe(201);
      expect(fuelRes.body.message).toMatch(/Successfully.*fuel/i);

      const fuelId = fuelRes.body.fuel_id ?? fuelRes.body.id ?? validMaintenanceInfo.fuel_type_id;

      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "NewMake41", model: "NewModel41", year: 2020 })
        .set(adminAuth)
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
        .set(adminAuth)
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
      const fuelList = await request(app).get(`${BASE}/fuels/`).set(adminAuth);
      expect(fuelList.status).toBe(200);
      const existingFuelId =
        fuelList.body?.[0]?.fuel_id ??
        fuelList.body?.[0]?.id ??
        validMaintenanceInfo.fuel_type_id;

      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "NewMake41b", model: "NewModel41b", year: 2021 })
        .set(adminAuth)
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
        .set(adminAuth)
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
      const fuelRes = await request(app)
        .post(`${BASE}/fuels/`)
        .set(adminAuth)
        .send({ fuel_type: "BioDiesel-US41" });

      expect(fuelRes.status).toBe(201);
      expect(fuelRes.body.message).toMatch(/Successfully.*fuel/i);

      const vehicleRes = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin: "33333333333333333",
          license_plate_num: "NEW41C",
        });

      expect(vehicleRes.status).toBe(201);
      expect(vehicleRes.body.message).toBe("Successfully created vehicle.");
    });

    it("User inputs valid information into the `Add Vehicle` modal", async () => {
      const res = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin: "44444444444444444",
          license_plate_num: "VAL41A",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully created vehicle.");
    });

    it("User inputs valid information into the `Add Vehicle` modal but a record already exists", async () => {
      const payload = {
        ...validVehicle,
        vin: "55555555555555555",
        license_plate_num: "DUP41A",
      };

      const first = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(adminAuth)
        .send(payload);
      expect([201, 409]).toContain(first.status);

      const second = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(adminAuth)
        .send(payload);

      expect(second.status).toBe(409);
      expect(typeof second.body.message).toBe("string");
      expect(second.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.2 — Add a new vehicle as a `maintenance` role", () => {
    it("User inputs valid information into the `Add Vehicle` modal", async () => {
      const res = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(maintenanceAuth)
        .send({
          ...validVehicle,
          vin: "66666666666666666",
          license_plate_num: "VAL42A",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully created vehicle.");
    });

    it("User inputs valid information into the `Add Vehicle` modal but a record already exists", async () => {
      const payload = {
        ...validVehicle,
        vin: "77777777777777777",
        license_plate_num: "DUP42A",
      };

      await request(app).put(`${BASE}/vehicles/`).set(maintenanceAuth).send(payload);

      const second = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(maintenanceAuth)
        .send(payload);

      expect(second.status).toBe(409);
      expect(typeof second.body.message).toBe("string");
      expect(second.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.3 — Edit a vehicle as a `admin` role", () => {
    const vin = "88888888888888888";

    beforeAll(async () => {
      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "EDT43A",
        });
    });

    it("User inputs a `make`, `model`, and `year` into the comboboxes that doesn't exist", async () => {
      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "EditMake43", model: "EditModel43", year: 2019 })
        .set(adminAuth)
        .send({
          ...validMaintenanceInfo,
          make: "EditMake43",
          model: "EditModel43",
          year: 2019,
        });

      expect(maintRes.status).toBe(201);
      expect(maintRes.body.message).toBe("Successfully created maintenance-info.");

      const updateRes = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin,
          make: "EditMake43",
          model: "EditModel43",
          year: 2019,
          license_plate_num: "EDT43A",
        });

      expect(updateRes.status).toBe(201);
      expect(updateRes.body.message).toBe("Successfully updated vehicle.");
    });

    it("User inputs valid information into the `Edit Vehicle` modal", async () => {
      const res = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin,
          color: "Blue",
          license_plate_num: "EDT43A",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully updated vehicle.");
    });

    it("User inputs valid information into the `Edit Vehicle` modal but a vehicle with a different VIN has the same licesnse plate number", async () => {
      const otherVin = "99999999999999999";
      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin: otherVin,
          license_plate_num: "TAKEN43",
        });

      const res = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "TAKEN43",
        });

      expect(res.status).toBe(409);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.4 — Edit a vehicle as a `maintenance` role", () => {
    const vin = "10101010101010101";

    beforeAll(async () => {
      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(maintenanceAuth)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "EDT44A",
        });
    });

    it("User inputs a `make`, `model`, and `year` into the comboboxes that doesn't exist", async () => {
      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "EditMake44", model: "EditModel44", year: 2018 })
        .set(maintenanceAuth)
        .send({
          ...validMaintenanceInfo,
          make: "EditMake44",
          model: "EditModel44",
          year: 2018,
        });

      expect(maintRes.status).toBe(201);
      expect(maintRes.body.message).toBe("Successfully created maintenance-info.");

      const updateRes = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(maintenanceAuth)
        .send({
          ...validVehicle,
          vin,
          make: "EditMake44",
          model: "EditModel44",
          year: 2018,
          license_plate_num: "EDT44A",
        });

      expect(updateRes.status).toBe(201);
      expect(updateRes.body.message).toBe("Successfully updated vehicle.");
    });

    it("User inputs valid information into the `Edit Vehicle` modal", async () => {
      const res = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(maintenanceAuth)
        .send({
          ...validVehicle,
          vin,
          color: "Red",
          license_plate_num: "EDT44A",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully updated vehicle.");
    });

    it("User inputs valid information into the `Edit Vehicle` modal but a vehicle with a different VIN has the same licesnse plate number", async () => {
      const otherVin = "12121212121212121";
      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(maintenanceAuth)
        .send({
          ...validVehicle,
          vin: otherVin,
          license_plate_num: "TAKEN44",
        });

      const res = await request(app)
        .post(`${BASE}/vehicles/${vin}`)
        .set(maintenanceAuth)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "TAKEN44",
        });

      expect(res.status).toBe(409);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.5 — Delete a vehicle as a `admin` role", () => {
    it("User clicks the delete icon button", async () => {
      const vin = "13131313131313131";
      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "DEL45A",
        });

      const res = await request(app)
        .delete(`${BASE}/vehicles/${vin}`)
        .set(adminAuth);

      expect(res.status).toBeLessThan(400);

      const getRes = await request(app)
        .get(`${BASE}/vehicles/${vin}`)
        .set(adminAuth);
      expect([404, 500]).toContain(getRes.status);
    });

    it("User clicks the delete icon button but no vehicle exists in the database", async () => {
      const res = await request(app)
        .delete(`${BASE}/vehicles/00000000000000000`)
        .set(adminAuth);

      expect(res.status).toBe(500);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.6 — Delete a vehicle as a `maintenance` role", () => {
    it("User clicks the delete icon button", async () => {
      const vin = "14141414141414141";
      await request(app)
        .put(`${BASE}/vehicles/`)
        .set(maintenanceAuth)
        .send({
          ...validVehicle,
          vin,
          license_plate_num: "DEL46A",
        });

      const res = await request(app)
        .delete(`${BASE}/vehicles/${vin}`)
        .set(maintenanceAuth);

      expect(res.status).toBeLessThan(400);

      const getRes = await request(app)
        .get(`${BASE}/vehicles/${vin}`)
        .set(maintenanceAuth);
      expect([404, 500]).toContain(getRes.status);
    });

    it("User clicks the delete icon button but no vehicle exists in the database", async () => {
      const res = await request(app)
        .delete(`${BASE}/vehicles/00000000000000001`)
        .set(maintenanceAuth);

      expect(res.status).toBe(500);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-4.15 — Confirm create new `maintenance-info` as a admin", () => {
    it("User clicks the `confirm` button", async () => {
      const fuelRes = await request(app)
        .post(`${BASE}/fuels/`)
        .set(adminAuth)
        .send({ fuel_type: "ConfirmFuel-US415" });

      expect(fuelRes.status).toBe(201);
      expect(fuelRes.body.message).toMatch(/Successfully.*fuel/i);

      const fuelId = fuelRes.body.fuel_id ?? fuelRes.body.id ?? 1;

      const maintRes = await request(app)
        .put(`${BASE}/maintenance-info`)
        .query({ make: "ConfirmMake", model: "ConfirmModel", year: 2017 })
        .set(adminAuth)
        .send({
          ...validMaintenanceInfo,
          make: "ConfirmMake",
          model: "ConfirmModel",
          year: 2017,
          fuel_type_id: fuelId,
        });

      expect(maintRes.status).toBe(201);
      expect(maintRes.body.message).toBe("Successfully created maintenance-info.");

      const vehicleRes = await request(app)
        .put(`${BASE}/vehicles/`)
        .set(adminAuth)
        .send({
          ...validVehicle,
          vin: "15151515151515151",
          make: "ConfirmMake",
          model: "ConfirmModel",
          year: 2017,
          license_plate_num: "CNF415",
        });

      expect(vehicleRes.status).toBe(201);
      expect(vehicleRes.body.message).toBe("Successfully created vehicle.");
    });
  });

});
