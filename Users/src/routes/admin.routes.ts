import express from "express";
import { middleware } from "../midlewares/middleware";
import Admin from "../controllers/admin.controller";
const router  = express.Router();


router.route('/login').put(Admin.Login)
router.route('/role/:userId').patch(Admin.updateRole)


export default router;
