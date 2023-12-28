"use server";

import prisma from "@/lib/prisma";
import { truckTypes } from "@/lib/utils/consts";
import { Vehicle } from "@prisma/client";
import { getCustomer } from "./customer";
import { handleError } from "./error";

export type VehicleDTO = {
  vendorCode: string;
  vendorName: string;
  truckNumber: string;
  merk: string;
  truckType: string;
  mesinNumber: string;
  rangkaNumber: string;
  silinder: number;
  color: string;
  stnkExpired: Date;
  pajakExpired: Date;
  keurExpired: Date;
  createDate: Date;
  status: boolean;
};

export type VehicleInput = {
  vendor: string;
  truckNumber: string;
  merk: string;
  truckType: string;
  mesinNumber: string;
  rangkaNumber: string;
  silinder: number;
  color: string;
  stnkExpired: Date;
  pajakExpired: Date;
  keurExpired: Date;
};

async function map(vehicle: Vehicle): Promise<VehicleDTO> {
  const vendor = await getCustomer(vehicle.vendorCode);

  return {
    vendorCode: vendor?.code ?? "",
    vendorName: vendor?.name ?? "",
    truckNumber: vehicle.truckNumber,
    merk: vehicle.merk,
    truckType: vehicle.truckType,
    mesinNumber: vehicle.mesinNumber,
    rangkaNumber: vehicle.rangkaNumber,
    silinder: vehicle.silinder,
    color: vehicle.color,
    stnkExpired: vehicle.stnkExpired,
    pajakExpired: vehicle.pajakExpired,
    keurExpired: vehicle.keurExpired,
    createDate: vehicle.createDate,
    status: vehicle.status && (vendor?.status ?? true),
  };
}

export async function saveVehicle(
  input: VehicleInput,
  truckNumber: string | null = null
) {
  try {
    if (!truckNumber) {
      await prisma.vehicle.create({
        data: {
          vendorCode: input.vendor,
          truckNumber: input.truckNumber,
          merk: input.merk,
          truckType: input.truckType,
          mesinNumber: input.mesinNumber,
          rangkaNumber: input.rangkaNumber,
          silinder: input.silinder,
          color: input.color,
          stnkExpired: input.stnkExpired,
          pajakExpired: input.pajakExpired,
          keurExpired: input.keurExpired,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.vehicle.update({
        where: {
          truckNumber,
        },
        data: {
          vendorCode: input.vendor,
          truckNumber: input.truckNumber,
          merk: input.merk,
          truckType: input.truckType,
          mesinNumber: input.mesinNumber,
          rangkaNumber: input.rangkaNumber,
          silinder: input.silinder,
          color: input.color,
          stnkExpired: input.stnkExpired,
          pajakExpired: input.pajakExpired,
          keurExpired: input.keurExpired,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllVehicles() {
  const vehicles = await prisma.vehicle.findMany();
  return Promise.all(vehicles.map(map));
}

export async function getVehicleOptions() {
  const vehicles = await getAllVehicles();

  return vehicles
    .filter((vehicle) => vehicle.status)
    .map((vehicle) => ({
      value: vehicle.truckNumber,
      label: vehicle.truckNumber,
    }));
}

export async function getVehicle(truckNumber: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      truckNumber,
    },
  });

  if (!vehicle) {
    return null;
  }

  return await map(vehicle);
}

export async function setVehicleStatus(truckNumber: string, status: boolean) {
  await prisma.vehicle.update({
    where: {
      truckNumber,
    },
    data: {
      status,
    },
  });
}

const merk = [
  "Hino",
  "Mitsubishi",
  "Isuzu",
  "UD",
  "Tata",
  "Mercedes Benz",
  "Toyota",
  "Volvo",
  "Renault",
  "Scania",
  "MAN",
];

export async function getMerkOptions() {
  return merk.map((m) => ({
    value: m,
    label: m,
  }));
}

export async function getTruckTypeOptions() {
  return truckTypes.map((t) => ({
    value: t,
    label: t,
  }));
}
