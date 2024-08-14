import { Queue } from "bullmq";
import { ApiError } from "../utils/apiError";
const notificationQueue = new Queue("email-queue", {
  connection: {
    host: "redis-server",
    port: 6379,
  },
  defaultJobOptions: {
    attempts: 2,
  },
});

class Bull {
  private static async init(admin: any) {
    const {
      id,
      userID,
      position,
      department,
      salary,
      joinedAt,
      positionDesc,
      name,
      userName,
      creator,
    } = admin;
    try {
      const res = await notificationQueue.add("mail the error", {
        email: "email@organisation.com",
        subject: "Regaurdung his Offer Letter Sent to employee",
        text: {
          name,
          userName,
          userID,
          position,
          department,
          salary,
          joinedAt,
          positionDesc,
          creator,
          toUser: false,
        },
      });
    } catch (err) {
      throw new ApiError(401, "Unable to add in  queue notifiction");
    }
  }

  private static async init2(user: any) {
    const {
      id,
      userID,
      position,
      department,
      salary,
      joinedAt,
      positionDesc,
      name,
      userName,
      email,
    } = user;
    try {
      const res = await notificationQueue.add("mail the error", {
        email: email,
        subject: "Offer Letter for the selection in Organisation",
        text: {
          name,
          userName,
          userID,
          position,
          department,
          salary,
          joinedAt,
          positionDesc,
          toUser: true,
        },
      });
    } catch (err) {
      throw new ApiError(401, "Unable to add in  queue notifiction");
    }
  }

  static pushToAdminQueue = this.init;
  static pushToUserQueue = this.init2;
}

export default Bull;
