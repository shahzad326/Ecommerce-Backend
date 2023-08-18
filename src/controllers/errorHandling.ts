import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

const notFoundError = (req: Request, res: Response, next: NextFunction) =>
  next(createError(404, "Not Found"));

const serverError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  res.status(status);
  res.json({
    status,
    message: err.message,
  });
};

export { notFoundError, serverError };
