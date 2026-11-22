import db from "../models/index.js";
import logger from "../config/logger.js";
import { isRequestActive } from "./request.controller.js";

const exports = {};

function text(value) {
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

function required(field) {
  return `${field} is required`;
}

exports.findRequestsByVehicle = async (req, res) => {
  try {
    const vehicleId = text(req.params.vehicle_id);
    const rows = await db.request.findAll({ where: { vehicleId } });
    const presented = [];

    for (const row of rows) {
      const plain = row.toJSON();
      const active = isRequestActive(plain.startDate, plain.startTime, plain.endDate, plain.endTime);

      if (plain.currentlyActive !== active) {
        await row.update({ currentlyActive: active });
        plain.currentlyActive = active;
      }

      presented.push({
        ...plain,
        request_id: plain.requestId,
        requester_id: plain.requesterId,
        vehicle_id: plain.vehicleId,
      });
    }

    return res.send(presented);
  } catch (error) {
    logger.error(`findRequestsByVehicle failed: ${error.message}`);
    return res.status(500).send({ message: "Could not retrieve requests." });
  }
};

exports.findNotesByRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.request_id);
    if (!Number.isInteger(requestId)) {
      return res.status(400).send({ message: required("request_id") });
    }

    const notes = await db.note.findAll({ where: { request_id: requestId } });
    return res.send(
      notes.map((note) => ({
        ...note.toJSON(),
        description: note.text,
      }))
    );
  } catch (error) {
    logger.error(`findNotesByRequest failed: ${error.message}`);
    return res.status(500).send({ message: "Could not retrieve notes." });
  }
};

