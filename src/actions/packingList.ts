"use server";

import { getCustomer } from "@/actions/customer";
import { getInquiryDetail } from "@/actions/inquiry";
import prisma from "@/lib/prisma";
import { JobOrder, PackingList } from "@prisma/client";
import dayjs from "dayjs";
import { handleError } from "./error";
import { getAllJobOrder } from "./jobOrder";
import { getVessel } from "./vessel";

export type PackingListDetailDTO = {
  jobOrderNumber: string;
  jobOrder: {
    inquiryDetailId: string;
    inquiryDetail: {
      inquiryNumber: string;
      inquiry: {
        shipperCode: string;
        shipperName: string;
        shipperCity: string;
      };
      deliveryToCode: string;
      deliveryToName: string;
      deliveryToCity: string;
      portCode: string;
      portName: string;
      serviceType: string;
    };
    consigneeCode: string;
    consigneeName: string;
    containerNumber1: string;
    sealNumber1: string;
    containerNumber2: string | null;
    sealNumber2: string | null;
    suratJalanNumber: string;
    bastNumber: string;
  };
  createDate: Date;
};

export type PackingListDTO = {
  number: string;
  shippingCode: string;
  shippingName: string;
  vesselId: string;
  vesselName: string;
  voyage: string;
  details: PackingListDetailDTO[];
  createDate: Date;
};

export type PackingListDetailInput = {
  jobOrderNumber: string;
};

export type PackingListInput = {
  shipping: string;
  vessel: string;
  voyage: string;
  details: PackingListDetailInput[];
};

async function mapDetail(jobOrder: JobOrder): Promise<PackingListDetailDTO> {
  const inquiryDetail = await getInquiryDetail(jobOrder.inquiryDetailId);
  const consignee = await getCustomer(jobOrder.consigneeCode);
  const suratJalan = await prisma.suratJalan.findFirst({
    where: {
      jobOrderNumber: jobOrder.number,
    },
  });
  const bast = await prisma.beritaAcaraSerahTerima.findFirst({
    where: {
      suratJalanNumber: suratJalan?.number ?? "",
    },
  });

  return {
    jobOrderNumber: jobOrder.number,
    jobOrder: {
      inquiryDetailId: jobOrder.inquiryDetailId,
      inquiryDetail: {
        inquiryNumber: inquiryDetail?.inquiryNumber ?? "",
        inquiry: {
          shipperCode: inquiryDetail?.inquiry.shipperCode ?? "",
          shipperName: inquiryDetail?.inquiry.shipperName ?? "",
          shipperCity: inquiryDetail?.inquiry.shipperCity ?? "",
        },
        deliveryToCode: inquiryDetail?.deliveryToCode ?? "",
        deliveryToName: inquiryDetail?.deliveryToName ?? "",
        deliveryToCity: inquiryDetail?.deliveryToCity ?? "",
        portCode: inquiryDetail?.portCode ?? "",
        portName: inquiryDetail?.portName ?? "",
        serviceType: inquiryDetail?.serviceType ?? "",
      },
      consigneeCode: jobOrder.consigneeCode,
      consigneeName: consignee?.name ?? "",
      containerNumber1: jobOrder.containerNumber1,
      sealNumber1: jobOrder.sealNumber1,
      containerNumber2: jobOrder.containerNumber2,
      sealNumber2: jobOrder.sealNumber2,
      suratJalanNumber: suratJalan?.number ?? "",
      bastNumber: bast?.number ?? "",
    },
    createDate: jobOrder.createDate,
  };
}

async function map(packingList: PackingList): Promise<PackingListDTO> {
  const shipping = await getCustomer(packingList.shippingCode);
  const vessel = await getVessel(packingList.vesselId);
  const details = await getPackingListDetails(packingList?.number ?? "");

  return {
    number: packingList.number,
    shippingCode: packingList.shippingCode,
    shippingName: shipping?.name ?? "",
    vesselId: packingList.vesselId,
    vesselName: vessel?.name ?? "",
    voyage: packingList.voyage,
    details,
    createDate: packingList.createDate,
  };
}

export async function getPackingListNumber() {
  const packingList = await prisma.packingList.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  const [currentMonth, currentYear] = dayjs().format("MMMM/YYYY").split("/");

  if (!packingList) {
    return `0001/PKL/${currentMonth}/${currentYear}`;
  }

  return (
    (Number(packingList.number.slice(0, 4)) + 1).toString().padStart(4, "0") +
    "/PKL/" +
    currentMonth +
    "/" +
    currentYear
  );
}

export async function savePackingList(input: PackingListInput) {
  try {
    await prisma.packingList.create({
      data: {
        number: await getPackingListNumber(),
        shippingCode: input.shipping,
        vesselId: input.vessel,
        voyage: input.voyage,
        details: {
          connect: input.details.map((inputDetail) => {
            return {
              number: inputDetail.jobOrderNumber,
            };
          }),
        },
        createDate: new Date(),
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllPackingList() {
  const packingLists = await prisma.packingList.findMany();
  return Promise.all(packingLists.map(map));
}

export async function getPackingList(number: string) {
  const packingList = await prisma.packingList.findUnique({
    where: {
      number,
    },
  });

  if (!packingList) {
    return null;
  }

  return await map(packingList);
}

export async function getPackingListDetails(packingListNumber: string) {
  const jobOrders = await prisma.jobOrder.findMany({
    where: {
      packingListNumber,
    },
  });

  return Promise.all(jobOrders.map(mapDetail));
}

export async function getJobOrdersByPackingList(
  shipping: string,
  vessel: string,
  voyage: string
) {
  return (await getAllJobOrder()).filter(
    (jobOrder) =>
      jobOrder.inquiryDetail.shippingCode === shipping &&
      jobOrder.inquiryDetail.vesselId === vessel &&
      jobOrder.inquiryDetail.voyage === voyage &&
      !!jobOrder.suratJalanNumber &&
      !!jobOrder.bastNumber
  );
}
