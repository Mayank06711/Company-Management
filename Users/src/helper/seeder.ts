import faker from "faker"
import prisma from "./clientPrism"
class fakeDataGen {
    private numb = 10;
     contructor(num:Number = this.numb) {

     }

     private async fakeUser  () {
        try{
            const user = [];
            for(let i = 0; i < this.numb; i++ ){
                const newUser = await prisma.user.create({
                   data: { 
                    name:faker.person.name(),
                    username:faker.internet.username(),
                    email:faker.email(),
                    photo_url:faker.person.url(),
                    photo_public_id:faker.person.url(),
                    password:"123345678",
                    emailVerified:true,
                    }
                })
                user.push(newUser)
            }
            await Promise.all(user)
            console.log("user created")
            process.exit(1)
        }catch(err){
            console.log("failed user creation", err)
            process.exit(1)
        }
     }
     private async fakerEmployee (){
        try{
            const empl = []
            for(let i = 0; i < this.numb; i++){
                const newEmpl = await prisma.employee.create({
                    data:{
                        phoneNum:faker.phone(),
                        positionDesc:faker.lorem.senetence(),
                        departmentId:faker.lorem.id(),
                        salary:50000,
                        isActive:true,
                        userId:faker.id(),
                        positionId:faker.id()
                    }
                })
                empl.push(newEmpl)
            }
            await Promise.all(empl);
            console.log("Employee created")
            process.exit(1)
        }catch(err){
            console.log("failed to create employee", err)
            process.exit(1)
        }
     }

     private async fakePosition () {
            try{
                const post = []
                for(let i = 0; i < this.numb; i++){
                    const newPost = await prisma.position.create({
                        data:{
                            name:faker.person.name(),
                            desc:faker.senetence(),
                            vacancy:5,
                        }
                    })
                    post.push(newPost)
                }
                await Promise.all(post);
                console.log("post created")
                process.exit(1)
            }catch(err){
                console.log("failed to create postiotn", err)
                process.exit(1)
            }
     }

     private async fakeNoti () {
        try{
            const noti = []
            for(let i =0; i< this.numb; i++){
                if(i & 1) {
                   const  channel = 1
                }
                const newNoti = await prisma.notifications.create({
                    data:{
                        type:"email",
                        message:faker.lorem(),
                        channel:
                        userId:faker.id(),
                    }
                })
            }
        }catch(err){
            console.log("failer to create noti", err)
            process.exit(1)
        }
     } 
}

export  default fakeDataGen