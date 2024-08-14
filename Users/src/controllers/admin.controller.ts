import {Request, Response, NextFunction} from "express"
// import {newRequest} from "../types/express"
import {Redis} from "ioredis"
import  prisma  from "../helper/clientPrism"
import  { middleware } from "../midlewares/middleware"
import {ApiError} from "../utils/apiError"
import {ApiResponse} from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandler"
import { AuthServices } from "../helper/auth"
import {sendEmails} from "../utils/emailHandler"
import {UserSchema, EmployeeSchema, PositionSchema, NotificationsSchema} from "../models/zodValidation.schemas"
// import {} from "../utils/eventEmitter"
import { newRequest} from "../types/express"
import EmitEvents from "../utils/eventEmitter"
import { EMAIL_FAILED, EMAIL_VERIFY, OK_EMAIL_SENT, PRIORITY } from "../constant"
import { time } from "console"


class admin {
    private static async adminsLogin(req: Request, res:Response){
        // Implementation for logging in a user
        const {username, email, password, adminKey} = req.body;
        if(!username && !email){
            throw new ApiError(401, "Please enter a username or email");
        }

        if(!adminKey){ //!adminKey (this is a falsy condtion check which is same as) adminKey.length === 0 || adminKey === undefined || adminKey === null ||  adminKey === NaN || adminKey === false || adminKey === 0
            throw new ApiError(401, "Please enter admin key, or if forgot you adminKey head to get your adminKey");
        }
        if(adminKey !== process.env.ADMIN_SECRET_KEY){
            throw new ApiError(401, "Invalid admin key try again or if forgot you adminKey head to get your adminKey");
        }

        const user = await prisma.user.findFirst({
            where:{
                OR:[
                {username: username},
                {email:email}
            ]},
        })
        if(!user){
            throw new ApiError(404, "User not found");
        }
        
        if(!user.emailVerified){
            throw new ApiError(401, "Please verify your email first");
        }
        
        if(!await AuthServices.isKeyCorrect(password, user.password)){
            throw new ApiError(401, "Invalid password");
        }
        
        const {id, name, role, isMFAEnabled, photo_url,  createdAt} = {...user}
        
        console.log(typeof +process.env.ACCESS_TOKEN_EXPIRY!)
        const accessToken = await AuthServices.genJWT_Token({id, role, username, email }, process.env.ACCESS_TOKEN_SECRET!, process.env.ACCESS_TOKEN_EXPIRY!)  // + sign to convert into number
        const refreshToken = await AuthServices.genJWT_Token({id, role, username }, process.env.REFRESH_TOKEN_SECRET!, process.env.REFRESH_TOKEN_EXPIRY!)  // + sign to convert into number
        
        const options = {
            httpOnly:true,
            secure:true,
            sameSite:"Strict",
        }

        if(isMFAEnabled){
            const {MFAKey} = req.body;
            if(!MFAKey){
                throw new ApiError(401, "Please enter MFA key, or if forgot you MKAKey meet your department head to get your MFAkey");
            }
            // implement MFA verification logic
            if(!await AuthServices.isKeyCorrect(MFAKey, user.MFASecretKey!)){
                throw new ApiError(401, "Invalid MFA key try again or if forgot you MKAKey meet your department head to get your MFAkey");
            }

            res.status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", refreshToken)
            .json(new ApiResponse(200, { id, name, role, photo_url, isMFAEnabled, createdAt}, "Login successful"))
        
        }
        else{
            
            res.status(200)
           .cookie("accessToken", accessToken)
           .cookie("refreshToken", refreshToken)
           .json(new ApiResponse(200, { id, name, role, photo_url,isMFAEnabled, createdAt}, "Login successful"))
        }
        
    }

    private static async UpdateRole(req: Request, res: Response){
        const {userId} =  req.params;
        console.log(userId)
        if(!userId){
            throw new ApiError(400, "Please provide userId");
        }
        const {role, adminKey} = req.body;
        if(!role){
            throw new ApiError(400, "Please provide role you are trying to update");
        }
        if(!adminKey){
            throw new ApiError(400, "Please your admin key");
        }
        
        if(adminKey !== process.env.ADMIN_SECRET_KEY){
            throw new ApiError(401, "Invalid admin key, try with original adminkey");
        }
        const user = await prisma.user.findFirst({
            where:{
                id: userId
            },
            select:{
                role:true,
                username:true
            }
        })
        if(!user){
            throw new ApiError(404, "User not found");
        }

        if(user.role === role){
            throw new ApiError(403, "Please enter your new role, entered role is same as your current role");
        }

        if(role !== "Director" && role !== "CEO"){
            console.log(role, typeof role === "string"   )
            throw new ApiError(403, "You can only update role to Director or CEO");
        }

        await prisma.user.update({
            where:{
                id: userId
            },
            data:{
                role: role
            }
        })
        res.status(200)
       .json(new ApiResponse(200, { username: user.username }, "Role updated successfully"))
    }



    static Login  = asyncHandler.wrap(admin.adminsLogin)
    static updateRole = asyncHandler.wrap(admin.UpdateRole)
}

export default admin;