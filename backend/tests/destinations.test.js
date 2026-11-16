/**
 * Feature 6 — Destination CRUD
 * Spec: features/feature-6-destination-crud.md
 */
import request from "supertest";
import app from "../server.js";

const DESTINATIONS = "/vehicle-t3/destinations";
const LOGIN_MESSAGE =
  "Please sign in. If you think this is a mistake, contact your system administrator";
const FORBIDDEN_MESSAGE = "Please contact a system administrator for assistance.";

const validDestination = {
  zip: "12345-0001",
  city: "Omaha",
  state: "Nebraska",
  addr_line_1: "69420 Appleberry Lane",
  dest_name: "ur mom's house",
};

function createdId(response) {
  if (response.body?.id != null) {
    return response.body.id;
  }

  const text = typeof response.body === "string" ? response.body : response.body?.message;
  const match = String(text ?? "").match(/id=(\d+)/);

  if (!match) {
    throw new Error(`Create response did not include an id. Status ${response.status}: ${response.text}`);
  }

  return match[1];
}

describe("Feature 6 — Destination CRUD", () => {
  describe("US-6.3: Add Destination", () => {
    it("Send add request with valid form data", async () => {
      const response = await request(app)
        .post(`${DESTINATIONS}/`)
        .set("Authorization", "Bearer admin-token")
        .send(validDestination);

      expect(response.status).toBe(201);

      const message = typeof response.body === "string" ? response.body : response.body?.message;
      expect(message).toMatch(/^New destination created with id=\d+$/);
    });

    it("Signed out user makes add request", async () => {
      const response = await request(app).post(`${DESTINATIONS}/`).send(validDestination);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: LOGIN_MESSAGE });
    });
  });

  describe("US-6.4: Remove Destination", () => {
    it("Press Delete inside Delete confirmation dialog", async () => {
      const created = await request(app)
        .post(`${DESTINATIONS}/`)
        .set("Authorization", "Bearer admin-token")
        .send(validDestination);

      expect(created.status).toBe(201);
      const id = createdId(created);

      const response = await request(app)
        .delete(`${DESTINATIONS}/${id}`)
        .set("Authorization", "Bearer admin-token");

      expect(response.status).toBe(204);
      expect(response.text).toBe("");
    });
  });

  describe("US-6.6: Edit Destination", () => {
    it("Send edit request with valid form data", async () => {
      const created = await request(app)
        .post(`${DESTINATIONS}/`)
        .set("Authorization", "Bearer admin-token")
        .send(validDestination);

      expect(created.status).toBe(201);

      const response = await request(app)
        .put(`${DESTINATIONS}/${createdId(created)}`)
        .set("Authorization", "Bearer admin-token")
        .send({
          ...validDestination,
          dest_name: "ur dad's house",
          zip: "54321-9999",
        });

      expect(response.status).toBe(201);
    });

    it("Non-admin user makes update request", async () => {
      const response = await request(app)
        .put(`${DESTINATIONS}/1`)
        .set("Authorization", "Bearer driver-token")
        .send(validDestination);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: FORBIDDEN_MESSAGE });
    });
  });
});
