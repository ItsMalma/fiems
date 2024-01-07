"use server";

import { getJobOrder } from "@/actions/jobOrder";
import prisma from "@/lib/prisma";
import { BeritaAcaraSerahTerima, SuratJalanDetail } from "@prisma/client";
import dayjs from "dayjs";
import { handleError } from "./error";
import { getProduct } from "./product";
import { getAllSuratJalan, getSuratJalan } from "./suratJalan";

export type BASTDetailDTO = {
  id: string;
  suratJalanNumber: string;
  bastNumber: string;
  productSkuCode: string;
  productName: string;
  qty: number;
  satuan: string;
  createDate: Date;
};

export type BASTDTO = {
  number: string;
  suratJalanNumber: string;
  suratJalan: {
    jobOrderNumber: string;
    jobOrder: {
      inquiryDetailId: string;
      inquiryDetail: {
        inquiryNumber: string;
        inquiry: {
          shipperCode: string;
          shipperName: string;
          shipperAddress: string;
          shipperCity: string;
        };
        shippingCode: string;
        shippingName: string;
        vesselId: string;
        vesselName: string;
        voyage: string;
      };
      consigneeCode: string;
      consigneeName: string;
      consigneeAddress: string;
      consigneeCity: string;
      truckNumber: string;
      containerNumber1: string;
      sealNumber1: string;
      containerNumber2: string | null;
      sealNumber2: string | null;
    };
    doCustomer: number;
    details: BASTDetailDTO[];
  };
  createDate: Date;
};

export type BASTDetailInput = {
  id: string;
  product: string;
  qty: number;
  satuan: string;
};

export type BASTInput = {
  suratJalan: string;
  doCustomer: number;
  productCategory: string;
  details: BASTDetailInput[];
};

async function mapDetail(
  suratJalanDetail: SuratJalanDetail
): Promise<BASTDetailDTO> {
  const product = await getProduct(suratJalanDetail.productSkuCode);

  return {
    id: suratJalanDetail.id,
    suratJalanNumber: suratJalanDetail.suratJalanNumber,
    bastNumber: suratJalanDetail.bastNumber ?? "",
    productSkuCode: suratJalanDetail.productSkuCode,
    productName: product?.name ?? "",
    qty: suratJalanDetail.qty,
    satuan: suratJalanDetail.satuan,
    createDate: suratJalanDetail.createDate,
  };
}

async function map(bast: BeritaAcaraSerahTerima): Promise<BASTDTO> {
  const suratJalan = await getSuratJalan(bast.suratJalanNumber);
  const jobOrder = await getJobOrder(suratJalan?.jobOrderNumber ?? "");
  const details = await getBASTDetails(suratJalan?.number ?? "");

  return {
    number: bast.number,
    suratJalanNumber: bast.suratJalanNumber,
    suratJalan: {
      jobOrderNumber: suratJalan?.jobOrderNumber ?? "",
      jobOrder: {
        inquiryDetailId: jobOrder?.inquiryDetailId ?? "",
        inquiryDetail: {
          inquiryNumber: jobOrder?.inquiryDetail.inquiryNumber ?? "",
          inquiry: {
            shipperCode: jobOrder?.inquiryDetail.inquiry.shipperCode ?? "",
            shipperName: jobOrder?.inquiryDetail.inquiry.shipperName ?? "",
            shipperAddress:
              jobOrder?.inquiryDetail.inquiry.shipperAddress ?? "",
            shipperCity: jobOrder?.inquiryDetail.inquiry.shipperCity ?? "",
          },
          shippingCode: jobOrder?.inquiryDetail.shippingCode ?? "",
          shippingName: jobOrder?.inquiryDetail.shippingName ?? "",
          vesselId: jobOrder?.inquiryDetail.vesselId ?? "",
          vesselName: jobOrder?.inquiryDetail.vesselName ?? "",
          voyage: jobOrder?.inquiryDetail.voyage ?? "",
        },
        consigneeCode: jobOrder?.consigneeCode ?? "",
        consigneeName: jobOrder?.consigneeName ?? "",
        consigneeAddress: jobOrder?.consigneeAddress ?? "",
        consigneeCity: jobOrder?.consigneeCity ?? "",
        truckNumber: jobOrder?.truckNumber ?? "",
        containerNumber1: jobOrder?.containerNumber1 ?? "",
        sealNumber1: jobOrder?.sealNumber1 ?? "",
        containerNumber2: jobOrder?.containerNumber2 ?? null,
        sealNumber2: jobOrder?.sealNumber2 ?? null,
      },
      doCustomer: suratJalan?.doCustomer ?? 0,
      details: details,
    },
    createDate: bast.createDate,
  };
}

export async function getBASTNumber() {
  const suratJalan = await prisma.suratJalan.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  const [currentMonth, currentYear] = dayjs().format("MMMM/YYYY").split("/");

  if (!suratJalan) {
    return `0001/BAST/${currentMonth}/${currentYear}`;
  }

  return (
    (Number(suratJalan.number.slice(0, 4)) + 1).toString().padStart(4, "0") +
    "/BAST/" +
    currentMonth +
    "/" +
    currentYear
  );
}

export async function saveBAST(input: BASTInput) {
  try {
    await prisma.beritaAcaraSerahTerima.create({
      data: {
        number: await getBASTNumber(),
        suratJalanNumber: input.suratJalan,
        details: {
          connect: input.details.map((inputDetail) => {
            return {
              id: inputDetail.id,
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

export async function getAllBAST() {
  const bast = await prisma.beritaAcaraSerahTerima.findMany();
  return Promise.all(bast.map(map));
}

export async function getBAST(number: string) {
  const bast = await prisma.beritaAcaraSerahTerima.findUnique({
    where: {
      number,
    },
  });

  if (!bast) {
    return null;
  }

  return await map(bast);
}

export async function getBASTDetails(bastNumber: string) {
  const suratJalanDetails = await prisma.suratJalanDetail.findMany({
    where: {
      bastNumber,
    },
  });

  return Promise.all(suratJalanDetails.map(mapDetail));
}

export async function getBASTSuratJalanOptions() {
  return (await getAllSuratJalan())
    .filter((suratJalan) => !suratJalan.bastNumber)
    .map((suratJalan) => ({
      value: suratJalan.number,
      label: suratJalan.number,
    }));
}
