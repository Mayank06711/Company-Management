import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { Request, Response } from 'express';
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import fs from "fs";
import path from "path";
// import { RedisClient } from 'redis';
import { Server } from 'http';
import prisma from "./helper/clientPrism";
// Import routes
import userRouter from "../src/routes/user.routes";
import AWSRouter from "../src/routes/aws.routes";
import DepartmentRouter from "./routes/department.routes";
import { middleware } from "./midlewares/middleware";
import EventHandler from "../src/utils/eventHandler"

import {intit }from "../src/kafka/kafkaManager"
// Class to manage the server
class ServerManager {
  private app = express();
  private server!: Server; // ! (definite assignment) operator to tell TypeScript that server will be assigned before it is used as it will not be assigned until start method is called
//   private redisClient: RedisClient;
  constructor() {
    this.loadEnvironmentVariables();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeGracefulShutdown();
  }

  // Load environment variables
  private loadEnvironmentVariables() {
    dotenv.config({
      path: ".env"  // Path to your environment variables file
    });
  }

  // Initialize middlewares
  private initializeMiddlewares() {
    this.app.use(cors({
      origin: ["http://localhost:5173", "*"],//process.env.CORS_ORIGIN
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true, limit: "30kb" }));
    this.app.use(cookieParser());
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later after 15 mins."
    }));
  }

  // Initialize routes
  private initializeRoutes() {
    this.app.use("/api/v1/users", userRouter);
    this.app.use("/api/v1/xyz-company", AWSRouter);
    this.app.use("/api/v1/aws", AWSRouter);
    this.app.use("/api/v1/department", /*auth middleware*/ DepartmentRouter);
    this.app.get('/', (req: Request, res: Response) => {
      res.status(201).send('Hello Now my application is working!');
    });
  }

  // Initialize error handling middleware
  private initializeErrorHandling() {
    this.app.use(middleware.ErrorMiddleware);
    this.app.use("*", (req, res) => {
      res.status(404).json({ message: "Page not found" });
    });
  }



  // Start the server
  public start() {
    new EventHandler()
    intit()
    this.server = this.app.listen(process.env.PORT || 9001, () => {
      console.log('Server is running on port 9001');
    });
  }

  // Initialize graceful shutdown logic
  private initializeGracefulShutdown() {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.logError(`${new Date().toISOString()} - Unhandled Rejection at: ${promise} reason: ${reason}`);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.logError(`${new Date().toISOString()} - Uncaught Exception: ${error.stack}`);
      this.shutdownGracefully();
    });

    process.on('SIGTERM', this.shutdownGracefully.bind(this));
    process.on('SIGINT', this.shutdownGracefully.bind(this));
  }

  // Log error to file
  private logError(message: string) {
    const logFilePath = path.join(__dirname, '../logs', 'error.log'); // Log file outside src directory
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true }); // Create directories if they don't exist
    fs.appendFileSync(logFilePath, `${message}\n\n`);
  }

  // Perform cleanup logic before shutdown
  private async shutdownGracefully() {
    try {
      console.log('Performing cleanup before shutdown...');

      // Flush logs
      this.flushLogs();

      // Close database connection
      await this.closeDatabaseConnection();

      // Close Redis client
    //   await this.closeRedisClient();

      // this.KAFKA.disconnectKafkaProducer()
      // Stop the server
      await this.stopServer();

      console.log('Cleanup completed. Exiting application.');
      process.exit(0); // Exit with success code
    } catch (error) {
      console.error('Error during cleanup:', error);
      process.exit(1); // Exit with failure code
    }
  }

  // Flush logs (example: flush log buffer to disk)
  private flushLogs() {
    const logMessage = `${new Date().toISOString()} - Application shutdown initiated.\n\n`;
    const logFilePath = path.join(__dirname, '../logs', 'shutdown.log');
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.appendFileSync(logFilePath, logMessage);
    console.log('Logs flushed.');
  }

  // Close the database connection
  private async closeDatabaseConnection() {
    console.log('Closing database connection...');
    try {
        await prisma.$disconnect(); // // Close the Prisma Client connection
        console.log('Database connection closed.');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
  }

  // Close the Redis client
//   private closeRedisClient() {
//     return new Promise<void>((resolve, reject) => {
//       console.log('Closing Redis client...');
//       this.redisClient.quit((err) => {
//         if (err) {
//           console.error('Error closing Redis client:', err);
//           reject(err);
//         } else {
//           console.log('Redis client closed.');
//           resolve();
//         }
//       });
//     });
//   }

  // Stop the server
  private stopServer() {
    return new Promise<void>((resolve, reject) => {
      console.log('Stopping server...');
      this.server.close((err) => {
        if (err) {
          console.error('Error stopping server:', err);
          reject(err);
        } else {
          console.log('Server stopped.');
          resolve();
        }
      });
    });
  }
}

