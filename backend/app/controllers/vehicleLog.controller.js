import { Op } from "sequelize";
import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};

function text(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function formatDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readCompleted(value) {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }

  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }

  return null;
}

function readPayload(body) {
  const serviceDate = text(body?.serviceDate);
  const vin = text(body?.vin);
  const description = text(body?.description);
  const completed = readCompleted(body?.completed);

  if (!serviceDate || !vin || !description || completed === null) {
    return { error: "Vehicle log is incomplete!" };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) || Number.isNaN(Date.parse(`${serviceDate}T00:00:00`))) {
    return { error: "Vehicle log is incomplete!" };
  }

  return {
    value: {
      serviceDate,
      vin,
      description,
      completed,
    },
  };
}

async function ownerIdsFor(logId) {
  const rows = await db.vehicleLogOwner.findAll({
    where: { vehicleLogId: logId },
    order: [["id", "ASC"]],
  });

  return rows.map((row) => row.userId);
}

async function present(log) {
  return {
    id: log.id,
    serviceDate: formatDate(log.serviceDate),
    vin: log.vin,
    description: log.description,
    completed: Boolean(log.completed),
    creatorId: log.creatorId,
    ownerIds: await ownerIdsFor(log.id),
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}

function canWrite(req, ownerIds) {
  if (req.user.role === "admin") {
    return true;
  }

  return ownerIds.map(Number).includes(Number(req.user.id));
}

export async function purgeExpiredVehicleLogs(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 18);
  const cutoffDate = formatDate(cutoff);
  const expired = await db.vehicleLog.findAll({
    where: { serviceDate: { [Op.lt]: cutoffDate } },
  });

  for (const log of expired) {
    await db.vehicleLogOwner.destroy({ where: { vehicleLogId: log.id } });
    await log.destroy();
  }
}

async function findLog(id) {
  if (id === null) {
    return null;
  }

  return db.vehicleLog.findByPk(id);
}

exports.findAll = async (req, res) => {
  try {
    await purgeExpiredVehicleLogs();
    const logs = await db.vehicleLog.findAll({ order: [["serviceDate", "DESC"], ["id", "ASC"]] });
    const body = [];

    for (const log of logs) {
      body.push(await present(log));
    }

    return res.send(body);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load vehicle logs." });
  }
};

exports.findOne = async (req, res) => {
  const logId = parseId(req.params.id);

  try {
    await purgeExpiredVehicleLogs();
    const log = await findLog(logId);

    if (!log) {
      return res.status(404).send({ message: "Vehicle log not found!" });
    }

    return res.send(await present(log));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load the vehicle log." });
  }
};

exports.create = async (req, res) => {
  const parsed = readPayload(req.body ?? {});

  if (parsed.error) {
    return res.status(400).send({ message: parsed.error });
  }

  try {
    const vehicle = await db.vehicle.findByPk(parsed.value.vin);

    if (!vehicle) {
      return res.status(404).send({ message: "Vehicle not found!" });
    }

    const log = await db.vehicleLog.create({
      ...parsed.value,
      creatorId: req.user.id,
    });
    await db.vehicleLogOwner.create({
      vehicleLogId: log.id,
      userId: req.user.id,
    });

    return res.status(201).send(await present(log));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to create the vehicle log." });
  }
};

exports.update = async (req, res) => {
  const logId = parseId(req.params.id);
  const parsed = readPayload(req.body ?? {});

  if (parsed.error) {
    return res.status(400).send({ message: parsed.error });
  }

  try {
    const log = await findLog(logId);

    if (!log) {
      return res.status(404).send({ message: "Vehicle log not found!" });
    }

    const owners = await ownerIdsFor(log.id);

    if (!canWrite(req, owners)) {
      return res.status(403).send({ message: "Forbidden" });
    }

    const vehicle = await db.vehicle.findByPk(parsed.value.vin);

    if (!vehicle) {
      return res.status(404).send({ message: "Vehicle not found!" });
    }

    await log.update(parsed.value);
    return res.send(await present(log));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to update the vehicle log." });
  }
};

exports.remove = async (req, res) => {
  const logId = parseId(req.params.id);

  try {
    const log = await findLog(logId);

    if (!log) {
      return res.status(404).send({ message: "Vehicle log not found!" });
    }

    const owners = await ownerIdsFor(log.id);

    if (!canWrite(req, owners)) {
      return res.status(403).send({ message: "Forbidden" });
    }

    await db.vehicleLogOwner.destroy({ where: { vehicleLogId: log.id } });
    await log.destroy();
    return res.send({ message: "Vehicle log deleted." });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to delete the vehicle log." });
  }
};

exports.addOwner = async (req, res) => {
  const logId = parseId(req.params.id);
  const userId = parseId(req.body?.userId);

  if (userId === null) {
    return res.status(400).send({ message: "Vehicle log is incomplete!" });
  }

  try {
    const log = await findLog(logId);

    if (!log) {
      return res.status(404).send({ message: "Vehicle log not found!" });
    }

    const owners = await ownerIdsFor(log.id);

    if (!canWrite(req, owners)) {
      return res.status(403).send({ message: "Forbidden" });
    }

    const user = await db.user.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    if (!owners.map(Number).includes(userId)) {
      await db.vehicleLogOwner.create({ vehicleLogId: log.id, userId });
    }

    return res.send(await present(log));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to add the owner." });
  }
};

export default exports;
