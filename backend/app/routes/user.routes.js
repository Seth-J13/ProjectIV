import { Router } from "express";
import user from "../controllers/user.controller.js";
import { authenticate, requireAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate, requireAdmin], user.findAll);
router.put("/:id", [authenticate, requireAdmin], user.update);

export default router;
