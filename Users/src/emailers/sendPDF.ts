const PDFDocument = require('pdfkit');
const nodemailer =require('nodemailer');

// Define a type for the mail options
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  attachments: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
}

async function generateAndSendPDF(parameter1: string): Promise<void> {
  try {
    // Create a new PDF document
    const doc = new PDFDocument();

    // Store PDF data in a buffer
    const pdfBuffer: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => pdfBuffer.push(chunk));
    doc.on('end', () => {
      const finalBuffer = Buffer.concat(pdfBuffer);

      // Setup Nodemailer transport
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'elvie68@ethereal.email',
          pass: 'CT1P7jR3VAhke6Rx6Y',
        },
      });

      // Send the email with PDF attachment
      const mailOptions: MailOptions = {
        from: 'your_email@gmail.com',
        to: 'satyam73soni@gmail.com',
        subject: 'Your PDF Document',
        text: 'Please find attached your PDF document.',
        attachments: [
          {
            filename: 'document.pdf',
            content: finalBuffer,
            contentType: 'application/pdf',
          },
        ],
      };

      transporter.sendMail(mailOptions)
        .then(() => console.log('Email sent successfully'))
        .catch((error: Error) => console.error('Error sending email:', error));
    });

    // Add content to the PDF
    doc.fontSize(25).text('are you kidding me', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('you should accept this offer buddy');
    doc.moveDown();
    doc.fontSize(10).text('Author: is very important', { align: 'right' });
    doc.end();

  } catch (error) {
    console.error('Error generating PDF or sending email:', error);
  }
}

