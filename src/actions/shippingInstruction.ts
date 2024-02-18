"use server";

import { handleError } from "@/actions/error";
import { getInquiryDetail } from "@/actions/inquiry";
import prisma from "@/lib/prisma";
import {
  JobOrder,
  ShippingInstruction,
  ShippingInstructionBillingAndPayment,
} from "@prisma/client";
import dayjs from "dayjs";
import { getCustomer } from "./customer";
import { getAllJobOrder } from "./jobOrder";
import { getSales } from "./sales";
import { getVessel } from "./vessel";

export type ShippingInstructionDetailDTO = {
  jobOrderNumber: string;
  jobOrder: {
    inquiryDetailId: string;
    inquiryDetail: {
      inquiryNumber: string;
      portCode: string;
      portName: string;
      serviceType: string;
    };
    containerNumber1: string;
    sealNumber1: string;
    containerNumber2: string | null;
    sealNumber2: string | null;
    suratJalanNumber: string;
    bastNumber: string;
  };
  createDate: Date;
};

export type ShippingInstructionDTO = {
  number: string;
  shipperCode: string;
  shipperName: string;
  consigneeCode: string;
  consigneeName: string;
  ownerName: string;
  ownerAddress: string;
  portOfLoading: string;
  portOfDischarge: string;
  shippingTerm: string;
  vesselName: string;
  voyage: string;
  oceanFreight: ShippingInstructionBillingAndPayment;
  portOfLoadingCharges: ShippingInstructionBillingAndPayment;
  portOfLoadingDiscargeCharges: ShippingInstructionBillingAndPayment;
  goods: boolean;
  temperature: string;
  nomorUN: string;
  dangerousGoods: string;
  catatan: string;
  transhipmentImport: boolean;
  pib: boolean;
  bc12: boolean;
  transhipmentExport: boolean;
  peb: boolean;
  bc10: boolean;
  salesCode: string;
  salesName: string;
  details: ShippingInstructionDetailDTO[];
  createDate: Date;
};

export type ShippingInstructionDetailInput = {
  jobOrder: string;
};

export type ShippingInstructionInput = {
  number: string;
  shipper: string;
  consignee: string;
  ownerName: string;
  ownerAddress: string;
  portOfLoading: string;
  portOfDischarge: string;
  shippingTerm: string;
  vessel: string;
  voyage: string;
  oceanFreight: ShippingInstructionBillingAndPayment;
  portOfLoadingCharges: ShippingInstructionBillingAndPayment;
  portOfLoadingDiscargeCharges: ShippingInstructionBillingAndPayment;
  goods: boolean;
  temperature: string;
  nomorUN: string;
  dangerousGoods: string;
  catatan: string;
  transhipmentImport: boolean;
  pib: boolean;
  bc12: boolean;
  transhipmentExport: boolean;
  peb: boolean;
  bc10: boolean;
  sales: string;
  details: ShippingInstructionDetailInput[];
};

async function mapDetail(
  jobOrder: JobOrder
): Promise<ShippingInstructionDetailDTO> {
  const inquiryDetail = await getInquiryDetail(jobOrder.inquiryDetailId);
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
        portCode: inquiryDetail?.portCode ?? "",
        portName: inquiryDetail?.portName ?? "",
        serviceType: inquiryDetail?.serviceType ?? "",
      },
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

async function map(
  shippingInstruction: ShippingInstruction
): Promise<ShippingInstructionDTO> {
  const shipper = await getCustomer(shippingInstruction.shipperCode);
  const consignee = await getCustomer(shippingInstruction.consigneeCode);
  const vessel = await getVessel(shippingInstruction.vesselId);
  const sales = await getSales(shippingInstruction.salesCode);

  return {
    number: shippingInstruction.number,
    shipperCode: shipper?.code ?? "",
    shipperName: shipper?.name ?? "",
    consigneeCode: consignee?.code ?? "",
    consigneeName: consignee?.name ?? "",
    ownerName: shippingInstruction.ownerName,
    ownerAddress: shippingInstruction.ownerAddress,
    portOfLoading: shippingInstruction.portOfLoading,
    portOfDischarge: shippingInstruction.portOfDischarge,
    shippingTerm: shippingInstruction.shippingTerm,
    vesselName: vessel?.name ?? "",
    voyage: shippingInstruction.voyage,
    oceanFreight: shippingInstruction.oceanFreight,
    portOfLoadingCharges: shippingInstruction.portOfLoadingCharges,
    portOfLoadingDiscargeCharges:
      shippingInstruction.portOfLoadingDiscargeCharges,
    goods: shippingInstruction.goods,
    temperature: shippingInstruction.temperature,
    nomorUN: shippingInstruction.nomorUN,
    dangerousGoods: shippingInstruction.dangerousGoods,
    catatan: shippingInstruction.catatan,
    transhipmentImport: shippingInstruction.transhipmentImport,
    pib: shippingInstruction.pib,
    bc12: shippingInstruction.bc12,
    transhipmentExport: shippingInstruction.transhipmentExport,
    peb: shippingInstruction.peb,
    bc10: shippingInstruction.bc10,
    salesCode: sales?.code ?? "",
    salesName: sales?.name ?? "",
    details: await getShippingInstructionDetails(shippingInstruction.number),
    createDate: shippingInstruction.createDate,
  };
}

