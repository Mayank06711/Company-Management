import express from "express";
import { Employees } from "../controllers/employee.controller";
import { middleware } from "../midlewares/middleware";
const router = express.Router()


router.route("/new").post(Employees.addNewEmp);
router.route("/update").put(Employees.EmpUp);
router.route("/delete").delete(Employees.removeEmp);
router.route("/help").post(Employees.helpReq)
router.route("/get-report").post(Employees.getReports)
router.route("/attendence").post(Employees.markAttendance)
router.route("/send-reports").post(middleware.AttachmentsMulter, Employees.sendReports)
router.route("/shareData").post(middleware.AttachmentsMulter, Employees.DataSharing)




/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: API endpoints for employee management
 */

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Employee details to create
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request due to validation errors
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden access
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /employees/{employeeId}:
 *   put:
 *     summary: Update an existing employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: ID of the employee to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Employee data to update
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeUpdate'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request due to validation errors
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden access
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /employees/{employeeId}:
 *   delete:
 *     summary: Remove an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: ID of the employee to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden access
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /employees/{employeeId}:
 *   get:
 *     summary: Get an employee's details
 *     tags: [Employees]
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: ID of the employee to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /employees/help-request:
 *   post:
 *     summary: Submit a help request from an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: File upload for help request
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Help request initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request, file required
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /employees/{employeeId}/report:
 *   get:
 *     summary: Get report related to an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: ID of the employee to get the report for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /employees/{employeeId}/send-report:
 *   post:
 *     summary: Send a report about an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: ID of the employee for whom the report is to be sent
 *         schema:
 *           type: string
 *     requestBody:
 *       description: File or data to be sent in the report
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Report sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request, data required
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /employees/{employeeId}/attendance:
 *   post:
 *     summary: Mark attendance for an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: ID of the employee to mark attendance for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /employees/share-data:
 *   post:
 *     summary: Share data with HR team
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: File or data to be shared
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Data shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request, data not provided
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */



export default router;