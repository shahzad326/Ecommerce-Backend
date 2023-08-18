import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../middleware/verifyToken";
import createError from "http-errors";
import prisma, { userSelects } from "./../prisma";

export const followUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { userIdToFollow } = req.body;
  const { userId } = req.user;

  try {
    const userToFollow = await prisma.user.findUnique({
      where: { id: userIdToFollow },
    });

    if (!userToFollow) throw createError(404, "User not found");

    if (userIdToFollow === userId)
      throw createError(400, "You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: userIdToFollow,
        },
      },
    });

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: userIdToFollow,
          },
        },
      });
      return res.json({ message: "Unfollowed successfully" });
    } else {
      await prisma.follows.create({
        data: { followerId: userId, followingId: userIdToFollow },
      });
      return res.json({ message: "Followed successfully" });
    }
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const followers = await prisma.user.findUnique({
      where: { id: +id },
      select: {
        followers: {
          select: {
            follower: userSelects,
          },
        },
      },
    });

    if (!followers) throw createError(404, "User not found");

    return res.json({
      followers: followers.followers.map((follow: any) => follow.follower),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getFollowing = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const following = await prisma.user.findUnique({
      where: { id: +id },
      select: {
        following: {
          select: {
            following: userSelects,
          },
        },
      },
    });

    if (!following) throw createError(404, "User not found");

    return res.json({
      following: following.following.map((follow: any) => follow.following),
    });
  } catch (error) {
    next(error);
  }
};
