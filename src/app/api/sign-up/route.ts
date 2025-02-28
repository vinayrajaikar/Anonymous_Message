import prisma from "@/lib/prismaClient";
import bcyrpt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request){
    try{
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUsername =await prisma.user.findFirst({
            where:{
                AND:[
                    {username},
                    {isVerified:true}
                ],
            },
        })

        // console.log(existingUserVerifiedByUsername)

        if(existingUserVerifiedByUsername){
            return Response.json(
                {
                success:false,
                message:"Username is already taken"
                }, 
                {
                status:400
                }
            )
        }

        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        })

        const verifyCode = Math.floor(10000+Math.random()*900000).toString()

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User already exist with this email"
                },{status: 400})
            }
            else{
                const hashedPassword = await bcyrpt.hash(password,10)
                await prisma.user.update({
                    where: { email: existingUserByEmail.email },
                    data: {
                        password: hashedPassword,
                        verifyCode: verifyCode,
                        verifyCodeExpiry: new Date(Date.now() + 3600000) // Set expiry time to 1 hour
                    }
                });
            }
        }
        else{
            const hashedPassword = await bcyrpt.hash(password,10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours()+1)//for 1 hr

            const newUser = await prisma.user.create({
                data:{                
                    username,
                    email,
                    password: hashedPassword,
                    verifyCode,
                    verifyCodeExpiry: expiryDate,
                    isVerified: false,
                    isAcceptingMessage: true,
                    messages: {
                        create: [] 
                    },
                }
            })
        }

        //send Verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success:false,
                message:emailResponse.message
            }, {status:500})
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please Verify your email"
        }, {
            status:201
        })
    }
    catch(err){
        console.error('Error registering user', err)
        return Response.json(
            {
                success:false,
                message:"Error registering user"
            },
            {
                status:500
            }
        )
    }
}