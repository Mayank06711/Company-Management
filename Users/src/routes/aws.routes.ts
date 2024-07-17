import express, { Router,  } from "express";
import { middleware } from "../middlewares/middleware";
import { AWS_SERVICES } from "../helper/AWS"
import UserService from "../controllers/user.controller";
const router  = express.Router();


router.route("/uploadAws").put()