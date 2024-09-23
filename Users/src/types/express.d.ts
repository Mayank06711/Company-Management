import express, {Request} from 'express';

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

export {newRequest}

