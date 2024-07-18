import express from 'express';
import { User} from "@prisma/client" 

declare module express {
    export interface Request {
        user: User;
    }
} // definig type overwrite in module express there is an interface Request on which we want to attach extra type user which is of typoe User   