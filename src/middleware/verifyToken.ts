import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { verifyJWTToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

export interface CustomRequest extends Request {
  user?: any;
}

export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization) throw createError(401, "Unauthorized");
    const token = req.headers.authorization.split(" ")[1];
    const decodeValue = await verifyJWTToken(token);

    if (decodeValue) {
      req.user = decodeValue;
      next();
    } else {
      throw createError(401, "Unauthorized");
    }
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).send({ status, message });
  }
};
