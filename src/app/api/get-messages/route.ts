import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prismaClient";
import { User } from "next-auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
  
    const user = session?.user as User;
    const userId = parseInt(user?.id, 10); 

    if (isNaN(userId)) {
        return Response.json(
          { success: false, message: "Invalid user ID format" },
          { status: 400 }
    )};

    try{
        const userWithMessages = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              messages: {
                orderBy: { createdAt: "desc" }, // Sorting messages by createdAt (descending)
              },
            },
        });

        if (!userWithMessages) {
            return Response.json(
              { success: false, message: "User not found" },
              { status: 404 }
            );
        }

        if (!userWithMessages.messages || userWithMessages.messages.length === 0) {
            return Response.json(
              { success: true, message: "No messages found for user" },
              { status: 200 }
            );
        }
      
          return Response.json(
            { success: true, message: "User found", messages: userWithMessages.messages },
            { status: 200 }
        );
    }
    catch(err){
        console.error("Error fetching user messages:", err);
        return Response.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }

}