import db from "../models/index.js";
import logger from "../config/logger.js";
import { getAreaOrNull } from "../authorization/authorization.js";

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

function logoValue(logo) {
  if (logo == null) {
    return null;
  }

  if (Buffer.isBuffer(logo)) {
    return logo.length === 0 ? null : logo.toString("utf8");
  }

  const trimmed = String(logo).trim();
  return trimmed === "" ? null : trimmed;
}

function present(area) {
  return {
    id: area.id,
    name: area.name,
    noticeEmail: area.noticeEmail,
    logo: logoValue(area.logo),
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
    value.logo = logoValue(body.logo);
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

    const area = await db.area.create(parsed.value);
    return res.status(201).send(present(area));
  } catch (error) {
    if (isDuplicateName(error)) {
      return res.status(409).send({ message: "Area name already in use!" });
    }

    logger.error(error.message);
    return res.status(500).send({ message: "Unable to create the area." });
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

    await area.update(parsed.value);
    return res.send(present(area));
  } catch (error) {
    if (isDuplicateName(error)) {
      return res.status(409).send({ message: "Area name already in use!" });
    }

    logger.error(error.message);
    return res.status(500).send({ message: "Unable to update the area." });
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
