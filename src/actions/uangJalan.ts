"use server";

import prisma from "@/lib/prisma";
import { containerTypes } from "@/lib/utils/consts";
import { UangJalan } from "@prisma/client";
import lodash from "lodash";
import { FieldData } from "rc-field-form/es/interface";
import { handleError } from "./error";
import {
  getAllPriceVendorDetails,
  getAllPriceVendors,
  getPriceVendorDetail,
} from "./priceVendor";
import { getAllVehicles } from "./vehicle";

export type UangJalanDTO = {
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
  bbm: number;
  tol: number;
  biayaBuruh: number;
  meal: number;
  lainLain: number;
  total: number;
  createDate: Date;
  status: boolean;
};

export type UangJalanInput = {
  id?: string;
  vendor: string;
  route: string;
  containerSize: string;
  truckType: string;
  bbm: number;
  tol: number;
  biayaBuruh: number;
  meal: number;
  lainLain: number;
};

async function map(uangJalan: UangJalan): Promise<UangJalanDTO> {
  const priceVendorDetail = await getPriceVendorDetail(
    uangJalan.priceVendorDetailId
  );

  return {
    id: uangJalan.id,
    priceVendorDetailId: uangJalan.priceVendorDetailId,
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
    truckType: uangJalan.truckType,
    bbm: uangJalan.bbm,
    tol: uangJalan.tol,
    biayaBuruh: uangJalan.biayaBuruh,
    meal: uangJalan.meal,
    lainLain: uangJalan.lainLain,
    total:
      uangJalan.bbm +
      uangJalan.tol +
      uangJalan.biayaBuruh +
      uangJalan.meal +
      uangJalan.lainLain,
    createDate: uangJalan.createDate,
    status: uangJalan.status && (priceVendorDetail?.status ?? true),
  };
}

async function getPriceVendorDetailByUangJalan(
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

export async function saveUangJalan(
  input: UangJalanInput,
  id: string | null = null
) {
  try {
    const fieldDatas: FieldData[] = [];

    const priceVendorDetail = await getPriceVendorDetailByUangJalan(
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

    const uangJalan = await prisma.uangJalan.findFirst({
      where: {
        priceVendorDetailId: priceVendorDetail?.id,
        truckType: input.truckType,
      },
    });
    if (uangJalan && id && uangJalan.id !== id) {
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
      await prisma.uangJalan.create({
        data: {
          priceVendorDetailId: priceVendorDetail.id,
          truckType: input.truckType,
          bbm: input.bbm,
          tol: input.tol,
          biayaBuruh: input.biayaBuruh,
          meal: input.meal,
          lainLain: input.lainLain,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.uangJalan.update({
        where: {
          id,
        },
        data: {
          priceVendorDetailId: priceVendorDetail.id,
          truckType: input.truckType,
          bbm: input.bbm,
          tol: input.tol,
          biayaBuruh: input.biayaBuruh,
          meal: input.meal,
          lainLain: input.lainLain,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllUangJalan() {
  const uangJalan = await prisma.uangJalan.findMany();
  return Promise.all(uangJalan.map(map));
}

export async function getUangJalan(id: string) {
  const uangJalan = await prisma.uangJalan.findUnique({
    where: {
      id,
    },
  });

  if (!uangJalan) {
    return null;
  }

  return map(uangJalan);
}

export async function setUangJalanStatus(id: string, status: boolean) {
  await prisma.uangJalan.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getUangJalanVendorOptions() {
  return lodash.uniqBy(
    (await getAllPriceVendors()).map((priceVendor) => ({
      label: priceVendor.vendorName,
      value: priceVendor.vendorCode,
    })),
    (opt) => opt.value
  );
}

export async function getUangJalanRouteOptions() {
  return lodash.uniqBy(
    (await getAllPriceVendorDetails()).map((priceVendorDetail) => ({
      label: priceVendorDetail.routeDescription,
      value: priceVendorDetail.routeCode,
    })),
    (opt) => opt.value
  );
}

export async function getUangJalanContainerSizeOptions() {
  return lodash.uniqBy(
    (await getAllPriceVendorDetails()).map((priceVendorDetail) => ({
      label: priceVendorDetail.containerSize,
      value: priceVendorDetail.containerSize,
    })),
    (opt) => opt.value
  );
}

export async function getPriceVendorContainerTypeOptions() {
  return containerTypes.map((containerType) => {
    return {
      label: containerType,
      value: containerType,
    };
  });
}

export async function getUangJalanTruckTypeOptions(vendor: string) {
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
