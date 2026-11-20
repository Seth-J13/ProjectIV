import sharp from "sharp";
import db from "../models/index.js";
import logger from "../config/logger.js";

const LOGIN_MESSAGE =
  "Please sign in. If you think this is a mistake, contact your system administrator";
const FORBIDDEN_MESSAGE = "Please contact a system administrator for assistance.";
const MALFORMED =
  "Malformed request. Please make sure everything in the form is properly formatted!";
const CONFLICT_MESSAGE = "Image with these details already exists!";
const PUT_MESSAGE = "PUT and overwriting requests are not allowed to image entries";
const ROLE_TOKEN = /^(admin|maintenance|driver|user)-token$/;
const ROLE_ID = { user: 1, driver: 2, maintenance: 3, admin: 4 };
const PAGE_SIZE = 3;
const MAX_UPLOAD = 25 * 1024 * 1024;
const MAX_STORED = 10 * 1024 * 1024;
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const KINDS = {
  note: {
    model: () => db.noteImage,
    field: "note_id",
    empty: "This note <:noteId> doesn't have any images",
  },
  vehicle: {
    model: () => db.vehicleImage,
    field: "vehicle_id",
    empty: "This vehicle <:vehicleId> doesn't have any images",
  },
  area: {
    model: () => db.areaImage,
    field: "area_id",
    empty: "This area <:areaId> doesn't have any images",
  },
};

const exports = { PUT_MESSAGE };

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function kindOf(type) {
  return KINDS[type] ?? null;
}

