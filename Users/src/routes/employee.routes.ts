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

export default router;