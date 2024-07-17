import express,{Request, Response} from "express"
import {AWS_SERVICES} from "../helper/AWS"
import { ApiError } from "../utils/apiError"
import {ApiResponse} from "../utils/apiResponse"


class AWSAPI {
    private static async uploadData(req:Request, res:Response){
        const  {fileName, contentType} = req.query

        if (!fileName ||!contentType) {
            throw new ApiError(400, "Invalid file or content type")
        }

        try {
            const preSignedUrl = await AWS_SERVICES.putObjectToS3(process.env.AWS_BUCKET_NAME!, fileName, contentType, 3600)
            if(!preSignedUrl){
                throw new ApiError(500, "Failed to create signed URL for upload request")
            }
    
            res.redirect(301, preSignedUrl)
        } catch (error) {
            res.status(500).json(new ApiResponse(500, "Failed to create signed URL for upload request"))
        }
    }
}

export { AWSAPI }
