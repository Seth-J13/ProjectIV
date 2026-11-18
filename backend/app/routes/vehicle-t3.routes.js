import { Router } from "express";
import driver from "../controllers/driver.controller.js";
import { authenticate, requireAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", authenticate, driver.findAll);
router.get("/:driver_id", authenticate, driver.findOne);
router.post("/", [authenticate, requireAdmin], driver.create);
router.put("/:driver_id", [authenticate, requireAdmin], driver.update);
router.delete("/:driver_id", [authenticate, requireAdmin], driver.remove);

export default router;