export async function getShippingInstructionNumber() {
  const shippingInstruction = await prisma.shippingInstruction.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  const [currentMonth, currentYear] = dayjs().format("MMMM/YYYY").split("/");

  if (!shippingInstruction) {
    return `0001/SI/${currentMonth}/${currentYear}`;
  }

  return (
    (Number(shippingInstruction.number.slice(0, 4)) + 1)
      .toString()
      .padStart(4, "0") +
    "/SI/" +
    currentMonth +
    "/" +
    currentYear
  );
}

export async function getAllShippingInstruction() {
  const shippingInstructions = await prisma.shippingInstruction.findMany();
  return Promise.all(shippingInstructions.map(map));
}

export async function getShippingInstructionDetails(number: string) {
  const jobOrders = await prisma.jobOrder.findMany({
    where: {
      shippingInstructionNumber: number,
    },
  });

  return Promise.all(jobOrders.map(mapDetail));
}

export async function getShippingInstruction(number: string) {
  const shippingInstruction = await prisma.shippingInstruction.findUnique({
    where: {
      number,
    },
  });

  if (!shippingInstruction) {
    return null;
  }

  return await map(shippingInstruction);
}

export async function saveShippingInstruction(input: ShippingInstructionInput) {
  try {
    console.log(input);
    await prisma.shippingInstruction.create({
      data: {
        number: await getShippingInstructionNumber(),
        shipperCode: input.shipper,
        consigneeCode: input.consignee,
        ownerName: input.ownerName,
        ownerAddress: input.ownerAddress,
        portOfLoading: input.portOfLoading,
        portOfDischarge: input.portOfDischarge,
        shippingTerm: input.shippingTerm,
        vesselId: input.vessel,
        voyage: input.voyage,
        oceanFreight: input.oceanFreight,
        portOfLoadingCharges: input.portOfLoadingCharges,
        portOfLoadingDiscargeCharges: input.portOfLoadingDiscargeCharges,
        goods: input.goods,
        temperature: input.temperature,
        nomorUN: input.nomorUN,
        dangerousGoods: input.dangerousGoods,
        catatan: input.catatan,
        transhipmentImport: input.transhipmentImport,
        pib: input.pib,
        bc12: input.bc12,
        transhipmentExport: input.transhipmentExport,
        peb: input.peb,
        bc10: input.bc10,
        salesCode: input.sales,
        details: {
          connect: input.details.map((inputDetail) => {
            return {
              number: inputDetail.jobOrder,
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

export async function getShippingInstructionShipperOptions() {
  return (await getAllJobOrder())
    .filter((jobOrder) => !!jobOrder.suratJalanNumber && !!jobOrder.bastNumber)
    .map((jobOrder) => ({
      label: jobOrder.inquiryDetail.inquiry.shipperName,
      value: jobOrder.inquiryDetail.inquiry.shipperCode,
    }));
}

export async function getShippingInstructionConsigneeOptions() {
  return (await getAllJobOrder())
    .filter((jobOrder) => !!jobOrder.suratJalanNumber && !!jobOrder.bastNumber)
    .map((jobOrder) => ({
      label: jobOrder.consigneeName,
      value: jobOrder.consigneeCode,
    }));
}

export async function getShippingInstructionVesselOptions() {
  return (await getAllJobOrder())
    .filter((jobOrder) => !!jobOrder.suratJalanNumber && !!jobOrder.bastNumber)
    .map((jobOrder) => ({
      label: jobOrder.inquiryDetail.vesselName,
      value: jobOrder.inquiryDetail.vesselId,
    }));
}

export async function getShippingInstructionVoyageOptions() {
  return (await getAllJobOrder())
    .filter((jobOrder) => !!jobOrder.suratJalanNumber && !!jobOrder.bastNumber)
    .map((jobOrder) => ({
      label: jobOrder.inquiryDetail.voyage,
      value: jobOrder.inquiryDetail.voyage,
    }));
}

export async function getJobOrdersByShippingInstruction(
  shipper: string,
  consignee: string,
  vessel: string,
  voyage: string
) {
  console.log(shipper, consignee, vessel, voyage);
  return (await getAllJobOrder()).filter(
    (jobOrder) =>
      jobOrder.inquiryDetail.inquiry.shipperCode === shipper &&
      jobOrder.consigneeCode === consignee &&
      jobOrder.inquiryDetail.vesselId === vessel &&
      jobOrder.inquiryDetail.voyage === voyage &&
      !!jobOrder.suratJalanNumber &&
      !!jobOrder.bastNumber
  );
}
