import { Op } from "sequelize";
import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};

const VEHICLE_REQUIRED = [
  "vin",
  "make",
  "model",
  "year",
  "purchased_date",
  "tag_exp_month",
  "area_id",
  "available",
];

function text(value) {
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

function parseDate(value) {
  if (!value) {
    return null;
  }
  const normalized = String(value).replace(/\//g, "-");
  const parts = normalized.split("-").map((part) => Number(part));
  if (parts.length < 3 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }
  const [year, month, day] = parts;
  const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : iso;
}

function currentYear() {
  return new Date().getFullYear();
}

function missingFieldMessage(field) {
  return `${field} is required`;
}

function validateYear(year) {
  const value = Number(year);
  if (!Number.isInteger(value) || value < 1900 || value > currentYear()) {
    return "Select a year between 1900-Today";
  }
  return null;
}

function normalizeVehicleBody(body = {}) {
  return {
    vin: text(body.vin),
    make: text(body.make),
    model: text(body.model),
    year: body.year == null || body.year === "" ? null : Number(body.year),
    purchased_date: parseDate(body.purchased_date),
    color: body.color == null || body.color === "" ? null : text(body.color),
    license_plate_num:
      body.license_plate_num == null || body.license_plate_num === ""
        ? null
        : text(body.license_plate_num),
    tag_exp_month: parseDate(body.tag_exp_month),
    area_id: body.area_id == null || body.area_id === "" ? null : Number(body.area_id),
    most_recent_dest_id:
      body.most_recent_dest_id == null || body.most_recent_dest_id === ""
        ? null
        : Number(body.most_recent_dest_id),
    available:
      body.available === true || body.available === 1 || body.available === "1"
        ? true
        : body.available === false || body.available === 0 || body.available === "0"
          ? false
          : body.available,
    mileage:
      body.mileage == null || body.mileage === "" ? null : Number(body.mileage),
  };
}

function validateVehiclePayload(payload, { requireVin = true } = {}) {
  for (const field of VEHICLE_REQUIRED) {
    if (field === "vin" && !requireVin) {
      continue;
    }
    const value = payload[field];
    if (value === null || value === undefined || value === "") {
      return missingFieldMessage(field);
    }
  }

  if (requireVin && !/^\d{17}$/.test(payload.vin)) {
    return "vin must be 17 numbers";
  }

  const yearError = validateYear(payload.year);
  if (yearError) {
    return yearError;
  }

  if (payload.purchased_date) {
    const purchased = new Date(`${payload.purchased_date}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (purchased.getTime() > today.getTime()) {
      return "purchased_date cannot be in the future";
    }
  }

  if (payload.mileage != null && (!Number.isFinite(payload.mileage) || payload.mileage < 0)) {
    return "mileage must be non-negative";
  }

  if (typeof payload.available !== "boolean") {
    return missingFieldMessage("available");
  }

  return null;
}

async function findLicenseConflict(licensePlateNum, excludeVin) {
  if (!licensePlateNum) {
    return null;
  }

  const where = { license_plate_num: licensePlateNum };
  if (excludeVin) {
    where.vin = { [Op.ne]: excludeVin };
  }

  return db.vehicle.findOne({ where });
}

exports.findAll = async (_req, res) => {
  try {
    const vehicles = await db.vehicle.findAll({
      include: [{ model: db.area, attributes: ["id", "name"] }],
      order: [["make", "ASC"], ["model", "ASC"], ["year", "ASC"]],
    });
    return res.send({
      message: "Successfully retreived all vehicles",
      vehicles,
    });
  } catch (error) {
    logger.error(`findAll vehicles failed: ${error.message}`);
    return res.status(500).send({ message: "Could not retrieve vehicles." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const vin = text(req.params.vin);
    const vehicle = await db.vehicle.findByPk(vin, {
      include: [{ model: db.area, attributes: ["id", "name"] }],
    });

    if (!vehicle) {
      return res.status(404).send({ message: `Vehicle with vin=${vin} not found.` });
    }

    return res.send(vehicle);
  } catch (error) {
    logger.error(`findOne vehicle failed: ${error.message}`);
    return res.status(500).send({ message: "Could not retrieve vehicle." });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = normalizeVehicleBody(req.body);
    const validationError = validateVehiclePayload(payload);
    if (validationError) {
      return res.status(400).send({ message: validationError });
    }

    const existingVin = await db.vehicle.findByPk(payload.vin);
    if (existingVin) {
      return res.status(409).send({ message: "A vehicle with this VIN already exists." });
    }

    const licenseConflict = await findLicenseConflict(payload.license_plate_num);
    if (licenseConflict) {
      return res.status(409).send({
        message: `A vehicle already has license number ${payload.license_plate_num}`,
      });
    }

    await db.vehicle.create(payload);
    return res.status(201).send({ message: "Successfully created vehicle." });
  } catch (error) {
    logger.error(`create vehicle failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create vehicle." });
  }
};

exports.update = async (req, res) => {
  try {
    const vin = text(req.params.vin);
    const existing = await db.vehicle.findByPk(vin);
    if (!existing) {
      return res.status(404).send({ message: `Vehicle with vin=${vin} not found.` });
    }

    const payload = normalizeVehicleBody({ ...existing.toJSON(), ...req.body, vin });
    const validationError = validateVehiclePayload(payload, { requireVin: true });
    if (validationError) {
      return res.status(400).send({ message: validationError });
    }

    const licenseConflict = await findLicenseConflict(payload.license_plate_num, vin);
    if (licenseConflict) {
      return res.status(409).send({
        message: `A vehicle already has license number ${payload.license_plate_num}`,
      });
    }

    await existing.update({
      make: payload.make,
      model: payload.model,
      year: payload.year,
      purchased_date: payload.purchased_date,
      color: payload.color,
      license_plate_num: payload.license_plate_num,
      tag_exp_month: payload.tag_exp_month,
      area_id: payload.area_id,
      most_recent_dest_id: payload.most_recent_dest_id,
      available: payload.available,
      mileage: payload.mileage,
    });

    return res.status(201).send({ message: "Successfully updated vehicle." });
  } catch (error) {
    logger.error(`update vehicle failed: ${error.message}`);
    return res.status(500).send({ message: "Could not update vehicle." });
  }
};

exports.remove = async (req, res) => {
  try {
    const vin = text(req.params.vin);
    await db.vehicleImage.destroy({ where: { vehicle_id: vin } });
    const deleted = await db.vehicle.destroy({ where: { vin } });
    if (!deleted) {
      return res.status(500).send({ message: `Vehicle with vin=${vin} not found.` });
    }
    return res.send({ message: "Successfully deleted vehicle." });
  } catch (error) {
    logger.error(`delete vehicle failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete vehicle." });
  }
};

exports.findFuels = async (_req, res) => {
  try {
    const fuels = await db.fuelType.findAll({ order: [["fuel_type", "ASC"]] });
    return res.send(fuels);
  } catch (error) {
    logger.error(`findFuels failed: ${error.message}`);
    return res.status(500).send({ message: "Could not retrieve fuels." });
  }
};

exports.createFuel = async (req, res) => {
  try {
    const fuelType = text(req.body?.fuel_type);
    if (!fuelType) {
      return res.status(400).send({ message: "fuel_type is required" });
    }

    const created = await db.fuelType.create({ fuel_type: fuelType });
    return res.status(201).send({
      message: "Successfully created fuel type.",
      fuel_id: created.fuel_id,
      fuel_type: created.fuel_type,
    });
  } catch (error) {
    logger.error(`createFuel failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create fuel type." });
  }
};

exports.findMaintenanceInfo = async (req, res) => {
  try {
    const make = text(req.query.make);
    const model = text(req.query.model);
    const year = Number(req.query.year);

    if (!make || !model || !Number.isInteger(year)) {
      return res.status(400).send({ message: "make, model, and year are required" });
    }

    const info = await db.maintenanceInfo.findOne({ where: { make, model, year } });
    if (!info) {
      return res.status(404).send({ message: "Maintenance info not found." });
    }

    return res.send(info);
  } catch (error) {
    logger.error(`findMaintenanceInfo failed: ${error.message}`);
    return res.status(500).send({ message: "Could not retrieve maintenance info." });
  }
};

exports.createMaintenanceInfo = async (req, res) => {
  try {
    const make = text(req.query.make || req.body?.make);
    const model = text(req.query.model || req.body?.model);
    const year = Number(req.query.year ?? req.body?.year);
    const fuelTypeId = Number(req.body?.fuel_type_id);
    const fuelCapacity = Number(req.body?.fuel_capacity);
    const recommendedTirePsi = Number(req.body?.recommended_tire_psi);
    const tireType = text(req.body?.tire_type);
    const oilViscosity = text(req.body?.oil_viscosity) || "5W4";

    if (!make) {
      return res.status(400).send({ message: "make is required" });
    }
    if (!model) {
      return res.status(400).send({ message: "model is required" });
    }
    if (!Number.isInteger(year)) {
      return res.status(400).send({ message: "year is required" });
    }

    const yearError = validateYear(year);
    if (yearError) {
      return res.status(400).send({ message: yearError });
    }

    if (!Number.isInteger(fuelTypeId)) {
      return res.status(400).send({ message: "fuel_type_id is required" });
    }
    if (!Number.isFinite(fuelCapacity) || fuelCapacity < 0) {
      return res.status(400).send({ message: "fuel_capacity is required" });
    }
    if (!Number.isFinite(recommendedTirePsi) || recommendedTirePsi < 0) {
      return res.status(400).send({ message: "recommended_tire_psi is required" });
    }
    if (!tireType) {
      return res.status(400).send({ message: "tire_type is required" });
    }

    const existing = await db.maintenanceInfo.findOne({ where: { make, model, year } });
    if (existing) {
      return res.status(409).send({ message: "Maintenance info already exists." });
    }

    await db.maintenanceInfo.create({
      make,
      model,
      year,
      fuel_type_id: fuelTypeId,
      fuel_capacity: fuelCapacity,
      oil_viscosity: oilViscosity.slice(0, 3),
      recommended_tire_psi: recommendedTirePsi,
      tire_type: tireType,
    });

    return res.status(201).send({ message: "Successfully created maintenance-info." });
  } catch (error) {
    logger.error(`createMaintenanceInfo failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create maintenance info." });
  }
};

exports.findAreas = async (_req, res) => {
  try {
    const areas = await db.area.findAll({
      attributes: ["id", "name", "logo"],
      order: [["name", "ASC"]],
    });
    return res.send(
      areas.map((area) => {
        const logo = area.logo;
        const buffer = logo == null ? null : Buffer.isBuffer(logo) ? logo : Buffer.from(logo);

        return {
          id: area.id,
          name: area.name,
          logo: buffer?.length ? buffer.toString("base64") : null,
        };
      })
    );
  } catch (error) {
    logger.error(`findAreas failed: ${error.message}`);
    return res.status(500).send({ message: "Could not retrieve areas." });
  }
};

export default exports;
