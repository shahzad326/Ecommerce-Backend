import { convertObjectValuesToString } from "../utils/convertObjectValuesToString";
import prisma, { postIncludes, productSelects, userSelects } from "./../prisma";
import { sendNotification } from "./sendNotification";

const getPostById = async (postId: number) => {
  return await prisma.post.findUnique({
    where: {
      id: postId,
    },
    ...postIncludes,
  });
};

const getUserById = async (userId: number) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    ...userSelects,
  });
};

const getProductById = async (productId: number) => {
  return await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      ...productSelects,
    },
  });
};

const makeAndSendNotification = async (
  messageHead: string,
  messageStr: string,
  userId: number | undefined,
  data: any
) => {
  if (!userId) return;

  try {
    const fcmTokens = await prisma.fCMToken.findMany({
      where: {
        user: {
          id: userId,
        },
      },
    });
    console.log({ fcmTokens });

    const notifications = fcmTokens.map(({ token }: any) => ({
      notification: {
        title: messageHead,
        body: messageStr,
      },
      data: convertObjectValuesToString(data),
      token: token,
    }));

    for (const notification of notifications) {
      sendNotification(notification);
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const sendLikeNotificaiton = async (postId: number, userId: number) => {
  const [post, user] = await Promise.all([
    getPostById(postId),
    getUserById(userId),
  ]);
  const author = post?.author;

  const messageHead = `Post Liked`;
  const messageStr = `${user?.username} liked your post ${post?.caption}`;

  console.log(`Like Notification Sent:: ${messageStr}`);
  makeAndSendNotification(messageHead, messageStr, author?.id, {
    postId,
    userId,
  });
};

export const sendCommentNotificaiton = async (
  content: string,
  postId: number,
  userId: number
) => {
  const [post, user] = await Promise.all([
    getPostById(postId),
    getUserById(userId),
  ]);
  const author = post?.author;

  const messageHead = `Comment Added`;
  const messageStr = `${user?.username} added comment ${
    content ? content : ""
  } on your post ${post?.caption}`;

  console.log(`Comment Added Notification Sent:: ${messageStr}`);
  makeAndSendNotification(messageHead, messageStr, author?.id, {
    postId,
    userId,
  });
};

export const sendFollowNotificaiton = async (
  followerId: number,
  followingId: number
) => {
  const [follower, following] = await Promise.all([
    getUserById(followerId),
    getUserById(followingId),
  ]);

  const messageHead = `Started Following`;
  const messageStr = `${follower?.username} started Following you`;

  console.log(`Started Following Notification Sent:: ${messageStr}`);
  makeAndSendNotification(messageHead, messageStr, following?.id, {
    followerId,
    followingId,
  });
};

export const sendOrderNotificaiton = async (
  userId: number,
  productIds: number[]
) => {
  const [user, product] = await Promise.all([
    getUserById(userId),
    getProductById(productIds[0]),
  ]);
  const author = product?.user;

  const messageHead = `Order Placed`;
  const messageStr = `${user?.username} placed order of ${
    productIds.length === 1 ? product?.name : productIds.length + " products"
  }`;

  console.log(`Order Placed Notification Sent:: ${messageStr}`);
  makeAndSendNotification(messageHead, messageStr, author?.id, {
    userId,
    productIds,
  });
};
