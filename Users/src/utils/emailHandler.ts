import nodemailer from "nodemailer"
import { ApiError } from "./apiError"
import { EmailOptions } from "../types/scriptInterfaces"
import EventEmitter  from "../utils/eventEmitter"

const sendEmail = async(option:EmailOptions)=>{
    // create a transporter
     try {
          const transporter = nodemailer.createTransport({
              host:process.env.EMAIL_HOSTNAME,
              port: process.env.EMAIL_PORT,
              secure: false, // true for 465, false for other ports
              auth: {
                  user: process.env.EMAIL_USERNAME, // generated ethereal user
                  pass:  process.env.EMAIL_USERNAME_PASSWORD, // generated ethereal password
              },
          });
      
          //DEfine email options
          const emailOption = {
              from:"BlogMini support<support@blogmini.com>",
              to:option.email,
              subject:option.subject,
              text:option.message,
          }
         await transporter.sendMail(emailOption)
         // emit event from here
         console.log("Email sent successfully-> \n")
     } catch (error:any) {
        console.log(error, "Error sending email-> \n")
        // emit event here also
        throw new ApiError(500, "Nodemailer error", error.message)
     }
   }

   export {sendEmail}