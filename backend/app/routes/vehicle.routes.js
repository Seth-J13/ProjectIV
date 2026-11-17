import { Router } from "express";
import {
  authenticate,
  requireAdminOrMaintenance,
} from "../authorization/authorization.js";
import vehicleController from "../controllers/vehicle.controller.js";
import maintenanceController from "../controllers/maintenance.controller.js";

const router = Router();
const guard = [authenticate, requireAdminOrMaintenance];

router.get("/vehicles/", ...guard, vehicleController.findAll);
router.get("/vehicles/:vin", ...guard, vehicleController.findOne);
router.put("/vehicles/", ...guard, vehicleController.create);
router.post("/vehicles/:vin", ...guard, vehicleController.update);
router.put("/vehicles/:vin", ...guard, maintenanceController.updateVehiclePartial);
router.delete("/vehicles/:vin", ...guard, vehicleController.remove);

router.get("/fuels/", ...guard, vehicleController.findFuels);
router.post("/fuels/", ...guard, vehicleController.createFuel);
router.put("/fuels/:fuel_id", ...guard, maintenanceController.updateFuel);
router.delete("/fuels/:fuel_id", ...guard, maintenanceController.deleteFuel);

router.get("/maintenance-info", ...guard, vehicleController.findMaintenanceInfo);
router.get("/maintenance-infos", ...guard, vehicleController.findMaintenanceInfo);
router.put("/maintenance-info", ...guard, vehicleController.createMaintenanceInfo);
router.post("/maintenance-info/", ...guard, maintenanceController.createMaintenanceInfoPost);
router.put("/maintenance-infos", ...guard, maintenanceController.updateMaintenanceInfo);

router.get("/areas/", ...guard, vehicleController.findAreas);

router.get("/requests/:vehicle_id", ...guard, maintenanceController.findRequestsByVehicle);
router.get("/notes/:request_id", ...guard, maintenanceController.findNotesByRequest);
router.post("/notes/", ...guard, maintenanceController.createNote);
router.put("/notes/:note_id", ...guard, maintenanceController.updateNote);
router.delete("/notes/:note_id", ...guard, maintenanceController.deleteNote);

router.post("/vehicle-service-logs/", ...guard, maintenanceController.createServiceLog);

export default router;
