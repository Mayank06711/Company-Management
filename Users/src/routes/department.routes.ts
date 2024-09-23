import express from "express"
import DepartmentService from "../controllers/department.controller"
import { middleware } from "../midlewares/middleware";
const router = express.Router()


router.route("/new").post(middleware.VerifyJWT, DepartmentService.registerDepartment);
router.route("/change/:id").put(middleware.VerifyJWT, DepartmentService.renewDepartment).delete(middleware.VerifyJWT, DepartmentService.removeDepartment).patch(middleware.VerifyJWT, DepartmentService.reactivateDepartment);
router.route("/about/:name").put(DepartmentService.getDepartmentAbout);
router.route("/:id").post(DepartmentService.getDepartmentById);


export default router;