import express from "express";
import {
  searchUsers,
  searchPosts,
  searchProducts,
} from "../controllers/search";

const router = express.Router();

router.get("/users", searchUsers);
router.get("/posts", searchPosts);
router.get("/products", searchProducts);

export default router;
