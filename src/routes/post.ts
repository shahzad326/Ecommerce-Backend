import { Router } from "express";
import {
  createPost,
  getFeedForUser,
  getPostById,
  likePost,
  addCommentToPost,
  explorePosts,
  unlikePost,
  deletePost,
  deleteComment,
  updatePost,
} from "../controllers/post";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.post("/", [verifyToken], createPost);
router.get("/feed/user", [verifyToken], getFeedForUser);
router.get("/explore", explorePosts);
router.get("/:id", getPostById);
router.post("/:id/like", [verifyToken], likePost);
router.post("/:id/unlike", [verifyToken], unlikePost);
router.post("/:id/comment", [verifyToken], addCommentToPost);
router.delete("/:id", [verifyToken], deletePost);
router.delete("/:postId/comment/:commentId", [verifyToken], deleteComment);
router.put("/:id", [verifyToken], updatePost);

export default router;
