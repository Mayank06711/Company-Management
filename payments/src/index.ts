import dotenv from "dotenv"
import express from 'express';
import { Server } from 'http';
import cors from "cors"
import cookieParser from "cookie-parser"
import ratelimit from "express-rate-limit"
import fs from "fs";
import path from "path";
import {Kafka} from "kafkajs"

class PaymentServerManager {
    private app = express();
    private server!: Server; // ! (definite assignment) operator to tell TypeScript that server will be assigned before it is used as it will not be assigned until start method is called
    private kafka = new Kafka({
        clientId: "payment-server",
        brokers: [process.env.KAFKA_BROKER_URL!] || "localhost:9002",
    });
    private consumer = this.kafka.consumer({ groupId: 'payment-group' });
    constructor() {
        this.loadEnvironmentVariables();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    private loadEnvironmentVariables(){
        dotenv.config({
            path: ".env"  
        });
    } 

    private initializeMiddlewares(){
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));  // parse application/x-www-form-urlencoded
        this.app.use(cookieParser());
        this.app.use(ratelimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: "Too many requests from this IP, please try again later after 15 mins."
        }))
    }

    private initializeRoutes(){
        // // Import routes and mount them here
        // const userRouter = require("./routes/user.route").router;
        // this.app.use("/api/users", userRouter);
        this.app.use("/",(req, res)=>{
            res.send("Hello from server")
        })
    }

    private initializeErrorHandling() {
       // this.app.use(middleware.ErrorMiddleware);
        this.app.use("*", (req, res) => {
          res.status(404).json({ message: "Page not found" });
        });
    }

     // Initialize Kafka consumer
     private async initializeKafkaConsumer() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: 'notification-event', fromBeginning: true });
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                if(message.value != null){
                const event = JSON.parse(message.value.toString());
                console.log(`Received event: ${event}`);
                }else {
                    console.warn(`Received a topic with null value ${topic}`);
                }
                // Handle event (e.g., trigger a payment process)
            }
        });
        console.log('Kafka consumer connected and listening for events.');
    }

    public start() {
       // new EventHandler()
        this.server = this.app.listen(process.env.PORT || 9003, () => {
          console.log('Server is running on port 9003');
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


  private logError(message: string) {
    const logFilePath = path.join(__dirname, '../logs', 'error.log'); // Log file outside src directory
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true }); // Create directories if they don't exist
    fs.appendFileSync(logFilePath, `${message}\n\n`);
  }
  private async shutdownGracefully() {
    try {
      console.log('Performing cleanup before shutdown...');

      // Flush logs
      this.flushLogs();

      // Close database connection
      await this.closeDatabaseConnection();

      // Close Redis client
    //   await this.closeRedisClient();

    // Close Kafka consumer
    await this.consumer.disconnect();
      // Stop the server
      await this.stopServer();

      console.log('Cleanup completed. Exiting application.');
      process.exit(0); // Exit with success code
    } catch (error) {
      console.error('Error during cleanup:', error);
      process.exit(1); // Exit with failure code
    }
  }


  private flushLogs() {
    const logMessage = `${new Date().toISOString()} - Application shutdown initiated.\n\n`;
    const logFilePath = path.join(__dirname, '../logs', 'shutdown.log');
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.appendFileSync(logFilePath, logMessage);
    console.log('Logs flushed.');
  }

  private async closeDatabaseConnection() {
    console.log('Closing database connection...');
    try {
        //await prisma.$disconnect(); // // Close the Prisma Client connection
        console.log('Database connection closed.');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
  }
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

const serverManagerInstance = new PaymentServerManager();
serverManagerInstance.start()
