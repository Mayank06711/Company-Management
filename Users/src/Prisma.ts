import { PrismaClient } from "@prisma/client";
import { error } from "console";

const prisma = new PrismaClient({
    log:["error" , "query"]
})

export default prisma;