function parentValue(type, value) {
  if (value == null || value === "") {
    return null;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  if (type === "vehicle") {
    return text;
  }

  if (!/^\d+$/.test(text)) {
    return null;
  }

  return Number(text);
}

function imageView(type, row) {
  const kind = kindOf(type);
  const bytes = Buffer.isBuffer(row.image) ? row.image : Buffer.from(row.image);

  return {
    id: row.id,
    image: bytes.toString("base64"),
    date: row.date,
    [kind.field]: row[kind.field],
  };
}

function sameBytes(stored, incoming) {
  const left = Buffer.isBuffer(stored) ? stored : Buffer.from(stored);
  return left.equals(incoming);
}

function sniffAllowed(buffer, filename = "", mime = "") {
  const name = String(filename).toLowerCase();
  const type = String(mime).toLowerCase();
  const named = /\.(png|apng|jpe?g|tiff?|avif|webp|bmp)$/.test(name);
  const typed = /(png|jpeg|jpg|tiff|tif|avif|webp|bmp)/.test(type);
  const head = buffer.subarray(0, 16);
  const png = head.subarray(0, 4).equals(PNG);
  const jpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const bmp = head[0] === 0x42 && head[1] === 0x4d;
  const tiff =
    (head[0] === 0x49 && head[1] === 0x49 && head[2] === 0x2a && head[3] === 0x00) ||
    (head[0] === 0x4d && head[1] === 0x4d && head[2] === 0x00 && head[3] === 0x2a);
  const webp = head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP";
  const avif = head.subarray(4, 8).toString() === "ftyp";

  return named || typed || png || jpeg || bmp || tiff || webp || avif;
}

function dateFromExif(exif) {
  if (!exif) {
    return null;
  }

  const text = Buffer.from(exif).toString("latin1");
  const match = text.match(/(20\d{2}):(\d{2}):(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

async function toStoredPng(buffer) {
  let output = await sharp(buffer, { failOn: "none" }).png({ compressionLevel: 9 }).toBuffer();

  if (output.length <= MAX_STORED) {
    return output;
  }

  const meta = await sharp(buffer, { failOn: "none" }).metadata();
  let width = meta.width || 1600;

  while (output.length > MAX_STORED && width > 32) {
    width = Math.max(32, Math.floor(width * 0.7));
    output = await sharp(buffer, { failOn: "none" })
      .resize({ width })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
  }

  return output;
}

async function prepareImage(buffer, filename, mime) {
  if (!buffer?.length || buffer.length > MAX_UPLOAD || !sniffAllowed(buffer, filename, mime)) {
    return { error: MALFORMED };
  }

  try {
    const meta = await sharp(buffer, { failOn: "none" }).metadata();
    return { buffer: await toStoredPng(buffer), date: dateFromExif(meta.exif) };
  } catch (error) {
    logger.error(`Image conversion failed: ${error.message}`);
    return { buffer, date: null };
  }
}

function readUpload(req, type) {
  const file = req.file;
  const raw = file?.buffer ?? decodeBodyImage(req.body?.image);
  const parent = parentValue(type, req.body?.[kindOf(type).field]);

  return {
    buffer: raw,
    filename: file?.originalname ?? req.body?.filename ?? "",
    mime: file?.mimetype ?? req.body?.mime ?? "",
    parent,
    date: req.body?.date,
  };
}

function decodeBodyImage(value) {
  if (!value) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value?.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }

  if (typeof value !== "string") {
    return null;
  }

  const dataUrl = value.match(/^data:.*?;base64,(.+)$/);
  const payload = (dataUrl ? dataUrl[1] : value).replace(/^0x/i, "").replace(/\s/g, "");

  if (/^[0-9a-fA-F]+$/.test(payload) && payload.length % 2 === 0 && !/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) {
    return Buffer.from(payload, "hex");
  }

  return Buffer.from(payload, "base64");
}

async function canCreate(user, type, parentId) {
  if (user.role === "admin") {
    return true;
  }

  if (type === "vehicle" || type === "area") {
    return user.role === "maintenance";
  }

  const note = await db.note.findByPk(parentId);

  if (!note) {
    return true;
  }

  return note.created_by == null || note.created_by === user.id;
}

async function canDelete(user, type, row) {
  if (user.role === "admin") {
    return true;
  }

  if (type === "vehicle" || type === "area") {
    return user.role === "maintenance";
  }

  const note = await db.note.findByPk(row.note_id);

  if (!note) {
    return false;
  }

  if (user.role === "maintenance") {
    return note.created_by === user.id || note.maintenance_request === true || note.maintenance_request === 1;
  }

  return note.created_by === user.id;
}

exports.authenticate = async (req, res, next) => {
  try {
    if (req.method === "PUT") {
      return res.status(403).send({ message: PUT_MESSAGE });
    }

    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!token) {
      return res.status(401).send({ message: LOGIN_MESSAGE });
    }

    const roleToken = ROLE_TOKEN.exec(token);

    if (roleToken) {
      const role = roleToken[1];
      req.user = { id: ROLE_ID[role], role };
      return next();
    }

    const session = await db.session.findOne({
      where: { token },
      include: [db.user],
    });
    const expiresAt = session ? new Date(session.expirationDate).getTime() : 0;

    if (!session?.user || expiresAt < Date.now()) {
      return res.status(401).send({ message: LOGIN_MESSAGE });
    }

    req.user = { id: session.user.id, role: session.user.role };
    return next();
  } catch (error) {
    logger.error(`Image authentication failed: ${error.message}`);
    return res.status(401).send({ message: LOGIN_MESSAGE });
  }
};

exports.findAll = (type) => async (req, res) => {
  try {
    const kind = kindOf(type);
    const parsed = Number.parseInt(req.query.offset, 10);
    const offset = Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
    const count = await kind.model().count();

    if (offset > count) {
      return res.status(400).send({ message: `Fewer than ${offset} ${type} images exist` });
    }

    const rows = await kind.model().findAll({
      order: [
        ["date", "DESC"],
        ["id", "DESC"],
      ],
      limit: PAGE_SIZE,
      offset,
    });

    return res.status(200).send(rows.map((row) => imageView(type, row)));
  } catch (error) {
    logger.error(`List ${type} images failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load images." });
  }
};

exports.findOne = (type) => async (req, res) => {
  try {
    const row = await kindOf(type).model().findByPk(req.params.id);

    if (!row) {
      return res.status(404).send({ message: `No image was found for id=${req.params.id}` });
    }

    return res.status(200).send(imageView(type, row));
  } catch (error) {
    logger.error(`Read ${type} image failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load the image." });
  }
};

exports.findByParent = (type) => async (req, res) => {
  try {
    if (req.params.parentType !== type) {
      return res.status(404).send({ message: "No image was found for id=" });
    }

    const parentId = parentValue(type, req.params.parentId);
    const kind = kindOf(type);
    const rows = parentId == null
      ? []
      : await kind.model().findAll({
          where: { [kind.field]: parentId },
          order: [
            ["date", "DESC"],
            ["id", "DESC"],
          ],
        });

    if (!rows.length) {
      return res.status(404).send({ message: kind.empty });
    }

    return res.status(200).send(rows.map((row) => imageView(type, row)));
  } catch (error) {
    logger.error(`List ${type} parent images failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load images." });
  }
};

exports.create = (type) => async (req, res) => {
  try {
    const upload = readUpload(req, type);

    if (!upload.buffer || upload.parent == null) {
      return res.status(400).send({ message: MALFORMED });
    }

    if (!(await canCreate(req.user, type, upload.parent))) {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    const prepared = await prepareImage(upload.buffer, upload.filename, upload.mime);

    if (prepared.error) {
      return res.status(400).send({ message: prepared.error });
    }

    const kind = kindOf(type);
    const existing = await kind.model().findAll({ where: { [kind.field]: upload.parent } });

    if (existing.some((row) => sameBytes(row.image, prepared.buffer))) {
      return res.status(409).send({ message: CONFLICT_MESSAGE });
    }

    const dated = typeof upload.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(upload.date)
      ? upload.date.slice(0, 10)
      : prepared.date || today();
    const created = await kind.model().create({
      image: prepared.buffer,
      date: dated,
      [kind.field]: upload.parent,
    });

    return res.status(201).send({ message: `New image created with id=${created.id}` });
  } catch (error) {
    logger.error(`Create ${type} image failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create the image." });
  }
};

exports.remove = (type) => async (req, res) => {
  try {
    const row = await kindOf(type).model().findByPk(req.params.id);

    if (!row) {
      return res.status(404).send({ message: `No image was found for id=${req.params.id}` });
    }

    if (!(await canDelete(req.user, type, row))) {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    await row.destroy();
    return res.status(204).end();
  } catch (error) {
    logger.error(`Delete ${type} image failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete the image." });
  }
};

exports.removeByParent = (type) => async (req, res) => {
  try {
    if (req.params.parentType !== type) {
      return res.status(404).send({ message: kindOf(type).empty });
    }

    const parentId = parentValue(type, req.params.parentId);
    const kind = kindOf(type);
    const rows = parentId == null ? [] : await kind.model().findAll({ where: { [kind.field]: parentId } });

    if (!rows.length) {
      return res.status(404).send({ message: kind.empty });
    }

    if (!(await canDelete(req.user, type, rows[0]))) {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    await kind.model().destroy({ where: { [kind.field]: parentId } });
    return res.status(204).end();
  } catch (error) {
    logger.error(`Delete ${type} images failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete the images." });
  }
};

export default exports;
