import {z} from "zod"

export const signInSchema = z.object({
    identifier: z.string().length(6,'Verification code must be 6 digits'),
    password: z.string(),
})