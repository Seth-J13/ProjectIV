import express from "express";
import notes from "../controllers/note.controller.js";

const router = express.Router();

router.use(notes.authenticate);

router.get("/note/:noteId", notes.findOne);
router.get("/request/:requestId", notes.findByRequest);
router.get("/user/:userId", notes.findByUser);
router.put("/note/:noteId", notes.update);
router.delete("/note/:noteId", notes.remove);
router.delete("/request/:requestId", notes.removeByRequest);

router.get("/contributors/note/:noteId", notes.findContributionsByNote);
router.get("/contributors/user/:userId", notes.findContributionsByUser);
router.delete("/contributors/contribution/:contributionId", notes.removeContribution);
router.delete("/contributors/note/:noteId", notes.removeContributionsByNote);
router.get("/contributors", notes.findContributions);
router.post("/contributors", notes.addContribution);

router.get("/", notes.findAll);
router.post("/", notes.create);

export default router;
