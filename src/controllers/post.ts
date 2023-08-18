import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../middleware/verifyToken";
import createError from "http-errors";
import prisma, { postIncludes } from "../prisma";

export const createPost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { image, caption, description } = req.body;
    const userId = req.user.userId;

    if (!userId) throw createError(401, "Unauthorized");

    const post = await prisma.post.create({
      data: {
        image,
        caption,
        description,
        author: {
          connect: { id: userId },
        },
      },
    });

    res.json({ post });
  } catch (error) {
    next(error);
  }
};

export const getFeedForUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Number(req.query.size) || Number(process.env.PAGE_SIZE);
    const userId = req.user.userId;

    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / pageSize);

    const followingPosts = await prisma.post.findMany({
      where: {
        author: {
          followers: {
            some: { followerId: userId },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...postIncludes,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const followingIds = (
      await prisma.follows.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      })
    ).map((follow: any) => follow.followerId);

    const restOfPosts = await prisma.post.findMany({
      where: {
        author: {
          followers: {
            none: { followerId: userId },
          },
        },
        authorId: {
          notIn: followingIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...postIncludes,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const posts = [...followingPosts, ...restOfPosts];

    res.json({ posts, totalPages });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = parseInt(req.params.id, 10);

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      ...postIncludes,
    });

    if (!post) throw createError(404, "Post not found");

    res.json({ post });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = Number(req.user.userId);

    if (!userId) throw createError(401, "Unauthorized");

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw createError(404, "Post not found");

    const like = await prisma.like.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    if (like) throw createError(400, "Post already liked");

    const likedPost = await prisma.like.create({
      data: {
        post: {
          connect: {
            id: postId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        post: true,
      },
    });

    res.json({ post: likedPost.post });
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = Number(req.user.userId);

    if (!userId) throw createError(401, "Unauthorized");

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw createError(404, "Post not found");

    const like = await prisma.like.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    if (!like) throw createError(400, "Post not liked");

    await prisma.like.delete({
      where: {
        id: like.id,
      },
    });

    res.json({ message: "Post successfully unliked" });
  } catch (error) {
    next(error);
  }
};

export const addCommentToPost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;
    const postId = parseInt(req.params.id, 10);
    const userId = Number(req.user.userId);

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw createError(404, "Post not found");

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
    });

    res.json({ comment });
  } catch (error) {
    next(error);
  }
};

export const explorePosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Number(req.query.size) || Number(process.env.PAGE_SIZE);
    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / pageSize);
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      ...postIncludes,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.json({ posts, totalPages });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = Number(req.user.userId);

    if (!userId) throw createError(401, "Unauthorized");

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw createError(404, "Post not found");

    if (post.authorId !== userId) throw createError(403, "Forbidden");

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.json({ message: "Post successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = parseInt(req.params.commentId, 10);
    const userId = Number(req.user.userId);

    if (!userId) throw createError(401, "Unauthorized");

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        post: true,
      },
    });

    if (!comment) throw createError(404, "Comment not found");

    if (comment.userId !== userId && comment.post.authorId !== userId) {
      throw createError(403, "Forbidden");
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    res.json({ message: "Comment successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = Number(req.user.userId);

    if (!userId) throw createError(401, "Unauthorized");

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw createError(404, "Post not found");

    if (post.authorId !== userId) throw createError(403, "Forbidden");

    const { image, caption, description } = req.body;

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        image,
        caption,
        description,
      },
    });

    res.json({ post: updatedPost });
  } catch (error) {
    next(error);
  }
};
