import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  deletePost,
  createComment,
  toggleLike,
} from "../controllers/post.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();

router.get("/", optionalAuth, getPosts);
router.get("/:id", optionalAuth, getPost);

router.post("/", requireAuth, createPost);
router.delete("/:id", requireAuth, deletePost);

router.post("/:id/comments", requireAuth, createComment);

router.post("/:id/like", requireAuth, toggleLike);

export default router;
