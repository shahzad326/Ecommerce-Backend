import { PrismaClient } from "@prisma/client";
import {
  sendCommentNotificaiton,
  sendFollowNotificaiton,
  sendLikeNotificaiton,
  sendOrderNotificaiton,
} from "./services/notifications";
const prisma = new PrismaClient();

prisma.$use(async (params: any, next: any) => {
  if (params.model == "Like" && params.action == "create") {
    sendLikeNotificaiton(
      params.args.data.post.connect.id,
      params.args.data.user.connect.id
    );
  }

  if (params.model == "Comment" && params.action == "create") {
    sendCommentNotificaiton(
      params.args.data.connect,
      params.args.data.postId,
      params.args.data.userId
    );
  }

  if (params.model == "Follows" && params.action == "create") {
    sendFollowNotificaiton(
      params.args.data.followerId,
      params.args.data.followingId
    );
  }

  if (params.model == "Order" && params.action == "create") {
    sendOrderNotificaiton(
      params.args.data.userId,
      params.args.data.items.create.map((item: any) => item.product.connect.id)
    );
  }

  return next(params);
});

export const userSelects = {
  select: {
    id: true,
    username: true,
    email: true,
    avatar: true,
    about: true,
  },
};

export const productSelects = {
  id: true,
  name: true,
  image: true,
  price: true,
  description: true,
  createdAt: true,
  user: {
    ...userSelects,
  },
};

export const postIncludes = {
  include: {
    author: {
      ...userSelects,
    },
    likes: {
      select: {
        id: true,
        user: {
          ...userSelects,
        },
      },
    },
    comments: {
      select: {
        id: true,
        content: true,
        user: {
          ...userSelects,
        },
      },
    },
  },
};

export default prisma;
