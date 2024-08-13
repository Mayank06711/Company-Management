import express, {Request, Response} from "express";
import prisma from "../helper/clientPrism";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import AsyncHandler from "../utils/asyncHandler";
import { EmployeeSchema } from "../models/zodValidation.schemas";
import { AuthServices } from "../helper/auth";
import UserService from "./user.controller";
import {newRequest} from "../types/express"


class Employees {
    private static async createEmployee(req: Request, res: Response): Promise<void> {
        const validationResult = EmployeeSchema.safeParse(req.body);
    
        if (!validationResult.success) {
            throw new ApiError(400 , `${validationResult.error.errors}`);
        }
    
        const {
          phoneNum,
          positionDesc,
          departmentId,
          joinedAt,
          salary,
          isActive,
          userId,
          positionId,
          projectId,
        } = validationResult.data;
    
        const newEmployee = await prisma.employee.create({
          data: {
            phoneNum,
            positionDesc,
            departmentId,
            joinedAt: joinedAt ? new Date(joinedAt) : undefined,
            salary,
            isActive,
            userId,
            positionId,
            projectId,
          },
        });
    
        res.status(201).json(newEmployee);
      }
    
    
    private static async updateEmpl(req:Request, res:Response){
        
    }

    private static async promoteEmploy(req:Request, res:Response){
        
    }
    
    private static async removeEmploy(req:Request, res:Response){

    }

    private static async getEmploy(req:Request, res:Response){

    }

    private static async employHelpReq(req:Request, res:Response){

    }

    private static async reportAbuse(req:Request, res:Response){

    }

    private static async generateReport(req:Request, res:Response){

    }

    private static async getReport(req:Request, res:Response){

    }

    private static async sendReport(req:Request, res:Response){

    }

    private static async scheduleMeetup(req:Request, res:Response){

    }

    private static async attendance(req:Request, res:Response){

    }

    private static async readonlyTeams(req:Request, res:Response){

    }

    private static async reqLeave(req:Request, res:Response){

    }

    private static async shareData(req:Request, res:Response){

    }

    
}
export {Employees}