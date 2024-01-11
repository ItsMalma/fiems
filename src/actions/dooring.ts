"use server";

import prisma from "@/lib/prisma";
import { Dooring } from "@prisma/client";
import dayjs from "dayjs";
import { createError } from "./error";
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
  isHasStorageDemurrage: boolean;
  freeTimeStorage: number | null;
  freeTimeDemurrage: number | null;
  hariStorage: number | null;
  hariDemurrage: number | null;
  masa1: number | null;
  priceMasa1: number | null;
  nilaiMasa1: number | null;
  masa2: number | null;
  priceMasa2: number | null;
  nilaiMasa2: number | null;
  masa3: number | null;
  priceMasa3: number | null;
  nilaiMasa3: number | null;
  nilaiDemurrage: number | null;
  totalStorage: number | null;
  totalDemurrage: number | null;
  totalBiaya: number | null;
  createDate: Date;
};

async function map(dooring: Dooring): Promise<DooringDTO> {
  const jobOrder = await getJobOrder(dooring.jobOrderNumber);
  const storageDemurrage = await prisma.storageDemurage.findFirst({
    where: {
      dooringId: dooring.id,
    },
  });

  const hariStorage = storageDemurrage?.freeTimeStorage
    ? dayjs(dooring.actualDooring).diff(dooring.bongkarKapal, "day") -
      storageDemurrage.freeTimeStorage
    : null;
  const hariDemurrage = storageDemurrage?.freeTimeDemurage
    ? dayjs(dooring.actualDooring).diff(dooring.bongkarKapal, "day") -
      storageDemurrage.freeTimeDemurage
    : null;
  const nilaiMasa1 =
    storageDemurrage?.masa1 && storageDemurrage?.priceMasa1
      ? storageDemurrage.masa1 * storageDemurrage.priceMasa1
      : null;
  const nilaiMasa2 =
    storageDemurrage?.masa2 && storageDemurrage?.priceMasa2
      ? storageDemurrage.masa2 * storageDemurrage.priceMasa2
      : null;
  const nilaiMasa3 =
    storageDemurrage?.masa3 && storageDemurrage?.priceMasa3
      ? storageDemurrage.masa3 * storageDemurrage.priceMasa3
      : null;
  const totalStorage =
    nilaiMasa1 && nilaiMasa2 && nilaiMasa3
      ? nilaiMasa1 + nilaiMasa2 + nilaiMasa3
      : null;
  const totalDemurrage =
    hariDemurrage && storageDemurrage?.nilaiDemurage
      ? hariDemurrage * storageDemurrage.nilaiDemurage
      : null;

  return {
    id: dooring.id,
    jobOrderNumber: dooring.jobOrderNumber,
    jobOrder: jobOrder!,
    bongkarKapal: dooring.bongkarKapal,
    estimateDooring: dooring.estimateDooring,
    actualDooring: dooring.actualDooring,
    isHasStorageDemurrage: storageDemurrage != null,
    freeTimeStorage: storageDemurrage?.freeTimeStorage ?? null,
    freeTimeDemurrage: storageDemurrage?.freeTimeDemurage ?? null,
    hariStorage,
    hariDemurrage,
    masa1: storageDemurrage?.masa1 ?? null,
    priceMasa1: storageDemurrage?.priceMasa1 ?? null,
    nilaiMasa1,
    masa2: storageDemurrage?.masa2 ?? null,
    priceMasa2: storageDemurrage?.priceMasa2 ?? null,
    nilaiMasa2,
    masa3: storageDemurrage?.masa3 ?? null,
    priceMasa3: storageDemurrage?.priceMasa3 ?? null,
    nilaiMasa3,
    nilaiDemurrage: storageDemurrage?.nilaiDemurage ?? null,
    totalStorage,
    totalDemurrage,
    totalBiaya:
      totalStorage && totalDemurrage ? totalStorage + totalDemurrage : null,
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

export async function getDooringByID(id: string): Promise<DooringDTO | null> {
  const dooring = await prisma.dooring.findUnique({
    where: {
      id,
    },
  });

  if (!dooring) {
    return null;
  }

  return await map(dooring);
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

type ConfirmDooringInput = {
  freeTimeStorage: number;
  freeTimeDemurrage: number;
  masa1: number;
  priceMasa1: number;
  masa2: number;
  priceMasa2: number;
  masa3: number;
  priceMasa3: number;
  nilaiDemurrage: number;
};

export async function confirmDooring(id: string, input: ConfirmDooringInput) {
  const dooring = await getDooringByID(id);
  if (!dooring) return;

  const hariStorage =
    dayjs(dooring.actualDooring).diff(dooring.bongkarKapal, "day") -
    input.freeTimeStorage;

  if (input.masa1 + input.masa2 + input.masa3 !== hariStorage) {
    return [
      createError(
        "masa1",
        "Harus sama dengan hari storage jika ditambah masa 2 dan masa 3"
      ),
      createError(
        "masa2",
        "Harus sama dengan hari storage jika ditambah masa 1 dan masa 3"
      ),
      createError(
        "masa3",
        "Harus sama dengan hari storage jika ditambah masa 1 dan masa 2"
      ),
    ];
  }

  const storageDemurage = await prisma.storageDemurage.findFirst({
    where: {
      dooringId: id,
    },
  });

  if (storageDemurage) {
    await prisma.storageDemurage.update({
      where: {
        id: storageDemurage.id,
      },
      data: {
        freeTimeStorage: input.freeTimeStorage,
        freeTimeDemurage: input.freeTimeDemurrage,
        masa1: input.masa1,
        priceMasa1: input.priceMasa1,
        masa2: input.masa2,
        priceMasa2: input.priceMasa2,
        masa3: input.masa3,
        priceMasa3: input.priceMasa3,
        nilaiDemurage: input.nilaiDemurrage,
      },
    });
  } else {
    await prisma.storageDemurage.create({
      data: {
        dooring: {
          connect: {
            id,
          },
        },
        freeTimeStorage: input.freeTimeStorage,
        freeTimeDemurage: input.freeTimeDemurrage,
        masa1: input.masa1,
        priceMasa1: input.priceMasa1,
        masa2: input.masa2,
        priceMasa2: input.priceMasa2,
        masa3: input.masa3,
        priceMasa3: input.priceMasa3,
        nilaiDemurage: input.nilaiDemurrage,
      },
    });
  }
}
