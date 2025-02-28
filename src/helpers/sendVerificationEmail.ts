import {resend} from "@/lib/resend"
import VerificationEmail from "../../emails/VerificationEmail"
import { ApiResponse } from "@/types/ApiResponse"

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{

    try{
        await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Cryptic message | verification Code',
        react: VerificationEmail({username,otp:verifyCode}),
        });
        return {success:true, message: 'Verification email send successfully'}
    } catch(err){
        console.error("Error sending verification email", err)
        return {
            success:false,
            message:'Failed to send verifiaction email'
        }
    }

}