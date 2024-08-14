import express from 'express';
import { position } from '../controllers/position.controller';

const router = express.Router();


router.route('/new').post(position.newPostion);
router.route('/').get(position.getPost)
export default router;