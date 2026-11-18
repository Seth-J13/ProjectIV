import { Router } from "express";
import area from "../controllers/area.controller.js";
import { authenticate, requireAreaAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate, requireAreaAdmin], area.findAll);
router.get("/:id", [authenticate, requireAreaAdmin], area.findOne);
router.post("/", [authenticate, requireAreaAdmin], area.create);
router.put("/:id", [authenticate, requireAreaAdmin], area.update);
router.delete("/:id", [authenticate, requireAreaAdmin], area.remove);

export default router;
