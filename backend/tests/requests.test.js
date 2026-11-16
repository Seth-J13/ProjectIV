/**
 * Feature 8 — Request Management
 * Spec: features/feature-8-Requests-Crud.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";

const REQUESTS_PATH = "/api/requests";

const tripBody = {
  requestType: "trip",
  vehicleId: 12,
  driverId: 3,
  destId: 7,
  startDate: "2026-11-10",
  startTime: "09:00",
  endDate: "2026-11-10",
  endTime: "17:00",
  numPeople: 6,
};

const maintenanceBody = {
  requestType: "maintenance",
  vehicleId: 12,
  startDate: "2026-11-15",
  startTime: "08:00",
};

async function authHeader(role, username = role) {
  if (!db.user || !db.session) {
    return { Authorization: `Bearer ${username}-token` };
  }

  const user = await db.user.create({
    fName: "Ada",
    lName: username,
    email: `${username}@example.com`,
    username,
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

function requestIds(body) {
  return (Array.isArray(body) ? body : []).map((row) => row.requestId);
}

describe("Feature 8 — Request Management", () => {
  describe("US-8.1 — Create a normal request", () => {
    let user;

    beforeEach(async () => {
      await syncTestDatabase();
      user = await authHeader("worker", "requester");
    });

    it("User creates a trip request", async () => {
      const response = await request(app).post(REQUESTS_PATH).set(user).send({
        ...tripBody,
        requesterId: 99999,
      });

      expect(response.status).toBe(201);
      expect(response.body.requestId).toBeDefined();
      expect(response.body.requesterId).not.toBe(99999);
      expect(response.body).toMatchObject({
        requestType: "trip",
        startDate: "2026-11-10",
        startTime: "09:00",
        endDate: "2026-11-10",
        endTime: "17:00",
        numPeople: 6,
      });
      expect(response.body.vehicle).toEqual(
        expect.objectContaining({ vehicleId: 12, license: "ABC-1234", make: "Ford", model: "Transit" })
      );
      expect(response.body.driver).toEqual(expect.objectContaining({ driverId: 3 }));
      expect(response.body.destination).toEqual(expect.objectContaining({ destId: 7 }));
    });

    it("User creates a trip request with an end before the start", async () => {
      const response = await request(app)
        .post(REQUESTS_PATH)
        .set(user)
        .send({
          ...tripBody,
          startDate: "2026-11-10",
          startTime: "09:00",
          endDate: "2026-11-09",
          endTime: "08:00",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "end must be after start." });
    });

    it("User creates a trip request with an invalid number of people", async () => {
      const response = await request(app)
        .post(REQUESTS_PATH)
        .set(user)
        .send({ ...tripBody, numPeople: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "number of people must be at least 1." });
    });

    it("User creates a request referencing a nonexistent vehicle", async () => {
      const response = await request(app)
        .post(REQUESTS_PATH)
        .set(user)
        .send({ ...tripBody, vehicleId: 99999 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "vehicle does not exist." });
    });
  });

  describe("US-8.2 — Create a maintenance request", () => {
    beforeEach(async () => {
      await syncTestDatabase();
    });

    it("Admin creates a maintenance request", async () => {
      const admin = await authHeader("admin", "admin");
      const response = await request(app).post(REQUESTS_PATH).set(admin).send(maintenanceBody);

      expect(response.status).toBe(201);
      expect(response.body.requestType).toBe("maintenance");
      expect(response.body.driverId ?? null).toBeNull();
      expect(response.body.driver ?? null).toBeNull();
      expect(response.body.destId ?? null).toBeNull();
      expect(response.body.destination ?? null).toBeNull();
      expect(response.body.numPeople ?? null).toBeNull();
    });

    it("Non-admin cannot create a maintenance request", async () => {
      const worker = await authHeader("worker", "worker");
      const response = await request(app).post(REQUESTS_PATH).set(worker).send(maintenanceBody);

      expect(response.status).toBe(403);
      expect(response.body.message).toEqual(expect.stringMatching(/unauthor|forbidden|admin/i));
    });
  });

  describe("US-8.3 — View requests", () => {
    beforeEach(async () => {
      await syncTestDatabase();
    });

    it("Requests view loads with existing requests", async () => {
      const owner = await authHeader("worker", "owner");
      const first = await request(app).post(REQUESTS_PATH).set(owner).send(tripBody);
      const second = await request(app)
        .post(REQUESTS_PATH)
        .set(owner)
        .send({ ...tripBody, startDate: "2026-11-12", endDate: "2026-11-12" });

      const response = await request(app).get(REQUESTS_PATH).set(owner);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(requestIds(response.body)).toEqual(
        expect.arrayContaining([first.body.requestId, second.body.requestId])
      );
      for (const row of response.body) {
        expect(row.requestType).toBeDefined();
        expect(row.vehicle).toBeDefined();
        expect(row.startDate).toBeDefined();
      }
    });

    it("User does not see other users' requests", async () => {
      const owner = await authHeader("worker", "owner");
      const other = await authHeader("worker", "other");
      const created = await request(app).post(REQUESTS_PATH).set(owner).send(tripBody);

      const response = await request(app).get(REQUESTS_PATH).set(other);

      expect(response.status).toBe(200);
      expect(requestIds(response.body)).not.toContain(created.body.requestId);
    });

    it("Admin sees all requests", async () => {
      const firstUser = await authHeader("worker", "ada");
      const secondUser = await authHeader("worker", "ben");
      const admin = await authHeader("admin", "admin");
      const first = await request(app).post(REQUESTS_PATH).set(firstUser).send(tripBody);
      const second = await request(app).post(REQUESTS_PATH).set(secondUser).send(maintenanceBody);

      const response = await request(app).get(REQUESTS_PATH).set(admin);

      expect(response.status).toBe(200);
      expect(requestIds(response.body)).toEqual(
        expect.arrayContaining([first.body.requestId, second.body.requestId])
      );
    });
  });

  describe("US-8.5 — Edit and delete requests", () => {
    beforeEach(async () => {
      await syncTestDatabase();
    });

    it("User edits a request", async () => {
      const owner = await authHeader("worker", "owner");
      const created = await request(app).post(REQUESTS_PATH).set(owner).send(tripBody);

      const response = await request(app)
        .put(`${REQUESTS_PATH}/${created.body.requestId}`)
        .set(owner)
        .send({ ...tripBody, numPeople: 4 });

      expect(response.status).toBe(200);
      expect(response.body.numPeople).toBe(4);
      expect(response.body.requestType).toBe("trip");
    });

    it("User deletes a request", async () => {
      const owner = await authHeader("worker", "owner");
      const created = await request(app).post(REQUESTS_PATH).set(owner).send(tripBody);

      const response = await request(app)
        .delete(`${REQUESTS_PATH}/${created.body.requestId}`)
        .set(owner);

      expect(response.status).toBe(204);

      const listed = await request(app).get(REQUESTS_PATH).set(owner);
      expect(requestIds(listed.body)).not.toContain(created.body.requestId);
    });

    it("User cannot edit another user's request", async () => {
      const owner = await authHeader("worker", "owner");
      const other = await authHeader("worker", "other");
      const created = await request(app).post(REQUESTS_PATH).set(owner).send(tripBody);

      const response = await request(app)
        .put(`${REQUESTS_PATH}/${created.body.requestId}`)
        .set(other)
        .send({ ...tripBody, numPeople: 4 });

      expect(response.status).toBe(404);
    });

    it("User cannot delete another user's request", async () => {
      const owner = await authHeader("worker", "owner");
      const other = await authHeader("worker", "other");
      const created = await request(app).post(REQUESTS_PATH).set(owner).send(tripBody);

      const response = await request(app)
        .delete(`${REQUESTS_PATH}/${created.body.requestId}`)
        .set(other);

      expect(response.status).toBe(404);
    });

    it("Admin edits any request", async () => {
      const owner = await authHeader("worker", "owner");
      const admin = await authHeader("admin", "admin");
      const created = await request(app).post(REQUESTS_PATH).set(owner).send(tripBody);

      const response = await request(app)
        .put(`${REQUESTS_PATH}/${created.body.requestId}`)
        .set(admin)
        .send({ ...tripBody, numPeople: 4 });

      expect(response.status).toBe(200);
      expect(response.body.numPeople).toBe(4);
    });
  });

  describe("Authentication", () => {
    it("Unauthenticated API request to requests", async () => {
      const response = await request(app).get(REQUESTS_PATH);

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringMatching(/unauthorized/i),
        })
      );
    });
  });
});
