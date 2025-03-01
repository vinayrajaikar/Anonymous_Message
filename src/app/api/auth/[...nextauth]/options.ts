import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prismaClient";

export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id: "credentials",
            name:"Credentials",
            credentials:{
                email: {label: "Email",type: "text"},
                password:{label:"Password",type:"password"},
            },
            async authorize(credentails:any): Promise<any>{
                try{
                    const user= await prisma.user.findFirst({
                        where:{
                            OR:[
                                {email:credentails?.identifier},
                                {username:credentails?.identifier},
                            ],
                        },
                    });

                    if(!user){
                        throw new Error("User not found")
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your email");
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentails.password, user.password
                    );

                    if (isPasswordCorrect) {
                        return user;
                    } 
                    else {
                        throw new Error("Incorrect Password");
                    }

                }
                catch(err:any){
                    throw new Error(err.message || "An unknown error occurred");
                }             
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
          //altering the token
          if (user) {
            token. id = user.id?.toString();
            token.isVerified = user?.isVerified;
            token.isAcceptingMessage = user?.isAcceptingMessage;
            token.username = user?.username;
          }
          return token;
        },
    
        async session({ session, token }) {
          if (token) {
            session.user.id = token.id as string;
            session.user.isVerified = token.isVerified as boolean;
            session.user.isAcceptingMessage = token.isAcceptingMessage as boolean;
            session.user.username = token.username as string;
          }
    
          return session;
        },
      },

      pages: {
        signIn: "/sign-in",
      },

      session: {
        strategy: "jwt",
      },

      secret: process.env.NEXTAUTH_SECRET

}