import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../middleware/verifyToken";
import createError from "http-errors";
import prisma, { productSelects, userSelects } from "../prisma";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_API_KEY_SECTRET!, {
  apiVersion: "2022-11-15",
});

export const createProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, price, description, image } = req.body;
  const userId = req.user.userId;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price,
        image,
        description,
        userId,
      },
    });

    return res.json({ product });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Number(req.query.size) || Number(process.env.PAGE_SIZE);
    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / pageSize);
    const products = await prisma.product.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        ...productSelects,
        user: false,
        userId: true,
      },
    });

    res.json({ products, totalPages });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: +id },
      select: {
        ...productSelects,
      },
    });
    if (!product) throw createError(404, "Product not found");
    return res.json({ product });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { productId, quantity } = req.body;
  const { userId } = req.user;

  try {
    const product = await prisma.product.findUnique({
      where: { id: +productId },
    });

    if (!product) throw createError(404, "Product not found");

    const cartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: +productId,
        },
      },
    });

    if (cartItem) {
      throw createError(400, "Product is already in the cart");
    } else {
      await prisma.cart.create({
        data: {
          userId,
          quantity,
          productId: +productId,
        },
      });

      return res.json({ message: "Product added to cart successfully" });
    }
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { id: productId } = req.params;
  const { userId } = req.user;

  try {
    const cartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: +productId,
        },
      },
    });

    if (!cartItem) throw createError(404, "Product not found in cart");

    await prisma.cart.delete({
      where: {
        userId_productId: {
          userId: userId,
          productId: +productId,
        },
      },
    });

    return res.json({ message: "Product removed from cart successfully" });
  } catch (error) {
    next(error);
  }
};

export const emptyCart = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;

  try {
    await prisma.cart.deleteMany({
      where: {
        userId,
      },
    });

    return res.json({ message: "Cart emptied successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUserCart = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;

  try {
    const userCart = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cart: {
          include: {
            product: {
              select: {
                ...productSelects,
                user: false,
              },
            },
          },
        },
      },
    });

    if (!userCart) throw createError(404, "User not found");

    return res.json({ cart: userCart.cart });
  } catch (error) {
    next(error);
  }
};

export const checkout = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user;
    const { paymentMethodId } = req.body;

    const userCart = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cart: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!userCart) throw createError(404, "Not Found");

    const amount = userCart.cart.reduce(
      (total: number, cartItem: any) =>
        total + cartItem.product.price * cartItem.quantity,
      0
    );

    if (!userCart.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userCart.email,
        name: userCart.username,
      });

      await prisma.user.update({
        where: {
          id: userCart.id,
        },
        data: {
          stripeCustomerId: customer.id,
        },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethodId,
      amount: amount * 100,
      currency: "usd",
      confirmation_method: "manual",
      confirm: true,
    });

    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: userCart.cart.map((item: any) => ({
            product: { connect: { id: item.product.id } },
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    await prisma.cart.deleteMany({
      where: {
        userId,
      },
    });

    return res.json({ success: true, order });
  } catch (error: any) {
    console.error("Error confirming payment intent:", error.message);
    next(error);
  }
};
