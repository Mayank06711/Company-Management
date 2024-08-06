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
    private static async newEmpl(req:Request, res:Response){
    
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