import { Response } from "express";

import { prisma } from "../lib/prisma";

export const deleteComment = async (req: any, res: Response) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await prisma.comment.delete({
      where: {
        id: req.params.id,
      },
    });

    return res.json({
      message: "Comment deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete comment",
    });
  }
};
