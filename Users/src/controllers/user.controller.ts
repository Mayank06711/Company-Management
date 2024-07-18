import {Request, Response, NextFunction} from "express"
import JWT from "jsonwebtoken"
import  bcrypt from "bcrypt"
import {Redis} from "ioredis"
import  prisma  from "../helper/clientPrism"
import  { middleware } from "../middlewares/middleware"
import {ApiError} from "../utils/apiError"
import {ApiResponse} from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandler"
import {sendEmail} from "../utils/emailHandler"
import {UserSchema, EmployeeSchema, PositionSchema, NotificationsSchema} from "../models/zodValidation.schemas"
// import {} from "../utils/eventEmitter"

class UserService {
    // User-related methods go here
    private static async generateRefreshAndAccessToken(req:Request, res:Response){
        // Implementation for generating a MFA token
    }
    private static async newUser(req:Request, res:Response){
        // Implementation for registering a user
        const result = UserSchema.safeParse(req.body); //  result = {success: true/false,data:{req.body}}
        if(!result.success){
            console.log(result.error)
            throw new ApiError(401, result.error.toString());
        }
        console.log(result.data)
        const user = await prisma.user.findFirst({
            where:{
                username: result.data.username,
            },
        })
        if(user){
            throw new ApiError(400, "User already exists");
        }
        const avatar = req.files // user photo if he want to
        if(!avatar){
           console.log(avatar, "Avatar already  not given")
        }
        const uploadedResult = await  middleware.UploadFilesToCloudinary([avatar]) // upload avatar to cloudinary if exists
        if(!uploadedResult){
            throw new ApiError(404, "Photo Upload failed please try again later")
        } 
        const newUser = await prisma.user.create({
            data:{
                ...result.data,
                photo_url: uploadedResult[0].url,          
                photo_public_id:uploadedResult[0].public_id
            }
        })
        if(!newUser){
            throw new ApiError(500, "User creation failed please try again later")
        }
        const formattedResult = {
                              id: newUser.id,
                              name: newUser.name,
                              email: newUser.email,
                              username: newUser.username,
                              photo_url: newUser.photo_url,          
                              role: newUser.role,
                            }
        res
        .status(201)
        .json(new ApiResponse(201, formattedResult, "Congratualtion you account is created"))
    }
    private static async loginUser(req:Request, res:Response){
        // Implementation for logging in a user
    }
    private static async getUser(req:Request, res:Response){
        // Implementation for getting a user
    }
    private static async updateUser(req:Request, res:Response){
        // Implementation for updating a user
    }
    private static async deleteUser(req:Request, res:Response){
        // Implementation for deleting a user
    }
   
    private static async verifyMFAToken(req:Request, res:Response){
        // Implementation for verifying a MFA token
    }
    private static async enableMFA(req:Request, res:Response){
        // Implementation for enabling MFA
    }
    private static async disableMFA(req:Request, res:Response){
        // Implementation for disabling MFA
    }
    private static async changePassword(req:Request, res:Response){
        // Implementation for changing a user's password
    }
    private static async resetPassword(req:Request, res:Response){
        // Implementation for resetting a user's password
    }
    private static async sendVerificationEmail(req:Request, res:Response){
        // Implementation for sending a verification email
    }
    private static async verifyVerificationEmail(req:Request, res:Response){
        // Implementation for verifying a verification email
    }
    private static async forgotPassword(req:Request, res:Response){
        // Implementation for sending a password reset email
    }
    private static async resetPasswordWithToken(req:Request, res:Response){
        // Implementation for resetting a user's password with a token
    }

    static registerUser = asyncHandler.wrap(UserService.newUser);
}

export default UserService;