import express from 'express';
import {
  createConversation,
  deleteConversation,
  findConversation,
  getConversation,
} from '../controllers/conversation';
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.post('/createConversation', [verifyToken], createConversation);

router.get('/getConversation/:userId', getConversation);

router.get('/findConversation/:receiverId', [verifyToken], findConversation);
// router.get('/findChat/:userId/otherUserId', findChat);

router.delete('/deleteConversation/:conversationId', deleteConversation);

export default router;
