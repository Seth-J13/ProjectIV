import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

<<<<<<< HEAD
import driverRoutes from "./vehicle-t3.routes.js";

router.use("/vehicle-t3", driverRoutes);
=======
router.use("/", authRoutes);
router.use("/users", userRoutes);
>>>>>>> 7e0f16e29febe48b6cbfd8b1dfb3e2c8664dbcdf

export default router;
