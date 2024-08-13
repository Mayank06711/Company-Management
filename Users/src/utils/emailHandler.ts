
import nodemailer from "nodemailer";
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ApiError } from "./apiError";
import { EventData } from "../types/scriptInterfaces";
import EmitEvents from "../utils/eventEmitter";
import { EMAIL_FAILED, OK_EMAIL_SENT, PRIORITY } from "../constant";

const sendEmail = async (options: EventData) => {
  // create a transporter
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOSTNAME!,
      port: Number(process.env.EMAIL_PORT!), // Ensure the port is a number
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME!, // generated ethereal user
        pass: process.env.EMAIL_USERNAME_PASSWORD!, // generated ethereal password
      },
    } as SMTPTransport.Options);

    // Define email options
    const emailOption = {
      from: "XYZ-PVT.LMT support<support@xyz.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(emailOption);
    console.log("Email sent successfully  \n");

    // Emit event after sending email
    EmitEvents.createEvent(OK_EMAIL_SENT, {
      req: options.req,
      data: options.data,
      message: "Email sent successfully",
    }, PRIORITY.OK_EMAIL_SENT);
  } catch (error: any) {
    console.log(error, "Error sending email-> \n");

    // Emit event on error
    EmitEvents.createEvent(EMAIL_FAILED , {
      req: options.req,
      data: options.data,
      message: error.message,
    },PRIORITY.REJECT);

    throw new ApiError(500, "Nodemailer error", error.message);
  }
};



export { sendEmail };
