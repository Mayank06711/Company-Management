import { EventEmitter } from "events"; // Import the EventEmitter class from the 'events' module // Import the sendEmail function from the emailHandler module
import { EventData, PriorityEvent } from "../types/scriptInterfaces"; // Import EventData and PriorityEvent interfaces
import { PRIORITY } from "../constant"; // Import PRIORITY constants

// Class for managing events with priority and concurrency
class EventQueue {
  private queue: Array<PriorityEvent> = []; // Queue to store events with priority
  private isProcessing: boolean = false; // Flag to check if processing is already in progress
  private concurrencyLimit: number; // Limit for concurrent processing of events
  private currentConcurrency: number = 0; // Current number of concurrently processed events

  // Constructor to initialize concurrency limit
  constructor(concurrencyLimit: number = 3) {
    this.concurrencyLimit = concurrencyLimit;
  }

  // Method to add an event to the queue
  addEvent(name: string, data: EventData, priority: number = PRIORITY.UNKNOWN) {
    const event: PriorityEvent = {
      name,
      data,
      priority,
      retries: 0 // Initialize retries to 0
    };
    
    if(priority >= 0)
    this.queue.push(event); // Add event to the queue
    // Sort events in the queue by priority (highest priority first)
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    this.processQueue(); // Start processing the queue
  }

  // Method to process the event queue
  private async processQueue() {
    if (this.isProcessing) return; // Exit if already processing
    this.isProcessing = true; // Set processing flag to true
    console.log(this.queue, "you are seeing the queue")
    // Continue processing while there are events and concurrency limit is not reached
    while (this.queue.length > 0 && this.currentConcurrency < this.concurrencyLimit) {
      const event = this.queue.shift(); // Get the next event from the queue
      if (event) {
        this.currentConcurrency++; // Increment the current concurrency count
        console.log(this.concurrencyLimit, this.currentConcurrency, "concurrent limit and current concurrency")
        this.processEvent(event) // Process the event
          .finally(() => {
            this.currentConcurrency--; // Decrement concurrency count after processing
            this.processQueue(); // Continue processing remaining events
          });
      }
    }
    
    this.isProcessing = false; // Reset processing flag
  }

  // Method to process a single event
  private async processEvent(event: PriorityEvent) {
    console.log(`Processing event named: ${event.name} with priority ${event.priority}`);
    
    try {
      console.log("emmiting  event")
      emitEvent.emit(event.name, event.data); // Emit the event to registered handlers
    } catch (error) {
      // Handle errors that occur during event processing
      if (typeof error === 'string') {
        console.log(`Error sending email: ${error}`);
      } else if (error instanceof Error) {
        console.log(`Error sending email: ${error.message}`);
      } else {
        console.log(`Error sending email: ${error}`);
      }
      if ((event.retries || 0) < 5) { // Retry if retries are less than 5
        event.retries = (event.retries || 0) + 1; // Increment retry count
        // Re-add event to the queue with a delay
        setTimeout(() => {
          this.queue.push(event);
          this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0)); // Re-sort events
          this.processQueue(); // Continue processing
        }, this.getRetryDelay(event.retries)); // Get delay based on retry count
      } else {
        console.error(`Event ${event.name} failed after maximum retries.`); // Log error after max retries
      }
    }
  }

  // Method to calculate retry delay using exponential backoff
  private getRetryDelay(retries: number): number {
    return Math.pow(2, retries) * 1000; // Exponential backoff (e.g., 2^retries * 1000 ms)
  }
}

const eventQueue = new EventQueue(); // Create an instance of EventQueue

// Class to handle event creation and consumption
class EmitEvents extends EventEmitter {
  constructor() {
    super(); // Call parent class constructor
  }

  // Static method to create a new event
  static createEvent(name: string, data: EventData, priority: number = PRIORITY.UNKNOWN) {
    eventQueue.addEvent(name, data, priority); // Add event to the queue
  }

  // Static method to register a handler for an event
  static consumeEvent(name: string, handler: (data: EventData) => void) {
    emitEvent.on(name, handler); // Register the handler for the specified event
  }
}

const emitEvent = new EmitEvents(); // Create an instance of EmitEvents

export default EmitEvents; // Export the EmitEvents class for external use

