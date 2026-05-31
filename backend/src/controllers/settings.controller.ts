import { Response } from "express";
import { prisma } from "../lib/prisma.js";

// PUT /api/settings
export const updateSettings = async (req: any, res: Response) => {
  try {
    const { username, bio } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Check username not taken by someone else
    const existing = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username: username.trim(),
        bio: bio?.trim() || null,
      },
      select: { id: true, email: true, username: true, bio: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update settings" });
  }
};
