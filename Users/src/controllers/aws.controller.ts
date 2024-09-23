import express, { Request, Response } from "express";
import { AWS_SERVICES } from "../helper/AWS";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

interface GeneratePresignedUrlQuery {
  fileName: string;
  contentType: string;
}

// Request<{}, {}, {}, GeneratePresignedUrlQuery>
class AWSAPI {
  private static async uploadData(req: Request, res: Response) {
    res.send(`

        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload File to XYZ-COMPANY S3 Bucket</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .upload-container {
      height: 85%;
      width: 85%;
      max-width: 800px;
      padding: 20px;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .upload-container h2 {
      color: #333;
      margin-top: 0;
    }
    .upload-form {
      margin-top:5%;
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: center;
    }
    #fileInput {
      padding: 10px;
      margin-right: 20px;
      width: 300px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }
    #filePreview {
      margin-top:5%;
      max-width: 100%;
      height: auto;
      margin-top: 20px;
      overflow: hidden;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border: none;
      cursor: pointer;
      border-radius: 4px;
      font-size: 16px;
    }
    button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
  <div class="upload-container">
    <h2>Upload File to XYZ-COMPANY S3 Bucket</h2>
    <form class="upload-form" id="uploadForm">
      <input type="file" id="fileInput" required onchange="previewFile()">
      <button type="button" onclick="handleUpload()">Upload</button>
    </form>
    <div id="filePreview"></div>
  </div>

  <script>
    function previewFile() {
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];
      const filePreview = document.getElementById('filePreview');

      if (file) {
        filePreview.innerHTML = ''; // Clear previous preview

        // Display different previews based on file type
        if (file.type.startsWith('image/')) {
          // Image preview
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          filePreview.appendChild(img);
        } else if (file.type === 'application/pdf') {
          // PDF preview (can be an embedded viewer or link)
          const pdfEmbed = document.createElement('embed');
          pdfEmbed.src = URL.createObjectURL(file);
          pdfEmbed.type = 'application/pdf';
          pdfEmbed.width = '600px';
          pdfEmbed.height = '800px'; // Adjust height as needed
          filePreview.appendChild(pdfEmbed);
        } else if (file.type.startsWith('video/')) {
          // Video preview (can be an embedded player or link)
          const videoPlayer = document.createElement('video');
          videoPlayer.src = URL.createObjectURL(file);
          videoPlayer.controls = true;
          videoPlayer.style.maxWidth = '100%';
          videoPlayer.style.height = 'auto';
          filePreview.appendChild(videoPlayer);
        } else {
          // Default message for unsupported file types
          const unsupportedMessage = document.createElement('p');
          unsupportedMessage.textContent = "File type is not supported for preview.";
          filePreview.appendChild(unsupportedMessage);
        }
      } else {
        filePreview.innerHTML = ''; // Clear preview if no file selected
      }
    }

    async function handleUpload() {
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];

      if (!file) {
        alert('Please select a file');
        return;
      }

      const fileName = file.name;
      const contentType = file.type;

      try {
        // Call a backend endpoint to generate presigned URL
        const response = await fetch('/api/v1/xyz-company/generatePresignedUrl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileName, contentType })
        });

        if (!response.ok) {
          throw new Error('Failed to generate presigned URL');
        }

        const { presignedUrl } = await response.json();
        console.log('Presigned URL:', presignedUrl);

        // Upload the file using the presigned URL
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': contentType
          },
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        alert('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file');
      }
    }
  </script>
</body>
</html>



        `);
  }

  private static async generatePresignedUrl(req: Request, res: Response) {
    try {
      console.log(req);
      const { fileName, contentType } = req.body;
      console.log(fileName, contentType);
     if (!fileName || !contentType) {
      throw new Error("Invalid file or content type");
    }

      // Generate presigned URL
      const preSignedUrl = await AWS_SERVICES.putObjectToS3(
        process.env.AWS_BUCKET_NAME!,
        fileName,
        contentType,
        3600
      );
      if (!preSignedUrl) {
        throw new Error("Failed to generate presigned URL");
      }
      console.log(preSignedUrl, "preSigned");
      // Send the presigned URL back to the client
      res.status(200).json({ presignedUrl: preSignedUrl });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      res.status(500).json({ error: "Failed to generate presigned URL" });
    }
  }

  private static async uploadFiles(req: Request, res: Response) {
    try {
    //  console.log("Uploading files")
      const files = req.files as Express.Multer.File[];
     // console.log(files)
      if (!files || files.length === 0) {
        throw new ApiError(400, "No files uploaded");
      }

      const uploadPromises = files.map(file =>
        AWS_SERVICES.multipartUpload(process.env.AWS_BUCKET_NAME!, file.originalname, file)
      );

      const fileUrls = await Promise.all(uploadPromises);

      res.status(200).json({ message: "Files uploaded successfully", fileUrls: fileUrls });
    } catch (error: any) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
   }
  
