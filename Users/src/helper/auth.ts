import express, {Request, Response} from "express"
import JWT from "jsonwebtoken"
import  bcrypt from "bcrypt"
import crypto from "crypto"
import { rejects } from "assert"
import { ApiError } from "../utils/apiError"
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

    // private static async generateRandomToken<T extends string | object>(data:T, resettoken, resetTokenExpiry){
    //     const resetToken = crypto.randomBytes(42).toString("hex");
    //     this.passResetToken =  crypto.createHash("sha256").update(resetToken).digest("hex")
    //     this.passResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    //     console.log(resetToken, this.passResetExpires, this.passResetToken)
    //     return resetToken;
    // }

    private static async checkHashedKey(key:string, hashedKey:string): Promise<boolean>{
        return await bcrypt.compare(key, hashedKey)
    }
    
    static genJWT_Token = AuthServices.generate_JWT_Token
    static isKeyCorrect = AuthServices.checkHashedKey;

}

export {AuthServices}