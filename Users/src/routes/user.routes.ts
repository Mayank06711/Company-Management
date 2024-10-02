import express from "express";
import { middleware } from "../midlewares/middleware";
import UserService from "../controllers/user.controller";
const router  = express.Router();


router.route("/register").post(middleware.SingleFile, UserService.registerUser);
router.route("/emailverification").post(UserService.sendVerificationURLEmail)
router.route("/verify-email").get(UserService.verifyYourEmail).post(UserService.handleForm)
router.route("/login").post(UserService.loginUser);
router.route("/logout").post(middleware.VerifyJWT,middleware.isActive, UserService.logoutUser);
router.route("/whoami").get(middleware.VerifyJWT, middleware.isActive, UserService.whoAmI)
router.route("/update-profile").put(middleware.VerifyJWT, middleware.isActive,  UserService.updateYourProfile)
router.route("/change-password").post( middleware.VerifyJWT,middleware.isActive, UserService.changeYourPassword)
router.route("/enableMFA").post(middleware.VerifyJWT, middleware.isActive, UserService.enableTwoFactorAuth)
router.route("/disableMFA").post(middleware.VerifyJWT, middleware.isActive, UserService.disableTwoFactorAuth)
router.route("/delete-profile").delete(middleware.VerifyJWT, middleware.isActive, UserService.deleteYourAccount)



/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Pass@1234
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                   id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    photo_url: newUser.photo_url,          
                    role: newUser.role,
 *       400:
 *         description: User Already Exists
 *       409:
 *         description: Email already in use
 */




/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Pass@1234
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: jwt-token-here
 *       401:
 *         description: Invalid credentials
 */



/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged out successfully
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 613b1fffcf1f2b0023f2e8c7
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john.doe@example.com
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 */



/**
 * @swagger
 * /user:
 *   put:
 *     summary: Update user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */



/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only admin)
 */



/**
 * @swagger
 * /user/mfa/enable:
 *   post:
 *     summary: Enable MFA for a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA enabled successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/mfa/disable:
 *   post:
 *     summary: Disable MFA for a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA disabled successfully
 *       401:
 *         description: Unauthorized
 */





/**
 * @swagger
 * /user/password:
 *   post:
 *     summary: Change the password for a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: oldPass@123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newPass@123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request
 */





/**
 * @swagger
 * /user/verify-email:
 *   post:
 *     summary: Send email verification token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Email verification sent
 *       400:
 *         description: Invalid request
 */





export default router