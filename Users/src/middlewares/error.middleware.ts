import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken"
import bcrypt from "bcrypt"
import multer from "multer"
import AsyncHandler from "../utils/asyncHandler"
import prisma from "../helper/clientPrism";
class middleware {
    
    // Multer middleware for single and multiple files
    private static multerUpload = multer({
        limits: {
          fileSize: 1024 * 1024 * 5, // 5mb
        },
    }); //  by default it will use our ram memory  to store files in buffer format  as we have not provided any location to store files
    static singleFile = middleware.multerUpload.single("singleFile")
    static attachmentsMulter = middleware.multerUpload.array("arrayFiles", 5)

    // auth middleware function
    static async verifyJWT(req: Request, res: Response, next: NextFunction) {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")[0]; // Extract the access token from cookies or headers
    
        if (!accessToken) {
            // Handle error if access token is missing
            // Typically, you would return an error response or call the 'next' function with an error
            // For example: return res.status(401).json({ message: 'No access token provided' });
            // Or: return next(new Error('No access token provided'));
        }
    
        const decodedToken = JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // Verify and decode the access token
    
        const user = await prisma.User.findFirst({
            where: {
                id: decodedToken?.id, // Find the user based on the decoded token's ID
            },
            select: {
                isMFAEnabled: true, // Include the user's MFA status in the response
                active: true, // Include whether the user is active
                username: true, // Include the username
                role: true, // Include the user's role
            },
        });
    
        if (!user) {
            // Handle error if user is not found based on the decoded token
            // Typically, you would return an error response or call the 'next' function with an error
            // For example: return res.status(404).json({ message: 'User not found' });
            // Or: return next(new Error('User not found'));
        }
    
        req.user = user; // Attach the user object to the request object for further use in the route handler
        next(); // Call the next middleware function or route handler
    }

    static async verifyMFA(MFASecretKey: string, id: string) {
        const user = await prisma.User.findFirst({
            where:{
                id: id, // if not work try adding+
                isMFAEnabled: true,
            },
            select: {
                MFASecretKey: true
            },
        });
        if(!user){
            return false
        }
       // Compare the provided MFASecretKey with the stored one
        const verified = await bcrypt.compare(MFASecretKey, user.MFASecretKey);

        return verified;
    }

    static async isMFAEnabled(req:Request, res:Response, next:NextFunction) {
        if (!req.user?.isMFAEnabled) {
        next()
        }
        else {
            const { MFASecretKey } = req.body
            if(!MFASecretKey){
                return res.status(401).json({message: "Two-factor authentication (MFA) is required"})
            }
            const isValid = await middleware.verifyMFA(MFASecretKey, req.user.id);
            if(isValid){
                next()
            }
            else {
                return res.status(401).json({message: "Invalid two-factor authentication (MFA) code"})
            }
        }
    }
    

    // chech if admin or not
    static isAdmin(req:Request, res:Response, next:NextFunction) {
        const {role} = req.user.role;
        const originalUrl = req.originalUrl
        if(role === "admin" && req.originalUrl.startsWith("/admin")){
            // i do have another logic apache kafka later
            next()
        }
        else{
            // apache kafka used here
            return res.status(401).json({message: "You are not authorized to access this resource"})
        }
    }

    // check if payment request
    static isPayment(req:Request, res:Response, next:NextFunction) {
        const protocol = req.protocol // http or htttps
        const hostname = req.hostname
        const originalUrl = req.originalUrl
        // Construct the full URL
        const fullUrl = `${protocol}://${hostname}${originalUrl}`;
        if (originalUrl.startsWith('/payment')) {
            // If the path matches the '/payment' pattern, i do have a logic 
            next();
        } else {
            // If the path doesn't match, send a 403 Forbidden response
            res.status(403).json({ message: "Access denied. This route is for payment only." });
        }
    }

    // for all error
    static errorMiddleware(err, req, res, next) {
        err.message ||= "Internal Server Error, please try again later"
        const statusCode = err.statusCode || 500

        console.error(`Error: ${error}`);
        res.status(statusCode).json({ 
            sucess:false,
            message: process.env.NODE_ENV.trim() === "DEVELOPMENT" ? err: err.message // here i will use apiError class  
        });
    }

}

// const uploadFilesToCloudinary = async (files = []) => {
//     const uploadPromises = files.map((file) => {
//       return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(
//           getBase64(file),
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
//         url: result.secure_url,
//       }));
//       return formattedResults;
//     } catch (err) {
//       throw new Error("Error uploading files to cloudinary", err);
//     }
//   };


//const result = await uploadFilesToCloudinary([file]);

//export const getBase64 = (file) =>`data:${file.mimetype};base64,${file.buffer.toString("base64")}`;


const attachmentsMulter = multerUpload.array("files", 5);

export { attachmentsMulter };