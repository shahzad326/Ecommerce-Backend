import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import prisma, { userSelects } from './../prisma';
import { CustomRequest } from '../middleware/verifyToken';



export const createConversation = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.userId;

    // Check if sender and receiver IDs are the same
    if (senderId === parseInt(receiverId)) {
      return res.status(400).json({
        success: false,
        msg: "You cannot create a conversation with yourself.",
      });
    }

    // Check if a conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { senderId: senderId },
          { receiverId: parseInt(receiverId) },
        ],
      },
    });

    // If conversation already exists, return it
    if (existingConversation) {
      return res.status(200).json({
        success: true,
        msg: 'Conversation Already Exists',
        conversation: existingConversation,
      });
    }

    // If conversation doesn't exist, create a new one
    const newConversation = await prisma.conversation.create({
      data: {
        sender: {
          connect: { id: senderId },
        },
        receiver: {
          connect: { id: parseInt(receiverId) },
        },
      },
    });

    return res.status(200).json({
      success: true,
      msg: 'Conversation Created Successfully',
      conversation: newConversation,
    });
  } catch (error) {
    next(error);
  }
};



export const getConversation = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId); // Convert the userId to integer

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: true,
        receiver: true,
      },

    });

    const conversationUserData = conversations.map((conversation) => {
      const otherUser =
        conversation.senderId !== userId
          ? conversation.sender
          : conversation.receiver;

      return {
        user: { email: otherUser.email, userName: otherUser.username, avatar: otherUser.avatar, about: otherUser.about },
        conversationId: conversation.id,
      };
    });

    // console.log('Conversation user data:', conversationUserData);

    res.status(200).json({
      success: true,
      conversationUserData,
    });
  } catch (error) {
    next(error);
  }
};
export const findConversation = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const receiverId = parseInt(req.params.receiverId);
    const senderId = req.user.userId;

    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            OR: [
              { senderId: senderId, receiverId: receiverId },
              { senderId: receiverId, receiverId: senderId },
            ],
          },
        ],
      },
      include: {
        messages: true,
        sender: {
          select: {
            ...userSelects.select,

          },
        },
        receiver: {
          select: {
            ...userSelects.select,

          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};





export const deleteConversation = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    // Find the conversation by ID
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    // If conversation doesn't exist, return an error
    if (!conversation) {
      return res.status(404).json({
        success: false,
        msg: 'Conversation not found',
      });
    }

    // Delete the conversation
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return res.status(200).json({
      success: true,
      msg: 'Conversation Deleted Successfully',
    });
  } catch (error) {
    next(error);
  }
};

