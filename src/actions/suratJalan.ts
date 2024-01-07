"use server";

import { getAllJobOrder, getJobOrder } from "@/actions/jobOrder";
import prisma from "@/lib/prisma";
import { SuratJalan, SuratJalanDetail } from "@prisma/client";
import dayjs from "dayjs";
import { handleError } from "./error";
import { getAllProduct, getProduct } from "./product";
import { getProductCategory } from "./productCategory";

export type SuratJalanDetailDTO = {
  id: string;
  suratJalanNumber: string;
  productSkuCode: string;
  productName: string;
  qty: number;
  satuan: string;
  createDate: Date;
};

export type SuratJalanDTO = {
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
        shipperCity: string;
      };
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
  productCategoryReff: string;
  productCategory: string;
  details: SuratJalanDetailDTO[];
  createDate: Date;
};

export type SuratJalanDetailInput = {
  id?: string;
  product: string;
  qty: number;
  satuan: string;
};

export type SuratJalanInput = {
  jobOrder: string;
  doCustomer: number;
  productCategory: string;
  details: SuratJalanDetailInput[];
};

async function mapDetail(
  suratJalanDetail: SuratJalanDetail
): Promise<SuratJalanDetailDTO> {
  const product = await getProduct(suratJalanDetail.productSkuCode);

  return {
    id: suratJalanDetail.id,
    suratJalanNumber: suratJalanDetail.suratJalanNumber,
    productSkuCode: suratJalanDetail.productSkuCode,
    productName: product?.name ?? "",
    qty: suratJalanDetail.qty,
    satuan: suratJalanDetail.satuan,
    createDate: suratJalanDetail.createDate,
  };
}

async function map(suratJalan: SuratJalan): Promise<SuratJalanDTO> {
  const jobOrder = await getJobOrder(suratJalan.jobOrderNumber);
  const details = await getSuratJalanDetails(suratJalan.number);
  const productCategory = await getProductCategory(
    suratJalan.productCategoryReff
  );

  return {
    number: suratJalan.number,
    jobOrderNumber: suratJalan.jobOrderNumber,
    jobOrder: {
      inquiryDetailId: jobOrder?.inquiryDetailId ?? "",
      inquiryDetail: {
        inquiryNumber: jobOrder?.inquiryDetail.inquiryNumber ?? "",
        inquiry: {
          shipperCode: jobOrder?.inquiryDetail.inquiry.shipperCode ?? "",
          shipperName: jobOrder?.inquiryDetail.inquiry.shipperName ?? "",
          shipperAddress: jobOrder?.inquiryDetail.inquiry.shipperAddress ?? "",
          shipperCity: jobOrder?.inquiryDetail.inquiry.shipperCity ?? "",
        },
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
    doCustomer: suratJalan.doCustomer,
    productCategoryReff: suratJalan.productCategoryReff,
    productCategory: productCategory?.name ?? "",
    details: details,
    createDate: suratJalan.createDate,
  };
}

export async function getSuratJalanNumber() {
  const suratJalan = await prisma.suratJalan.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  const [currentMonth, currentYear] = dayjs().format("MMMM/YYYY").split("/");

  if (!suratJalan) {
    return `0001/SJ/${currentMonth}/${currentYear}`;
  }

  return (
    (Number(suratJalan.number.slice(0, 4)) + 1).toString().padStart(4, "0") +
    "/SJ/" +
    currentMonth +
    "/" +
    currentYear
  );
}

export async function saveSuratJalan(
  input: SuratJalanInput,
  number: string | null = null
) {
  try {
    if (!number) {
      await prisma.suratJalan.create({
        data: {
          number: await getSuratJalanNumber(),
          jobOrderNumber: input.jobOrder,
          doCustomer: input.doCustomer,
          productCategoryReff: input.productCategory,
          details: {
            create: input.details.map((inputDetail) => {
              return {
                productSkuCode: inputDetail.product,
                qty: inputDetail.qty,
                satuan: inputDetail.satuan,
                createDate: new Date(),
              };
            }),
          },
          createDate: new Date(),
        },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const suratJalanDetails = await tx.suratJalanDetail.findMany({
          where: {
            suratJalanNumber: number,
          },
        });

        for (const suratJalanDetail of suratJalanDetails) {
          if (
            !input.details.find(
              (inputDetail) => inputDetail.id === suratJalanDetail.id
            )
          ) {
            await tx.suratJalanDetail.delete({
              where: { id: suratJalanDetail.id },
            });
          }
        }

        for (const inputDetail of input.details) {
          if (
            suratJalanDetails.find((detail) => detail.id === inputDetail.id)
          ) {
            await tx.suratJalanDetail.update({
              where: { id: inputDetail.id },
              data: {
                productSkuCode: inputDetail.product,
                qty: inputDetail.qty,
                satuan: inputDetail.satuan,
              },
            });
          } else {
            await tx.suratJalanDetail.create({
              data: {
                suratJalanNumber: number,
                productSkuCode: inputDetail.product,
                qty: inputDetail.qty,
                satuan: inputDetail.satuan,
                createDate: new Date(),
              },
            });
          }
        }

        return await tx.suratJalan.update({
          where: {
            number,
          },
          data: {
            doCustomer: input.doCustomer,
            productCategoryReff: input.productCategory,
          },
        });
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllSuratJalan() {
  const suratJalan = await prisma.suratJalan.findMany();
  return Promise.all(suratJalan.map(map));
}

export async function getAllSuratJalanDetails() {
  const suratJalanDetails = await prisma.suratJalanDetail.findMany();
  return Promise.all(suratJalanDetails.map(mapDetail));
}

export async function getSuratJalan(number: string) {
  const suratJalan = await prisma.suratJalan.findUnique({
    where: {
      number,
    },
  });

  if (!suratJalan) {
    return null;
  }

  return await map(suratJalan);
}

export async function getSuratJalanDetail(id: string) {
  const suratJalanDetail = await prisma.suratJalanDetail.findUnique({
    where: {
      id,
    },
  });

  if (!suratJalanDetail) {
    return null;
  }

  return await mapDetail(suratJalanDetail);
}

export async function getSuratJalanDetails(suratJalanNumber: string) {
  const suratJalanDetails = await prisma.suratJalanDetail.findMany({
    where: {
      suratJalanNumber,
    },
  });

  return Promise.all(suratJalanDetails.map(mapDetail));
}

export async function getSuratJalanJobOrderOptions() {
  return (await getAllJobOrder())
    .filter((jobOrder) => {
      return (
        jobOrder.td &&
        jobOrder.ta &&
        jobOrder.sandar &&
        !jobOrder.suratJalanNumber
      );
    })
    .map((jobOrder) => ({
      value: jobOrder.number,
      label: jobOrder.number,
    }));
}

export async function getSuratJalanProductOptions(productCategory: string) {
  return (await getAllProduct())
    .filter(
      (product) => product.status && product.categoryReff === productCategory
    )
    .map((product) => ({
      value: product.skuCode,
      label: product.name,
    }));
}
