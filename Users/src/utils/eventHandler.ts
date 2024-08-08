import EmitEvents from './eventEmitter'; // Import the EmitEvents class
import { EventData } from '../types/scriptInterfaces'; // Import EventData interface
import { sendEmail } from './emailHandler'; // Import the sendEmail function
import { EMAIL_FAILED, EMAIL_VERIFY, OK_EMAIL_SENT } from '../constant';
import logger from './logger';
class EventHandler {
  constructor() {
    // Register handlers for events
    this.registerHandlers();
    console.log("hii")
  }

  // Method to register event handlers
  private registerHandlers() {
    console.log("Registering event handlers");
    EmitEvents.consumeEvent(OK_EMAIL_SENT, this.handleEmailSentSuccess);
    EmitEvents.consumeEvent(EMAIL_FAILED, this.handleEmailSentFailure);
    EmitEvents.consumeEvent(EMAIL_VERIFY, this.handleSendEmail);
  }

  // Handler for email sent success
  private handleEmailSentSuccess(data: EventData) {
    logger.info(`Email sent successfully: ${JSON.stringify(data)}`);
  }

  // Handler for email sent failure
  private handleEmailSentFailure(data: EventData) {
    logger.error(`Email sending failed: ${JSON.stringify(data)}`);
    this.handleSendEmail(data)
  }

  // Handler for sendEmail event
  private handleSendEmail(data: EventData) {
    try {
      sendEmail(data); // Attempt to send the email
      EmitEvents.createEvent(OK_EMAIL_SENT, data); // Emit success event
    } catch (error) {
       logger.error(`Error sending email: ${error}`);
      EmitEvents.createEvent(EMAIL_FAILED, data); // Emit failure event
    }
  }
}

export default  EventHandler; // Create and export the EventHandler instance to be used globally.
