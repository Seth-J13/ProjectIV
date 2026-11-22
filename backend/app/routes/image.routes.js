import express from "express";
import multer from "multer";
import imageController from "../controllers/image.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 26 * 1024 * 1024 },
});

export default function imageRoutes(type) {
  const router = express.Router();

  router.use(imageController.authenticate);
  router.get("/", imageController.findAll(type));
  router.post("/", upload.single("image"), imageController.create(type));
  router.get("/:parentType/:parentId", imageController.findByParent(type));
  router.delete("/:parentType/:parentId", imageController.removeByParent(type));
  router.get("/:id", imageController.findOne(type));
  router.delete("/:id", imageController.remove(type));

  return router;
}
