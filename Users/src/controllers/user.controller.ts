import {Request, Response, NextFunction} from "express"
// import {newRequest} from "../types/express"
import {Redis} from "ioredis"
import  prisma  from "../helper/clientPrism"
import  { middleware } from "../midlewares/middleware"
import {ApiError} from "../utils/apiError"
import {ApiResponse} from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandler"
import { AuthServices } from "../helper/auth"
import {sendEmail} from "../utils/emailHandler"
import {UserSchema, EmployeeSchema, PositionSchema, NotificationsSchema} from "../models/zodValidation.schemas"
// import {} from "../utils/eventEmitter"
import { newRequest} from "../types/express"

class UserService {
    // User-related methods go here

    private static async newUser(req: Request, res:Response){
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
            throw new ApiError(500, "Photo Upload failed please try again later")
        } 
        const newUser  = await prisma.user.create({
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


    private static async login(req: Request, res:Response){
        // Implementation for logging in a user
        const {username, email, password} = req.body;
        if(!username && !email){
            throw new ApiError(401, "Please enter a username or email");
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

    private static async logout(req:Request, res:Response){
        // Implementation for logging out a user
        if(!req.user?.id){
            throw new ApiError(401, "User id missing from request");
        }
        const user = await prisma.user.findFirst({
            where:{
                id:req.user.id
            }
        })
        if(!user){
            throw new ApiError(401, "User not found")
        }
        res.clearCookie("refreshToken").clearCookie("accessToken").status(200).json(new ApiResponse(200, {}, "Logged out successfully"))
    }

    private static async getUser(req:Request, res:Response){
        // Implementation for getting a user
        const user = await prisma.user.findFirst({
            where:{
                id:req.user?.id
            }
        })
        if(!user){
         throw new ApiError(404, "User not found")   
        }
        res.status(200).json(new ApiResponse(200, {id:user.id, name:user.name, email:user.email, role:user.role },"User found"))
    }

    private static async updateUser(req:Request, res:Response){
        // Implementation for updating a user
        const {name} = req.body
        if(!name || name === undefined){
           throw new ApiError(400,"Invalid input please enyter your correct name")
        }
        const file = req.files
        if(!file){
            const updateUser = await prisma.user.update({
               where:{ 
                    id: req.user?.id
            },
               data:{
                name:name
               }
            })
            res.status(200).json(new ApiResponse(200, {id:updateUser.id, name:updateUser.name}, "Your name is updated"))        
        }
        const result = await middleware.UploadFilesToCloudinary([file])
        console.log(result)
        if(!result){
            throw new ApiError(500,"There was an error uploading your photo, please try again")
        }
        const user = await prisma.user.update({
            where:{
                id:req.user?.id
            },
            data:{
                name:name,
                photo_url: result[0].url,
                photo_public_id: result[0].public_id
            },
            select:{
                id: true,
                name: true,
                email: true,
                role: true,
                photo_url: true,
                createdAt: true,
            }
        }) 
        if(!user){
            throw new ApiError(500,"There was an error updating your profile, please try again")
        }
        res.status(200).json(new ApiResponse(200, user, "Your profile is updated"))
    }

    private static async deleteUser(req:Request, res:Response){
        // Implementation for deleting a user 
        // only admins can delete
        if(req.user?.role !== "admin"){
            throw new ApiError(403, "You are not authorized to perform this action")
        }
        const {userId} = req.query
        // Ensure userId is provided and is a string
       if (!userId || typeof userId !== "string") {
            throw new ApiError(400, "Please provide a valid userId to delete from the database");
        }

        const user = await prisma.user.update({
            where:{
                id: userId
            },
            data:{
                active:false
            }
        })
        if(!user){
            throw new ApiError(404, "User not found")
        }
        res.status(200).json(new ApiResponse(200, user.id, "User id deactivated successfully"))
    }
   
    private static async enableMFA(req:Request, res:Response){
        // Implementation for enabling MFA
        const {MFAKey, password} = req.body;
        if(!MFAKey){
            throw new ApiError(400,"Please enter MFA key")
        }
        if(MFAKey.length < 6){
            throw new ApiError(406,"MFA key should be at least 6 characters long") // not acceptable error
        }
        const user = await prisma.user.findFirst({
            where:{
                id:req.user?.id
            }
        })
        if(!user){
            throw new ApiError(403, "No id matches with our database")
        }
        if(! await AuthServices.isKeyCorrect(password, user.password)){
            throw new ApiError(401, "Invalid password, can not enable MFA")
        }
        const updateUser = await prisma.user.update({
            where:{
                id:req.user?.id
            },
            data:{
                MFASecretKey: MFAKey,
                isMFAEnabled: true
            }
        })
        if(!updateUser){
            throw new ApiError(500, "Something went wrong try again")
        }
        // send noti to user as well as admin/his manager and ceo
        res.status(200).json(new ApiResponse(200, user.id , `Dear ${user.name} MFA is enabled on your account, save it for further login`))
    }

    private static async disableMFA(req:Request, res:Response){
        // Implementation for disabling MFA
        // only admins can disab
        const user = await prisma.user.findFirst({
            where:{
                id:req.user?.id,
            }
        })
        if(!user){
            throw new ApiError(404, "User not found")
        }
        if(user.role === "admin"){
            const updateUser = await prisma.user.update({
                where:{
                    id:req.user?.id
                },
                data:{
                    MFASecretKey: null,
                    isMFAEnabled: false
                }
            })
            if(!updateUser){
                throw new ApiError(500, "Something went wrong try again")
            }
            // send noti to user as well as admin/his manager and ceo
            res.status(200).json(new ApiResponse(200, user.id , `Dear ${user.name} MFA is disabled on your account`))
        
        }
        if(!user.isMFAEnabled){
            throw new ApiError(403, "MFA is not enabled on your account")
        }
        const updateUser = await prisma.user.update({
            where:{
                id:req.user?.id
            },
            data:{
                MFASecretKey: null,
                isMFAEnabled: false
            }
        })
        if(!updateUser){
            throw new ApiError(500, "Something went wrong try again")
        }
        // send noti to user as well as admin/his manager and ceo
        res.status(200).json(new ApiResponse(200, user.id , `Dear ${user.name} MFA is disabled on your account`))
    }

    private static async changePassword(req:Request, res:Response){
        // Implementation for changing a user's password
        const {oldPassword, newPassword} = req.body;
        if(!oldPassword || !newPassword){
            throw new ApiError(400,"Invalid input please enter your correct old and new password")
        }
        if(newPassword.length < 8){
            throw new ApiError(406,"Password should be at least 8 characters long") // not acceptable error
        }
        const user = await prisma.user.findFirst({
            where:{
                id:req.user?.id
            }
        })
        if(!user){
            throw new ApiError(404, "User not found")
        }
        if(!await AuthServices.isKeyCorrect(oldPassword, user.password)){
            throw new ApiError(401, "Invalid old password")
        }
        const updatedUser = await prisma.user.update({
            where:{
                id:req.user?.id
            },
            data:{
                password: newPassword
            }
        })
        if(!updatedUser){
            throw new ApiError(500, "Something went wrong try again")
       }
        res.status(200).json(new ApiResponse(200, {name:updatedUser.name, id: req.user?.id},"Password is updated"))
    }

    private static async sendEmailVerificationLink(req:Request, res:Response){
        // Implementation for sending a verification email
        // user will click on the verification link and he will be verified by token url has
        const {email} = req.body;
        if(!email){
            throw new ApiError(400,"Please enter your correct email")
        }
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(!user){
            throw new ApiError(404, "User not found")
        }
        const timestamp = Date.now().toString();
        const token = AuthServices.randomToken(28, user.email, timestamp);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const verificaonUrl = `${baseUrl}/verify-email?token=${token}&email=${user.email}&timestamp=${timestamp}`
        const emailOption = {
            email: user.email,
            subject: "Email Verification",
            message: `Click the link below to verify your email address which is valid only for 10 minutes \n \n \n  ${verificaonUrl} \n \n \n \n  If you did not requested this please ignore this email, or can complain at  support@xyz.com`
        }
       
        sendEmail(emailOption)
        // send verificaon email with token
        res.status(200).json(new ApiResponse(200, user.id, "Verification email sent successfully"))
    }

    private static async verifyEmail(req: Request, res: Response) {
        // Implementation for verifying a verification email
        const { token, email, timestamp } = req.query;
    
        if (!token || typeof token !== 'string') {
            return res.status(400).send('<html><body><h1 style="color: red;">Invalid verification link: Token is missing</h1></body></html>');
        }
    
        if (!email || typeof email !== 'string') {
            return res.status(400).send('<html><body><h1 style="color: red;">Invalid verification link: Email is missing or invalid</h1></body></html>');
        }
    
        if (!timestamp || typeof timestamp !== 'string') {
            return res.status(400).send('<html><body><h1 style="color: red;">Invalid verification link: Timestamp is missing</h1></body></html>');
        }
    
        const currentTime = Date.now().toString();
        const timeDifference = Math.abs(Number(currentTime) - Number(timestamp));
        const tenMinutesInMilliseconds = 10 * 60 * 1000;
    
        if (timeDifference > tenMinutesInMilliseconds) {
            return res.status(400).send('<html><body><h1 style="color: red;">Token has expired</h1></body></html>');
        }
    
        const originalToken = AuthServices.randomToken(28, email, timestamp);
    
        if (token !== originalToken) {
            return res.status(400).send('<html><body><h1 style="color: red;">Invalid token</h1></body></html>');
        }
    
        res.status(200).send('<html><body><h1 style="color: green;">Email Verified Successfully</h1></body></html>');
    }
    
    
    private static async forgotPassword(req:Request, res:Response){
        //Implementation for sending a password reset email
    }

    private static async resetPasswordWithToken(req:Request, res:Response){
        // Implementation for resetting a user's password with a token
    }

    static registerUser = asyncHandler.wrap(UserService.newUser);
    static loginUser = asyncHandler.wrap(UserService.login);
    static logoutUser = asyncHandler.wrap(UserService.logout);
    static whoAmI = asyncHandler.wrap(UserService.getUser);
    static updateYourProfile = asyncHandler.wrap(UserService.updateUser);
    static deleteYourAccount = asyncHandler.wrap(UserService.deleteUser);
    static enableTwoFactorAuth = asyncHandler.wrap(UserService.enableMFA);
    static disableTwoFactorAuth = asyncHandler.wrap(UserService.disableMFA);
    static changeYourPassword = asyncHandler.wrap(UserService.changePassword);
    static sendVerificationURLEmail = UserService.sendEmailVerificationLink;
    static verifyYourEmail = UserService.verifyEmail;
}

export default UserService;