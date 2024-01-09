"use server";

import prisma from "@/lib/prisma";
import { Port, PortType } from "@prisma/client";
import { createError, handleError } from "./error";

export type PortDTO = {
  code: string;
  province: string;
  city: string;
  name: string;
  type: PortType;
  createDate: Date;
  status: boolean;
};

export type PortInput = {
  province: string;
  city: string;
  name: string;
  type: PortType;
};

function map(port: Port): PortDTO {
  return {
    code: port.code,
    province: port.province,
    city: port.city,
    name: port.name,
    type: port.type,
    createDate: port.createDate,
    status: port.status,
  };
}
export async function getPortCode() {
  const port = await prisma.port.findFirst({
    orderBy: {
      code: "desc",
    },
  });

  if (!port) {
    return "PORT0001";
  }

  return "PORT" + (Number(port.code.slice(-4)) + 1).toString().padStart(4, "0");
}

async function isUnique(input: PortInput, code: string | null = null) {
  const port = await prisma.port.findFirst({
    where: {
      province: { equals: input.province, mode: "insensitive" },
      city: { equals: input.city, mode: "insensitive" },
      name: { equals: input.name, mode: "insensitive" },
      type: input.type,
    },
  });
  if (!port || (code && port.code === code)) {
    return true;
  }

  return false;
}

export async function savePort(input: PortInput, code: string | null = null) {
  if (!(await isUnique(input, code))) {
    return [
      createError("province", "Sudah ada yang sama"),
      createError("city", "Sudah ada yang sama"),
      createError("name", "Sudah ada yang sama"),
      createError("type", "Sudah ada yang sama"),
    ];
  }

  try {
    if (!code) {
      await prisma.port.create({
        data: {
          code: await getPortCode(),
          province: input.province,
          city: input.city,
          name: input.name,
          type: input.type,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.port.update({
        where: {
          code: code,
        },
        data: {
          province: input.province,
          city: input.city,
          name: input.name,
          type: input.type,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllPorts() {
  const ports = await prisma.port.findMany();
  return ports.map(map);
}

export async function getPortOptions() {
  const ports = await getAllPorts();

  return ports
    .filter((port) => port.status)
    .map((port) => ({
      value: port.code,
      label: `${port.city} - ${port.name} - ${port.type}`,
    }));
}

export async function getPort(code: string) {
  const port = await prisma.port.findUnique({
    where: {
      code: code,
    },
  });

  if (!port) {
    return null;
  }

  return map(port);
}

export async function setPortStatus(code: string, status: boolean) {
  await prisma.port.update({
    where: {
      code: code,
    },
    data: {
      status: status,
    },
  });
}