// Initialize and start the server
const serverManager = new ServerManager();

new EventHandler();
// Start the server to listen for incoming requests. This will start the server and log the start message.
serverManager.start();

export default ServerManager



































// import cookieParser from "cookie-parser";
// import dotenv from "dotenv"
// import express, { Request, Response } from 'express';
// import cors from "cors"
// import {rateLimit} from "express-rate-limit"
// import fs from "fs"
// import path from "path";
// // Create an instance of the express application
// const app = express();

// // Set up environment variables from.env file
// dotenv.config({
//     path: ".env"  // Path to your environment variables file
// })

// // Middleware to handle CORS requests
// app.use(cors({
//     origin: ["http://localhost:5173", "*"],//process.env.CORS_ORIGIN
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
// }))

// // Middleware to parse JSON request bodies

// app.use(express.json());

// // Middleware to parse URL-encoded request bodies (with querystring)
// app.use(express.urlencoded({ extended: true , limit: "30kb" }));
// // Middleware to parse cookies
// app.use(cookieParser())


// app.use(rateLimit(
//     {
//         windowMs: 15 * 60 * 1000, // 15 minutes
//         max: 100, // limit each IP to 100 requests per windowMs
//         message: "Too many requests from this IP, please try again later after 15 mins."
//     }
// ))

// console.log(process.env.NODE_ENV, process.env.PORT) 
// // Import routes
// import userRouter from "../src/routes/user.routes"
// import AWSRouter from "../src/routes/aws.routes"
// import DepartmentRouter from "./routes/department.routes"
// import { middleware } from "./midlewares/middleware";


// app.use("/api/v1/users", userRouter)
// app.use("/api/v1/xyz-company", AWSRouter)
// app.use("/api/v1/aws", AWSRouter)
// // app.use("api/v1/department" ,/*    auth middleware */ DepartmentRouter  );

// app.get('/', (req: Request, res: Response) => {
//     res.status(201).send('Hello Now my application is working!');
// });


// app.use(middleware.ErrorMiddleware)

// app.use("*",(req, res)=>{
//     res.status(404).json({message: "Page not found"})
// })

// app.listen(process.env.PORT || 9001, () => {
//     console.log('Server is running on port 9001')
// })


// // Handle unhandled promise rejections
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//     const logMessage = `${new Date().toISOString()} - Unhandled Rejection at: ${promise} reason: ${reason}\n\n`;
//     fs.appendFileSync(path.join(__dirname, 'logs', 'error.log'), logMessage);
//     // Optionally, you can handle the rejection in a specific way
//   });
  
//   // Handle uncaught exceptions
//   process.on('uncaughtException', (error) => {
//     console.error('Uncaught Exception:', error);
//     const logMessage = `${new Date().toISOString()} - Uncaught Exception: ${error.stack}\n\n`;
//     const logFilePath = path.join(__dirname, 'logs', 'error.log'); // Log file outside src directory
//     fs.mkdirSync(path.dirname(logFilePath), { recursive: true }); // Create directories if they don't exist
//     fs.appendFileSync(path.join(__dirname, 'logs', 'error.log'), logMessage);
//     // Optionally, you can handle the exception in a specific way
//    // sendErrorNotificationToAdmin(error);
//    // shutdownGracefully();
//   });


// /**
//  * 
//  * unhandledRejection: 
//  This event is emitted when a promise is rejected and no error handler is attached to the promise within a turn of the event loop. 
// Catches promise rejections that aren't handled anywhere in your code, preventing the application from crashing unexpectedly.
// uncaughtException:
// This event is emitted when an exception is not caught by any try-catch block.
// Catches synchronous errors that aren't caught anywhere in your code, again preventing unexpected crashes.


//  By default, THESE TWO ERROR would cause MY Node.js application to crash. TO PREVENT THIS WE USE THIS BY LISTENING process.on('uncaughtException', ...) event listener.
// *




