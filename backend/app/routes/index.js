import { Router } from "express";
import requestRoutes from "./Request.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/", requestRoutes);

export default router;
