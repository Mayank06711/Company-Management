import express from "express";
import { middleware } from "../midlewares/middleware";
import UserService from "../controllers/user.controller";
const router  = express.Router();


router.route("/register").post(middleware.SingleFile, UserService.registerUser);
router.route("/emailverification").post(UserService.sendVerificationURLEmail)
router.route("/verify-email").get(UserService.verifyYourEmail)
router.route("/login").post(UserService.loginUser);
router.route("/logout").post(middleware.VerifyJWT,middleware.isActive, UserService.logoutUser);
router.route("/whoami").get(middleware.VerifyJWT, middleware.isActive, UserService.whoAmI)
router.route("/update-profile").put(middleware.VerifyJWT, middleware.isActive,  UserService.updateYourProfile)
router.route("/change-password").post( middleware.VerifyJWT,middleware.isActive, UserService.changeYourPassword)
router.route("/enableMFA").post(middleware.VerifyJWT, middleware.isActive, UserService.enableTwoFactorAuth)
router.route("/disableMFA").post(middleware.VerifyJWT, middleware.isActive, UserService.disableTwoFactorAuth)
router.route("/delete-profile").delete(middleware.VerifyJWT, middleware.isActive, UserService.deleteYourAccount)
export default router