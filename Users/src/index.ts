import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import express, { Request, Response } from 'express';
import cors from "cors"
import {rateLimit} from "express-rate-limit"

// Create an instance of the express application
const app = express();

// Set up environment variables from.env file
dotenv.config({
    path: ".env"  // Path to your environment variables file
})

// Middleware to handle CORS requests
app.use(cors({
    origin: ["http://localhost:5173", "*"],//process.env.CORS_ORIGIN
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

// Middleware to parse JSON request bodies

app.use(express.json());

// Middleware to parse URL-encoded request bodies (with querystring)
app.use(express.urlencoded({ extended: true , limit: "30kb" }));
// Middleware to parse cookies
app.use(cookieParser())


app.use(rateLimit(
    {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: "Too many requests from this IP, please try again later after 15 mins."
    }
))

console.log(process.env.NODE_ENV, process.env.PORT) 
// Import routes
import userRouter from "../src/routes/user.routes"
import AWSRouter from "../src/routes/aws.routes"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/aws", AWSRouter)




app.listen(process.env.PORT || 9001, () => {
    console.log('Server is running on port 9001');
});