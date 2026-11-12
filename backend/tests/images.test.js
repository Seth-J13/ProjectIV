/**
 * Feature 11 — Images CRUD
 * Spec: features/feature-11-images-crud.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";
import { syncTestDatabase } from "./helpers.js";

const LOGIN_MESSAGE = "Please sign in. If you think this is a mistake, contact your system administrator";
const MALFORMED_MESSAGE = "Malformed request. Please make sure everything in the form is properly formatted!";
const CONFLICT_MESSAGE = "Image with these details already exists!";
const PUT_MESSAGE = "PUT and overwriting requests are not allowed to image entries";
const FORBIDDEN_MESSAGE = "Please contact a system administrator for assistance.";
const TEN_MB = 10 * 1024 * 1024;
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const PARENT_KEY = {
  note: "note_id",
  vehicle: "vehicle_id",
  area: "area_id",
};

let sequence = 1000;
let largeBmp;

function nextId() {
  sequence += 1;
  return sequence;
}

function bmpBytes(width, height) {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelSize = rowSize * height;
  const bytes = Buffer.alloc(54 + pixelSize);
  bytes.write("BM", 0);
  bytes.writeUInt32LE(bytes.length, 2);
  bytes.writeUInt32LE(54, 10);
  bytes.writeUInt32LE(40, 14);
  bytes.writeInt32LE(width, 18);
  bytes.writeInt32LE(height, 22);
  bytes.writeUInt16LE(1, 26);
  bytes.writeUInt16LE(24, 28);
  bytes.writeUInt32LE(pixelSize, 34);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = 54 + y * rowSize + x * 3;
      bytes[offset] = 20;
      bytes[offset + 1] = 80;
      bytes[offset + 2] = 140;
    }
  }

  return bytes;
}

function uploadBytes() {
  if (!largeBmp) {
    largeBmp = bmpBytes(2000, 1750);
  }

  return largeBmp;
}

async function authHeader(role) {
  if (!db.user || !db.session) {
    return { Authorization: `Bearer ${role}-token` };
  }

  const user = await db.user.create({
    fName: "Ada",
    lName: role,
    email: `${role}-${nextId()}@example.com`,
    username: `${role}-${sequence}`,
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

function collectionPath(type) {
  return `/vehicle-t3/${type}image/`;
}

function imagePath(type, id) {
  return `/vehicle-t3/${type}image/${id}`;
}

function parentPath(type, parentId) {
  return `/vehicle-t3/${type}image/${type}/${parentId}`;
}

function createdId(response) {
  const message = typeof response.body === "string" ? response.body : response.body?.message;
  const match = String(message ?? "").match(/id=(\d+)/);

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

function asBuffer(value) {
  if (value == null) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (value?.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }

  if (typeof value === "string") {
    const dataUrl = value.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    const payload = (dataUrl ? dataUrl[1] : value).replace(/^0x/i, "").replace(/\s/g, "");

    if (/^[A-Za-z0-9+/=]+$/.test(payload) && payload.length % 4 === 0) {
      const decoded = Buffer.from(payload, "base64");

      if (decoded.subarray(0, 4).equals(PNG)) {
        return decoded;
      }
    }

    if (/^[0-9a-fA-F]+$/.test(payload) && payload.length % 2 === 0) {
      return Buffer.from(payload, "hex");
    }
  }

  return null;
}

function storedBytes(body) {
  if (Buffer.isBuffer(body)) {
    return body;
  }

  return asBuffer(body?.image) || asBuffer(body);
}

function postImage(type, auth, { parentId, bytes, filename = "photo.bmp", mime = "image/bmp" } = {}) {
  const call = request(app).post(collectionPath(type));

  if (auth) {
    call.set(auth);
  }

  if (bytes) {
    call.attach("image", bytes, { filename, contentType: mime });
  }

  if (parentId != null) {
    call.field(PARENT_KEY[type], String(parentId));
  }

  return call;
}

async function createNote(auth, { maintenanceRequest, text }) {
  const response = await request(app).post("/vehicle-t3/notes/").set(auth).send({
    reason: "image coverage",
    maintenance_request: maintenanceRequest,
    request_id: nextId(),
    text,
  });

  expect(response.status).toBe(201);
  const message = typeof response.body === "string" ? response.body : response.body?.message;
  const fromMessage = String(message ?? "").match(/id=(\d+)/);
  const id = response.body?.note_id ?? response.body?.id ?? fromMessage?.[1];

  if (id == null) {
    throw new Error(`Note response did not include an id. Status ${response.status}: ${response.text}`);
  }

  return id;
}

async function expectStoredPng(type, auth, id, parentId, originalLength) {
  const details = await request(app).get(imagePath(type, id)).set(auth);

  expect(details.status).toBe(200);
  expect(String(details.body[PARENT_KEY[type]])).toBe(String(parentId));
  expectToday(details.body.date);

  const stored = storedBytes(details.body);
  expect(stored).not.toBeNull();
  expect(stored.subarray(0, 4).equals(PNG)).toBe(true);
  expect(stored.length).toBeLessThan(TEN_MB);
  expect(stored.length).toBeLessThan(originalLength);

  for (const key of ["email", "password", "role", "userId", "username", "fName", "lName"]) {
    expect(details.body).not.toHaveProperty(key);
  }
}

describe("Feature 11 — Images CRUD", () => {
  let admin;
  let maintenance;
  let user;
  let driver;

  beforeEach(async () => {
    await syncTestDatabase();
    admin = await authHeader("admin");
    maintenance = await authHeader("maintenance");
    user = await authHeader("user");
    driver = await authHeader("driver");
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe("US-11.1: See VehicleImage on Vehicle listings", () => {
    it("Vehicle has no images", async () => {
      const vehicleId = nextId();
      const response = await request(app).get(parentPath("vehicle", vehicleId)).set(maintenance);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "This vehicle <:vehicleId> doesn't have any images" });
    });
  });

  describe("US-11.2: Create VehicleImage on Vehicle listings", () => {
    it("Drag a valid image onto Vehicle Images", async () => {
      const vehicleId = nextId();
      const bytes = uploadBytes();
      const response = await postImage("vehicle", maintenance, { parentId: vehicleId, bytes });

      expect(response.status).toBe(201);
      expect(String(response.body?.message ?? response.text)).toMatch(/^New image created with id=\d+$/);
      await expectStoredPng("vehicle", maintenance, createdId(response), vehicleId, bytes.length);
    }, 20000);

    it("Duplicate vehicle image", async () => {
      const vehicleId = nextId();
      const bytes = uploadBytes();
      const first = await postImage("vehicle", admin, { parentId: vehicleId, bytes });

      expect(first.status).toBe(201);

      const second = await postImage("vehicle", admin, { parentId: vehicleId, bytes });

      expect(second.status).toBe(409);
      expect(second.body).toEqual({ message: CONFLICT_MESSAGE });
    }, 20000);

    it("Vehicle image request is missing a required field", async () => {
      const missingImage = await postImage("vehicle", maintenance, { parentId: nextId() });
      const missingParent = await postImage("vehicle", maintenance, { bytes: uploadBytes() });

      expect(missingImage.status).toBe(400);
      expect(missingImage.body).toEqual({ message: MALFORMED_MESSAGE });
      expect(missingParent.status).toBe(400);
      expect(missingParent.body).toEqual({ message: MALFORMED_MESSAGE });
    }, 20000);

    it("Signed out user uploads a vehicle image", async () => {
      const response = await postImage("vehicle", null, { parentId: nextId(), bytes: uploadBytes() });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: LOGIN_MESSAGE });
    }, 20000);

    it("Overwrite a vehicle image", async () => {
      const created = await postImage("vehicle", admin, { parentId: nextId(), bytes: uploadBytes() });
      const response = await request(app)
        .put(imagePath("vehicle", createdId(created)))
        .set(admin)
        .send({ image: "replacement" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: PUT_MESSAGE });
    }, 20000);
  });

  describe("US-11.3: Delete VehicleImage on Vehicle listings", () => {
    it("Delete one vehicle image", async () => {
      const created = await postImage("vehicle", maintenance, { parentId: nextId(), bytes: uploadBytes() });
      const id = createdId(created);
      const response = await request(app).delete(imagePath("vehicle", id)).set(maintenance);

      expect(response.status).toBe(204);
      expect(response.text).toBe("");

      const details = await request(app).get(imagePath("vehicle", id)).set(maintenance);
      expect(details.status).toBe(404);
      expect(details.body).toEqual({ message: `No image was found for id=${id}` });
    }, 20000);

    it("Admin deletes any vehicle image", async () => {
      const created = await postImage("vehicle", maintenance, { parentId: nextId(), bytes: uploadBytes() });
      const response = await request(app).delete(imagePath("vehicle", createdId(created))).set(admin);

      expect(response.status).toBe(204);
      expect(response.text).toBe("");
    }, 20000);

    it("Signed out user deletes a vehicle image", async () => {
      const created = await postImage("vehicle", admin, { parentId: nextId(), bytes: uploadBytes() });
      const response = await request(app).delete(imagePath("vehicle", createdId(created)));

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: LOGIN_MESSAGE });
    }, 20000);

    it("Delete a missing vehicle image", async () => {
      const id = nextId();
      const response = await request(app).delete(imagePath("vehicle", id)).set(admin);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `No image was found for id=${id}` });
    });
  });

  describe("US-11.4: See NoteImage on Note details", () => {
    it("Note has no images", async () => {
      const noteId = nextId();
      const response = await request(app).get(parentPath("note", noteId)).set(user);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "This note <:noteId> doesn't have any images" });
    });
  });

  describe("US-11.5: Create NoteImage on Note details", () => {
    it("Drag a valid image onto a note", async () => {
      const noteId = await createNote(user, { maintenanceRequest: false, text: "Note that can hold an image" });
      const bytes = uploadBytes();
      const response = await postImage("note", user, { parentId: noteId, bytes });

      expect(response.status).toBe(201);
      expect(String(response.body?.message ?? response.text)).toMatch(/^New image created with id=\d+$/);
      await expectStoredPng("note", user, createdId(response), noteId, bytes.length);
    }, 20000);

    it("Duplicate note image", async () => {
      const noteId = await createNote(user, { maintenanceRequest: false, text: "Duplicate image note" });
      const bytes = uploadBytes();
      const first = await postImage("note", user, { parentId: noteId, bytes });

      expect(first.status).toBe(201);

      const second = await postImage("note", user, { parentId: noteId, bytes });

      expect(second.status).toBe(409);
      expect(second.body).toEqual({ message: CONFLICT_MESSAGE });
    }, 20000);

    it("Note image request is missing a required field", async () => {
      const noteId = await createNote(user, { maintenanceRequest: false, text: "Missing image field" });
      const missingImage = await postImage("note", user, { parentId: noteId });
      const missingParent = await postImage("note", user, { bytes: uploadBytes() });

      expect(missingImage.status).toBe(400);
      expect(missingImage.body).toEqual({ message: MALFORMED_MESSAGE });
      expect(missingParent.status).toBe(400);
      expect(missingParent.body).toEqual({ message: MALFORMED_MESSAGE });
    }, 20000);

    it("Signed out user uploads a note image", async () => {
      const response = await postImage("note", null, { parentId: nextId(), bytes: uploadBytes() });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: LOGIN_MESSAGE });
    }, 20000);

    it("Overwrite a note image", async () => {
      const noteId = await createNote(user, { maintenanceRequest: false, text: "No overwrite" });
      const created = await postImage("note", user, { parentId: noteId, bytes: uploadBytes() });
      const response = await request(app).put(imagePath("note", createdId(created))).set(user).send({ image: "replacement" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: PUT_MESSAGE });
    }, 20000);
  });

  describe("US-11.6: Delete NoteImage on Note", () => {
    it("Delete a note image from the note form", async () => {
      const noteId = await createNote(user, { maintenanceRequest: false, text: "Delete my image" });
      const created = await postImage("note", user, { parentId: noteId, bytes: uploadBytes() });
      const id = createdId(created);
      const response = await request(app).delete(imagePath("note", id)).set(user);

      expect(response.status).toBe(204);
      expect(response.text).toBe("");

      const details = await request(app).get(imagePath("note", id)).set(user);
      expect(details.status).toBe(404);
      expect(details.body).toEqual({ message: `No image was found for id=${id}` });
    }, 20000);

    it("User or driver deletes someone else's note image", async () => {
      const noteId = await createNote(admin, { maintenanceRequest: false, text: "Admin note" });
      const created = await postImage("note", admin, { parentId: noteId, bytes: uploadBytes() });
      const id = createdId(created);

      const asUser = await request(app).delete(imagePath("note", id)).set(user);
      const asDriver = await request(app).delete(imagePath("note", id)).set(driver);

      expect(asUser.status).toBe(403);
      expect(asUser.body).toEqual({ message: FORBIDDEN_MESSAGE });
      expect(asDriver.status).toBe(403);
      expect(asDriver.body).toEqual({ message: FORBIDDEN_MESSAGE });

      const details = await request(app).get(imagePath("note", id)).set(admin);
      expect(details.status).toBe(200);
    }, 20000);

    it("Maintenance deletes a note image", async () => {
      const ownNote = await createNote(maintenance, { maintenanceRequest: false, text: "Maintenance note" });
      const ownImage = await postImage("note", maintenance, { parentId: ownNote, bytes: uploadBytes() });
      const ownDelete = await request(app).delete(imagePath("note", createdId(ownImage))).set(maintenance);

      expect(ownDelete.status).toBe(204);
      expect(ownDelete.text).toBe("");

      const requestNote = await createNote(user, { maintenanceRequest: true, text: "Maintenance request note" });
      const requestImage = await postImage("note", user, { parentId: requestNote, bytes: uploadBytes() });
      const requestDelete = await request(app).delete(imagePath("note", createdId(requestImage))).set(maintenance);

      expect(requestDelete.status).toBe(204);
      expect(requestDelete.text).toBe("");
    }, 20000);

    it("Admin deletes any note image", async () => {
      const noteId = await createNote(user, { maintenanceRequest: false, text: "User note for admin delete" });
      const created = await postImage("note", user, { parentId: noteId, bytes: uploadBytes() });
      const response = await request(app).delete(imagePath("note", createdId(created))).set(admin);

      expect(response.status).toBe(204);
      expect(response.text).toBe("");
    }, 20000);
  });

  describe("US-11.8: See AreaImage on Area listings", () => {
    it("Area has no images", async () => {
      const areaId = nextId();
      const response = await request(app).get(parentPath("area", areaId)).set(admin);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "This area <:areaId> doesn't have any images" });
    });
  });

  describe("US-11.9: Create AreaImage on Area listings", () => {
    it("Drag a valid image onto an area", async () => {
      const areaId = nextId();
      const bytes = uploadBytes();
      const response = await postImage("area", maintenance, { parentId: areaId, bytes });

      expect(response.status).toBe(201);
      expect(String(response.body?.message ?? response.text)).toMatch(/^New image created with id=\d+$/);
      await expectStoredPng("area", maintenance, createdId(response), areaId, bytes.length);
    }, 20000);

    it("Duplicate area image", async () => {
      const areaId = nextId();
      const bytes = uploadBytes();
      const first = await postImage("area", admin, { parentId: areaId, bytes });

      expect(first.status).toBe(201);

      const second = await postImage("area", admin, { parentId: areaId, bytes });

      expect(second.status).toBe(409);
      expect(second.body).toEqual({ message: CONFLICT_MESSAGE });
    }, 20000);

    it("Signed out user uploads an area image", async () => {
      const response = await postImage("area", null, { parentId: nextId(), bytes: uploadBytes() });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: LOGIN_MESSAGE });
    }, 20000);

    it("Overwrite an area image", async () => {
      const created = await postImage("area", maintenance, { parentId: nextId(), bytes: uploadBytes() });
      const response = await request(app).put(imagePath("area", createdId(created))).set(maintenance).send({ image: "replacement" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: PUT_MESSAGE });
    }, 20000);
  });

  describe("US-11.10: Delete AreaImage on Area listings", () => {
    it("Delete one area image", async () => {
      const created = await postImage("area", maintenance, { parentId: nextId(), bytes: uploadBytes() });
      const id = createdId(created);
      const response = await request(app).delete(imagePath("area", id)).set(maintenance);

      expect(response.status).toBe(204);
      expect(response.text).toBe("");

      const details = await request(app).get(imagePath("area", id)).set(maintenance);
      expect(details.status).toBe(404);
      expect(details.body).toEqual({ message: `No image was found for id=${id}` });
    }, 20000);

    it("Admin deletes any area image", async () => {
      const created = await postImage("area", maintenance, { parentId: nextId(), bytes: uploadBytes() });
      const response = await request(app).delete(imagePath("area", createdId(created))).set(admin);

      expect(response.status).toBe(204);
      expect(response.text).toBe("");
    }, 20000);

    it("Signed out user deletes an area image", async () => {
      const created = await postImage("area", admin, { parentId: nextId(), bytes: uploadBytes() });
      const response = await request(app).delete(imagePath("area", createdId(created)));

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: LOGIN_MESSAGE });
    }, 20000);
  });
});
