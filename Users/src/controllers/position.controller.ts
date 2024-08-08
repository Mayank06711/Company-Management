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
class position {
  private static async positionRequest(req: Request, res: Response){
      
  }

  private static async getPosition(req: Request, res: Response){

  }

  private static async updatePosition(req: Request, res: Response){

  }
  private static async deletePosition(req: Request, res: Response){

  }

  private static async getPositionList(req: Request, res: Response){

  }

  private static async getPositionUsers(req: Request, res: Response){

  }






  static newPostion = position.positionRequest
}

export {position}