import db from "../models/index.js";
import logger from "../config/logger.js";
import { getAccessibleRequestOrNull } from "../authorization/authorization.js";

const exports = {};

function text(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function parseId(value) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^[0-9]+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return null;
}

function stamp(date, time) {
  if (!date) {
    return null;
  }

  return new Date(`${date}T${time || "00:00"}`);
}

async function present(row) {
  const plain = row.get({ plain: true });
  const vehicle = await db.vehicle.findByPk(plain.vehicleId);
  const driver = plain.driverId == null ? null : await db.driver.findByPk(plain.driverId);
  const destination = plain.destId == null ? null : await db.destination.findByPk(plain.destId);

  return {
    requestId: plain.requestId,
    requestType: plain.requestType,
    requesterId: plain.requesterId,
    vehicleId: plain.vehicleId,
    driverId: plain.driverId ?? null,
    destId: plain.destId ?? null,
    vehicle: vehicle
      ? {
          vehicleId: vehicle.vehicleId,
          license: vehicle.license,
          make: vehicle.make,
          model: vehicle.model,
        }
      : null,
    driver: driver ? { driverId: driver.driverId, name: driver.name } : null,
    destination: destination ? { destId: destination.destId, name: destination.name } : null,
    startDate: plain.startDate,
    startTime: plain.startTime,
    endDate: plain.endDate,
    endTime: plain.endTime,
    numPeople: plain.numPeople ?? null,
    currentlyActive: plain.currentlyActive,
  };
}

async function readPayload(body, requestType) {
  if (requestType !== "trip" && requestType !== "maintenance") {
    return { error: "request type is required." };
  }

  const vehicleId = parseId(body.vehicleId);

  if (vehicleId === null) {
    return { error: "vehicle is required." };
  }

  const value = {
    requestType,
    vehicleId,
    driverId: null,
    destId: null,
    startDate: text(body.startDate) || null,
    startTime: text(body.startTime) || null,
    endDate: text(body.endDate) || null,
    endTime: text(body.endTime) || null,
    numPeople: null,
  };

  let driverId = null;
  let destId = null;

  if (requestType === "trip") {
    driverId = parseId(body.driverId);
    destId = parseId(body.destId);

    if (driverId === null) {
      return { error: "driver is required." };
    }

    if (destId === null) {
      return { error: "destination is required." };
    }

    if (!value.startDate) {
      return { error: "start date is required." };
    }

    if (!value.startTime) {
      return { error: "start time is required." };
    }

    if (!value.endDate) {
      return { error: "end date is required." };
    }

    if (!value.endTime) {
      return { error: "end time is required." };
    }

    const people = Number(body.numPeople);

    if (!Number.isInteger(people) || people < 1) {
      return { error: "number of people must be at least 1." };
    }

    const start = stamp(value.startDate, value.startTime);
    const end = stamp(value.endDate, value.endTime);

    if (end < start) {
      return { error: "end must be after start." };
    }

    value.numPeople = people;
  }

  const vehicle = await db.vehicle.findByPk(vehicleId);

  if (!vehicle) {
    return { error: "vehicle does not exist." };
  }

  if (requestType === "maintenance") {
    if (!value.endDate && value.startDate) {
      value.endDate = value.startDate;
    }

    return { value };
  }

  const driver = await db.driver.findByPk(driverId);
  const destination = await db.destination.findByPk(destId);

  if (!driver) {
    return { error: "driver does not exist." };
  }

  if (!destination) {
    return { error: "destination does not exist." };
  }

  value.driverId = driverId;
  value.destId = destId;
  return { value };
}

exports.findVehicles = async (_req, res) => {
  try {
    const vehicles = await db.vehicle.findAll({ order: [["vehicleId", "ASC"]] });
    return res.send(vehicles);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load vehicles." });
  }
};

exports.findDrivers = async (_req, res) => {
  try {
    const drivers = await db.driver.findAll({ order: [["driverId", "ASC"]] });
    return res.send(drivers);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load drivers." });
  }
};

exports.findDestinations = async (_req, res) => {
  try {
    const destinations = await db.destination.findAll({ order: [["destId", "ASC"]] });
    return res.send(destinations);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load destinations." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { requesterId: req.user.id };
    const rows = await db.request.findAll({ where, order: [["requestId", "ASC"]] });
    const presented = [];

    for (const row of rows) {
      presented.push(await present(row));
    }

    return res.send(presented);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load requests." });
  }
};

exports.findOne = async (req, res) => {
  const requestId = parseId(req.params.requestId);

  if (requestId === null) {
    return res.status(400).send({ message: "requestId is improperly formatted." });
  }

  try {
    const row = await getAccessibleRequestOrNull(req, requestId);

    if (!row) {
      return res.status(404).send({ message: `Request with id=${requestId} not found.` });
    }

    return res.send(await present(row));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load the request." });
  }
};

exports.create = async (req, res) => {
  const requestType = text(req.body.requestType);

  if (requestType === "maintenance" && req.user.role !== "admin") {
    return res.status(403).send({ message: "Admin access required." });
  }

  try {
    const parsed = await readPayload(req.body, requestType);

    if (parsed.error) {
      return res.status(400).send({ message: parsed.error });
    }

    const row = await db.request.create({
      ...parsed.value,
      requesterId: req.user.id,
      currentlyActive: true,
    });

    return res.status(201).send(await present(row));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to create the request." });
  }
};

exports.update = async (req, res) => {
  const requestId = parseId(req.params.requestId);

  if (requestId === null) {
    return res.status(400).send({ message: "requestId is improperly formatted." });
  }

  try {
    const row = await getAccessibleRequestOrNull(req, requestId);

    if (!row) {
      return res.status(404).send({ message: `Request with id=${requestId} not found.` });
    }

    const parsed = await readPayload(req.body, row.requestType);

    if (parsed.error) {
      return res.status(400).send({ message: parsed.error });
    }

    await row.update({
      ...parsed.value,
      requestType: row.requestType,
      requesterId: row.requesterId,
    });

    return res.send(await present(row));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to update the request." });
  }
};

exports.remove = async (req, res) => {
  const requestId = parseId(req.params.requestId);

  if (requestId === null) {
    return res.status(400).send({ message: "requestId is improperly formatted." });
  }

  try {
    const row = await getAccessibleRequestOrNull(req, requestId);

    if (!row) {
      return res.status(404).send({ message: `Request with id=${requestId} not found.` });
    }

    await row.destroy();
    return res.status(204).send();
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to delete the request." });
  }
};

export default exports;
