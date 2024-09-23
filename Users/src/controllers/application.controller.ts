import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { ApplicantionSchema } from "../models/zodValidation.schemas";
import prisma from "../helper/clientPrism";
import { position } from "./position.controller";
import AsyncHandler from "../utils/asyncHandler";

class ApplicationService {
    

    private static async createApplication(req: Request, res: Response){
        const appRes =  ApplicantionSchema.safeParse(req.body)
        if(!appRes.success){
            throw new ApiError(400, "Invalid application data");
        }
        const existApp = await prisma.applicantion.findFirst({
            where:{
                phoneNum:appRes.data.phoneNum
            }
        })
        if(existApp){
            throw new ApiError(400, "Application with this phone number already exist");
        }

        const positionRes = await position.getPositionById(appRes.data.positionId)
        if(!positionRes){
             throw new ApiError(404, "Position not found");
        }
        if(positionRes.vacancy === 0){
            throw new ApiError(400, "Vacancy is full for this position ");
        }
        const application = await prisma.applicantion.create({
            data: {
                  phoneNum:appRes.data.phoneNum!,
                  applicantDesc:appRes.data.applicantDesc,
                  positionId:appRes.data.positionId,
                  type:appRes.data.type,
                  isActive:true
                }
        })

        const formattedResults = {phoneNum:application.phoneNum, applicantDesc:application.applicantDesc,type:application.type, vacany:positionRes.vacancy}
        res.status(201).json(new ApiResponse(201,formattedResults, "Application completed"));
    }

    private static async getAllApplicationsActiveOrInactive(req: Request, res: Response){
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const applications = await prisma.applicantion.findMany({
            where:{
                isActive:isActive
            }
        })
        if(applications.length === 0){
            throw new ApiError(404, "No active applications found");
        }
        const formattedResults = applications.map(app => ({phoneNum:app.phoneNum, applicantDesc:app.applicantDesc, type:app.type}))
        res.status(200).json(new ApiResponse(200,formattedResults, "Active applications retrieved"));
    }

    private static async getApplicationByPhoneNum(req: Request, res: Response){
        const { phoneNum } = req.params;
        const application = await prisma.applicantion.findFirst({
            where:{
                phoneNum:+phoneNum as number
            }
        })
        if(!application){
             throw new ApiError(404, "Application not found");
        }
        const formattedResults = {phoneNum:application.phoneNum, applicantDesc:application.applicantDesc, type:application.type}
        res.status(200).json(new ApiResponse(200,formattedResults, "Application retrieved"));
    }

    private static async updateApplicationStatus(req: Request, res: Response){
        const { phoneNum } = req.params;
        const { isActive } = req.body;
        const application = await prisma.applicantion.findFirst({
            where:{
                phoneNum:+phoneNum as number
            }
        })
        if(!application){
             throw new ApiError(404, "Application not found");
        }
        await prisma.applicantion.update({
            where:{
                phoneNum:+phoneNum as number
            },
            data: {
                isActive:isActive
            }
        })
        res.status(200).json(new ApiResponse(200, {phoneNum:phoneNum, isActive:isActive}, "Application status updated"));
    }


    private static async deleteApplication(req: Request, res: Response){
        const { phoneNum } = req.params;
        const application = await prisma.applicantion.findFirst({
            where:{
                phoneNum:+phoneNum as number
            }
        })
        if(!application){
             throw new ApiError(404, "Application not found");
        }
        await prisma.applicantion.delete({
            where:{
                phoneNum:+phoneNum as number
            }
        })
        res.status(200).json(new ApiResponse(200, {phoneNum:phoneNum}, "Application deleted"));
    }


    static newApp = AsyncHandler.wrap(ApplicationService.createApplication)
    static getAllApps = AsyncHandler.wrap(ApplicationService.getAllApplicationsActiveOrInactive)
    static getAppByPhoneNum = AsyncHandler.wrap(ApplicationService.getApplicationByPhoneNum)
    static updateAppStatus = AsyncHandler.wrap(ApplicationService.updateApplicationStatus)
    static deleteApp = AsyncHandler.wrap(ApplicationService.deleteApplication)

}

export default ApplicationService;