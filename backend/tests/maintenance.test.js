/**
 * Feature 5 — Maintenance Info CRUD
 * Spec: features/feature-5-Maintenance-Info-CRUD.md
 */
import request from "supertest";
import app from "../server.js";
import { syncTestDatabase } from "./helpers.js";

const BASE = "/api/vehicle-t3";

const adminAuth = { Authorization: "Bearer admin-test-token" };
const maintenanceAuth = { Authorization: "Bearer maintenance-test-token" };

const sampleNote = {
  submitted_when: "Morning",
  type: "Maintenance",
  maintenance_request: true,
  request_id: 5,
  name: "John Doe",
  date: "2026-10-29",
  text: "Increased the tire pressure and fixed the steering.",
  subject: "Tire pressure",
};

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

const sampleVin = "12345671234567123";

beforeAll(async () => {
  await syncTestDatabase();
});

describe("Feature 5 — Maintenance Info CRUD", () => {
  describe("US-5.2 —  User adds a maintenance note", () => {
    it("User inputs valid input into the `Add Maintenance Note` modal", async () => {
      const res = await request(app)
        .post(`${BASE}/notes/`)
        .set(adminAuth)
        .send(sampleNote);

      expect(res.status).toBe(201);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User inputs invalid input into the `Add Maintenance Note` modal", async () => {
      const res = await request(app)
        .post(`${BASE}/notes/`)
        .set(adminAuth)
        .send({ ...sampleNote, request_id: 999999 });

      expect(res.status).toBe(404);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-5.3 — User edits a maintenance note", () => {
    let noteId;

    beforeAll(async () => {
      const created = await request(app)
        .post(`${BASE}/notes/`)
        .set(adminAuth)
        .send({ ...sampleNote, subject: "Editable note" });
      noteId = created.body.note_id ?? created.body.id ?? 1;
    });

    it("User inputs valid input into the `Edit Maintenance Note` modal", async () => {
      const res = await request(app)
        .put(`${BASE}/notes/${noteId}`)
        .set(adminAuth)
        .send({
          ...sampleNote,
          subject: "Updated subject",
          text: "Updated description text.",
        });

      expect(res.status).toBe(201);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User inputs invalid input into the `Edit Maintenance Note` modal", async () => {
      const res = await request(app)
        .put(`${BASE}/notes/999999`)
        .set(maintenanceAuth)
        .send({
          ...sampleNote,
          subject: "Missing note",
        });

      expect(res.status).toBe(404);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-5.4 — User deletes a maintenance note", () => {
    it("User clicks `confirm` button", async () => {
      const created = await request(app)
        .post(`${BASE}/notes/`)
        .set(adminAuth)
        .send({ ...sampleNote, subject: "Complete me" });
      const noteId = created.body.note_id ?? created.body.id ?? 1;

      const logRes = await request(app)
        .post(`${BASE}/vehicle-service-logs/`)
        .set(adminAuth)
        .send({
          vehicle_id: sampleVin,
          date: "2026-10-31",
          type: "maintenance",
          value: "Vehicle needs new tires",
        });

      expect(logRes.status).toBe(201);
      expect(typeof logRes.body.message).toBe("string");
      expect(logRes.body.message.length).toBeGreaterThan(0);

      const deleteRes = await request(app)
        .delete(`${BASE}/notes/${noteId}`)
        .set(adminAuth);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toMatch(/Successfully deleted/i);
    });
  });

  describe("US-5.5 — User updates the car's mileage", () => {
    it("User clicks the `confirm` button", async () => {
      const res = await request(app)
        .put(`${BASE}/vehicles/${sampleVin}`)
        .set(adminAuth)
        .send({ mileage: 5320 });

      expect(res.status).toBe(200);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("US-5.9 — User clicks the `Edit Maintenance Info` button", () => {
    it("User enters valid input for all fields", async () => {
      const res = await request(app)
        .put(`${BASE}/maintenance-infos`)
        .query({ make: "Honda", model: "Accord", year: 2014 })
        .set(adminAuth)
        .send(sampleMaintenanceInfo);

      expect(res.status).toBe(200);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User inputs a fuel type that doesn't exist", async () => {
      const res = await request(app)
        .post(`${BASE}/fuels/`)
        .set(adminAuth)
        .send({ fuel_type: "E85-Feature5" });

      expect(res.status).toBe(201);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User clicks confirms the `fuel type` and/or `make`, `year`, and `model`", async () => {
      const fuelRes = await request(app)
        .post(`${BASE}/fuels/`)
        .set(adminAuth)
        .send({ fuel_type: "ConfirmFuel-F5" });
      expect([200, 201]).toContain(fuelRes.status);

      const fuelId = fuelRes.body.fuel_id ?? fuelRes.body.id ?? 1;

      const createMaint = await request(app)
        .post(`${BASE}/maintenance-info/`)
        .set(adminAuth)
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
        .set(adminAuth)
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
        .set(adminAuth)
        .send({
          make: "NewMake5",
          model: "NewModel5",
          year: 2020,
        });
      expect(vehicleUpdate.status).toBe(200);
      expect(typeof vehicleUpdate.body.message).toBe("string");
    });
  });

  describe("US-5.10 — User clicks the `Manage Fuels` button", () => {
    let fuelId;

    beforeAll(async () => {
      const created = await request(app)
        .post(`${BASE}/fuels/`)
        .set(adminAuth)
        .send({ fuel_type: "ManageFuel-F5" });
      fuelId = created.body.fuel_id ?? created.body.id ?? 1;
    });

    it("User clicks the `update` button on the `Edit Fuel` modal", async () => {
      const res = await request(app)
        .put(`${BASE}/fuels/${fuelId}`)
        .set(adminAuth)
        .send({ fuel_type: "ManageFuel-Updated" });

      expect(res.status).toBe(200);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User clicks the `Add` button on the `Add Fuel` modal", async () => {
      const res = await request(app)
        .post(`${BASE}/fuels/`)
        .set(maintenanceAuth)
        .send({ fuel_type: "BrandNewFuel-F5" });

      expect(res.status).toBe(201);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });

    it("User clicks the `Delete` button on the `View Fuel Management` modal", async () => {
      const created = await request(app)
        .post(`${BASE}/fuels/`)
        .set(adminAuth)
        .send({ fuel_type: "DeleteMe-F5" });
      const id = created.body.fuel_id ?? created.body.id ?? fuelId;

      const res = await request(app)
        .delete(`${BASE}/fuels/${id}`)
        .set(adminAuth);

      expect(res.status).toBe(200);
      expect(typeof res.body.message).toBe("string");
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });
});
