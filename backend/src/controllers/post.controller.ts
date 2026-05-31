import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/* =========================================================
   GET POSTS (INFINITE FEED + LIKE STATE)
========================================================= */
export const getPosts = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true } },
        likes: userId
          ? {
              where: { userId },
              select: { userId: true },
            }
          : false,
      },
    });

    let nextCursor: string | null = null;

    if (posts.length > limit) {
      const next = posts.pop();
      nextCursor = next?.id ?? null;
    }

    const result = posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      user: post.author,
      _count: post._count,

      // ❤️ FIXED LIKE SYSTEM
      likes: post._count.likes,
      likedByMe: userId ? (post.likes?.length ?? 0) > 0 : false,
    }));

    return res.json({ posts: result, nextCursor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

/* =========================================================
   GET SINGLE POST (POST DETAIL PAGE)
========================================================= */
export const getPost = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { likes: true, comments: true } },
        likes: userId
          ? {
              where: { userId },
              select: { userId: true },
            }
          : false,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json({
      ...post,
      user: post.author,

      // ❤️ FIXED LIKE STATE
      likes: post._count.likes,
      likedByMe: userId ? (post.likes?.length ?? 0) > 0 : false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch post" });
  }
};

/* =========================================================
   CREATE POST
========================================================= */
export const createPost = async (req: any, res: Response) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    return res.status(201).json({
      ...post,
      user: post.author,
      likes: 0,
      likedByMe: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create post" });
  }
};

/* =========================================================
   DELETE POST
========================================================= */
export const deletePost = async (req: any, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.post.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

/* =========================================================
   CREATE COMMENT
========================================================= */
export const createComment = async (req: any, res: Response) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: req.params.id,
        authorId: req.user.id,
      },
      include: {
        author: true,
      },
    });

    return res.status(201).json({
      ...comment,
      user: comment.author,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create comment" });
  }
};

/* =========================================================
   TOGGLE LIKE (STABLE + RETURNS CORRECT STATE)
========================================================= */
export const toggleLike = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const existing = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    // UNLIKE
    if (existing) {
      await prisma.like.delete({
        where: { id: existing.id },
      });

      const count = await prisma.like.count({
        where: { postId },
      });

      return res.json({
        liked: false,
        likes: count,
      });
    }

    // LIKE
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    const count = await prisma.like.count({
      where: { postId },
    });

    return res.json({
      liked: true,
      likes: count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to toggle like" });
  }
};
