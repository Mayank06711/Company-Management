import express from "express";
import { middleware } from "../midlewares/middleware";
import Admin from "../controllers/admin.controller";
const router  = express.Router();


router.route('/login').put(Admin.Login)
router.route('/role/:userId').patch(Admin.updateRole)

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Log in as an admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the admin.
 *               email:
 *                 type: string
 *                 description: The email of the admin.
 *               password:
 *                 type: string
 *                 description: The password of the admin.
 *               adminKey:
 *                 type: string
 *                 description: The admin key for authentication.
 *               MFAKey:
 *                 type: string
 *                 description: The MFA key if MFA is enabled.
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 photo_url:
 *                   type: string
 *                 isMFAEnabled:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *       401:
 *         description: Unauthorized due to invalid credentials or admin key.
 *       404:
 *         description: User not found or email not verified.
 *       500:
 *         description: Internal server error.
 */



/**
 * @swagger
 * /admin/update-role/{userId}:
 *   put:
 *     summary: Update a user's role
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user whose role is to be updated.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 description: The new role to be assigned to the user. Should be "Director" or "CEO".
 *               adminKey:
 *                 type: string
 *                 description: The admin key for authentication.
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 message:
 *                   type: string
 *                   example: "Role updated successfully"
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *       401:
 *         description: Unauthorized due to invalid admin key.
 *       403:
 *         description: Forbidden due to invalid role or role being the same as current role.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
export default router;
