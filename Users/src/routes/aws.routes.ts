import express, { Router,  } from "express";
import { middleware } from "../midlewares/middleware";
import { AWS_SERVICES } from "../helper/AWS"
import UserService from "../controllers/user.controller";
import {AWSAPI} from "../controllers/aws.controller"
const router  = express.Router();


router.route("/uploadAws").get(AWSAPI.upload)
router.post('/generatePresignedUrl', AWSAPI.generatePresignedURL);
router.post("/uploadfiles", middleware.AttachmentsMulter, AWSAPI.uploadFile)

export default router