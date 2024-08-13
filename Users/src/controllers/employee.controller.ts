import express, {Request, Response} from "express";
import prisma from "../helper/clientPrism";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import AsyncHandler from "../utils/asyncHandler";
import { EmployeeSchema } from "../models/zodValidation.schemas";
import { AuthServices } from "../helper/auth";
import UserService from "./user.controller";
import {newRequest} from "../types/express"
const roles =  ["HR" , "CEO" , "DIRECOR" ]

class Employees {
  private static async createEmployee(req: newRequest, res: Response): Promise<void> {

     if(!roles.includes(req.user.role) ){{
      throw new ApiError(401 , "You cannot create Employee")
     }}
    const validationResult = EmployeeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, `${validationResult.error.errors}`);
    }
    const Employee = await prisma.user.findFirst({
      where:{
          username: validationResult.data.userId,
      },
  })
  if(Employee){
      throw new ApiError(400, "Employee already exists");
  }

   
    const newEmployee = await prisma.employee.create({
      data :req.body
    });

    if(!newEmployee){
      throw new ApiError(400 , "Employee Creation Failed");
    }

    res.status(201).json(newEmployee);
  }
    
    
    private static async updateEmplSalary(req:newRequest, res:Response){
      if(!roles.includes(req.user.role) ){{
        throw new ApiError(401 , "You cannot update Employee")
       }}

      const update = req.body;
      
      const updateUser = await prisma.employee.update({
        where:{ 
             id: req.body?.id
     },
        data:{
          salary:update.salary
        }
     });
    if(updateUser){
        throw new ApiError(400, "Failed updating salary");
    }
  
      res.status(201).json(updateUser);;
    }

    private static async promoteEmploy(req:newRequest, res:Response){
      if(!roles.includes(req.user.role) ){{
        throw new ApiError(401 , "You cannot promote Employee")
       }}

       const{ position , positionDesc}= req.body;
       const updateUser = await prisma.employee.update({
        where:{ 
             id: req.body?.id
     },
        data:{
          position,
          positionDesc
        }
     })

    if(!updateUser){
      throw new ApiError(401 , "Failed to update position");
    } 

    res.status(200).json((updateUser));

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

    static newEmployee  = this.createEmployee;
    static UpdateSalary = this.updateEmplSalary
}
export {Employees}