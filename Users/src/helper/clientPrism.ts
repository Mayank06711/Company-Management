import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient({
    
})




prisma.$use(async (params, next)=>{
    if(params.model === "User"){
        if(params.action === "create" || params.action === "update"){
            const user = params.args.data;
            //console.log(user,"|", params.model, "|",params.action,"|", params.args)
            if(user.password){
                user.password = await bcrypt.hash(user.password, 10);
                console.log(user.password, "hashed passowrd \n primsa middleware")
            }
            if(user.MFASecretKey && user.isMFAEnabled){
                user.MFASecretKey = await bcrypt.hash(user.MFASecretKey, 10);
                console.log(user.MFASecretKey, "hashed passowrd \n primsa middleware")
            }
        }
    }
    const result = await next(params)
    //console.log(result)
    return result;
})


// prisma.$extends({
//     client: {
//       async $use(params, next) {
//         if (params.model === 'User' && (params.action === 'create' || params.action === 'update')) {
//           const user = params.args.data;
  
//           // Check if password is present in the data being created or updated
//           if (user.password) {
//             // Hash the password before saving
//             user.password = await bcrypt.hash(user.password, 10);
//           }
//         }
//            const result = await next(params)
//            console.log(result)
//            return result;
//       },
//     },
//   });

export default prisma;