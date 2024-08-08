import {Request ,Response, NextFunction } from "express";
import {newRequest} from "../types/express"
import JWT from "jsonwebtoken"
import {JwtPayload} from "jsonwebtoken"
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import prisma from "../helper/clientPrism";
import { User } from "@prisma/client";
import { ApiError } from "../utils/apiError";
import AsyncHandler from "../utils/asyncHandler";
import fs from "fs";
import path from 'path';



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
})

// console.log(process.env.CLOUDINARY_API_KEY, "cloudinary API key: ")
function getFormattedDate() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now
    .getDate()
    .toString()
    .padStart(2, '0')} ${now
    .getHours()
    .toString()
    .padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${now
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
}
class middleware {
    
    // Multer middleware method for single and multiple files
    private static multerUpload = multer({
        limits: {
          fileSize: 1024 * 1024 * 5, // 5mb
        },
    }); //  by default it will use our ram memory  to store files in buffer format  as we have not provided any location to store files
    
    private static singleFile = middleware.multerUpload.array("avatar", 1)
    private static attachmentsMulter = middleware.multerUpload.array("arrayFiles", 5)
    
    private static getBase64 = (file:any) =>`data:${file[0].mimetype};base64,${file[0].buffer.toString("base64")}`
    private static async uploadFilesToCloudinary(files: any[] = []){  
      if (!files || files.length === 0) {
        throw new Error("No files provided for upload");
     }

      const uploadPromises = files.map((file) => {
        if (!file) {
          console.error("Undefined file encountered:", file);
          return Promise.reject(new Error("Undefined file encountered"));
         }
            return new Promise((resolve, reject) => {
              cloudinary.uploader.upload(
                middleware.getBase64(file),
                {
                  resource_type: "auto",
                  public_id: uuid(),
                },
                (error, result) => {
                  if (error) {
                    console.log(error, "Upload failed");
                    return reject(error)};
                  resolve(result);
                }
              );
            });
          });
        
          try {
            const results = await Promise.all(uploadPromises);
            console.log(results, "\n --------------------------------->" )
            const formattedResults = results.map((result:any) => ({
              public_id: result.public_id,
              url: result.secure_url,
            }));
            return formattedResults;
          } catch (err:any) {
            console.log(err)
            throw new Error("Error uploading files to cloudinary");
          }
    }

    private static async verify_JWT(req: Request, res: Response, next: NextFunction) {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")[0]; // Extract the access token from cookies or headers
    
        if (!accessToken || accessToken.length === 0) {
            throw new ApiError(401, "Invalid Access Token")
        }
        let decodedToken:string|JwtPayload = JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!); // Verify and decode the access token
        
        if(typeof decodedToken === "string"){
          throw new ApiError(401, "Invalid Access Token")
        }
        const user = await prisma.user.findFirst({
            where: {
              OR:[
                {username: decodedToken.username},
                {id: decodedToken.id}
              ]
            },
            select: {
                id:true,
                email:true,
                isMFAEnabled: true, // Include the user's MFA status in the response
                active: true, // Include whether the user is active
                username: true, // Include the username
                role: true, // Include the user's role
            },
        });
    
        if (!user) {
           throw new ApiError(401, "Invalid access Token")
        }
    
        req.user = {id:user.id, role:user.role, username:user.username, isMFAEnabled:user.isMFAEnabled, email: user.email, active:user.active};
        next(); // Call the next middleware function or route handler
    } 


    // private static async verifyMFA(MFASecretKey: string, id: string) {
    //     const user = await prisma.user.findFirst({
    //         where:{
    //             id: id, // if not work try adding+
    //             isMFAEnabled: true,
    //         },
    //         select: {
    //             MFASecretKey: true
    //         },
    //     });
    //     if(!user){
    //         return false
    //     }
    //    // Compare the provided MFASecretKey with the stored one
    //     const verified = await bcrypt.compare(MFASecretKey, user.MFASecretKey);

    //     return verified;
    // }

    // private static async isMFAEnabled(req:Request, res:Response, next:NextFunction):Promise<void>{ // we may have to remove promise any
    //     if (!req.user?.isMFAEnabled) {
    //     next()
    //     }
    //     else {
    //         const { MFASecretKey } = req.body
    //         if(!MFASecretKey){
    //             res.status(401).json({message: "Two-factor authentication (MFA) is required"})
    //             return;
    //         }
    //         const isValid = await middleware.verifyMFA(MFASecretKey, req.user.id);
    //         if(isValid){
    //             next()
    //         }
    //         else {
    //             res.status(401).json({message: "Invalid two-factor authentication (MFA) code"})
    //         }
    //     }
    // }



    // private static isAdmin(req:Request, res:Response, next:NextFunction) {
    //     const {role} = req.user.role;
    //     const originalUrl = req.originalUrl
    //     if(role === "admin" && req.originalUrl.startsWith("/admin")){
    //         // i do have another logic apache kafka later
    //         next()
    //     }
    //     else{
    //         // apache kafka used here
    //         res.status(401).json({message: "You are not authorized to access this resource"}) // throwing erro instead of thus
    //     }
    // }

  
    // private static isPayment(req:Request, res:Response, next:NextFunction) {
    //     const protocol = req.protocol // http or htttps
    //     const hostname = req.hostname
    //     const originalUrl = req.originalUrl
    //     // Construct the full URL
    //     const fullUrl = `${protocol}://${hostname}${originalUrl}`;
    //     if (originalUrl.startsWith('/payment')) {
    //         // If the path matches the '/payment' pattern, i do have a logic 
    //         next();
    //     } else {
    //         // If the path doesn't match, send a 403 Forbidden response
    //         res.status(403).json({ message: "Access denied. This route is for payment only." });
    //     }
    // }

      private static  Active(req:Request, res:Response, next:NextFunction){
        if (req.user?.active) {
            // console.log(req.user.active, "i am loggin in")
            next()
        } else {
          // console.log(req, "i am loggin in")
            //  return res.status(401).json({ message: "You are not authorized to access this resource" });
            throw new ApiError(401, "You are not authorized to access this resource")
        }
      }

    
   
   
    private static errorMiddleware(err:any, req:Request, res:Response, next:NextFunction) {
        err.message ||= "Internal Server Error, please try again later"
        const statusCode = err.statusCode || 500

        console.error(`Error: ${err}`); // apierror
        
         // Log the error to a file with a timestamp
         const logMessage = `${getFormattedDate()} - Error: ${err.message}\n${
         err.stack
        }\npathname: ${req.path} statusCode: ${statusCode} \n\n`;
        const logFilePath = path.join(__dirname, '../../logs', 'error.log');

         // Ensure the logs directory exists
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
        //Create the logs directory if it does not exist, using recursive: true to ensure all parent directories are created as well
         // Append the error log to the file
        fs.appendFileSync(logFilePath, logMessage);

        res.status(statusCode).json({ 
            sucess:false,
            message:err.message
            // message: process.env.NODE_ENV.trim() === "DEVELOPMENT" ? err: err.message // here i will use apiError class  
        }); 
    }

    // Expose the private methods as static methods wrapped in AsyncHandler so that erros can be catched
    static SingleFile = middleware.singleFile;
    static AttachmentsMulter = middleware.attachmentsMulter;
    static UploadFilesToCloudinary = middleware.uploadFilesToCloudinary;
    static VerifyJWT =  AsyncHandler.wrap(middleware.verify_JWT);
    static isActive  = middleware.Active;
    // static IsMFAEnabled = AsyncHandler.wrap(middleware.isMFAEnabled);
    // static IsAdmin = AsyncHandler.wrap(middleware.isAdmin);
    // static IsPayment = AsyncHandler.wrap(middleware.isPayment);
    static ErrorMiddleware = middleware.errorMiddleware;
}





