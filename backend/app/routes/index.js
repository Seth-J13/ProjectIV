import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

import driverRoutes from "./vehicle-t3.routes.js";

router.use("/vehicle-t3", driverRoutes);

export default router;
