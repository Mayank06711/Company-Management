import { Queue, Worker, Job } from 'bullmq';
import prisma from '../helper/clientPrism'; // Assuming this is your Prisma client instance
import { NotificationsState, Channel } from '@prisma/client'; // Assuming enums are generated from Prisma schema
import {sendEmails} from '../utils/emailHandler'; // Placeholder for your email service
import SmsService from '../utils/SMS'; // Placeholder for your SMS service
import WhatsAppService from '../utils/whatsapp'; // Placeholder for your WhatsApp service
import { EventData } from '../types/scriptInterfaces';
import { ApiError } from '../utils/apiError';
import { NotificationsSchema } from '../models/zodValidation.schemas';
import { ApiResponse } from '../utils/apiResponse';
import AsyncHandler from '../utils/asyncHandler';
import { newRequest } from '../types/express';
import { Request, Response } from 'express';
import { loadWorkerConfig } from '../utils/config';


class NotificationService {
    private worker:Worker | null = null;// class prop in typescript needs to be intialized immediately or in constructor 
    private static instance: NotificationService
    private notificationQueue: Queue;
    private workerConfig = loadWorkerConfig();
    //docker run -d  --name xyz -p 6379:6379 redis/redis-stack-server:latest      ,  run this command but change name of conatiner if you will not expose the port it won`t connect
    private constructor(name: string = this.workerConfig.queueName) {
        console.log(name);
        this.notificationQueue = new Queue(name, {
            connection: {
                host: 'localhost', // Redis host
                port: 6379, // Redis port
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                  },
                },
        });
        this.initializeWorker()
    }


    public static getInstance(name:string = 'notifications'): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService(name);
        }
        return NotificationService.instance;
    }

    private initializeWorker() {
        console.log("Initial initialization started worker")
          this.worker =  new Worker(this.workerConfig.queueName, async (job: Job) => {
            const { notificationId, channel } = job.data;

            // Fetch the notification from the database
            const notification = await prisma.notifications.findUnique({
                where: { id: notificationId },
                include: {
                  user: {
                    include: {
                      employee: true,  // Include the related employee data within the User model
                    },
                  },
                },
              });
              

            if (!notification) {
                throw new Error('Notification not found');
            }

            // Send the notification based on the channel
            switch (channel) {
                 case Channel.Email:{
                    const eventData: EventData = {
                        email: notification.user.email,
                        subject: "XYZ_COMPANY_NOTIFICATION",  // You can adjust the subject based on the context
                        message: notification.message,
                      };
                    await sendEmails(eventData);
                    break;
                }
                case Channel.SMS:{
                  //  Send SMS to each employee's phone number
                    if (notification.user.employee.length > 0) {
                        for (const emp of notification.user.employee) {
                            if (emp.phoneNum) {
                                await SmsService.send(emp.phoneNum.toString(), notification.message);
                            } else {
                                throw new Error(`Employee with ID ${emp.id} does not have a phone number`);
                            }
                        }
                    } else {
                        throw new Error('No employees found for SMS notification');
                    }
                    console.log("SMS")
                    break;
                }
                case Channel.Whatsapp:{
                    // Send WhatsApp to each employee's phone number
                    await WhatsAppService.send("+919125256906", notification.message);
                    if (notification.user.employee.length > 0) {
                        for (const emp of notification.user.employee) {
                            if (emp.phoneNum) {
                                await WhatsAppService.send(emp.phoneNum.toString(), notification.message);
                            } else {
                                throw new Error(`Employee with ID ${emp.id} does not have a phone number`);
                            }
                        }
                    } else {
                        throw new Error('No employees found for WhatsApp notification');
                    }
                    break;
                }
                default:
                    throw new Error('Unknown channel');
            }

            // Update the notification status to Sent
            await prisma.notifications.update({
                where: { id: notificationId },
                data: { status: NotificationsState.Sent },
            });
        },
        {
            connection: {
                host: this.workerConfig.redisHost,
                port: this.workerConfig.redisPort,
            }
        });

        this.worker.on('completed', async (job) => {
            console.log(`Notification job completed: ${job.id}`);
            //await this.stopWorker() //  After every single job is completed, the worker will be stopped not efficient 
        });

        this.worker.on('failed', (job, err) => {
            console.error(`Notification job failed: ${job?.id}`, err);
            // Retry the failed job after a delay
            this.restartWorker(); // Restart on failure
        });
    }

    public async stopWorker(){
        try {
            console.log("Stopping worker")
            // Close the current worker
            if (this.worker) {
                await this.worker.close();
                console.log('Worker closed successfully');
            } else {
                console.log('No worker instance to close');
            }
        }catch (err) {
            console.error('Failed to close the worker:', err);
        }
    }

    public async restartWorker(time: number = 3000) {
        try {
            console.log("Restarting worker")
            // Close the current worker
            if (this.worker) {
                await this.worker.close();
                console.log('Worker closed successfully');
            } else {
                console.log('No worker instance to close');
            }
    
            // Restart the worker after the specified delay
            setTimeout(() => {
                try {
                    this.initializeWorker();
                    console.log('Notification worker restarted');
                } catch (startError) {
                    console.error('Failed to restart the worker:', startError);
                }
            }, time);
            
        } catch (closeError) {
            console.error('Failed to close the worker:', closeError);
        }
    }
    
    async addNotificationToQueue(notificationId: string, channel: Channel): Promise<void>{
        await this.notificationQueue.add('send-notification', {
            notificationId,
            channel,
        });
        console.log(`Notification added to queue: ${notificationId}, channel: ${channel}`)
    }

    async createNotification(type: string, message: string, userId: string, channel: Channel) {
        // Create the notification in the database
    const notification = await prisma.notifications.create({
            data: {
                type,
                message,
                channel,
                userId,
                status: NotificationsState.Pending,
            },
    });

    if(!notification){
        throw new ApiError(500, "Failed to create notification in our database");
    }
    console.log(`Notification: ${notification}`)
        // Add the notification to the queue
    await this.addNotificationToQueue(notification.id, channel);

    return notification;
    }

}


