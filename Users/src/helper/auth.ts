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
       // console.log(`Generated Reset Token: ${resetToken}`);
        const tokenWithTimestamp = resetToken+data+timestamp;
       // console.log(`Token with Timestamp: ${tokenWithTimestamp} ${typeof tokenWithTimestamp} last is typeof`);
        const hashedToken =  crypto.createHash("sha256").update(tokenWithTimestamp).digest("hex");
        //console.log(`Hashed Token: ${hashedToken} ${typeof hashedToken} last is typeof`);
        return hashedToken;
    }

    private static generateSimpleHash(input: string): string {
        // A simple hash function to ensure we get a deterministic token
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(16); // Convert hash to hex string
    }

    private static genCustomToken(byte: number, data: string, timestamp: string): string {
        // Simple token generation function
        let randomPart = '';
        for (let i = 0; i < byte; i++) {
            randomPart += String.fromCharCode(97 + Math.floor(Math.random() * 26)); // Generate random letters
        }
        console.log(`Generated Random Part: ${randomPart}`);

        const combined = randomPart + data + timestamp;
        console.log(`Combined String: ${combined}`);

        const hashedToken = this.generateSimpleHash(combined);
        console.log(`Custom Hashed Token: ${hashedToken}`);

        return hashedToken;
    }

    private static simpleHash(input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(16); // Convert hash to hex string
    }

    // Generate a deterministic token
    static generateDeterministicToken(data: string, timestamp: string): string {
        const staticString = "static-part"; // A predefined static string
        const combined = data + timestamp + staticString;
        return this.simpleHash(combined);
    }

    static genJWT_Token = AuthServices.generate_JWT_Token
    static isKeyCorrect = AuthServices.checkHashedKey;
    static getAuthToken = AuthServices.generateResetToken
    static randomToken = AuthServices.genRandomToken
    static customToken = AuthServices.genCustomToken
}

export {AuthServices}