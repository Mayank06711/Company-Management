import  {CreateBucketCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { ApiError } from "../utils/apiError"



// Ensure that environment variables are set and defined
//we can use non-null assertion (!) to tell TypeScript that these variables will not be undefined.
const accessKeyId = process.env.AWS_ACCESS_KEY_ID!
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!

// Create a new S3 client using the provided AWS credentials and region
const s3Client = new S3Client({
    region:process.env.AWS_REGION!,
    credentials:{
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    }
})

class AWS_SERVICES {
    // to upload objects to s3
    private static async putObjectTos3(bucket:string,fileName:string  , contentType: string, expiresIn: number): Promise<string>
    {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: fileName,
            // Body: content, see on chatgpt
            ContentType: contentType
        })
       try {
         //console.log("hdd", command)
         const preSignedUrlForPutingObject  = await getSignedUrl(s3Client,command, {expiresIn: expiresIn})
         console.log("preSignedUrlForPutingObject",preSignedUrlForPutingObject)
         return preSignedUrlForPutingObject;
       } catch (error:any) {
          console.error(error);
          throw new ApiError(500, error?.message, error);
       }
    }
    
    // to getObject from s3
    private static async getObjectFromS3(bucketName: string, objectKey: string, expiresIn: number){
        const getObjectCommand = new GetObjectCommand({Bucket: bucketName, Key: objectKey});
       try {
         const preSignedUrlForGettingObject  = await getSignedUrl(s3Client, getObjectCommand, {expiresIn: expiresIn});
         return preSignedUrlForGettingObject;
       } catch (error:any) {
          console.error(error);
          throw new ApiError(500, error?.message, error);
       }
    }
   
   //  delete from s3
   private static async deleteObjectsFromS3(bucketName: string, objectKeys: string[]){
    const objectsToDelete = objectKeys.map(key => ({ Key: key })); 
    const command = new DeleteObjectsCommand({
         Bucket: bucketName,
         Delete: {
            Objects: objectsToDelete,
          },
     })
     try {
        const response = await s3Client.send(command);
        console.log(response);
        return response
      } catch (err: any) {
        console.error(err);
        throw new ApiError(500, err?.message);
      }
   }


   // list evrything from s3
    private static async listObjectsFromS3(bucketName: string, objectKey:string){
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix:objectKey,
            MaxKeys:20
        })
       try {
         const data = await s3Client.send(command);
         return data.Contents;
       } catch (error:any) {
         console.error(error);
         throw new ApiError(500, error?.message, error);
       }
    }
    
    // create a bucket
    private static async createBucket(bucketName: string){
        const command = new CreateBucketCommand({Bucket: bucketName});
       try {
         await s3Client.send(command);
         console.log(`Bucket ${bucketName} created.`);
       } catch (error: any) {
         console.error(error);
         throw new ApiError(500, error?.message, error);
       }
    }

    

    static putObjectToS3 = AWS_SERVICES.putObjectTos3;
}





export {AWS_SERVICES}