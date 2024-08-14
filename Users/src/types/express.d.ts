import express from 'express'; 
import { Request } from 'express';

 // definig type overwrite in module express there is an interface Request on which we want to attach extra type user which is of typoe User   

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  photo_url?: string;
  photo_public_id?: string;
  password: string;
  role: string;
  active: boolean;
  refreshToken: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isMFAEnabled: boolean;
  MFASecretKey?: string;
  createdAt: Date;
  updatedAt: Date;
  notifications?: Notifications[];
  employee?: Employee[];
}
  
  interface Employee {
    id: string;  // mapped to MongoDB ObjectId
    phoneNum: number;
    positionDesc: string;
    departmentId: string;  // mapped to MongoDB ObjectId
    joinedAt: Date;
    salary: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId: string;  // mapped to MongoDB ObjectId
    positionId: string;  // mapped to MongoDB ObjectId
    projectId: string;
  }
  
  interface Department {
    id: string;  // mapped to MongoDB ObjectId
    name: string;
    desc?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    project?: Project[];  // one-to-many relationship
  }
  
  interface Position {
    id: string;  // mapped to MongoDB ObjectId
    name: string;
    desc?: string;
    vacancy: number;
    createdAt: Date;
    updatedAt: Date;
    employee?: Employee[];  // one-to-many relationship
  }
  
  enum ProjectStatus {
    Active = "Active",
    Inactive = "Inactive",
    Completed = "Completed",
    Archieved = "Archieved",
    Discarded = "Discarded"
  }
  
  interface Project {
    id: string;  // mapped to MongoDB ObjectId
    name: string;
    desc?: string;
    teamLead: string;  // mapped to MongoDB ObjectId
    members: string[];  // array of MongoDB ObjectIds
    manager: string;  // mapped to MongoDB ObjectId
    status: ProjectStatus;
    budget: number;
    deadline?: Date;
    createdAt: Date;
    updatedAt: Date;
    departmentId: string;  // mapped to MongoDB ObjectId
    department: Department;
  }
  
  enum ApplicantionType {
    Employee = "Employee",
    Intern = "Intern",
    Visitor = "Visitor"
  }
  
  interface Applicantion {
    id: string;  // mapped to MongoDB ObjectId
    phoneNum: number;
    type: ApplicantionType;
    positionId: string;  // mapped to MongoDB ObjectId
    applicantDesc?: string;
    isActive: boolean;
    appliedAt: Date;
  }
  
  enum NotificationsState {
    Pending = "Pending",
    Sent = "Sent",
    Recieved = "Recieved"
  }
  
  interface Notifications {
    id: string;  // mapped to MongoDB ObjectId
    type: string;
    message: string;
    status: NotificationsState;
    createdAt: Date;
    updatedAt: Date;
    userId: string;  // mapped to MongoDB ObjectId
    user: User;
  }
  
  export {User , Employee , Notifications ,Applicantion , Project , Position , Department }

declare global{
    namespace Express{
      interface Request{
        user?:{
            id: string;
            username: string;
            email: string;
            role: string;
            isMFAEnabled: boolean;
            active: boolean;
        }
      }
    }
  }

  interface asRequest extends Request {
    user?: Document & IUser;
  }

export {newRequest , asRequest}


