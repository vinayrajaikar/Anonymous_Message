import prisma from "@/lib/prismaClient";

export async function POST(req: Request) {
  const { username, content } = await req.json();
  console.log(username, content);

  try { 
    // Find user by username
    const user = await prisma.user.findFirst({
      where: { username },
      select: { id: true, isAcceptingMessage: true }
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        { success: false, message: "User is not accepting messages" },
        { status: 403 }
      );
    }

    // Create and associate new message with user
    await prisma.message.create({
      data: {
        content,
        createdAt: new Date(),
        userId: user.id  // Assuming messages have a relation with `userId`
      },
    });

    return Response.json(
      { success: true, message: "Message sent successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error saving message:", error);
    return Response.json(
      { success: false, message: "Something went wrong on the server side" },
      { status: 500 }
    );
  }
}
