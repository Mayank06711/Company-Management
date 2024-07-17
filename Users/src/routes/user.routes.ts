import express, { Router,  } from "express";
import { middleware } from "../middlewares/middleware";
import UserService from "../controllers/user.controller";
const router  = express.Router();


router.route("/register").post(middleware.SingleFile, UserService.registerUser);


export default router