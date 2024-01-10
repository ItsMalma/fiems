"use server";

import prisma from "@/lib/prisma";
import { Dooring } from "@prisma/client";
import { getJobOrder } from "./jobOrder";

export type DooringDTO = {
  id: string;
  jobOrderNumber: string;
  jobOrder: {
    inquiryDetail: {
      inquiryNumber: string;
      inquiry: {
        salesName: string;
        shipperName: string;
        createDate: Date;
      };
      shippingCode: string;
      shippingName: string;
      vesselId: string;
      vesselName: string;
      voyage: string;
      etd: Date;
      eta: Date;
      loadDate: Date;
      deliveryToName: string;
      routeDescription: string;
      portName: string;
      containerSize: string;
      containerType: string;
      serviceType: string;
      typeOrder: string;
    };
    roNumber: string;
    /**
     * Vendor's Name
     */
    consigneeName: string;
    stuffingDate: Date;
    trackingRouteDescription: string;
    trackingVendorName: string;
    truckNumber: string;
    driverName: string;
    containerNumber1: string;
    sealNumber1: string;
    containerNumber2: string | null;
    sealNumber2: string | null;
    td: Date | null;
    ta: Date | null;
    sandar: Date | null;
    suratJalanNumber: string | null;
  };
  bongkarKapal: Date | null;
  estimateDooring: Date | null;
  actualDooring: Date | null;
  createDate: Date;
};

async function map(dooring: Dooring): Promise<DooringDTO> {
  const jobOrder = await getJobOrder(dooring.jobOrderNumber);

  return {
    id: dooring.id,
    jobOrderNumber: dooring.jobOrderNumber,
    jobOrder: jobOrder!,
    bongkarKapal: dooring.bongkarKapal,
    estimateDooring: dooring.estimateDooring,
    actualDooring: dooring.actualDooring,
    createDate: dooring.createDate,
  };
}

export async function getAllDooring(): Promise<DooringDTO[]> {
  const doorings = await prisma.dooring.findMany();

  return await Promise.all(doorings.map(map));
}

type DooringInput = {
  jobOrderNumber: string;
  bongkarKapal: Date;
  estimateDooring: Date;
  actualDooring: Date;
};

export async function saveDooring(input: DooringInput) {
  const dooring = await getDooringByJobOrderNumber(input.jobOrderNumber);

  if (!dooring) {
    return await prisma.dooring.create({
      data: {
        jobOrder: {
          connect: { number: input.jobOrderNumber },
        },
        bongkarKapal: input.bongkarKapal,
        estimateDooring: input.estimateDooring,
        actualDooring: input.actualDooring,
      },
    });
  } else {
    return await prisma.dooring.update({
      where: {
        id: dooring.id,
      },
      data: {
        bongkarKapal: input.bongkarKapal,
        estimateDooring: input.estimateDooring,
        actualDooring: input.actualDooring,
      },
    });
  }
}

export async function getDooringByJobOrderNumber(
  jobOrderNumber: string
): Promise<DooringDTO | null> {
  const dooring = await prisma.dooring.findFirst({
    where: {
      jobOrderNumber,
    },
  });

  if (!dooring) {
    return null;
  }

  return await map(dooring);
}
