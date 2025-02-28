import {z} from "zod"
import { usernameValidation } from "@/schemas/signUpSchema"
import prisma from "@/lib/prismaClient";

const UsernameQuerySchema = z.object({
    username:usernameValidation
})

export async function GET(request: Request){
    try{
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        } 

        //validation with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result)

        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length>0
                ? usernameErrors.join(', ')
                : 'Invalid query parameters'
            },{status:400})
        }

        const {username} = result.data

        const existingVerifiedUser = await prisma.user.findFirst({
            where:{
                AND:[
                    {username},
                    {isVerified: true}
                ]
            }
        })

        if(existingVerifiedUser){
            return Response.json({
                success: false,
                message: 'Username is already taken',
            }, {status:400})
        }

        return Response.json({
            success: true,
            message: 'Username is unique'
        }, {status:400})

    }
    catch(err){
        console.error("Error checking username", err);
        return Response.json(
            {
                success: false,
                message: "Eror checking username"
            },
            {status:500}
        )
    }
}