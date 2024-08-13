import express from "express"
import DepartmentService from "../controllers/department.controller"
const router = express.Router()


router.route("/new").post(DepartmentService.registerDepartment);
router.route("/change").put(DepartmentService.renewDepartment).delete(DepartmentService.removeDepartment);
router.route("/about").post(DepartmentService.getDepartmentAbout);
router.route("/:name").post(DepartmentService.getDepartmentByName);


export default router;