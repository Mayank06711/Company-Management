import { NextFunction, Request, Response } from "express";

// Define a type for the request handler which can be an async or a normal function
type AsyncRequestHandler = (req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

class AsyncHandler {
  static wrap(requestHandler: AsyncRequestHandler) {
    return (req: Request, res: Response, next?: NextFunction) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err: any) => {
        console.log("ERROR FROM REQUEST HANDLER FUNCTION: " + err);
        if(next) next(err);
        else {
            res.status(500).send("An error occurred");
            console.log("ERROR FROM REQUEST HANDLER FUNCTION when next does not exist if using middleware")
        }
      });
    };
  }
}


/*
Class in TypeScript
In TypeScript (and in object-oriented programming in general), 
a class is a blueprint for creating objects that
 encapsulate data and behavior (methods). 
 Classes are used to model real-world entities or abstract 
 concepts

 A static method belongs to the class itself rather than 
 to instances of the class. Static methods are accessed 
 directly from the class and do not require an instance 
 to be created.

Usage: Static methods are called using the class name
 (AsyncHandler.wrap(...)), 
 not on instances
(new AsyncHandler().wrap(...)).
Access: Static methods cannot access instance-specific 
data (this) because they are not bound to any instance; 
they operate at the class level.
Utility: They are often used for utility functions that 
are related to the class but do not require instance-specific
 data.
*/

