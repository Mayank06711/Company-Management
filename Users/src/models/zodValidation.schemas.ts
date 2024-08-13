import {z} from "zod"

  const UserSchema = z.object({
    name: z.string().max(26, "Name cannot be greater than 26 characters"),
    username: z.string().min(3, "Username must be at least 3 characters long").max(20, "Username cannot be greater than 20 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password cannot be less than 6 characters"),
    role: z.string().optional(),
    active: z.boolean().optional(),
  });
  

  

  const EmployeeSchema = z.object({

    phoneNum: z.number().int().positive().min(1000000000, "Phone number must be a valid 10-digit number"),
    positionDesc: z.string().optional(),
    departmentId: z.string(),
    salary: z.number().int().min(0, "Salary must be a non-negative integer"),
    positionId: z.string(),
  });


  const DepartmentSchema = z.object({
    name: z.string().max(34,"Department name can be more than 34 characters"),
    desc: z.string().optional()
  })

  const PositionSchema = z.object({
    name: z.string(),
    desc: z.string().optional(),
    vacancy: z.number().int().min(0, "Vacancy must be a non-negative integer").optional(),
  });
  


  const ProjectSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    desc: z.string().optional(),
    teamLead: z.string().optional(),
    members: z.array(z.string()).optional(),
    manager: z.string().optional(),
    status: z.enum(["Active", "Inactive", "Completed", "Archieved", "Discarded"]).optional(),
    budget: z.number().min(0, "Budget must be a non-negative number").optional(),
    deadline: z.date().optional(),
  });


  const ApplicantionSchema = z.object({
    phoneNum: z.number().int().positive().min(1000000000, "Phone number must be a valid 10-digit number").optional(),
    type: z.enum(["Employee", "Intern", "Visitor"]).optional(),
    positionId: z.string(),
    applicantDesc: z.string().optional(),
    isActive: z.boolean().optional(),
    appliedAt: z.date().optional(),
  });
  
 

  const NotificationsSchema = z.object({
    type: z.string(),
    message: z.string(),
    status: z.enum(["Pending", "Sent", "Recieved"]).optional(),
  });


  export {
    UserSchema,
    EmployeeSchema,
    DepartmentSchema,
    PositionSchema,
    ProjectSchema,
    ApplicantionSchema,
    NotificationsSchema,  // exporting the schemas for other files to use them.  // it's a good practice to export the schemas so that other files can use them for validation.  // the schema is defined using zod library which provides a simple way to define and validate JSON objects.  // it's also a good practice to keep the schemas in separate files.  // this way, if the schema changes, other files can easily update without having to change the code in other files.  // it's also a good practice to use the same schema for different objects (like User, Employee, Department, Position, etc.) to make it easier to manage and validate the data.  // in this way, it's easier to maintain and update the schema.  // the schema is defined using zod library which provides a simple way to define and validate JSON
  }
  


  // notes 
  
  /*

  Zod
  Is is a TypeScript-first schema validation library that helps
   you define and validate data structures in your JavaScript
    or TypeScript applications. It's designed to be:

Type-Safe: Zod leverages TypeScript's type system to ensure 
type safety throughout your validation process.

Flexible: It allows you to define complex data structures, 
including nested objects, arrays, enums, and more, with clear
 and concise syntax.

Composable: You can combine validators to build reusable schemas,
 making it easy to handle complex validation requirements.

Error Handling: Provides detailed error messages when validation 
fails, helping you pinpoint issues quickly during development.

Extensible: Supports custom validators and transformations, 
allowing you to tailor validation rules to your specific needs.

Overall, Zod simplifies data validation in TypeScript projects
, ensuring your data conforms to expected shapes and types with minimal overhead and maximum type safety.

             Zod Schemas:
   Use Zod schemas to validate structured data objects where 
   you expect properties to be of specific types (e.g., strings, 
   numbers).
   Zod schemas are not directly involved in validating file 
   uploads; they validate JSON data structures.
  */

    
  
  
