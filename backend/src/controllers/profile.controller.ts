import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const PAGE_SIZE = 10;

export const getProfile = async (req: Request, res: Response) => {
  try {
    const usernameParam = req.params.username;
    const username = Array.isArray(usernameParam)
      ? usernameParam[0]
      : usernameParam;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const pageParam = req.query.page;
    const pageString = Array.isArray(pageParam) ? pageParam[0] : pageParam;
    const page = parseInt((pageString as string) || "", 10);
    const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
    const skip = (currentPage - 1) * PAGE_SIZE;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, email: true, username: true, bio: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: user.id },
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.post.count({ where: { authorId: user.id } }),
    ]);

    return res.json({
      user,
      posts,
      hasMore: skip + posts.length < total,
      total,
      page,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};
