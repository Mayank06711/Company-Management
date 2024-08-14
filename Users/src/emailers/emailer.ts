import { Worker, Queue, WorkerOptions } from "bullmq";
import nodemailer from "nodemailer";
import Bull from "./emailQueue";
import { Job } from "bullmq";
import { ApiError } from "../utils/apiError";

class EmailProcessor {
  private static transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "elvie68@ethereal.email",
      pass: "CT1P7jR3VAhke6Rx6Y",
    },
  });

  // Configure Redis connection
  

  

  private static worker = new Worker(
    "email-queue",
    async (job: any): Promise<void> => {
      try {
        await this.main(job);
        console.log("Mail Sent");
      } catch (error) {
        console.error("Error processing job:", error);
      }
    },{ connection: {
      host: "redis-server",
      port: 6379
    }}
  );

  private static async main(job:Job) {
    if(!job.data?.text?.toUser){
      try {
        // Create a new PDF document
        const { subject, text } = job.data;
        console.time("start");
        const doc = new PDFDocument();
    
        // Store PDF data in a buffer
        const pdfBuffer: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => pdfBuffer.push(chunk));
        doc.on("end", () => {
          const finalBuffer = Buffer.concat(pdfBuffer);
    
          // Setup Nodemailer transport
          
    
          // Send the email with PDF attachment
          const mailOptions: MailOptions = {
            from: "your_email@gmail.com",
            to: job.data?.email,
            subject: subject,
            text: "This mail is regarding to inform the organisation that new employee has been added",
            attachments: [
              {
                filename: "offer_letter.pdf",
                content: finalBuffer,
                contentType: "application/pdf",
              },
            ],
          };
    
          this.transporter
            .sendMail(mailOptions)
            .then(() => {
              console.log("Email sent successfully");
              console.timeEnd("start")
            })
    
            .catch((error: Error) => console.error("Error sending email:", error));
        });
    
        // Add content to the PDF
        doc.fontSize(25).text("Information Letter", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.fontSize(12).text(`Organisation,`);
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `Team is pleased to inform you that the position of ${text.position} at desk ${text.positionDesc} is started for ${text.name} at  ${text.joinedAt}.`
          );
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `As discussed, your his salary will be ${text.salary} per annum, and he will be eligible for benefits as outlined .`
          );
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `Please review the attached documents for more details regarding his employment and benefits.`
          );
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `If you have any questions or need further information, please do not hesitate to contact team.`
          );
        doc.moveDown();
        doc.fontSize(12).text(`Best regards,`);
        doc.moveDown();
        doc.fontSize(12).text(`Team Organisation`);
        doc.fontSize(12).text(`${text.creator}`);
        doc.fontSize(12).text(`Organisation`);
        doc.fontSize(12).text(`Contact Information: Contact`);
        doc.end();
      } catch (error) {
        console.error("Error generating PDF or sending email:", error);
      }
    }
    else{
      try {
        // Create a new PDF document
        const { subject, text } = job.data;
        console.time("start");
        const doc = new PDFDocument();
    
        // Store PDF data in a buffer
        const pdfBuffer: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => pdfBuffer.push(chunk));
        doc.on("end", () => {
          const finalBuffer = Buffer.concat(pdfBuffer);
    
          // Setup Nodemailer transport
          
    
          // Send the email with PDF attachment
          const mailOptions: MailOptions = {
            from: "your_email@gmail.com",
            to: job.data.email,
            subject: subject,
            text: "Please find attached your offer letter , and congratulations for joining organisation , wish you best for your career.",
            attachments: [
              {
                filename: "offer_letter.pdf",
                content: finalBuffer,
                contentType: "application/pdf",
              },
            ],
          };
    
          this.transporter
            .sendMail(mailOptions)
            .then(() => {
              console.log("Email sent successfully");
              console.timeEnd("start")
            })
    
            .catch((error: Error) => console.error("Error sending email:", error));
        });
    
        // Add content to the PDF
        doc.fontSize(25).text("Offer Letter", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.fontSize(12).text(`Dear ${text.name},`);
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `We are pleased to offer you the position of ${text.position} at desk ${text.positionDesc}. Your start date will be ${text.joinedAt}. We are excited to have you join our team and look forward to your contributions.`
          );
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `As discussed, your starting salary will be ${text.salary} per annum, and you will be eligible for benefits as outlined in the attached documents. Your primary responsibilities will include [brief description of responsibilities].`
          );
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `Please review the attached documents for more details regarding your employment and benefits. We look forward to receiving your concent`
          );
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `If you have any questions or need further information, please do not hesitate to contact us.`
          );
        doc.moveDown();
        doc.fontSize(12).text(`Best regards,`);
        doc.moveDown();
        doc.fontSize(12).text(`Your Name`);
        doc.fontSize(12).text(`Your Position`);
        doc.fontSize(12).text(`Organisation`);
        doc.fontSize(12).text(`Contact Information: Contact`);
        doc.end();
      } catch (error) {
        console.error("Error generating PDF or sending email:", error);
      }
    }
   
  }

  static runWorker(){
    console.log("worker started");
  };
}

export default EmailProcessor;
