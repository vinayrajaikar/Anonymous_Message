import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import {User} from 'next-auth'
import prisma from "@/lib/prismaClient";
import { error } from "console";

export async function POST(req:Request){
    const session = await getServerSession(authOptions);

    if(!session || !session.user){
        return Response.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = session?.user;
    const userId = user?.id;
    const userIdInt = parseInt(userId, 10);
    const {acceptMessages} = await req.json();

    try{
        const updatedUser = await prisma.user.update({
            where: {id:userIdInt},
            data: {isAcceptingMessage:acceptMessages},
        });

        return Response.json(
            { success:true , message: "status updated successfully", updatedUser},
            { status:200}
        )
    }
    catch(err){
        console.error(err);
        return Response.json(
            { success:false, message: "Failed to updated status"},
            { status:500 }
        );
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
  
    if (!session || !session.user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
  
    const user = session?.user as User;
    const userId = user?.id;
    const userIdInt = parseInt(userId,10);

    try{
        const foundUser =await prisma.user.findUnique({
            where: {id:userIdInt},
            select: { isAcceptingMessage: true}
        });

        if (!foundUser) {
            return Response.json(
              { success: false, message: "User not found" },
              { status: 404 }
            );
          }
      
          return Response.json(
            {
              success: true,
              message: "User found",
              isAcceptingMessage: foundUser.isAcceptingMessage,
            },
            { status: 200 }
          );
    }
    catch(err){
        console.error("Error fetching user: ",error);
        return Response.json(
            {success:false, message: "Failed to get user"},
            { status: 500}
        );
    }
}