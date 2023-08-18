import { Router } from "express";
import {
  getProducts,
  getProductById,
  addToCart,
  removeFromCart,
  checkout,
  createProduct,
  emptyCart,
  getUserCart,
} from "../controllers/shopping";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.post("/product", [verifyToken], createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/cart", [verifyToken], addToCart);
router.get("/get-cart", [verifyToken], getUserCart);
router.delete("/cart/:id", [verifyToken], removeFromCart);
router.delete("/empty-cart", [verifyToken], emptyCart);
router.post("/checkout", [verifyToken], checkout);

export default router;
