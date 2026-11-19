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

function dayKey(value) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(text(value));
  return match ? match[1] : "";
}

function clockMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})/.exec(text(value));

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function dateKey(now) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function nowMinutes(now) {
  return now.getHours() * 60 + now.getMinutes();
}

function isBeforeNow(date, time, now) {
  const day = dayKey(date);

  if (!day) {
    return false;
  }

  const today = dateKey(now);

  if (day < today) {
    return true;
  }

  if (day > today) {
    return false;
  }

  const minutes = clockMinutes(time);

  if (minutes == null) {
    return false;
  }

  return minutes < nowMinutes(now);
}

function isAfterNow(date, time, now) {
  const day = dayKey(date);

  if (!day) {
    return false;
  }

  const today = dateKey(now);

  if (day > today) {
    return true;
  }

  if (day < today) {
    return false;
  }

  const minutes = clockMinutes(time);

  if (minutes == null) {
    return false;
  }

  return minutes > nowMinutes(now);
}

export function isRequestActive(startDate, startTime, endDate, endTime, now = new Date()) {
  if (!isBeforeNow(startDate, startTime, now)) {
    return false;
  }

  if (!dayKey(endDate)) {
    return true;
  }

  return isAfterNow(endDate, endTime, now);
}

function scheduleError(startDate, startTime, endDate, endTime) {
  const startDay = dayKey(startDate);
  const endDay = dayKey(endDate);

  if (startDay && endDay && endDay < startDay) {
    return "end must be after start.";
  }

  if (startDay && endDay && endDay > startDay) {
    return "";
  }

  const startMinutes = clockMinutes(startTime);
  const endMinutes = clockMinutes(endTime);

  if (startMinutes == null || endMinutes == null || endMinutes > startMinutes) {
    return "";
  }

  return "end must be after start.";
}

function vehicleKey(vehicleId) {
  return String(vehicleId);
}

function vehicleView(vehicle) {
  if (!vehicle) {
    return null;
  }

  return {
    vehicleId: String(vehicle.vin),
    license: vehicle.license_plate_num ?? null,
    make: vehicle.make,
    model: vehicle.model,
  };
}

async function present(row) {
  const plain = row.get({ plain: true });
  const active = isRequestActive(plain.startDate, plain.startTime, plain.endDate, plain.endTime);

  if (plain.currentlyActive !== active) {
    await row.update({ currentlyActive: active });
    plain.currentlyActive = active;
  }

  const vehicle = await db.vehicle.findByPk(vehicleKey(plain.vehicleId));
  const driver = plain.driverId == null ? null : await db.driver.findByPk(plain.driverId);
  const destination = plain.destId == null ? null : await db.destination.findByPk(plain.destId);

  return {
    requestId: plain.requestId,
    requestType: plain.requestType,
    requesterId: plain.requesterId,
    vehicleId: plain.vehicleId,
    driverId: plain.driverId ?? null,
    destId: plain.destId ?? null,
    vehicle: vehicleView(vehicle),
    driver: driver ? { driverId: driver.driver_id, name: driver.name } : null,
    destination: destination ? { destId: destination.id, name: destination.dest_name } : null,
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

  const vehicleId = text(body.vehicleId);

  if (!vehicleId) {
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

    if (!value.endDate) {
      return { error: "end date is required." };
    }

    const people = Number(body.numPeople);

    if (!Number.isInteger(people) || people < 1) {
      return { error: "number of people must be at least 1." };
    }

    const order = scheduleError(value.startDate, value.startTime, value.endDate, value.endTime);

    if (order) {
      return { error: order };
    }

    value.numPeople = people;
  }

  const vehicle = await db.vehicle.findByPk(vehicleKey(vehicleId));

  if (!vehicle) {
    return { error: "vehicle does not exist." };
  }

  value.vehicleId = vehicle.vin;

  if (requestType === "maintenance") {
    const order = scheduleError(value.startDate, value.startTime, value.endDate, value.endTime);

    if (order) {
      return { error: order };
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
    const vehicles = await db.vehicle.findAll({ order: [["vin", "ASC"]] });
    return res.send(vehicles.map(vehicleView));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load vehicles." });
  }
};

exports.findDrivers = async (_req, res) => {
  try {
    const drivers = await db.driver.findAll({ order: [["driver_id", "ASC"]] });
    return res.send(
      drivers.map((driver) => ({
        driverId: driver.driver_id,
        name: driver.name,
      }))
    );
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load drivers." });
  }
};

exports.findDestinations = async (_req, res) => {
  try {
    const destinations = await db.destination.findAll({ order: [["id", "ASC"]] });
    return res.send(
      destinations.map((destination) => ({
        destId: destination.id,
        name: destination.dest_name,
      }))
    );
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

  if (
    requestType === "maintenance" &&
    req.user.role !== "admin" &&
    req.user.role !== "maintenance"
  ) {
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
      currentlyActive: isRequestActive(
        parsed.value.startDate,
        parsed.value.startTime,
        parsed.value.endDate,
        parsed.value.endTime
      ),
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
      currentlyActive: isRequestActive(
        parsed.value.startDate,
        parsed.value.startTime,
        parsed.value.endDate,
        parsed.value.endTime
      ),
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
