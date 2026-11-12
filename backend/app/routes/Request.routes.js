import { Router } from "express";
import requests from "../controllers/request.controller.js";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

router.get("/vehicles", authenticate, requests.findVehicles);
router.get("/drivers", authenticate, requests.findDrivers);
router.get("/destinations", authenticate, requests.findDestinations);
router.get("/requests", authenticate, requests.findAll);
router.get("/requests/:requestId", authenticate, requests.findOne);
router.post("/requests", authenticate, requests.create);
router.put("/requests/:requestId", authenticate, requests.update);
router.delete("/requests/:requestId", authenticate, requests.remove);

export default router;
