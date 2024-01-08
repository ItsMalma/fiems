"use server";

import prisma from "@/lib/prisma";
import { User, UserAccess } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createError } from "./error";

export type UserDTO = {
  id: string;
  username: string;
  accesses: UserAccess[];
  createDate: Date;
};

function map(user: User): UserDTO {
  return {
    id: user.id,
    username: user.username,
    accesses: user.accesses,
    createDate: user.createDate,
  };
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username, password },
  });

  if (!user) {
    return [
      createError("username", "Username atau password salah"),
      createError("password", "Username atau password salah"),
    ];
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT as string);

  cookies().set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: true,
  });

  redirect("/");
}
