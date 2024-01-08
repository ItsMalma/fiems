import prisma from "@/lib/prisma";
import * as jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = jwt.verify(body.token, process.env.JWT as string) as {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      return Response.json({ data: null });
    }

    return Response.json({
      data: user,
    });
  } catch (err) {
    return Response.json({ data: null });
  }
}
