"use server";

import prisma from "@/lib/prisma";
import { vesselSatuan } from "@/lib/utils/consts";
import { Vessel } from "@prisma/client";
import { getCustomer } from "./customer";
import { handleError } from "./error";

export type VesselDTO = {
  id: string;
  shippingCode: string;
  shippingName: string;
  name: string;
  capacity: number;
  satuan: string;
  createDate: Date;
  status: boolean;
};

export type VesselInput = {
  shipping: string;
  name: string;
  capacity: number;
  satuan: string;
};

async function map(vessel: Vessel): Promise<VesselDTO> {
  const shipping = await getCustomer(vessel.shippingCode);

  return {
    id: vessel.id,
    shippingCode: shipping?.code ?? "",
    shippingName: shipping?.name ?? "",
    name: vessel.name,
    capacity: vessel.capacity,
    satuan: vessel.satuan,
    createDate: vessel.createDate,
    status: vessel.status && (shipping?.status ?? true),
  };
}

export async function saveVessel(input: VesselInput, id: string | null = null) {
  try {
    if (!id) {
      await prisma.vessel.create({
        data: {
          shippingCode: input.shipping,
          name: input.name,
          capacity: input.capacity,
          satuan: input.satuan,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.vessel.update({
        where: {
          id,
        },
        data: {
          shippingCode: input.shipping,
          name: input.name,
          capacity: input.capacity,
          satuan: input.satuan,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllVessels() {
  const vessels = await prisma.vessel.findMany();
  return Promise.all(vessels.map(map));
}

export async function getVesselOptions() {
  const vessels = await getAllVessels();

  return vessels
    .filter((vessel) => vessel.status)
    .map((vessel) => ({
      value: vessel.name,
      label: vessel.id,
    }));
}

export async function getVessel(id: string) {
  const vessel = await prisma.vessel.findUnique({
    where: {
      id,
    },
  });

  if (!vessel) {
    return null;
  }

  return await map(vessel);
}

export async function setVesselStatus(id: string, status: boolean) {
  await prisma.vessel.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getVesselSatuanOptions() {
  return vesselSatuan.map((satuan) => ({
    value: satuan,
    label: satuan,
  }));
}
