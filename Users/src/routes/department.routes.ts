import express from "express"
import DepartmentService from "../controllers/department.controller"
import { middleware } from "../midlewares/middleware";
const router = express.Router()


router.route("/new").post(middleware.VerifyJWT, DepartmentService.registerDepartment);
router.route("/change/:id").put(middleware.VerifyJWT, DepartmentService.renewDepartment).delete(middleware.VerifyJWT, DepartmentService.removeDepartment).patch(middleware.VerifyJWT, DepartmentService.reactivateDepartment);
router.route("/about/:name").put(DepartmentService.getDepartmentAbout);
router.route("/:id").post(DepartmentService.getDepartmentById);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Department]
 *     description: Creates a new department if the user has the role of Director or CEO.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department created successfully
 *                 department:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Invalid department data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Invalid department data
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: User not allowed to create department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: You are not allowed to create department
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 */





/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update an existing department
 *     tags: [Department]
 *     description: Updates an existing department if the user has the role of Director or CEO.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the department to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department updated successfully
 *                 department:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Invalid department data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Invalid department data
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: User not allowed to update department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: You are not eligible
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 */




/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Soft delete a department
 *     tags: [Department]
 *     description: Soft deletes a department if the user has the role of Director or CEO.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the department to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department deleted successfully
 *                 department:
 *                   $ref: '#/components/schemas/Department'
 *       403:
 *         description: User not allowed to delete department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: You are not eligible
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 */



/**
 * @swagger
 * /departments/reactivate/{id}:
 *   patch:
 *     summary: Reactivate a department
 *     tags: [Department]
 *     description: Reactivates a soft-deleted department if the user has the role of Director or CEO.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the department to be reactivated
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department Reactivated successfully
 *                 department:
 *                   $ref: '#/components/schemas/Department'
 *       403:
 *         description: User not allowed to reactivate department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: You are not eligible
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 */



/**
 * @swagger
 * /departments/about/{name}:
 *   get:
 *     summary: Get details of a department by name
 *     tags: [Department]
 *     description: Retrieves information about a department by its name if it is active.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Name of the department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department found
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       400:
 *         description: Invalid department name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Invalid department id
 *       404:
 *         description: Department not found or closed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Department not exist or closed
 */



export default router;