"use server";

import prisma from "@/lib/prisma";
import { ShipperGroup } from "@prisma/client";
import { handleError } from "./error";

export type ShipperGroupDTO = {
  code: string;
  name: string;
  description: string;
  createDate: Date;
  status: boolean;
};

export type ShipperGroupInput = {
  name: string;
  description?: string;
};

function map(shipperGroup: ShipperGroup): ShipperGroupDTO {
  return {
    code: shipperGroup.code,
    name: shipperGroup.name,
    description: shipperGroup.description,
    createDate: shipperGroup.createDate,
    status: shipperGroup.status,
  };
}

export async function getShipperGroupCode() {
  const shipperGroup = await prisma.shipperGroup.findFirst({
    orderBy: {
      code: "desc",
    },
  });

  if (!shipperGroup) {
    return "GROUP0001";
  }

  return (
    "GROUP" +
    (Number(shipperGroup.code.substring(5)) + 1).toString().padStart(4, "0")
  );
}

export async function saveShipperGroup(
  input: ShipperGroupInput,
  code: string | null = null
) {
  try {
    if (!code) {
      await prisma.shipperGroup.create({
        data: {
          code: await getShipperGroupCode(),
          name: input.name,
          description: input.description ?? "",
          status: true,
        },
      });
    } else {
      await prisma.shipperGroup.update({
        where: {
          code: code,
        },
        data: {
          name: input.name,
          description: input.description ?? "",
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllShipperGroup() {
  const shipperGroups = await prisma.shipperGroup.findMany();
  return shipperGroups.map(map);
}

export async function getShipperGroupOptions() {
  const shipperGroups = await getAllShipperGroup();

  return shipperGroups
    .filter((shipperGroup) => shipperGroup.status)
    .map((shipperGroup) => ({
      value: shipperGroup.code,
      label: shipperGroup.name,
    }));
}

export async function getShipperGroup(code: string) {
  const shipperGroup = await prisma.shipperGroup.findUnique({
    where: {
      code: code,
    },
  });

  if (!shipperGroup) {
    return null;
  }

  return map(shipperGroup);
}

export async function setShipperGroupStatus(code: string, status: boolean) {
  await prisma.shipperGroup.update({
    where: {
      code: code,
    },
    data: {
      status: status,
    },
  });
}
