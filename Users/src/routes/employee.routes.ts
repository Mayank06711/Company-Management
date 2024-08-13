import express from "express"
const router = express.Router()
import { middleware } from "../midlewares/middleware";
import { Employees } from "../controllers/employee.controller";
router.post("/", middleware.VerifyJWT,middleware.isActive  ,Employees.newEmployee )

export default router;
