/**
 * Feature 12 — Landing Vue
 * Spec: features/feature-12-Landing-Vue.md
 *
 * API mount: `/api` (server.js) + `/vehicle-t3` (this spec).
 * Vehicle and maintenance creates share POST /requests/.
 * `maintenance: false` is a vehicle request. `maintenance: true` is a maintenance request.
 * `vehicleId` is a string. The requester field is `requesterId`.
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";

const REQUESTS_PATH = "/api/vehicle-t3/requests/";

const vehicleRequestBody = {
  requesterId: 10,
  vehicleId: "12345671234567123",
  destId: 7,
  driverId: 3,
  numPeople: 5,
  currentlyActive: true,
  startDate: "2026-10-25",
  endDate: "2026-10-28",
  startTime: "09:00:00",
  endTime: "17:00:00",
  maintenance: false,
};

const maintenanceRequestBody = {
  requesterId: 2,
  vehicleId: "12345671234567123",
  currentlyActive: true,
  startDate: "2026-10-25",
  endDate: "2026-10-28",
  startTime: "09:00:00",
  endTime: "17:00:00",
  maintenance: true,
};

async function authHeader(role) {
  if (!db.user || !db.session) {
    return { Authorization: `Bearer ${role}-test-token` };
  }

  const user = await db.user.create({
    fName: "Ada",
    lName: role,
    email: `${role}-landing@example.com`,
    username: `${role}-landing`,
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

function expectHumanMessage(response, status) {
  expect(response.status).toBe(status);
  expect(response.body).toEqual(
    expect.objectContaining({
      message: expect.any(String),
    })
  );
  expect(response.body.message).toMatch(/[A-Za-z]/);
}

beforeAll(async () => {
  await syncTestDatabase();
});

describe("Feature 12 — Landing Vue", () => {
  describe("US-12.5 — View `Vehicle Request Form` component", () => {
    it("User correctly fills out the `Vehicle Request Form`", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const response = await request(app)
          .post(REQUESTS_PATH)
          .set(await authHeader(role))
          .send(vehicleRequestBody);

        expectHumanMessage(response, 201);
      }
    });

    it("User incorrectly fills out the `Vehicle Request Form`", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const response = await request(app)
          .post(REQUESTS_PATH)
          .set(await authHeader(role))
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: expect.stringMatching(/is required/i),
          })
        );
      }
    });
  });

  describe("US-12.6 — View `Maintenance Request Form` component", () => {
    it("User correctly fills out the `Maintenance Request Form`", async () => {
      for (const role of ["admin", "maintenance"]) {
        const response = await request(app)
          .post(REQUESTS_PATH)
          .set(await authHeader(role))
          .send(maintenanceRequestBody);

        expectHumanMessage(response, 201);
      }
    });

    it("User incorrectly fills out the `Maintenance Request Form`", async () => {
      for (const role of ["admin", "maintenance"]) {
        const response = await request(app)
          .post(REQUESTS_PATH)
          .set(await authHeader(role))
          .send({ maintenance: true });

        expect(response.status).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: expect.stringMatching(/is required/i),
          })
        );
      }
    });
  });

  describe("US-12.7 — View `Reserved Vehicles`", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      const response = await request(app)
        .get(REQUESTS_PATH)
        .set(await authHeader("admin"));

      expectHumanMessage(response, 200);
    });
  });
});
