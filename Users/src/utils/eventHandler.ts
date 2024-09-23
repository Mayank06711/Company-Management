import EmitEvents from './eventEmitter'; // Import the EmitEvents class
import { EventData } from '../types/scriptInterfaces'; // Import EventData interface
import { sendEmails } from './emailHandler'; // Import the sendEmail function
import { EMAIL_FAILED, EMAIL_VERIFY, OK_EMAIL_SENT } from '../constant';
import logger from './logger';
import prisma from '../helper/clientPrism';
class EventHandler {
  constructor() {
    // Register handlers for events
    this.registerHandlers();
    console.log("hii i got initialized with event handlers")
  }

  // Method to register event handlers
  private registerHandlers() {
    console.log("Registering  event handlers from eventHandles to handle events...");
    EmitEvents.consumeEvent(OK_EMAIL_SENT, this.handleEmailSentSuccess);
    EmitEvents.consumeEvent(EMAIL_FAILED, this.handleEmailSentFailure);
    EmitEvents.consumeEvent(EMAIL_VERIFY, this.handleSendEmail);
  }

  // Handler for email sent success
  private handleEmailSentSuccess(data: EventData) {
    logger.info(`Email sent successfully I only log data not send email: ${JSON.stringify(data)}`);
  }

  // Handler for email sent failure
  private handleEmailSentFailure(data: EventData) {
    logger.error(`Email sending failed: ${JSON.stringify(data)}`);
    this.handleSendEmail(data)
  }

  // Handler for sendEmail event
  private handleSendEmail(data: EventData) {
    try {
      console.log("Send email received successfully ")
      sendEmails(data); // Attempt to send the email
      EmitEvents.createEvent(OK_EMAIL_SENT, data); // Emit success event
    } catch (error) {
       logger.error(`Error sending email: ${error}`);
      EmitEvents.createEvent(EMAIL_FAILED, data); // Emit failure event
    }
  }

  private handleNotification(data: EventData) {
    // Implement notification logic here
    console.log(`Sending notification to ${data.email}: ${data.message}`);
  }

  private handlePaymentEvents(data: EventData) {
    // Implement payment event handling logic here
    console.log(`Processing payment event for ${data.email}: ${data.message}`);
  }

  private handleOtherEvents(data: EventData) {
    // Implement other event handling logic here
    console.log(`Processing other event for ${data.email}: ${data.message}`);
  }

  private handleUnkownEvents(data:any){
    // Implement unknown event handling logic here
    console.log(`Unknown event received: ${JSON.stringify(data)}`);
  }
}

export default EventHandler; // Create and export the EventHandler instance to be used globally.
