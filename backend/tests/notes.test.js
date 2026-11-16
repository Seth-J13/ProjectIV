/**
 * Feature 9 — Note CRUD
 * Spec: features/feature-9-note-crud.md
 */
import request from "supertest";
import app from "../server.js";

const NOTES = "/vehicle-t3/notes";
const LOGIN_MESSAGE =
  "Please sign in. If you think this is a mistake, contact your system administrator";

const validNote = {
  reason: "test",
  maintenance_request: false,
  request_id: 5,
  text: "Brake noise from the front pads",
};

function createdId(response) {
  if (response.body?.note_id != null) {
    return response.body.note_id;
  }

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

function expectToday(value) {
  const match = String(value).match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  const now = new Date();

  expect(match).not.toBeNull();
  expect(Number(match[1])).toBe(now.getFullYear());
  expect(Number(match[2])).toBe(now.getMonth() + 1);
  expect(Number(match[3])).toBe(now.getDate());
}

function contributorKey(entry) {
  return `${entry.contributor_id}|${entry.created_note}|${entry.date}`;
}

describe("Feature 9 — Note CRUD", () => {
  describe("US-9.2: Remove Notes", () => {
    it("User confirms Delete", async () => {
      const created = await request(app)
        .post(`${NOTES}/`)
        .set("Authorization", "Bearer user-token")
        .send(validNote);

      expect(created.status).toBe(201);

      const id = createdId(created);
      const response = await request(app)
        .delete(`${NOTES}/note/${id}`)
        .set("Authorization", "Bearer user-token");

      expect(response.status).toBe(204);
      expect(response.text).toBe("");

      const details = await request(app).get(`${NOTES}/note/${id}`).set("Authorization", "Bearer user-token");

      expect(details.status).toBe(404);
      expect(details.body).toEqual({ message: `No note was found for id=${id}` });

      const contributions = await request(app)
        .get(`${NOTES}/contributors/note/${id}`)
        .set("Authorization", "Bearer user-token");

      expect(contributions.status).toBe(404);
      expect(contributions.body).toEqual({ message: `This note ${id} doesn't have any contributions` });
    });

    it("Maintenance deletes from Maintenance Requests Notes List", async () => {
      const created = await request(app)
        .post(`${NOTES}/`)
        .set("Authorization", "Bearer maintenance-token")
        .send({
          ...validNote,
          maintenance_request: true,
          text: "Pads are worn",
        });

      expect(created.status).toBe(201);

      const id = createdId(created);
      const response = await request(app)
        .delete(`${NOTES}/note/${id}`)
        .set("Authorization", "Bearer maintenance-token");

      expect(response.status).toBe(204);
      expect(response.text).toBe("");

      const details = await request(app).get(`${NOTES}/note/${id}`).set("Authorization", "Bearer maintenance-token");

      expect(details.status).toBe(404);
      expect(details.body).toEqual({ message: `No note was found for id=${id}` });
    });
  });

  describe("US-9.3: Create Notes", () => {
    it("Send add request with valid form data", async () => {
      const response = await request(app)
        .post(`${NOTES}/`)
        .set("Authorization", "Bearer user-token")
        .send(validNote);

      expect(response.status).toBe(201);

      const message = typeof response.body === "string" ? response.body : response.body?.message;
      expect(message).toMatch(/^New note created with id=\d+$/);
      expect(response.body).toEqual(
        expect.objectContaining({
          note_id: createdId(response),
          created_note: true,
        }),
      );
      expect(response.body.contributor_id).toBeDefined();
      expectToday(response.body.date);

      const details = await request(app)
        .get(`${NOTES}/note/${createdId(response)}`)
        .set("Authorization", "Bearer user-token");

      expect(details.status).toBe(200);
      expect(JSON.stringify(details.body)).toContain(validNote.text);

      const creator = (details.body.contributors ?? []).find((entry) => entry.created_note === true);
      expect(creator).toEqual(expect.objectContaining({ created_note: true }));
      expect(creator.contributor_id).toBeDefined();
      expectToday(creator.date);
    });

    it("Signed out user makes add request", async () => {
      const response = await request(app).post(`${NOTES}/`).send(validNote);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: LOGIN_MESSAGE });
    });
  });

  describe("US-9.4: Edit Notes", () => {
    it("Send edit request with valid form data", async () => {
      const created = await request(app)
        .post(`${NOTES}/`)
        .set("Authorization", "Bearer user-token")
        .send(validNote);

      expect(created.status).toBe(201);
      const id = createdId(created);
      const before = await request(app).get(`${NOTES}/note/${id}`).set("Authorization", "Bearer user-token");
      const beforeKeys = new Set((before.body.contributors ?? []).map(contributorKey));

      const response = await request(app)
        .put(`${NOTES}/note/${id}`)
        .set("Authorization", "Bearer user-token")
        .send({
          ...validNote,
          reason: "test3",
          text: "well well well...",
        });

      expect(response.status).toBe(200);
      expect(String(response.body.note_id)).toBe(String(id));
      expect(response.body.created_note).toBe(false);
      expect(response.body.contributor_id).toBeDefined();
      expectToday(response.body.date);

      const after = await request(app).get(`${NOTES}/note/${id}`).set("Authorization", "Bearer user-token");
      expect(JSON.stringify(after.body)).toContain("well well well...");

      const added = (after.body.contributors ?? []).filter((entry) => !beforeKeys.has(contributorKey(entry)));
      expect(added.length).toBeGreaterThan(0);
      expect(added[0].contributor_id).toBeDefined();
      expect(added[0].created_note).toBe(false);
      expectToday(added[0].date);
    });

    it("Signed out user makes edit request", async () => {
      const response = await request(app).put(`${NOTES}/note/1`).send(validNote);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: LOGIN_MESSAGE });
    });
  });

  describe("US-9.5: Admin Notes Management", () => {
    it("Admin super-permissions on any list", async () => {
      const created = await request(app)
        .post(`${NOTES}/`)
        .set("Authorization", "Bearer user-token")
        .send({ ...validNote, text: "Created by someone else" });

      expect(created.status).toBe(201);
      const id = createdId(created);

      const updated = await request(app)
        .put(`${NOTES}/note/${id}`)
        .set("Authorization", "Bearer admin-token")
        .send({ ...validNote, text: "Updated by an admin" });

      expect(updated.status).toBe(200);
      expect(String(updated.body.note_id)).toBe(String(id));
      expect(updated.body.created_note).toBe(false);

      const details = await request(app).get(`${NOTES}/note/${id}`).set("Authorization", "Bearer admin-token");
      expect(JSON.stringify(details.body)).toContain("Updated by an admin");

      const removed = await request(app).delete(`${NOTES}/note/${id}`).set("Authorization", "Bearer admin-token");

      expect(removed.status).toBe(204);
      expect(removed.text).toBe("");
    });
  });
});
