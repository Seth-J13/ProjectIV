import { Router } from "express";
import {
  authenticate,
  requireAdminOrMaintenance,
} from "../authorization/authorization.js";
import vehicleController from "../controllers/vehicle.controller.js";

const router = Router();
const guard = [authenticate, requireAdminOrMaintenance];

router.get("/vehicles/", ...guard, vehicleController.findAll);
router.get("/vehicles/:vin", ...guard, vehicleController.findOne);
router.put("/vehicles/", ...guard, vehicleController.create);
router.post("/vehicles/:vin", ...guard, vehicleController.update);
router.delete("/vehicles/:vin", ...guard, vehicleController.remove);

router.get("/fuels/", ...guard, vehicleController.findFuels);
router.post("/fuels/", ...guard, vehicleController.createFuel);

router.get("/maintenance-info", ...guard, vehicleController.findMaintenanceInfo);
router.put("/maintenance-info", ...guard, vehicleController.createMaintenanceInfo);

router.get("/areas/", ...guard, vehicleController.findAreas);

export default router;
