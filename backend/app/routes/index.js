import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import driverRoutes from "./vehicle-t3.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/", authRoutes);
router.use("/users", userRoutes);
router.use("/vehicle-t3", driverRoutes);

export default router;
