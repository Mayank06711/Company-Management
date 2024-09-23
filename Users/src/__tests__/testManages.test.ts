import EmitEvents from '../utils/eventEmitter'; 
import EventHandler from '../utils/eventHandler'; 
import { EventData } from '../types/scriptInterfaces'; 
import { OK_EMAIL_SENT, EMAIL_FAILED, EMAIL_VERIFY } from '../constant'; 

// Mock sendEmail function
jest.mock('../utils/emailHandler', () => ({
  sendEmail: jest.fn()
}));

// ServerManager class from your code
import ServerManager from "../index"; 

class TestManager {
  private serverManager: ServerManager;

  constructor() {
    this.serverManager = new ServerManager();
  }

  public async runTests() {
    describe('EventHandler', () => {
      const mockEventData: EventData = {
        email: 'test@example.com',
        subject: 'Test Email',
        message: 'This is a test email.'
      };

      beforeEach(() => {
        new EventHandler(); // Instantiate the handler to ensure it starts listening to events
      });

      it('should handle email sent success', () => {
        EmitEvents.createEvent(OK_EMAIL_SENT, mockEventData);
        // Add assertions to verify behavior
      });

      it('should handle email sent failure', () => {
        EmitEvents.createEvent(EMAIL_FAILED, mockEventData);
        // Add assertions to verify behavior
      });

      it('should handle send email event', () => {
        EmitEvents.createEvent(EMAIL_VERIFY, mockEventData);
        // Add assertions to verify behavior
      });
    });

    // Start the server before running tests
   // this.serverManager.start();

    // You can add more tests or other initialization tasks here
  }
}

// Initialize and run tests
const testManager = new TestManager();
testManager.runTests();
