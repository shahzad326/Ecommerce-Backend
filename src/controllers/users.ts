import { NextFunction, Request, Response } from "express";
import { comparePassword, generateHash } from "../utils/getPasswordHash";
import createError from "http-errors";
import prisma, { postIncludes, userSelects } from "./../prisma";
import { signToken } from "../utils/jwt";
import { CustomRequest } from "../middleware/verifyToken";
import generateRecoverykey from "../utils/generateRecoveryKey";
import { sendRecoveryKeyToUser } from "../services/mailService";

export const saveFCMToken = async (userId: number, token: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw createError(404, "User not found");

    await prisma.fCMToken.upsert({
      where: {
        token,
      },
      update: {
        user: {
          connect: {
            id: userId,
          },
        },
      },
      create: {
        token,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

export const createUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, avatar, about, fcmToken } = req.body;
    const hashedPassword = await generateHash(password);
    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        avatar,
        about,
      },
      ...userSelects,
    });

    if (fcmToken) await saveFCMToken(createdUser.id, fcmToken);

    const token = signToken(
      { userId: createdUser.id },
      process.env.JWT_TOKEN_INVALIDAITON_TIME
    );

    res.json({ token, user: createdUser });
  } catch (error) {
    next(error);
  }
};

export const authenticateUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, fcmToken } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        ...userSelects.select,
        password: true,
      },
    });

    if (!user) throw createError(404, "User not Found");
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) throw createError(401, "Invalid credentials");

    const token = signToken(
      { userId: user.id },
      process.env.JWT_TOKEN_INVALIDAITON_TIME
    );

    if (fcmToken) await saveFCMToken(user.id, fcmToken);
    user.password = "";

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      ...userSelects,
    });

    if (!user) throw createError(404, "User not Found");

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;

    if (userId) {
      await prisma.fCMToken.deleteMany({
        where: {
          userId,
        },
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getUserProfileByToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    if (!userId) throw createError(401, "Unauthorized");

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        ...userSelects.select,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw createError(404, "User not Found");

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, avatar, about } = req.body;
    const userId = req.user?.userId;

    if (!userId) throw createError(401, "Unauthorized");

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
        avatar,
        about,
      },
    });

    const updatedUserObject = {
      id: updatedUser.id,
      username: updatedUser.username,
      avatar: updatedUser.avatar,
      about: updatedUser.about,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    res.json({ user: updatedUserObject });
  } catch (error) {
    next(error);
  }
};

export const initiatePasswordReset = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const recoveryKey = generateRecoverykey();

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        recoveryKey,
      },
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    await sendRecoveryKeyToUser(user, recoveryKey);

    res.json({ message: "Recovery key sent to email" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, recoveryKey, newPassword } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw createError(404, "User not found");
    const isValidRecoveryKey = user.recoveryKey === Number(recoveryKey);
    if (!isValidRecoveryKey) throw createError(401, "Invalid recovery key");
    const hashedPassword = await generateHash(newPassword);

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.json({ message: "Password successfully reset" });
  } catch (err) {
    next(err);
  }
};

export const getUserLikes = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const likes = await prisma.like.findMany({
      where: {
        userId,
      },
      include: {
        post: true,
      },
    });

    res.json({ likes });
  } catch (error) {
    next(error);
  }
};

export const getUserComments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const comments = await prisma.comment.findMany({
      where: {
        userId,
      },
      include: {
        post: true,
      },
    });

    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      ...postIncludes,
    });

    res.json({ posts });
  } catch (error) {
    next(error);
  }
};