export class Notification {
    private static async createNotification(req:Request, res:Response) {
        const parsedNoti = NotificationsSchema.safeParse(req.body);
        console.log(parsedNoti, req.body);
        if(!parsedNoti.success){
            // console.log("Failed to create notification", parsedNoti.error)
            throw new ApiError(400, parsedNoti.error.name)
        }
        const notification = parsedNoti.data
        const notificationService = NotificationService.getInstance();
        const noti =  notificationService.createNotification(notification.type, notification.message, notification.userId, req.body.channel );
        res.status(201).json(new ApiResponse(201, noti, "Success"));
    }

    private static async selectChannel(req:Request, res:Response){
        const { channel } = req.body
       // Validate that the channel exists in the enum
        if (!channel || !Object.values(Channel).includes(channel as Channel)) {
          throw new ApiError(401, "Invalid or missing channel. No such channel is available for notification");
        }

        const result =  await prisma.notifications.update({
            where:{userId:req.user?.id},
            data:{
                channel:channel as Channel
            }
        })

        if(!result){
            throw new ApiError(500, "Failed to update channel in our database");
        }

        res.status(200).json(new ApiResponse(200, result.channel, "Success"));

    }
    static newNoti = AsyncHandler.wrap(Notification.createNotification)
    static chooseChannel = AsyncHandler.wrap(Notification.selectChannel)
    
} 


export default NotificationService;



/*
The send-notification in the addNotificationToQueue method is the name of the specific job you are adding to the notifications queue. Here's the distinction:

Queue Name vs. Job Name
Queue Name (notifications): When you create a new Queue instance, you're specifying the name of the queue (notifications in this case). This queue will manage the jobs that are added to it, and the worker will process these jobs.

Job Name (send-notification): When you add a job to the queue, you give it a name (send-notification). This name helps in identifying the type of job within the queue. It is especially useful if you want to manage different types of jobs within the same queue.

Why Use send-notification?
Job Identification: By naming the job send-notification, you can easily identify what type of job it is within the notifications queue. This is helpful if, in the future, you decide to handle multiple types of jobs within the same queue.

Worker Flexibility: The worker can be set up to process different job types differently based on their names. In your current setup, it seems you're handling only send-notification jobs, but if you add more job types later, you can easily extend the worker's logic.
*/

