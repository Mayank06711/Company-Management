import express from 'express';
import { middleware } from '../midlewares/middleware';
import {Notification} from '../controllers/notification.controller';
const router = express.Router();


router.route('/create').post(middleware.VerifyJWT, Notification.newNoti);
router.route("/channel").put(middleware.VerifyJWT, Notification.chooseChannel)



/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - type
 *         - message
 *         - userId
 *         - channel
 *       properties:
 *         type:
 *           type: string
 *           description: Type of the notification.
 *         message:
 *           type: string
 *           description: Message content of the notification.
 *         userId:
 *           type: string
 *           description: User ID to whom the notification will be sent.
 *         channel:
 *           type: string
 *           description: Channel through which the notification will be sent (Email, SMS, WhatsApp).
 *         channel:
 *           type: string
 *           enum: [Email, SMS, WhatsApp]
 *           description: The channel for sending notifications.
 */

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API endpoints for managing notifications.
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     description: Creates a new notification and adds it to the queue for processing.
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID of the created notification.
 *                     type:
 *                       type: string
 *                       description: Type of the notification.
 *                     message:
 *                       type: string
 *                       description: Message content of the notification.
 *                     userId:
 *                       type: string
 *                       description: User ID to whom the notification is sent.
 *                     channel:
 *                       type: string
 *                       description: Channel through which the notification is sent.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

/**
 * @swagger
 * /channel:
 *   post:
 *     summary: Select a notification channel
 *     description: Updates the notification channel for the user.
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 enum: [Email, SMS, WhatsApp]
 *                 description: The channel to select for notifications.
 *     responses:
 *       200:
 *         description: Channel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: string
 *                   description: Updated channel.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       401:
 *         description: Invalid or missing channel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

export default router;