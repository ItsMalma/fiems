"use server";

import prisma from "@/lib/prisma";
import { SuratPerintahMuat } from "@prisma/client";
import { handleError } from "./error";
import {
  getAllJobOrder,
  getJobOrder,
  getPriceVendorDetailByJobOrder,
} from "./jobOrder";
import { getAllUangJalan } from "./uangJalan";

export type SuratPerintahMuatDTO = {
  number: string;
  jobOrderNumber: string;
  jobOrder: {
    inquiryDetailId: string;
    inquiryDetail: {
      inquiryNumber: string;
      inquiry: {
        shipperCode: string;
        shipperName: string;
        shipperAddress: string;
      };
      deliveryToCode: string;
      deliveryToName: string;
      deliveryToAddress: string;
      routeCode: string;
      routeDescription: string;
    };
    consigneeCode: string;
    consigneeName: string;
    stuffingDate: Date;
    trackingRouteCode: string;
    trackingRouteDescription: string;
    trackingVendorCode: string;
    trackingVendorName: string;
    truckNumber: string;
    truckType: string;
    driverName: string;
    driverPhoneNumber: string;
    containerNumber1: string;
    sealNumber1: string;
    containerNumber2: string | null;
    sealNumber2: string | null;
  };
  uangJalanId: string;
  uangJalanTotal: number;
  createDate: Date;
};

export type SuratPerintahMuatInput = {
  jobOrder: string;
};

async function map(spm: SuratPerintahMuat): Promise<SuratPerintahMuatDTO> {
  const jobOrder = await getJobOrder(spm.jobOrderNumber);
  const uangJalan = await getUangJalanBySuratPerintahMuat(
    jobOrder?.trackingVendorCode ?? "",
    jobOrder?.trackingRouteCode ?? "",
    jobOrder?.truckType ?? ""
  );

  return {
    number: spm.number,
    jobOrderNumber: spm.jobOrderNumber,
    jobOrder: {
      inquiryDetailId: jobOrder?.inquiryDetailId ?? "",
      inquiryDetail: {
        inquiryNumber: jobOrder?.inquiryDetail.inquiryNumber ?? "",
        inquiry: {
          shipperCode: jobOrder?.inquiryDetail.inquiry.shipperCode ?? "",
          shipperName: jobOrder?.inquiryDetail.inquiry.shipperName ?? "",
          shipperAddress: jobOrder?.inquiryDetail.inquiry.shipperAddress ?? "",
        },
        deliveryToCode: jobOrder?.inquiryDetail.deliveryToCode ?? "",
        deliveryToName: jobOrder?.inquiryDetail.deliveryToName ?? "",
        deliveryToAddress: jobOrder?.inquiryDetail.deliveryToAddress ?? "",
        routeCode: jobOrder?.inquiryDetail.routeCode ?? "",
        routeDescription: jobOrder?.inquiryDetail.routeDescription ?? "",
      },
      consigneeCode: jobOrder?.consigneeCode ?? "",
      consigneeName: jobOrder?.consigneeName ?? "",
      stuffingDate: jobOrder?.stuffingDate ?? new Date(),
      trackingRouteCode: jobOrder?.trackingRouteCode ?? "",
      trackingRouteDescription: jobOrder?.trackingRouteDescription ?? "",
      trackingVendorCode: jobOrder?.trackingVendorCode ?? "",
      trackingVendorName: jobOrder?.trackingVendorName ?? "",
      truckNumber: jobOrder?.truckNumber ?? "",
      truckType: jobOrder?.truckType ?? "",
      driverName: jobOrder?.driverName ?? "",
      driverPhoneNumber: jobOrder?.driverPhoneNumber ?? "",
      containerNumber1: jobOrder?.containerNumber1 ?? "",
      sealNumber1: jobOrder?.sealNumber1 ?? "",
      containerNumber2: jobOrder?.containerNumber2 ?? null,
      sealNumber2: jobOrder?.sealNumber2 ?? null,
    },
    uangJalanId: uangJalan?.id ?? "",
    uangJalanTotal: uangJalan?.total ?? 0,
    createDate: spm.createDate,
  };
}

export async function getSuratPerintahMuatNumber() {
  const spm = await prisma.suratPerintahMuat.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  if (!spm) {
    return "SPM00001";
  }

  return "SPM" + (Number(spm.number.slice(-4)) + 1).toString().padStart(4, "0");
}

export async function getUangJalanBySuratPerintahMuat(
  trackingVendor: string,
  trackingRoute: string,
  truckType: string
) {
  const priceVendorDetail = await getPriceVendorDetailByJobOrder(
    trackingVendor,
    trackingRoute
  );

  const uangJalan = (await getAllUangJalan()).find(
    (uangJalan) =>
      uangJalan.priceVendorDetailId === priceVendorDetail?.id &&
      uangJalan.truckType === truckType
  );

  return uangJalan;
}

export async function saveSuratPerintahMuat(input: SuratPerintahMuatInput) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.suratPerintahMuat.create({
        data: {
          number: await getSuratPerintahMuatNumber(),
          jobOrderNumber: input.jobOrder,
          createDate: new Date(),
        },
      });
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllSuratPerintahMuat() {
  const spm = await prisma.suratPerintahMuat.findMany();
  return Promise.all(spm.map(map));
}

export async function getSuratPerintahMuat(number: string) {
  const spm = await prisma.suratPerintahMuat.findUnique({
    where: {
      number,
    },
  });

  if (!spm) {
    return null;
  }

  return map(spm);
}

export async function getSuratPerintahMuatJobOrderOptions() {
  return (await getAllJobOrder())
    .filter((jobOrder) => {
      return (
        jobOrder.td &&
        jobOrder.ta &&
        jobOrder.sandar &&
        !jobOrder.suratPerintahMuatNumber
      );
    })
    .map((jobOrder) => ({
      value: jobOrder.number,
      label: jobOrder.number,
    }));
}
