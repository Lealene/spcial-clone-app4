import express from "express";
import { deleteComment } from "../controllers/comment.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.delete("/:id", requireAuth, deleteComment);

export default router;
