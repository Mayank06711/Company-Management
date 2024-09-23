import fs from "fs"
import path from "path"



export const pdfGenerator = async() => {

}

export const textGenerator = async () => {

}

/*
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';

// Helper function to check file size
const isFileSizeUnderLimit = (filePath: string, maxSizeInMB: number) => {
  const fileSizeInBytes = fs.statSync(filePath).size;
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
  return fileSizeInMB <= maxSizeInMB;
};

export const pdfGenerator = async (content: string, fileName: string) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText(content, {
      x: 50,
      y: 350,
      size: 20,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const filePath = path.join(__dirname, `${fileName}.pdf`);
    fs.writeFileSync(filePath, pdfBytes);

    if (!isFileSizeUnderLimit(filePath, 5)) {
      fs.unlinkSync(filePath);
      throw new Error('Generated PDF exceeds 5MB limit.');
    }

    return filePath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const textGenerator = async (prompt: string, type: string) => {
  let message = '';

  switch (type.toLowerCase()) {
    case 'payment':
      message = `Dear Customer,\n\nThank you for your payment regarding ${prompt}. Your payment has been successfully processed.\n\nBest regards,\nYour Company`;
      break;

    case 'approval':
      message = `Dear Team,\n\nThe ${prompt} has been approved. Please proceed with the next steps.\n\nBest regards,\nYour Company`;
      break;

    default:
      message = `Dear User,\n\n${prompt}\n\nBest regards,\nYour Company`;
  }

  return message;
};

// Function to generate a receipt for payment
export const generatePaymentReceipt = (amount: number, customerName: string, transactionId: string) => {
  return `Receipt for Payment\n\nCustomer: ${customerName}\nAmount: $${amount.toFixed(2)}\nTransaction ID: ${transactionId}\n\nThank you for your payment!`;
};

// Function to generate an offer letter
export const generateOfferLetter = (candidateName: string, position: string, companyName: string, startDate: string) => {
  return `Dear ${candidateName},\n\nWe are pleased to offer you the position of ${position} at ${companyName}. Your start date will be ${startDate}.\n\nBest regards,\n${companyName}`;
};

*/