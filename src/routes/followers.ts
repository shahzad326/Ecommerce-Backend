import express from "express";
import {
  followUser,
  getFollowers,
  getFollowing,
} from "../controllers/followers";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.post("/", [verifyToken], followUser);
router.get("/followers/:id", getFollowers);
router.get("/following/:id", getFollowing);

export default router;
