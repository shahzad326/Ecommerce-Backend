import express from 'express';
import { verifyToken } from "../middleware/verifyToken";
import { createMessage, getMessage, getSharedAudio, getSharedImages, getSharedPosts, getSharedVideos, shareAudio, shareImage, sharePost, shareVideo } from '../controllers/message';

const router = express.Router();

router.post('/createMessage', [verifyToken], createMessage);

router.get('/getMessage/:conversationId', getMessage);

router.post('/sharePost', [verifyToken], sharePost);

router.get('/getSharedPost/:conversationId', getSharedPosts)

router.post('/shareImage', [verifyToken], shareImage)
router.post('/shareAudio', [verifyToken], shareAudio)
router.post('/shareVideo', [verifyToken], shareVideo)

router.get('/getSharedImage/:conversationId', getSharedImages)
router.get('/getSharedAudio/:conversationId', getSharedAudio)
router.get('/getSharedVideo/:conversationId', getSharedVideos)

export default router;