exports.createNote = async (req, res) => {
  try {
    const subject = text(req.body?.subject);
    const noteText = text(req.body?.text ?? req.body?.description);
    const requestId = Number(req.body?.request_id);

    if (!subject) {
      return res.status(400).send({ message: required("subject") });
    }
    if (!noteText) {
      return res.status(400).send({ message: required("text") });
    }
    if (!Number.isInteger(requestId)) {
      return res.status(400).send({ message: required("request_id") });
    }

    const requestRow = await db.request.findByPk(requestId);
    if (!requestRow) {
      return res.status(404).send({ message: `Request with id=${requestId} not found.` });
    }

    const created = await db.note.create({
      subject,
      text: noteText,
      maintenance_request: req.body?.maintenance_request !== false,
      request_id: requestId,
      date: req.body?.date || new Date().toISOString().slice(0, 10),
    });

    return res.status(201).send({
      message: "Successfully created maintenance note.",
      note_id: created.note_id,
      id: created.note_id,
      subject: created.subject,
      text: created.text,
      description: created.text,
      request_id: created.request_id,
      maintenance_request: created.maintenance_request,
      date: created.date,
    });
  } catch (error) {
    logger.error(`createNote failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create maintenance note." });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const noteId = Number(req.params.note_id);
    const note = await db.note.findByPk(noteId);
    if (!note) {
      return res.status(404).send({ message: `Note with id=${noteId} not found.` });
    }

    const subject = text(req.body?.subject);
    const noteText = text(req.body?.text ?? req.body?.description);
    if (!subject) {
      return res.status(400).send({ message: required("subject") });
    }
    if (!noteText) {
      return res.status(400).send({ message: required("text") });
    }

    await note.update({
      subject,
      text: noteText,
      date: req.body?.date || note.date,
      maintenance_request:
        req.body?.maintenance_request == null ? note.maintenance_request : !!req.body.maintenance_request,
    });

    return res.status(201).send({ message: "Successfully updated maintenance note." });
  } catch (error) {
    logger.error(`updateNote failed: ${error.message}`);
    return res.status(500).send({ message: "Could not update maintenance note." });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteId = Number(req.params.note_id);
    await db.noteImage.destroy({ where: { note_id: noteId } });
    const deleted = await db.note.destroy({ where: { note_id: noteId } });
    if (!deleted) {
      return res.status(404).send({ message: `Note with id=${noteId} not found.` });
    }
    return res.send({ message: "Successfully deleted maintenance note." });
  } catch (error) {
    logger.error(`deleteNote failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete maintenance note." });
  }
};

exports.createServiceLog = async (req, res) => {
  try {
    const vehicleId = text(req.body?.vehicle_id);
    const date = text(req.body?.date);
    const type = text(req.body?.type);
    const value = text(req.body?.value);

    if (!vehicleId) {
      return res.status(400).send({ message: required("vehicle_id") });
    }
    if (!date) {
      return res.status(400).send({ message: required("date") });
    }
    if (!type) {
      return res.status(400).send({ message: required("type") });
    }
    if (!value) {
      return res.status(400).send({ message: required("value") });
    }

    const created = await db.vehicleServiceLog.create({
      vehicle_id: vehicleId,
      date,
      type,
      value,
    });

    return res.status(201).send({
      message: "Successfully created vehicle service log.",
      vehicle_id: created.vehicle_id,
      date: created.date,
      type: created.type,
      value: created.value,
    });
  } catch (error) {
    logger.error(`createServiceLog failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create vehicle service log." });
  }
};

exports.updateFuel = async (req, res) => {
  try {
    const fuelId = Number(req.params.fuel_id);
    const fuelType = text(req.body?.fuel_type);
    if (!fuelType) {
      return res.status(400).send({ message: required("fuel_type") });
    }

    const fuel = await db.fuelType.findByPk(fuelId);
    if (!fuel) {
      return res.status(404).send({ message: `Fuel with id=${fuelId} not found.` });
    }

    await fuel.update({ fuel_type: fuelType });
    return res.send({ message: "Successfully updated fuel type." });
  } catch (error) {
    logger.error(`updateFuel failed: ${error.message}`);
    return res.status(500).send({ message: "Could not update fuel type." });
  }
};

exports.deleteFuel = async (req, res) => {
  try {
    const fuelId = Number(req.params.fuel_id);
    const deleted = await db.fuelType.destroy({ where: { fuel_id: fuelId } });
    if (!deleted) {
      return res.status(404).send({ message: `Fuel with id=${fuelId} not found.` });
    }
    return res.send({ message: "Successfully deleted fuel type." });
  } catch (error) {
    logger.error(`deleteFuel failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete fuel type." });
  }
};

exports.updateMaintenanceInfo = async (req, res) => {
  try {
    const make = text(req.query.make || req.body?.make);
    const model = text(req.query.model || req.body?.model);
    const year = Number(req.query.year ?? req.body?.year);

    if (!make || !model || !Number.isInteger(year)) {
      return res.status(400).send({ message: "make, model, and year are required" });
    }

    const info = await db.maintenanceInfo.findOne({ where: { make, model, year } });
    if (!info) {
      return res.status(404).send({ message: "Maintenance info not found." });
    }

    const fuelTypeId = Number(req.body?.fuel_type_id ?? info.fuel_type_id);
    const fuelCapacity = Number(req.body?.fuel_capacity ?? info.fuel_capacity);
    const recommendedTirePsi = Number(req.body?.recommended_tire_psi ?? info.recommended_tire_psi);
    const tireType = text(req.body?.tire_type) || info.tire_type;
    const oilViscosity = text(req.body?.oil_viscosity) || info.oil_viscosity;

    await info.update({
      fuel_type_id: fuelTypeId,
      fuel_capacity: fuelCapacity,
      recommended_tire_psi: recommendedTirePsi,
      tire_type: tireType,
      oil_viscosity: oilViscosity.slice(0, 3),
    });

    return res.send({
      message: "Successfully updated maintenance-info.",
      make: info.make,
      model: info.model,
      year: info.year,
      fuel_type_id: info.fuel_type_id,
      fuel_capacity: info.fuel_capacity,
      recommended_tire_psi: info.recommended_tire_psi,
      tire_type: info.tire_type,
      oil_viscosity: info.oil_viscosity,
    });
  } catch (error) {
    logger.error(`updateMaintenanceInfo failed: ${error.message}`);
    return res.status(500).send({ message: "Could not update maintenance info." });
  }
};

exports.createMaintenanceInfoPost = async (req, res) => {
  try {
    const make = text(req.body?.make);
    const model = text(req.body?.model);
    const year = Number(req.body?.year);
    const fuelTypeId = Number(req.body?.fuel_type_id);
    const fuelCapacity = Number(req.body?.fuel_capacity);
    const recommendedTirePsi = Number(req.body?.recommended_tire_psi);
    const tireType = text(req.body?.tire_type);
    const oilViscosity = text(req.body?.oil_viscosity) || "5W4";

    if (!make) {
      return res.status(400).send({ message: required("make") });
    }
    if (!model) {
      return res.status(400).send({ message: required("model") });
    }
    if (!Number.isInteger(year)) {
      return res.status(400).send({ message: required("year") });
    }
    if (!Number.isInteger(fuelTypeId)) {
      return res.status(400).send({ message: required("fuel_type_id") });
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
      fuel_capacity: Number.isFinite(fuelCapacity) ? fuelCapacity : 0,
      oil_viscosity: oilViscosity.slice(0, 3),
      recommended_tire_psi: Number.isFinite(recommendedTirePsi) ? recommendedTirePsi : 0,
      tire_type: tireType || "Unspecified",
    });

    return res.status(201).send({ message: "Successfully created maintenance-info." });
  } catch (error) {
    logger.error(`createMaintenanceInfoPost failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create maintenance info." });
  }
};

exports.updateVehiclePartial = async (req, res) => {
  try {
    const vin = text(req.params.vin);
    const vehicle = await db.vehicle.findByPk(vin);
    if (!vehicle) {
      return res.status(404).send({ message: `Vehicle with vin=${vin} not found.` });
    }

    const updates = {};
    if (req.body?.mileage != null && req.body?.mileage !== "") {
      const mileage = Number(req.body.mileage);
      if (!Number.isFinite(mileage) || mileage < 0) {
        return res.status(400).send({ message: "mileage must be non-negative" });
      }
      updates.mileage = mileage;
    }
    if (req.body?.make != null) {
      updates.make = text(req.body.make);
    }
    if (req.body?.model != null) {
      updates.model = text(req.body.model);
    }
    if (req.body?.year != null && req.body?.year !== "") {
      updates.year = Number(req.body.year);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).send({ message: "No updatable fields provided." });
    }

    await vehicle.update(updates);
    return res.send({
      message: "Successfully updated vehicle.",
      ...vehicle.toJSON(),
    });
  } catch (error) {
    logger.error(`updateVehiclePartial failed: ${error.message}`);
    return res.status(500).send({ message: "Could not update vehicle." });
  }
};

export default exports;
