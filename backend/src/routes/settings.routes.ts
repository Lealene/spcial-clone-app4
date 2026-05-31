import express from "express";
import { updateSettings } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.put("/", requireAuth, updateSettings);

export default router;