// const uploadFilesToCloudinary = async (files = []) => {
//     const uploadPromises = files.map((file) => {
//       return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(
//           middleware.getBase64(file),
//           {
//             resource_type: "auto",
//             public_id: uuid(),
//           },
//           (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//           }
//         );
//       });
//     });
  
//     try {
//       const results = await Promise.all(uploadPromises);
  
//       const formattedResults = results.map((result) => ({
//         public_id: result.public_id,
//         url: result.url,
//       }));
//       return formattedResults;
//     } catch (err) {
//       throw new Error("Error uploading files to cloudinary", err);
//     }
//   };

export  {middleware}

                       // above class implements encapsulation and abstraction of OOPs and maintain
//const result = await uploadFilesToCloudinary([file]);

// we can execute static method using instance if we have used static method i contructor itself using class name or this.contrutor.staticMethodName
// when class instance is created constructor is automatically called
// static we can not use static method when new instance of that calss is created, these are called using the class itself , mostly used to create utility functions, these are bound to class itself 
// super() keyword is used to send something to a class which has been extended and that class contructor uses this keyword and set value

/*
Use of getBase64 in Relation to Multer Configuration
Multer and File Handling:

Default Behavior: When you configure Multer without specifying a storage destination (diskStorage), it stores uploaded files in memory (memoryStorage). This means files are held in RAM as buffers.
Buffer Data: The file object passed to getBase64 contains this buffered data (file.buffer), which represents the file's content in binary format.
Purpose of getBase64:

Transformation Requirement: Since Multer stores files in memory (buffered format) by default, but services like Cloudinary typically require files in Base64 format for efficient handling and processing, getBase64 is used.
Conversion: It converts the buffered binary data (file.buffer) into a Base64-encoded string (data:${file.mimetype};base64,${base64String}). This conversion ensures that the file data can be easily passed to Cloudinary or any other service that expects files in this format.
Integration with Cloudinary:

Cloudinary's Requirement: Cloudinary accepts files in Base64 format for direct upload or processing. By using getBase64, you prepare the uploaded file data in a compatible format before sending it to Cloudinary's APIs.
Efficient Handling: Base64-encoded strings are text-based and include metadata (like MIME type), making them suitable for transmission over networks and storage in databases.
Conclusion
getBase64 bridges the gap between Multer's default behavior (storing files in memory as buffers) and the requirements of services like Cloudinary (which often prefer files in Base64 format). It ensures compatibility and efficient handling of file uploads within your application, facilitating seamless integration with external services that operate on file data in Base64 format.
*/