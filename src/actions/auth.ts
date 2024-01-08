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
  const user = await prisma.user.findFirst({
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

export async function verify(token: string) {
  try {
    const payload = jwt.verify(token, process.env.JWT as string) as {
      id: string;
    };

    const user = await prisma.user.findFirst({
      where: { id: payload.id },
    });
    if (!user) {
      return null;
    }

    return map(user);
  } catch (err) {
    return null;
  }
}

export async function getUser() {
  const token = cookies().get("token");
  if (!token) {
    return null;
  }

  return await verify(token.value);
}

export async function logout() {
  cookies().delete("token");
  redirect("/login");
}
