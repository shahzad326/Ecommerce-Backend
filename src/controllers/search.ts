import { Request, Response, NextFunction } from "express";
import prisma, { postIncludes, productSelects, userSelects } from "../prisma";
import { CustomRequest } from "../middleware/verifyToken";
import { uploadImage } from "../services/fileUpload";

export const searchUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const query = q as string;

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Number(req.query.size) || Number(process.env.PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { email: { contains: query } },
          ],
        },
        ...userSelects,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.user.count({
        where: {
          OR: [
            { username: { contains: query } },
            { email: { contains: query } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({ users, totalPages });
  } catch (error) {
    next(error);
  }
};

export const searchPosts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const query = q as string;

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Number(req.query.size) || Number(process.env.PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: {
          OR: [
            { caption: { contains: query } },
            { description: { contains: query } },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        ...postIncludes,
        skip,
        take: pageSize,
      }),
      prisma.post.count({
        where: {
          OR: [
            { caption: { contains: query } },
            { description: { contains: query } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({ posts, totalPages });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const query = q as string;

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Number(req.query.size) || Number(process.env.PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        // ...productSelects,
        skip,
        take: pageSize,
      }),
      prisma.product.count({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({ products, totalPages });
  } catch (error) {
    next(error);
  }
};
