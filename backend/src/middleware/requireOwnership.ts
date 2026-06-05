import { Response, NextFunction, Request } from "express";
import { prisma } from "../lib/prisma"; // IMPORTANT: use singleton prisma

type AuthRequest = Request & {
  user?: { id: string };
  resource?: any;
};

export const requireOwnership = (model: keyof typeof prisma) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      if (!req.user?.id) {
        return res.status(401).json({
          error: { message: "Unauthorized" },
        });
      }

      const prismaModel = prisma[model] as any;

      if (!prismaModel || !prismaModel.findUnique) {
        return res.status(500).json({
          error: { message: "Invalid model" },
        });
      }

      const resource = await prismaModel.findUnique({
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
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: { message: "Server error" },
      });
    }
  };
};
