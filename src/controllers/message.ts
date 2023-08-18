import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import prisma from './../prisma';
import { CustomRequest } from '../middleware/verifyToken';


export const createMessage = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId, message, receiverId = '' } = req.body;
    const senderId = req.user.userId;

    if (!senderId || !message) {
      return res.status(400).json({
        success: false,
        msg: 'All Fields are Required',
      });
    }

    let newConversationId = conversationId; // Use this variable to store the conversation ID

    if (conversationId === 'new' && receiverId) {
      const newConversation = await prisma.conversation.create({
        data: {
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: parseInt(receiverId) } },
        },
      });

      newConversationId = newConversation.id; // Set the new conversation ID
    }

    const newMessage = await prisma.messages.create({
      data: {
        conversationId: parseInt(newConversationId), // Convert to integer
        senderId: senderId,
        message: message,
      },
    });

    return res.status(200).json({
      success: true,
      msg: 'Message Sent Successfully',
      newMessage,
    });
  } catch (error) {
    next(error);
  }
};
export const getMessage = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid conversationId',
      });
    }

    if (conversationId === 0) {
      return res.status(200).json({});
    }

    const messages = await prisma.messages.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        conversation: true,
      },
    });

    const messageUserData = await Promise.all(
      messages.map(async (message) => {
        const sender = await prisma.user.findUnique({
          where: {
            id: message.senderId,
          },
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
            about: true
          },
        });

        // Handle the case when sender is null
        if (!sender) {
          return {
            user: {
              id: null,
              email: null,
              username: null,
              avatar: null,
              about: null
            },
            message: message.message,
          };
        }

        return {
          user: {
            id: sender.id,
            email: sender.email,
            username: sender.username,
            avatar: sender.avatar,
            about: sender.about
          },
          message: message.message,
        };
      })
    );

    // console.log('Messages:', messages);
    // console.log('MessageUserData:', messageUserData);

    return res.status(200).json({ messageUserData });
  } catch (error) {
    next(error);
  }
};


// Controller to share a valid post

export const sharePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId, postId } = req.body;
    const senderId = req.user.userId;

    if (!conversationId || !senderId || !postId) {
      return res.status(400).json({
        success: false,
        msg: 'All Fields are Required',
      });
    }

    // Check if the post exists
    const existingPost = await prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        msg: 'Post not found',
      });
    }

    // Create a new shared post record
    const newSharedPost = await prisma.sharedPost.create({
      data: {
        messageid: parseInt(conversationId),
        postId: parseInt(postId),
        conversationId: parseInt(conversationId),
      },
    });

    return res.status(200).json({
      success: true,
      msg: 'Post Shared Successfully',
      sharedPost: newSharedPost,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to get posts shared in a conversation
export const getSharedPosts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid conversationId',
      });
    }

    // Get shared posts associated with the conversation
    const sharedPosts = await prisma.sharedPost.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {

        Post: true,
      },
    });

    return res.status(200).json({
      success: true,
      sharedPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const shareImage = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId, receiverId = '', mediaUrl } = req.body;
    const senderId = req.user.userId;

    if (!senderId || !mediaUrl) {
      return res.status(400).json({
        success: false,
        msg: 'All Fields are Required',
      });
    }

    let newConversationId = conversationId;

    if (conversationId === 'new' && receiverId) {
      const newConversation = await prisma.conversation.create({
        data: {
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: parseInt(receiverId) } },
        },
      });

      newConversationId = newConversation.id;
    }

    const newMessage = await prisma.messages.create({
      data: {
        conversationId: parseInt(newConversationId),
        senderId: senderId,
        messageType: 'image', // Specify the media type
        mediaUrl: mediaUrl,   // Provide the URL to the image
        message: ''
      },
    });

    return res.status(200).json({
      success: true,
      msg: 'Image Shared Successfully',
      newMessage,
    });
  } catch (error) {
    next(error);
  }
};


export const shareVideo = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId, receiverId = '', mediaUrl } = req.body;
    const senderId = req.user.userId;

    if (!senderId || !mediaUrl) {
      return res.status(400).json({
        success: false,
        msg: 'All Fields are Required',
      });
    }

    let newConversationId = conversationId;

    if (conversationId === 'new' && receiverId) {
      const newConversation = await prisma.conversation.create({
        data: {
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: parseInt(receiverId) } },
        },
      });

      newConversationId = newConversation.id;
    }

    const newMessage = await prisma.messages.create({
      data: {
        conversationId: parseInt(newConversationId),
        senderId: senderId,
        messageType: 'video', // Specify the media type
        mediaUrl: mediaUrl,   // Provide the URL to the video
        message: ''
      },
    });

    return res.status(200).json({
      success: true,
      msg: 'Video Shared Successfully',
      newMessage,
    });
  } catch (error) {
    next(error);
  }
};


export const shareAudio = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId, receiverId = '', mediaUrl } = req.body;
    const senderId = req.user.userId;

    if (!senderId || !mediaUrl) {
      return res.status(400).json({
        success: false,
        msg: 'All Fields are Required',
      });
    }

    let newConversationId = conversationId;

    if (conversationId === 'new' && receiverId) {
      const newConversation = await prisma.conversation.create({
        data: {
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: parseInt(receiverId) } },
        },
      });

      newConversationId = newConversation.id;
    }

    const newMessage = await prisma.messages.create({
      data: {
        conversationId: parseInt(newConversationId),
        senderId: senderId,
        messageType: 'audio', // Specify the media type
        mediaUrl: mediaUrl,   // Provide the URL to the audio file
        message: ''
      },
    });

    return res.status(200).json({
      success: true,
      msg: 'Audio Shared Successfully',
      newMessage,
    });
  } catch (error) {
    next(error);
  }
};
export const getSharedImages = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid conversationId',
      });
    }

    const sharedImages = await prisma.messages.findMany({
      where: {
        conversationId: conversationId,
        messageType: 'image', // Filter by image type
      },
    });

    return res.status(200).json({ sharedImages });
  } catch (error) {
    next(error);
  }
};

export const getSharedVideos = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid conversationId',
      });
    }

    const sharedVideos = await prisma.messages.findMany({
      where: {
        conversationId: conversationId,
        messageType: 'video', // Filter by video type
      },
    });

    return res.status(200).json({ sharedVideos });
  } catch (error) {
    next(error);
  }
};

export const getSharedAudio = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid conversationId',
      });
    }

    const sharedAudio = await prisma.messages.findMany({
      where: {
        conversationId: conversationId,
        messageType: 'audio', // Filter by audio type
      },
    });

    return res.status(200).json({ sharedAudio });
  } catch (error) {
    next(error);
  }
};
