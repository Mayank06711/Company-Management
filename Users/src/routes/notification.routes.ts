import express from 'express';
import { middleware } from '../midlewares/middleware';
import {Notification} from '../controllers/notification.controller';
const router = express.Router();


router.route('/create').post(middleware.VerifyJWT, Notification.newNoti);
router.route("/channel").put(middleware.VerifyJWT, Notification.chooseChannel)
export default router;