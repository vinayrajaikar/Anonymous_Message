import prisma from "@/lib/prismaClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request,{ params }: { params: { Id: string } }) {
    const session = await getServerSession(authOptions);
    const { Id } = await params;
    const id = parseInt(Id, 10);
    const userId = session?.user?.id;
    console.log(userId)
    if(!userId || !session){
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
          );
    }

    try {
        
        const message = await prisma.message.findUnique({
          where: { id },
        });
    
        
        if (!message || message.userId !== Number(userId)) {
          return Response.json({ message: 'Message not found or unauthorized' }, { status: 404 });
        }
    
        const messageId = Number(id);

        const deletedMessage = await prisma.message.delete({
          where: {
            id: messageId,  
          },
        });

        if(!deletedMessage){
            return Response.json({ message: 'Failed to delete message' }, { status: 500 });
        }

        return Response.json({ message: 'Message deleted successfully' }, { status: 200 });
    
      } 
      catch (error) {
        console.error(error);
        return Response.json({ message: 'Failed to delete message' }, { status: 500 });
      }
}