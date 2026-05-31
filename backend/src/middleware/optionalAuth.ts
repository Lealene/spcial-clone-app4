import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const optionalAuth = (req: any, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    req.user = null;
  }

  next();
};
