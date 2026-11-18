import db from "../models/index.js";
import logger from "../config/logger.js";
import { getAccessibleDriversOrNull } from "../authorization/authorization.js";

const LICENSE_STATUSES = ["expired", "active", "suspended"];
const AVAILABILITY = ["available", "not available", "on call"];

const exports = {};

function parseDriverId(value) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^[0-9]+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return null;
}

function readPayload(body, driverId) {
  const id = parseDriverId(driverId ?? body.driver_id);

  if (id === null) {
    return { error: "driver_id is improperly formatted." };
  }

  if (body.name !== undefined && body.name !== null && String(body.name).trim() === "") {
    return { error: "Driver name is required." };
  }

  const licenseStatus = body.license_status === undefined || body.license_status === null
    ? ""
    : String(body.license_status).trim();

  if (!licenseStatus) {
    return { error: "license status is required." };
  }

  if (!LICENSE_STATUSES.includes(licenseStatus)) {
    return { error: "license status is invalid." };
  }

  const licenseExpDate = body.license_exp_date === undefined || body.license_exp_date === null
    ? ""
    : String(body.license_exp_date).trim();

  if (!licenseExpDate) {
    return { error: "license expiration date is required." };
  }

  const availability = body.availability === undefined || body.availability === null
    ? ""
    : String(body.availability).trim();

  if (!availability) {
    return { error: "availability is required." };
  }

  if (!AVAILABILITY.includes(availability)) {
    return { error: "availability is invalid." };
  }

  const value = {
    driver_id: id,
    license_status: licenseStatus,
    license_exp_date: licenseExpDate,
    availability,
  };

  if (body.name !== undefined && body.name !== null) {
    value.name = String(body.name).trim();
  }

  return { value };
}

exports.findAll = async (req, res) => {
  try {
    const drivers = await db.driver.findAll({ order: [["driver_id", "ASC"]] });
    return res.send(drivers);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load drivers." });
  }
};

exports.findOne = async (req, res) => {
  const driverId = parseDriverId(req.params.driver_id);

  if (driverId === null) {
    return res.status(400).send({ message: "driver_id is improperly formatted." });
  }

  try {
    const driver = await getAccessibleDriversOrNull(req, driverId);

    if (!driver) {
      return res.status(404).send({ message: `Driver with id=${driverId} not found.` });
    }

    return res.send(driver);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to load the driver." });
  }
};

exports.create = async (req, res) => {
  const parsed = readPayload(req.body);

  if (parsed.error) {
    return res.status(400).send({ message: parsed.error });
  }

  try {
    const existing = await db.driver.findByPk(parsed.value.driver_id);

    if (existing) {
      return res.status(400).send({ message: "A driver with that id already exists." });
    }

    const driver = await db.driver.create(parsed.value);
    return res.status(201).send(driver);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to create the driver." });
  }
};

exports.update = async (req, res) => {
  const parsed = readPayload(req.body, req.params.driver_id);

  if (parsed.error) {
    return res.status(400).send({ message: parsed.error });
  }

  try {
    const driver = await getAccessibleDriversOrNull(req, parsed.value.driver_id);

    if (!driver) {
      return res.status(404).send({ message: `Driver with id=${parsed.value.driver_id} not found.` });
    }

    await driver.update(parsed.value);
    return res.send(driver);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to update the driver." });
  }
};

exports.remove = async (req, res) => {
  const driverId = parseDriverId(req.params.driver_id);

  if (driverId === null) {
    return res.status(400).send({ message: "driver_id is improperly formatted." });
  }

  try {
    const driver = await getAccessibleDriversOrNull(req, driverId);

    if (!driver) {
      return res.status(404).send({ message: `Driver with id=${driverId} not found.` });
    }

    await driver.destroy();
    return res.status(204).send();
  } catch (error) {
    logger.error(error.message);
    return res.status(500).send({ message: "Unable to delete the driver." });
  }
};

export default exports;
