"use server";

import prisma from "@/lib/prisma";
import { Insurance } from "@prisma/client";
import { handleError } from "./error";
import { getAllJobOrder, getJobOrder } from "./jobOrder";

export type InsuranceDTO = {
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
      deliveryToCode: string;
      deliveryToName: string;
      deliveryToAddress: string;
      routeCode: string;
      routeDescription: string;
      portCode: string;
      portName: string;
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
    td: Date | null;
    containerNumber1: string;
    sealNumber1: string;
    containerNumber2: string | null;
    sealNumber2: string | null;
  };
  nilaiTertanggung: number;
  premi: number;
  premiDibayarkan: number;
  keterangan: string;
  createDate: Date;
};

export type InsuranceInput = {
  jobOrder: string;
  nilaiTertanggung: number;
  premi: number;
  keterangan: string | null;
};

async function map(insurance: Insurance): Promise<InsuranceDTO> {
  const jobOrder = await getJobOrder(insurance.jobOrderNumber);

  return {
    number: insurance.number,
    jobOrderNumber: insurance.jobOrderNumber,
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
        deliveryToCode: jobOrder?.inquiryDetail.deliveryToCode ?? "",
        deliveryToName: jobOrder?.inquiryDetail.deliveryToName ?? "",
        deliveryToAddress: jobOrder?.inquiryDetail.deliveryToAddress ?? "",
        routeCode: jobOrder?.inquiryDetail.routeCode ?? "",
        routeDescription: jobOrder?.inquiryDetail.routeDescription ?? "",
        portCode: jobOrder?.inquiryDetail.portCode ?? "",
        portName: jobOrder?.inquiryDetail.portName ?? "",
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
      td: jobOrder?.td ?? null,
      containerNumber1: jobOrder?.containerNumber1 ?? "",
      sealNumber1: jobOrder?.sealNumber1 ?? "",
      containerNumber2: jobOrder?.containerNumber2 ?? null,
      sealNumber2: jobOrder?.sealNumber2 ?? null,
    },
    nilaiTertanggung: insurance.nilaiTertanggung,
    premi: insurance.premi,
    premiDibayarkan: insurance.nilaiTertanggung * insurance.premi,
    keterangan: insurance.keterangan ?? "",
    createDate: insurance.createDate,
  };
}

export async function getInsuranceNumber() {
  const insurance = await prisma.insurance.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  if (!insurance) {
    return "INSURANCE00001";
  }

  return (
    "INSURANCE" +
    (Number(insurance.number.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function saveInsurance(
  input: InsuranceInput,
  number: string | null = null
) {
  try {
    if (!number) {
      await prisma.insurance.create({
        data: {
          number: await getInsuranceNumber(),
          jobOrderNumber: input.jobOrder,
          nilaiTertanggung: input.nilaiTertanggung,
          premi: input.premi,
          keterangan: input.keterangan,
          createDate: new Date(),
        },
      });
    } else {
      await prisma.insurance.update({
        where: { number },
        data: {
          nilaiTertanggung: input.nilaiTertanggung,
          premi: input.premi,
          keterangan: input.keterangan,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllInsurance() {
  const insurances = await prisma.insurance.findMany();
  return Promise.all(insurances.map(map));
}

export async function getInsurance(number: string) {
  const insurance = await prisma.insurance.findUnique({
    where: {
      number,
    },
  });

  if (!insurance) {
    return null;
  }

  return map(insurance);
}

export async function getInsuranceJobOrderOptions() {
  return (await getAllJobOrder())
    .filter((jobOrder) => {
      return (
        jobOrder.td &&
        jobOrder.ta &&
        jobOrder.sandar &&
        !jobOrder.insuranceNumber
      );
    })
    .map((jobOrder) => ({
      value: jobOrder.number,
      label: jobOrder.number,
    }));
}
