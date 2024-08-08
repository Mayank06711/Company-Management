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


class Employees {
  private static async newEmpl(req: Request, res: Response) {
    // Check if the user is authenticated
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const existingEmploy = await prisma.employee.findFirst({
      where: { id: req.user?.id },
    })

    if(existingEmploy){
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
        throw new ApiError(400,parsedEmployee.error);
      }
    }
    // Check if the user has the required permissions to create a new employee
    if (
      req.user?.role !== "Director" &&
      req.user?.role !== "CEO" &&
      req.user?.role !== "HR"
    ) {
      throw new ApiError(403, "You are not allowed to create a new employee")
    }
    
    // Check if the department exists
    const department = await DepartmentService.getDepartmentById(
      parsedEmployee.data.departmentId
    );
    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    // position of the employee
    const position = await prisma.position.findFirst({
      where: {id: parsedEmployee.data.positionId},
    });

    if (!position) {
      throw new ApiError(404, "Position not found");
    }
    
    if(position.vacancy === 0){
      throw new ApiError(400, "Vacancy is full for this position ");
    }

    const newEmpl = await prisma.employee.create({
      data: {
        phoneNum: parsedEmployee.data.phoneNum!,
        positionDesc: parsedEmployee.data.positionDesc,
        salary:parsedEmployee.data.salary,
        isActive:true,
        departmentId: parsedEmployee.data.departmentId, // directly assign the string id
        positionId: parsedEmployee.data.positionId, // directly assign the string id
        userId: req.user?.id, // make sure to set the userId if it's required
      },
    });

    if(!newEmpl){
      throw new ApiError(500, "Failed to create new employee data in our database");
    }
    
    const formattedResults = {id: newEmpl.id, userID: newEmpl.userId, position: position.name, department: department.name, salary: newEmpl.salary, joinedAt: newEmpl.joinedAt}
    // send email to user with his data on his email further

    res
      .status(201)
      .json(new ApiResponse(201, {formattedResults}, "Employee created successfully"));
  }

  private static async updateEmpl(req: Request, res: Response) {
        const {employeeId, salary, positionId, departmentId} =  req.body

        if (!req.user) {
          throw new ApiError(401, "Unauthorized");
        }

        // Check if the user has the required permissions to update employee data
        if (
          req.user?.role!== "Director" &&
          req.user?.role!== "CEO" &&
          req.user?.role!== "HR"
        ) {
          throw new ApiError(403, "You are not allowed to update employee data");
        }
        
        const employee = await prisma.employee.findFirst({
          where: { id: employeeId, userId: req.user?.id },
        });
        
        if (!employee) {
          throw new ApiError(404, "Employee not found");
        }

        // Check if the department exists
        const department = await DepartmentService.getDepartmentById(
          departmentId
        );
        if (!department) {
          throw new ApiError(404, "Department not found");
        }

        // position of the employee
        const position = await prisma.position.findFirst({
          where: {id: positionId},
        });

        if (!position) {
          throw new ApiError(404, "Position not found");
        }

        if(position.vacancy === 0){
          throw new ApiError(400, "Vacancy is full for this position ");
        }

        const updatedEmployee = await prisma.employee.update({
          where: { id: employeeId },
          data: { salary, positionId, departmentId },
        });

        if (!updatedEmployee) {
          throw new ApiError(500, "Failed to update employee data in our database");
        }
        
        const formattedResults = {id: updatedEmployee.id, userID: updatedEmployee.userId, position: position.name, department: department.name, salary: updatedEmployee.salary, joinedAt: updatedEmployee.joinedAt}
        // send email to user with his updated data on his email further
        
        res
      .status(200)
      .json(new ApiResponse(200, {formattedResults}, "Employee updated successfully"));
  }

  private static async removeEmploy(req: Request, res: Response) {
    const { employeeId } = req.body;
    
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if(!employeeId || employeeId === undefined){
      throw new ApiError(400, "Employee ID is required");
    }
    
    // Check if the user has the required permissions to remove employee data
    if (
      req.user?.role!== "Director" &&
      req.user?.role!== "CEO" &&
      req.user?.role!== "Manager"
    ) {
      throw new ApiError(403, "You are not allowed to remove employee data");
    }

    const result = await prisma.employee.update({
      where: { id: employeeId },
      data: { isActive: false },
    })
    
    if (!result) {
      throw new ApiError(500, "Failed to remove employee data in our database");
    }
    //send noti to employee
    res
     .status(200)
     .json(new ApiResponse(200, {employeeId}, "Employee removed successfully"));
  }

  private static async getEmploy(req: Request, res: Response) {
    const { employeeId } = req.params;
    
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    
    if(!employeeId || employeeId === undefined){
      throw new ApiError(400, "Employee ID is required");
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId },
      select: {
        id: true,
        phoneNum: true,
        salary:true,
        joinedAt:true,
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
    
    const formattedResults = {id: employee.id, userID: employee.user.id, position: employee.position.name, department: employee.department.name, salary: employee.salary, joinedAt: employee.joinedAt}
    res
     .status(200)
     .json(new ApiResponse(200, {formattedResults}, "Employee retrieved successfully"));
  }

  private static async employHelpReq(req: Request, res: Response) {
    const file  = req.files;
    
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if(!file || file === undefined || file.length === 0){
      throw new ApiError(400, "File is required");
    }

    // send email to his dapartment

    

  }


  private static async reportAbuse(req: Request, res: Response) {}

  private static async generateReport(req: Request, res: Response) {}

  private static async getReport(req: Request, res: Response) {}

  private static async sendReport(req: Request, res: Response) {}

  private static async scheduleMeetup(req: Request, res: Response) {}

  private static async attendance(req: Request, res: Response) {}

  private static async readonlyTeams(req: Request, res: Response) {}

  private static async shareData(req: Request, res: Response) {
     const file = req.files

     if(!file || file === undefined || file.length === 0){
      throw new ApiError(400, "Data is not provided")
     }

     const {email} = req.user?.email

     
  }
}
export { Employees };
