import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const requireOwnership = (model: any) => {
  return async (req: any, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const resource = await prisma[model].findUnique({
      where: { id },
    });

    if (!resource) {
      return res.status(404).json({
        error: { message: "Not found" },
      });
    }

    if (resource.authorId !== req.user.id) {
      return res.status(403).json({
        error: { message: "Forbidden" },
      });
    }

    req.resource = resource;

    next();
  };
};
