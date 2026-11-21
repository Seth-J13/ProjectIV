import { Router } from "express";
import vehicleLog from "../controllers/vehicleLog.controller.js";
import { authenticate, requireVehicleLogReader } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate, requireVehicleLogReader], vehicleLog.findAll);
router.get("/owner-choices", [authenticate, requireVehicleLogReader], vehicleLog.ownerChoices);
router.get("/:id", [authenticate, requireVehicleLogReader], vehicleLog.findOne);
router.post("/", [authenticate, requireVehicleLogReader], vehicleLog.create);
router.put("/:id", [authenticate, requireVehicleLogReader], vehicleLog.update);
router.delete("/:id", [authenticate, requireVehicleLogReader], vehicleLog.remove);
router.post("/:id/owners", [authenticate, requireVehicleLogReader], vehicleLog.addOwner);

export default router;
