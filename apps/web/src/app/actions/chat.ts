"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import z from "zod";

const getChatThreadByIdSchema = z.object({
  id: z.string(),
});

export async function getChatThreadById(
  input: z.infer<typeof getChatThreadByIdSchema>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validation = getChatThreadByIdSchema.safeParse(input);

  if (validation.error) {
    return {
      errors: validation.error.flatten(),
    };
  }

  return {
    data: await prisma.chat.findUnique({
      where: {
        id: validation.data.id,
        user_id: session.user.id,
      },
    }),
  };
}

export async function getChatHistory() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const chats = await prisma.chat.findMany({
      where: {
        user_id: session.user.id,
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        title: true,
        created_at: true,
        messages: true,
      },
    });

    return chats;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
