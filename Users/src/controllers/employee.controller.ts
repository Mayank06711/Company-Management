import express, { Request, Response } from "express";
import prisma from "../helper/clientPrism";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import AsyncHandler from "../utils/asyncHandler";
import { EmployeeSchema } from "../models/zodValidation.schemas";
import { AuthServices } from "../helper/auth";
import UserService from "./user.controller";
import DepartmentService from "./department.controller";
import { newRequest } from "../types/express";
import EmitEvents from "../utils/eventEmitter";
import { PRIORITY, SEND_EMAIL } from "../constant";
import Bull from "../emailers/emailQueue";
import { Employee } from "../types/express";

class Employees {
  private static async newEmpl(req: newRequest, res: Response) {
    
    // Check if the user is authenticated
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    const creator =req.user?.id;
    const existingEmploy = await prisma.employee.findFirst({
      where: { id: req.body?.userId },
    });

    if (existingEmploy) {
      throw new ApiError(403, "Already an employee of our company");
    }

    // Validate the request body against the Employee schema
    const parsedEmployee = EmployeeSchema.safeParse(req.body);
    if (!parsedEmployee.success) {
      if (typeof parsedEmployee.error.errors === "string") {
        throw new ApiError(400, parsedEmployee.error.errors);
      } else if (parsedEmployee.error instanceof Error) {
        throw new ApiError(400, parsedEmployee.error.message);
      } else {
        throw new ApiError(400, parsedEmployee.error);
      }
    }
    // Check if the user has the required permissions to create a new employee
    const roles = ["Director", "CEO", "HR"];
    if (!roles.includes(req?.user?.role)) {
      throw new ApiError(403, "You are not allowed to create a new employee");
    }

    // Check if the department exists
    const department = await prisma.department.findFirst({
      where: {
        AND: [{ id: parsedEmployee.data.departmentId }, { isActive: true }],
      },
    });
    if (!department) {
      throw new ApiError(404, "Department not found");
    }


    // position of the employee
    const position = await prisma.position.findFirst({
      where: { id: parsedEmployee.data.positionId },
    });

    if (!position) {
      throw new ApiError(404, "Position not found");
    }

    if (position.vacancy === 0) {
      throw new ApiError(400, "Vacancy is full for this position ");
    }

    const newEmpl = await prisma.employee.create({
      data: {
        phoneNum: parsedEmployee.data.phoneNum!,
        positionDesc: parsedEmployee.data.positionDesc,
        salary: parsedEmployee.data.salary,
        isActive: true,
        departmentId: parsedEmployee.data.departmentId, // directly assign the string id
        positionId: parsedEmployee.data.positionId, // directly assign the string id
        userId: parsedEmployee.data.userId,
        projectId: "",

        // projectId : null
        // make sure to set the userId if it's required
      },
      select:{
        phoneNum : true,
        positionDesc:true,
        user:{
          select:{
            name:true,
            email:true,
            username :true
          }
        },
        isActive :true,
        positionId:true,
        id:true,
        salary:true,
        joinedAt:true
      }
    });

    if (!newEmpl) {
      throw new ApiError(
        500,
        "Failed to create new employee data in our database"
      );
    }


    const formattedResults = {
      id: newEmpl.id,
      userID: newEmpl.id,
      position: position.name,
      department: department.name,
      salary: newEmpl.salary,
      joinedAt: newEmpl.joinedAt,
      positionDesc:newEmpl.positionDesc,
      name:newEmpl.user.name,
      userName :newEmpl.user.username,
      email : newEmpl.user.email,
    };
    await Bull.pushToUserQueue(formattedResults);
    await Bull.pushToAdminQueue({...formattedResults ,creator });

    // send email to user with his data on his email further

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { formattedResults },
          "Employee created successfully"
        )
      );
  }

  private static async updateEmpl(req: Request, res: Response) {
    const { salary, positionId, departmentId } = req.body;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    // Check if the user has the required permissions to update employee data
    const roles = ["HR", "CEO", "Director"];
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(403, "You are not allowed to update employee data");
    }

    const employee = await prisma.employee.findFirst({
      where: { id: req.body?.id, userId: req.body?.userId },
    });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    // Check if the department exists
    const department = await prisma.department.findFirst({
      where: {
        AND: [{ id: departmentId }, { isActive: true }],
      },
    });
    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    // position of the employee
    const position = await prisma.position.findFirst({
      where: { id: positionId },
    });

    if (!position) {
      throw new ApiError(404, "Position not found");
    }

    if (position.vacancy === 0) {
      throw new ApiError(400, "Vacancy is full for this position ");
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: req.body.id },
      data: { salary, positionId, departmentId },
      select:{
        phoneNum : true,
        positionDesc:true,
        user:{
          select:{
            name:true,
            email:true,
            username :true
          }
        },
        isActive :true,
        positionId:true,
        id:true,
        salary:true,
        joinedAt:true
      }
    });

    if (!updatedEmployee) {
      throw new ApiError(500, "Failed to update employee data in our database");

    }

    const formattedResults = {
      id: updatedEmployee.id,
      userID: updatedEmployee.id,
      position: position.name,
      department: department.name,
      salary: updatedEmployee.salary,
      joinedAt: updatedEmployee.joinedAt,
      positionDesc:updatedEmployee.positionDesc,
      name:updatedEmployee.user.name,
      userName :updatedEmployee.user.username,
      email : updatedEmployee.user.email,
    };


    // send email to user with his updated data on his email further

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { formattedResults },
          "Employee updated successfully"
        )
      );
  }

  private static async removeEmploy(req: Request, res: Response) {
    const employeeId = req.body.id;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!employeeId || employeeId === undefined) {
      throw new ApiError(400, "Employee ID is required");
    }

    // Check if the user has the required permissions to remove employee data
    const roles = ["HR", "CEO", "Director"];
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(403, "You are not allowed to remove employee data");
    }

    const result = await prisma.employee.update({
      where: { id: employeeId },
      data: { isActive: false },
    });

    if (!result) {
      throw new ApiError(500, "Failed to remove employee data in our database");
    }
    //send noti to employee
    res
      .status(200)
      .json(
        new ApiResponse(200, { employeeId }, "Employee terminated successfully")
      );
  }

  private static async getEmploy(req: Request, res: Response) {
    const { employeeId } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if(req.user?.role ==="user"){
      throw new ApiError(401 , "UNauthorised")
    }
    if (!employeeId || employeeId === undefined) {
      throw new ApiError(400, "Employee ID is required");
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId },
      select: {
        id: true,
        phoneNum: true,
        salary: true,
        joinedAt: true,
        departmentId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        position: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    const formattedResults = {
      id: employee.id,
      userID: employee.user.id,
      position: employee.position.name,
      departmentId: employee.departmentId,
      salary: employee.salary,
      joinedAt: employee.joinedAt,
    };
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { formattedResults },
          "Employee retrieved successfully"
        )
      );
  }

  private static async employHelpReq(req: Request, res: Response) {
    const file = req.files;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!file || file === undefined || file.length === 0) {
      throw new ApiError(400, "File is required");
    }

    // send email to his dapartment
    EmitEvents.createEvent(
      SEND_EMAIL,
      {
        message: "Employee Help Request",
        email: req.user.email,
        req: req.files,
      },
      PRIORITY.OK
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { username: req.user.username },
          "Your reqest is initiated"
        )
      );
  }

  private static async getReport(req: Request, res: Response) {}

  private static async sendReport(req: Request, res: Response) {
    const { employeeId } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!employeeId || employeeId === undefined) {
      throw new ApiError(400, "Employee ID is required");
    }

    const data = req.files;

    if (!data) {
      throw new ApiError(400, "Data is required");
    }

    // send email to HR team with data attached
    EmitEvents.createEvent(
      SEND_EMAIL,
      { message: "Employee Data", email: "HR_email", req: req.files },
      PRIORITY.OK
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { username: req.user.username },
          "Data sharing initialized"
        )
      );
  }

  private static async attendance(req: Request, res: Response) {
    const { employeeId } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!employeeId || employeeId === undefined) {
      throw new ApiError(400, "Employee ID is required");
    }

    // can add a model to log attendence
    return res
      .status(200)
      .json(new ApiResponse(200, { isPresent: true }, "Attendence marked"));
  }

  private static async shareData(req: Request, res: Response) {
    const file = req.files;

    if (!file || file === undefined || file.length === 0) {
      throw new ApiError(400, "Data is not provided");
    }

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    const user = await prisma.employee.findFirst({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    // send email to HR team with data attached
    EmitEvents.createEvent(
      SEND_EMAIL,
      { message: "Employee Data", email: "HR_email", req: req.files },
      PRIORITY.OK
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { username: req.user.username },
          "Data shared successfully"
        )
      );
  }

  static addNewEmp = Employees.newEmpl;
  static EmpUp = Employees.updateEmpl;
  static removeEmp = Employees.removeEmploy;
  static getEmp = Employees.getEmploy;
  static helpReq = Employees.employHelpReq;
  static getReports = Employees.getReport;
  static sendReports = Employees.sendReport;
  static markAttendance = Employees.attendance;
  static DataSharing = Employees.shareData;
}
export { Employees };
