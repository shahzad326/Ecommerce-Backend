import express from "express";
import {
  createUser,
  authenticateUser,
  getUserProfile,
  updateUserProfile,
  initiatePasswordReset,
  getUserProfileByToken,
  resetPassword,
  getUserLikes,
  getUserComments,
  getUserPosts,
  logoutUser,
} from "../controllers/users";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", authenticateUser);
router.post("/logout", [verifyToken], logoutUser);
router.get("/user-by-token", [verifyToken], getUserProfileByToken);
router.put("/user", [verifyToken], updateUserProfile);
router.post("/init-reset-password", initiatePasswordReset);
router.post("/reset-password", resetPassword);
router.get("/user/:id/profile", getUserProfile);
router.get("/user/:id/likes", getUserLikes);
router.get("/user/:id/comments", getUserComments);
router.get("/user/:id/posts", getUserPosts);

export default router;
