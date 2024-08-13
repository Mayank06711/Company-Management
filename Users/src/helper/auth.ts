import express, {Request, Response} from "express"
import JWT from "jsonwebtoken"
import  bcrypt from "bcrypt"
import crypto from "crypto"
import { ApiError } from "../utils/apiError"
import prisma from "./clientPrism"
import AsyncHandler from "../utils/asyncHandler"
class AuthServices {

    private static async generate_JWT_Token<T extends string | object>(payload: T, secretToken: string, expiry: string): Promise<string> {
         try {
            return await JWT.sign(payload, secretToken, {expiresIn: expiry})
         } catch (e) {
            if (typeof e === "string") {
                 throw new ApiError(500, `Token could not be generated ${e}`)
            } else if (e instanceof Error) {
                throw new ApiError(500, `Token could not be generated ${e.message}`)
            }
            else throw new ApiError(500, `Token could not be generated ${e}`)
         }
    }

    private static async generateResetToken<T extends string | object>(data:T){
       try {
         const user = await prisma.user.findFirst({
             where:{
                 email: data, 
             }
         })
         if(!user) throw new ApiError(404, `User could not be found with email ${data}`)
         const resetToken = crypto.randomBytes(42).toString("hex");
         user.passwordResetToken =  crypto.createHash("sha256").update(resetToken).digest("hex")
         user.passwordResetExpires =new  Date(Date.now() + 10 * 60 * 1000);  // 10 minutes from now
         // console.log(resetToken, this.passResetExpires, this.passResetToken)
         await prisma.user.update({
             where:{
                 id: user.id,
             },
             data: {
                 passwordResetToken: user.passwordResetToken,
                 passwordResetExpires: user.passwordResetExpires,
             }
         })
         return resetToken;
       } catch (e) {
        if (typeof e === "string") {
             throw new ApiError(500, `ResetToken could not be generated ${e}`)
        } else if (e instanceof Error) {
            throw new ApiError(500, `Token could not be generated ${e.message}`)
        }
        else throw new ApiError(500, `Token could not be generated ${e}`)
     }
    }

    private static async checkHashedKey(key:string, hashedKey:string): Promise<boolean>{
        return await bcrypt.compare(key, hashedKey)
    }
    
    private static genRandomToken(byte: number, data: string, timestamp: string): string {
        const resetToken = crypto.randomBytes(byte).toString("hex");
        const tokenWithTimestamp = resetToken + data + timestamp;
        return crypto.createHash("sha256").update(tokenWithTimestamp).digest("hex");
    }
    static genJWT_Token = AuthServices.generate_JWT_Token
    static isKeyCorrect = AuthServices.checkHashedKey;
    static getAuthToken = AuthServices.generateResetToken
    static randomToken = AuthServices.genRandomToken
}

export {AuthServices}