// emailOptions.ts
export  interface EventData {
    email?: string;
    subject?: string;
    req?: any; // Optional request object
    data?: Record<string, any>; // Optional additional data
    message: string; // Message related to the event
  }

 export interface PriorityEvent {
  name: string;
  data?: EventData;
  priority?: number | 0;
  retries?: number | 0;
}
  
/*
Record<K, T> Utility Type:

Record is a TypeScript utility type that constructs an object type with properties of type T using keys of type K.
The general form is Record<K, T>, where K is the type of the keys and T is the type of the values.
*/