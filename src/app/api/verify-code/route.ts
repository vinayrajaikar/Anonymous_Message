import {z} from "zod";
import {usernameValidation} from "@/schemas/signUpSchema"
import prisma from "@/lib/prismaClient";

const UsernameQuerySchema = z.object({
    username:usernameValidation,
})

export async function POST(request:Request){
    console.log("hello0");
    try{
        const { username, code } = await request.json();
        console.log(username,code)

        const validationUser = UsernameQuerySchema.safeParse({username});
        if(!validationUser.success){
            return Response.json({
                success: false,
                message: "Invalid username format"
            },{status:400})
        }

        const user = await prisma.user.findFirst({
            where: {
              username,
            },
          });

        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            })
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            await prisma.user.update({
              where: { id: user.id },
              data: { isVerified: true },
            });

            return Response.json({
                success:true,
                message: "Account verified successfully"
            },{ status:200 })
        }   

        else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code expired, signup to get registered"
            },{ status:400})
        }

        else{
            return Response.json({
                success:false,
                message: "Incorrect verfication code"
            },{ status:400})
        }

    }
    catch(err){
        console.error("Error verifying code: ", err);
        return Response.json({
            success: false,
            message: "Error verifying code",
        },{ status:500})
    }
}