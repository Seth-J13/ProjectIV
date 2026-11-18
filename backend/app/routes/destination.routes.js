import { Router } from "express";
import destination from "../controllers/destination.controller.js";

const router = Router();

router.get("/", destination.authenticate, destination.findAll);
router.post("/", destination.authenticate, destination.create);
router.get("/:destinationId", destination.authenticate, destination.findOne);
router.put("/:destinationId", [destination.authenticate, destination.requireAdmin], destination.update);
router.delete(
  "/:destinationId",
  [destination.authenticate, destination.requireAdmin],
  destination.remove
);

export default router;
