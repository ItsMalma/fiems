"use server";

import prisma from "@/lib/prisma";
import { UangMuat } from "@prisma/client";
import lodash from "lodash";
import { FieldData } from "rc-field-form/es/interface";
import { handleError } from "./error";
import {
  getAllPriceVendorDetails,
  getAllPriceVendors,
  getPriceVendorDetail,
} from "./priceVendor";
import { getAllVehicles } from "./vehicle";

export type UangMuatDTO = {
  id: string;
  priceVendorDetailId: string;
  priceVendorDetail: {
    priceVendorId: string;
    priceVendor: {
      vendorCode: string;
      vendorName: string;
    };
    routeCode: string;
    routeDescription: string;
    containerSize: string;
  };
  truckType: string;
  biayaBuruh: number;
  lainLain: number;
  total: number;
  createDate: Date;
  status: boolean;
};

export type UangMuatInput = {
  id?: string;
  vendor: string;
  route: string;
  containerSize: string;
  truckType: string;
  biayaBuruh: number;
  lainLain: number;
};

async function map(uangMuat: UangMuat): Promise<UangMuatDTO> {
  const priceVendorDetail = await getPriceVendorDetail(
    uangMuat.priceVendorDetailId
  );

  return {
    id: uangMuat.id,
    priceVendorDetailId: uangMuat.priceVendorDetailId,
    priceVendorDetail: {
      priceVendorId: priceVendorDetail?.priceVendorId ?? "",
      priceVendor: {
        vendorCode: priceVendorDetail?.priceVendor?.vendorCode ?? "",
        vendorName: priceVendorDetail?.priceVendor?.vendorName ?? "",
      },
      routeCode: priceVendorDetail?.routeCode ?? "",
      routeDescription: priceVendorDetail?.routeDescription ?? "",
      containerSize: priceVendorDetail?.containerSize ?? "",
    },
    truckType: uangMuat.truckType,
    biayaBuruh: uangMuat.biayaBuruh,
    lainLain: uangMuat.lainLain,
    total: uangMuat.biayaBuruh + uangMuat.lainLain,
    createDate: uangMuat.createDate,
    status: uangMuat.status && (priceVendorDetail?.status ?? true),
  };
}

async function getPriceVendorDetailByUangMuat(
  vendor: string,
  route: string,
  containerSize: string
) {
  const priceVendorDetail = (await getAllPriceVendorDetails()).find(
    (priceVendorDetail) =>
      priceVendorDetail.priceVendor.vendorCode === vendor &&
      priceVendorDetail.routeCode === route &&
      priceVendorDetail.containerSize === containerSize
  );

  return priceVendorDetail;
}

export async function saveUangMuat(
  input: UangMuatInput,
  id: string | null = null
) {
  try {
    const fieldDatas: FieldData[] = [];

    const priceVendorDetail = await getPriceVendorDetailByUangMuat(
      input.vendor,
      input.route,
      input.containerSize
    );
    if (!priceVendorDetail) {
      fieldDatas.push(
        { name: "vendor", errors: ["Tidak dapat menemukan vendor"] },
        { name: "route", errors: ["Tidak dapat menemukan route"] },
        {
          name: "containerSize",
          errors: ["Tidak dapat menemukan container size"],
        }
      );
      return fieldDatas;
    }

    const uangMuat = await prisma.uangMuat.findFirst({
      where: {
        priceVendorDetailId: priceVendorDetail?.id,
        truckType: input.truckType,
      },
    });
    if (uangMuat && id && uangMuat.id !== id) {
      fieldDatas.push(
        { name: "vendor", errors: ["Sudah ada yang sama"] },
        { name: "route", errors: ["Sudah ada yang sama"] },
        {
          name: "containerSize",
          errors: ["Sudah ada yang sama"],
        },
        { name: "truckType", errors: ["Sudah ada yang sama"] }
      );
      return fieldDatas;
    }

    if (!id) {
      await prisma.uangMuat.create({
        data: {
          priceVendorDetailId: priceVendorDetail.id,
          truckType: input.truckType,
          biayaBuruh: input.biayaBuruh,
          lainLain: input.lainLain,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.uangMuat.update({
        where: {
          id,
        },
        data: {
          priceVendorDetailId: priceVendorDetail.id,
          truckType: input.truckType,
          biayaBuruh: input.biayaBuruh,
          lainLain: input.lainLain,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllUangMuat() {
  const uangMuat = await prisma.uangMuat.findMany();
  return Promise.all(uangMuat.map(map));
}

export async function getUangMuat(id: string) {
  const uangMuat = await prisma.uangMuat.findUnique({
    where: {
      id,
    },
  });

  if (!uangMuat) {
    return null;
  }

  return map(uangMuat);
}

export async function setUangMuatStatus(id: string, status: boolean) {
  await prisma.uangMuat.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getUangMuatVendorOptions() {
  return lodash.uniqBy(
    (await getAllPriceVendors()).map((priceVendor) => ({
      label: priceVendor.vendorName,
      value: priceVendor.vendorCode,
    })),
    (opt) => opt.value
  );
}

export async function getUangMuatRouteOptions() {
  return lodash.uniqBy(
    (await getAllPriceVendorDetails()).map((priceVendorDetail) => ({
      label: priceVendorDetail.routeDescription,
      value: priceVendorDetail.routeCode,
    })),
    (opt) => opt.value
  );
}

export async function getUangMuatContainerSizeOptions() {
  return lodash.uniqBy(
    (await getAllPriceVendorDetails()).map((priceVendorDetail) => ({
      label: priceVendorDetail.containerSize,
      value: priceVendorDetail.containerSize,
    })),
    (opt) => opt.value
  );
}

export async function getUangMuatTruckTypeOptions(vendor: string) {
  return lodash.uniqBy(
    (await getAllVehicles())
      .filter((vehicle) => vehicle.vendorCode === vendor)
      .map((vehicle) => ({
        label: vehicle.truckType,
        value: vehicle.truckType,
      })),
    (opt) => opt.value
  );
}
