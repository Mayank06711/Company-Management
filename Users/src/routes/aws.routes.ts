import express, { Router,  } from "express";
import { middleware } from "../middlewares/middleware";
import { AWS_SERVICES } from "../helper/AWS"
import UserService from "../controllers/user.controller";
import {AWSAPI} from "../controllers/aws.controller"
const router  = express.Router();


router.route("/uploadAws").get(AWSAPI.upload)


export default router