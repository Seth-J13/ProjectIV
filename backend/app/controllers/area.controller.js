import sharp from "sharp";
import db from "../models/index.js";
import logger from "../config/logger.js";
import { getAreaOrNull } from "../authorization/authorization.js";

const MAX_STORED_LOGO = 10 * 1024 * 1024;

const exports = {};

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function text(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function logoBytes(logo) {
  if (logo == null) {
    return null;
  }

  if (Buffer.isBuffer(logo)) {
    return logo.length === 0 ? null : logo;
  }

  const raw = String(logo).trim();

  if (!raw) {
    return null;
  }

  const encoded = raw.includes(",") ? raw.slice(raw.indexOf(",") + 1) : raw;
  const buffer = Buffer.from(encoded, "base64");
  return buffer.length === 0 ? null : buffer;
}

function presentLogo(logo) {
  const buffer = logoBytes(logo);
  return buffer ? buffer.toString("base64") : null;
}

async function compressLogo(buffer) {
  let output = await sharp(buffer, { failOn: "none" }).png({ compressionLevel: 9 }).toBuffer();

  if (output.length <= MAX_STORED_LOGO) {
    return output;
  }

  const meta = await sharp(buffer, { failOn: "none" }).metadata();
  let width = meta.width || 1600;

  while (output.length > MAX_STORED_LOGO && width > 32) {
    width = Math.max(32, Math.floor(width * 0.7));
    output = await sharp(buffer, { failOn: "none" })
      .resize({ width })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
  }

  return output;
}

async function storeLogo(value) {
  if (!Object.prototype.hasOwnProperty.call(value, "logo") || value.logo == null) {
    return;
  }

  try {
    value.logo = await compressLogo(value.logo);
  } catch (error) {
    logger.error(error.message);
    const invalid = new Error("Use a png, jpg, tiff, avif, webp, or bmp image.");
    invalid.status = 400;
    throw invalid;
  }
}

function sendAreaError(res, error, fallback) {
  if (error.status === 400) {
    return res.status(400).send({ message: error.message });
  }

  if (String(error?.message || "").includes("Data too long")) {
    logger.error(error.message);
    return res.status(400).send({ message: "The logo image is too large." });
  }

  logger.error(error.message);
  return res.status(500).send({ message: fallback });
}

function present(area) {
  return {
    id: area.id,
    name: area.name,
    noticeEmail: area.noticeEmail,
    logo: presentLogo(area.logo),
  };
}

function readPayload(body) {
  const name = text(body?.name);
  const noticeEmail = text(body?.noticeEmail);

  if (!name || !noticeEmail) {
    return { error: "Area is incomplete!" };
  }

  if (name.length > 30) {
    return { error: "Area name must be at most 30 characters." };
  }

  if (noticeEmail.length > 255) {
    return { error: "Area is incomplete!" };
  }

  const value = { name, noticeEmail };

  if (Object.prototype.hasOwnProperty.call(body, "logo")) {
    value.logo = logoBytes(body.logo);
  }

  return { value };
}

async function nameInUse(name, areaId) {
  const existing = await db.area.findOne({ where: { name } });
  return Boolean(existing && existing.id !== areaId);
}

async function vehicleReferencesArea(areaId) {
  const [tables] = await db.sequelize.query(
    `SELECT TABLE_NAME AS tableName
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = 'vehicles'`
  );

  if (!tables.length) {
    return false;
  }

  const [rows] = await db.sequelize.query(
    "SELECT COUNT(*) AS referenceCount FROM vehicles WHERE area_id = :areaId",
    { replacements: { areaId } }
  );

  return Number(rows[0]?.referenceCount || 0) > 0;
}

function isDuplicateName(error) {
  return error?.name === "SequelizeUniqueConstraintError";
}

exports.findAll = async (req, res) => {
  try {
    const areas = await db.area.findAll({ order: [["name", "ASC"]] });
    return res.send(areas.map(present));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load areas." });
  }
};

exports.findOne = async (req, res) => {
  const areaId = parseId(req.params.id);

  if (areaId === null) {
    return res.status(404).send({ message: "Area not found!" });
  }

  try {
    const area = await getAreaOrNull(areaId);

    if (!area) {
      return res.status(404).send({ message: "Area not found!" });
    }

    return res.send(present(area));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load the area." });
  }
};

exports.create = async (req, res) => {
  const parsed = readPayload(req.body ?? {});

  if (parsed.error) {
    return res.status(400).send({ message: parsed.error });
  }

  try {
    if (await nameInUse(parsed.value.name)) {
      return res.status(409).send({ message: "Area name already in use!" });
    }

    await storeLogo(parsed.value);
    const area = await db.area.create(parsed.value);
    return res.status(201).send(present(area));
  } catch (error) {
    if (isDuplicateName(error)) {
      return res.status(409).send({ message: "Area name already in use!" });
    }

    return sendAreaError(res, error, "Unable to create the area.");
  }
};

exports.update = async (req, res) => {
  const areaId = parseId(req.params.id);

  if (areaId === null) {
    return res.status(404).send({ message: "Area not found!" });
  }

  const parsed = readPayload(req.body ?? {});

  if (parsed.error) {
    return res.status(400).send({ message: parsed.error });
  }

  try {
    const area = await getAreaOrNull(areaId);

    if (!area) {
      return res.status(404).send({ message: "Area not found!" });
    }

    if (await nameInUse(parsed.value.name, area.id)) {
      return res.status(409).send({ message: "Area name already in use!" });
    }

    await storeLogo(parsed.value);
    await area.update(parsed.value);
    return res.send(present(area));
  } catch (error) {
    if (isDuplicateName(error)) {
      return res.status(409).send({ message: "Area name already in use!" });
    }

    return sendAreaError(res, error, "Unable to update the area.");
  }
};

exports.remove = async (req, res) => {
  const areaId = parseId(req.params.id);

  if (areaId === null) {
    return res.status(404).send({ message: "Area not found!" });
  }

  try {
    const area = await getAreaOrNull(areaId);

    if (!area) {
      return res.status(404).send({ message: "Area not found!" });
    }

    if (await vehicleReferencesArea(area.id)) {
      return res.status(409).send({ message: "Area is in use!" });
    }

    await db.areaImage.destroy({ where: { area_id: area.id } });
    await area.destroy();
    return res.send({ message: "Area deleted." });
  } catch (error) {
    if (error?.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).send({ message: "Area is in use!" });
    }

    logger.error(error.message);
    return res.status(500).send({ message: "Unable to delete the area." });
  }
};

export default exports;