/**
 
IMP

The different names you see for your Docker containers (`quizzical_buck`, `pensive_golick`, etc.) are automatically generated by Docker when you run a container without specifying a name yourself. Docker assigns these random names to make it easier to identify and manage containers.

### Why the Names Change
Each time you start a new container without giving it a name, Docker generates a new unique name. This is why you see different names every time.

### How to Name Your Containers
You can avoid the random naming by explicitly naming your containers when you start them. Here's how you can do it:

```bash
docker run --name my_redis_container -d redis/redis-stack-server:latest
```

In this example, the container will be named `my_redis_container`. You can then refer to this container by name in your commands:

```bash
docker exec -it my_redis_container redis-cli
```

### Listing Containers with Names
To see all containers with their names, you can use the following command:

```bash
docker ps -a
```

This will list all containers, including those that are stopped, with their assigned names.

### Reusing Container Names
If you attempt to start a new container with a name that's already in use, Docker will throw an error. You'll need to remove or rename the existing container first:

```bash
docker rm my_redis_container
```

Or, if you want to start the existing container again:

```bash
docker start my_redis_container
```

Naming your containers consistently can help you manage and debug your Docker environment more effectively.




You can run Docker images by creating containers from them, and you can assign a name to each container when you start it. Here's how you can do it for the images you've listed:

### Example Command Structure

```bash
docker run --name <container_name> -d <image_name>
```

- `<container_name>`: The name you want to assign to the container.
- `<image_name>`: The name of the image you want to run.

### Running Each Image with a Custom Name

#### 1. Running the `confluentinc/cp-kafka` Image

```bash
docker run --name kafka_container -d confluentinc/cp-kafka:latest
```

#### 2. Running the `backend-blogmini-app` Image

```bash
docker run --name blogmini_container -d backend-blogmini-app:latest
```

#### 3. Running the `redis/redis-stack` Image

```bash
docker run --name redis_stack_container -d redis/redis-stack:latest
```

#### 4. Running the `redis/redis-stack-server` Image

```bash
docker run --name redis_stack_server_container -d redis/redis-stack-server:latest
```

#### 5. Running the `ubuntu` Image

```bash
docker run --name ubuntu_container -d ubuntu:latest
```

#### 6. Running the `zookeeper` Image

```bash
docker run --name zookeeper_container -d zookeeper:latest
```

### Verifying the Running Containers

After running the above commands, you can verify the containers are running with their assigned names using:

```bash
docker ps
```

This will list all running containers along with the names you provided.

### Stopping and Starting Containers by Name

- **Stop a container**: 
  ```bash
  docker stop <container_name>
  ```

- **Start a stopped container**:
  ```bash
  docker start <container_name>
  ```

By naming your containers, you'll be able to easily manage and identify them in the future.


You can run Docker images by creating containers from them, and you can assign a name to each container when you start it. Here's how you can do it for the images you've listed:

### Example Command Structure

```bash
docker run --name <container_name> -d <image_name>
```

- `<container_name>`: The name you want to assign to the container.
- `<image_name>`: The name of the image you want to run.

### Running Each Image with a Custom Name

#### 1. Running the `confluentinc/cp-kafka` Image

```bash
docker run --name kafka_container -d confluentinc/cp-kafka:latest
```

#### 2. Running the `backend-blogmini-app` Image

```bash
docker run --name blogmini_container -d backend-blogmini-app:latest
```

#### 3. Running the `redis/redis-stack` Image

```bash
docker run --name redis_stack_container -d redis/redis-stack:latest
```

#### 4. Running the `redis/redis-stack-server` Image

```bash
docker run --name redis_stack_server_container -d redis/redis-stack-server:latest
```

#### 5. Running the `ubuntu` Image

```bash
docker run --name ubuntu_container -d ubuntu:latest
```

#### 6. Running the `zookeeper` Image

```bash
docker run --name zookeeper_container -d zookeeper:latest
```

### Verifying the Running Containers

After running the above commands, you can verify the containers are running with their assigned names using:

```bash
docker ps
```

This will list all running containers along with the names you provided.

### Stopping and Starting Containers by Name

- **Stop a container**: 
  ```bash
  docker stop <container_name>
  ```

- **Start a stopped container**:
  ```bash
  docker start <container_name>
  ```

By naming your containers, you'll be able to easily manage and identify them in the future.
 */