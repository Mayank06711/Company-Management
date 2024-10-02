import express from 'express';
import { position } from '../controllers/position.controller';

const router = express.Router();


router.route('/new').post(position.newPostion);
router.route('/').get(position.getPost)


/**
 * @swagger
 * /api/position:
 *   post:
 *     summary: Create a new position
 *     description: Create a new position in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Software Engineer"
 *               desc:
 *                 type: string
 *                 example: "Handles backend development"
 *               vacancy:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       '201':
 *         description: Position created successfully
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
 *                   additionalProperties: true
 *                 message:
 *                   type: string
 *                   example: "Position created"
 *       '400':
 *         description: Invalid position data
 *       '500':
 *         description: Failed to create position in the database
 */


/**
 * @swagger
 * /api/position:
 *   get:
 *     summary: Get position details
 *     description: Retrieve details of a position by name.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Software Engineer"
 *     responses:
 *       '200':
 *         description: Position found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *                 message:
 *                   type: string
 *                   example: "Position found"
 *       '400':
 *         description: Position name is required
 *       '404':
 *         description: Position not found
 */




/**
 * @swagger
 * /api/position:
 *   put:
 *     summary: Update position details
 *     description: Update the description and vacancy of a position, reassign employees if necessary.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Software Engineer"
 *               desc:
 *                 type: string
 *                 example: "Updated job description"
 *               vacancy:
 *                 type: integer
 *                 example: 10
 *               employeeIdsToRemove:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["employee1", "employee2"]
 *               newPositionId:
 *                 type: string
 *                 example: "newPositionId123"
 *     responses:
 *       '200':
 *         description: Position updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *                 message:
 *                   type: string
 *                   example: "Position updated"
 *       '400':
 *         description: Invalid data or no need to remove employees
 *       '404':
 *         description: Position not found
 */




/**
 * @swagger
 * /api/position/{id}:
 *   delete:
 *     summary: Delete a position and add a new one
 *     description: Delete a position and optionally reassign employees to a new position.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the position to delete
 *         schema:
 *           type: string
 *           example: "positionId123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPositionName:
 *                 type: string
 *                 example: "New Position"
 *               vacancy:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Position and employees updated or deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *                 message:
 *                   type: string
 *                   example: "Position and associated employees deleted successfully"
 *       '400':
 *         description: Position ID is required
 *       '404':
 *         description: Position not found
 */




/**
 * @swagger
 * /api/position/{id}:
 *   delete:
 *     summary: Delete a position
 *     description: Delete a position and mark associated employees as inactive.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the position to delete
 *         schema:
 *           type: string
 *           example: "positionId123"
 *     responses:
 *       '200':
 *         description: Position and employees marked inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *                 message:
 *                   type: string
 *                   example: "Position and associated employees deleted successfully"
 *       '400':
 *         description: Position ID is required
 *       '404':
 *         description: Position not found
 */






/**
 * @swagger
 * /api/position/employees:
 *   get:
 *     summary: Get employee count by position
 *     description: Get the count of employees grouped by their positions.
 *     responses:
 *       '200':
 *         description: Employee count by position retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       positionName:
 *                         type: string
 *                         example: "Software Engineer"
 *                       employeeCount:
 *                         type: integer
 *                         example: 10
 *                 message:
 *                   type: string
 *                   example: "Employee count by position retrieved successfully"
 *       '500':
 *         description: Failed to retrieve employee counts by position
 */

export default router;