  static upload = AWSAPI.uploadData;
  static generatePresignedURL = AWSAPI.generatePresignedUrl;
  static uploadFile = AWSAPI.uploadFiles;
}

export { AWSAPI };








/*
upload notes
The error you're encountering (No 'Access-Control-Allow-Origin' header) is due to a CORS (Cross-Origin Resource Sharing) policy restriction. When your frontend code (running on http://localhost:9001) tries to fetch or upload a file to AWS S3 (https://mayank-bucket-2-private.s3.ap-south-1.amazonaws.com), the browser blocks the request because the S3 bucket does not explicitly allow requests from your localhost origin.

To resolve this issue, you can take one of the following approaches:

1. CORS Configuration on S3 Bucket
You need to configure your S3 bucket to allow requests from your frontend origin (http://localhost:9001). This involves adding CORS rules to your S3 bucket configuration.

Example CORS Configuration for S3
Create a CORS configuration file (e.g., cors-config.json) with the following content:

json
Copy code
[
    {
        "AllowedOrigins": ["http://localhost:9001"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": []
    }
]
Then, apply this configuration to your S3 bucket using AWS CLI:

bash
Copy code
aws s3api put-bucket-cors --bucket mayank-bucket-2-private --cors-configuration file://cors-config.json
This configuration allows GET, PUT, POST, and DELETE requests from http://localhost:9001 to your S3 bucket.

2. Proxy Server (Backend Solution)
If configuring S3 CORS is not feasible or you prefer not exposing your S3 bucket directly to the frontend, you can use a backend proxy server. This server can handle requests from your frontend, add necessary headers (like CORS headers), and then forward the requests to S3.

Example Proxy Server (using Node.js and Express)
Modify your server-side code to act as a proxy between your frontend and S3. Here’s a basic example using Express:

typescript
Copy code
import express from 'express';
import fetch from 'node-fetch'; // Install node-fetch if not already installed

const app = express();

app.use(express.json());

app.put('/uploadToS3', async (req, res) => {
    const { preSignedUrl, file } = req.body;

    try {
        const response = await fetch(preSignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.listen(9001, () => {
    console.log('Proxy server running on port 9001');
});
In this setup:

Your frontend makes a request to your Express server (http://localhost:9001/uploadToS3).
The Express server forwards the request to the pre-signed URL obtained from AWS.
The server receives the file from the frontend and uploads it to S3 using the pre-signed URL.
The server then sends the response back to the frontend.
Summary
S3 CORS Configuration: Directly configure S3 CORS if you want to allow frontend access directly.
Backend Proxy: Use a backend server (like Express) to handle file uploads, add necessary headers, and forward requests to S3.
Choose the approach that best fits your application architecture and security requirements.

cann i do cors configuration manually aws console
ChatGPT
Yes, you can configure CORS manually using the AWS Management Console for your S3 bucket. Here’s how you can do it:

Sign in to AWS Management Console:

Go to the AWS Management Console and sign in with your credentials.
Navigate to S3 Service:

Find and open the Amazon S3 service from the list of AWS services.
Select Your S3 Bucket:

Locate and click on the name of the S3 bucket (mayank-bucket-2-private in your case) for which you want to configure CORS.
Configure CORS:

In the bucket overview page, go to the "Permissions" tab.
Scroll down to find the "Cross-origin resource sharing (CORS)" configuration section.
Add CORS Rules:

Click on "Edit CORS configuration" to open the CORS configuration editor.
Add the appropriate CORS rules that define which origins (e.g., http://localhost:9001) are allowed, which HTTP methods are allowed (GET, PUT, POST, DELETE), and other headers.
Save Changes:

After adding the CORS rules, save the configuration. AWS will apply these settings to your S3 bucket.
Example CORS Configuration
Here’s a basic example of a CORS configuration JSON that you can use:

json
Copy code
[
    {
        "AllowedOrigins": ["http://localhost:9001"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": []
    }
]
Notes:
AllowedOrigins: List of origins that are allowed to access resources from your S3 bucket. You can specify multiple origins if needed.
AllowedMethods: List of HTTP methods (verbs) that are allowed for CORS requests.
AllowedHeaders: List of headers that are allowed in CORS requests. Use ["*"] to allow all headers.
ExposeHeaders: List of headers that browsers are allowed to access in the response from a CORS request.
By configuring CORS in the AWS Management Console, you allow your frontend application hosted on http://localhost:9001 (or any other origin you specify) to make requests directly to your S3 bucket, resolving the CORS policy issue you encountered.

*/



