import express, { Router,  } from "express";
import { middleware } from "../midlewares/middleware";
import { AWS_SERVICES } from "../helper/AWS"
import UserService from "../controllers/user.controller";
import {AWSAPI} from "../controllers/aws.controller"
const router  = express.Router();


router.route("/uploadAws").get(AWSAPI.upload)

router.post('/generatePresignedUrl', AWSAPI.generatePresignedURL);;



/**
 * @swagger
 * /uploadAws:
 *   get:
 *     summary: Serve the file upload HTML form
 *     responses:
 *       200:
 *         description: HTML form for file upload
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: |
 *                 <!DOCTYPE html>
 *                 <html lang="en">
 *                 <head>
 *                   ...
 *                 </head>
 *                 <body>
 *                   ...
 *                 </body>
 *                 </html>
 *     tags:
 *       - AWS
 */




/**
 * @swagger
 * /generatePresignedUrl:
 *   post:
 *     summary: Generate a presigned URL for uploading a file
 *     requestBody:
 *       description: Request payload for generating a presigned URL
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: "example.jpg"
 *               contentType:
 *                 type: string
 *                 example: "image/jpeg"
 *             required:
 *               - fileName
 *               - contentType
 *     responses:
 *       200:
 *         description: Presigned URL for file upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presignedUrl:
 *                   type: string
 *                   example: "https://bucket-name.s3.amazonaws.com/example.jpg?AWSAccessKeyId=...&Signature=...&Expires=..."
 *       500:
 *         description: Error generating presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to generate presigned URL"
 *     tags:
 *       - AWS
 */




/**
 * @swagger
 * /uploadFiles:
 *   post:
 *     summary: Upload files to S3
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             required:
 *               - files
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Files uploaded successfully"
 *                 fileUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uri
 *       500:
 *         description: Error uploading files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to upload files"
 *     tags:
 *       - AWS
 */



export default router