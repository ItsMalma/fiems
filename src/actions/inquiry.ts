"use server";

import prisma from "@/lib/prisma";
import {
  InquiryContainer,
  InquiryContainerDetail,
  QuotationDetailStatusInsurance,
  QuotationDetailStatusPPFTZ,
  QuotationDetailStatusPPN,
} from "@prisma/client";
import { FieldData } from "rc-field-form/es/interface";
import { getCustomer } from "./customer";
import { handleError } from "./error";
import { getAllQuotationDetails } from "./quotation";
import { getSales } from "./sales";
import { getAllVesselSchedule } from "./vesselSchedule";

export type InquiryDetailDTO = {
  id: string;
  inquiryNumber: string;
  inquiry: {
    salesCode: string;
    salesName: string;
    shipperCode: string;
    shipperName: string;
    purchaseCode: string;
    purchaseName: string;
  };
  jobOrderType: string;
  typeOrder: string;
  loadDate: Date;
  deliveryToCode: string;
  deliveryToName: string;
  deliveryToCity: string;
  routeCode: string;
  routeDescription: string;
  containerSize: string;
  containerType: string;
  serviceType: string;
  statusPPN: QuotationDetailStatusPPN;
  statusInsurance: QuotationDetailStatusInsurance;
  insurance: number;
  statusPPFTZ: QuotationDetailStatusPPFTZ;
  ppftz: number;
  shippingCode: string;
  shippingName: string;
  vesselId: string;
  vesselName: string;
  voyage: string;
  etd: Date;
  eta: Date;
  createDate: Date;
  status: boolean;
};

export type InquiryDTO = {
  number: string;
  salesCode: string;
  salesName: string;
  shipperCode: string;
  shipperName: string;
  shipperAddress: string;
  shipperCity: string;
  shipper: {
    groupCode: string;
    groupName: string;
  };
  // Shipper
  purchaseCode: string;
  purchaseName: string;
  purchaseAddress: string;
  purchaseCity: string;
  details: InquiryDetailDTO[];
  createDate: Date;
  status: boolean;
};

export type InquiryDetailInput = {
  id?: string;
  jobOrderType: string;
  typeOrder: string;
  loadDate: Date;
  route: string;
  containerSize: string;
  shipping: string;
  vessel: string;
  voyage: string;
};

export type InquiryInput = {
  sales: string;
  shipper: string;
  purchase: string;
  details: InquiryDetailInput[];
};

async function mapDetail(
  inquiryDetail: InquiryContainerDetail
): Promise<InquiryDetailDTO> {
  const inquiry = await prisma.inquiryContainer.findUnique({
    where: {
      number: inquiryDetail.inquiryNumber,
    },
    include: {
      sales: true,
      shipper: true,
      purchase: true,
    },
  });

  const quotationDetail = await getQuotationDetailByInquiry(
    inquiry?.shipperCode ?? "",
    inquiryDetail.routeCode,
    inquiryDetail.containerSize
  );

  const vesselSchedule = await getVesselScheduleByInquiry(
    inquiryDetail.shippingCode,
    inquiryDetail.vesselId,
    inquiryDetail.voyage
  );

  return {
    id: inquiryDetail.id,
    inquiryNumber: inquiryDetail.inquiryNumber,
    inquiry: {
      salesCode: inquiry?.salesCode ?? "",
      salesName: inquiry?.sales?.name ?? "",
      shipperCode: inquiry?.shipperCode ?? "",
      shipperName: inquiry?.shipper?.name ?? "",
      purchaseCode: inquiry?.purchaseCode ?? "",
      purchaseName: inquiry?.purchase?.name ?? "",
    },
    jobOrderType: inquiryDetail.jobOrderType,
    typeOrder: inquiryDetail.typeOrder,
    loadDate: inquiryDetail.loadDate,
    deliveryToCode: quotationDetail?.deliveryToCode ?? "",
    deliveryToName: quotationDetail?.deliveryToName ?? "",
    deliveryToCity: quotationDetail?.deliveryToCity ?? "",
    routeCode: inquiryDetail.routeCode,
    routeDescription: quotationDetail?.routeDescription ?? "",
    containerSize: inquiryDetail.containerSize,
    containerType: quotationDetail?.containerType ?? "",
    serviceType: quotationDetail?.quotation?.serviceType ?? "",
    statusPPN: quotationDetail?.summaryDetail.statusPPN ?? "Include",
    statusInsurance:
      quotationDetail?.summaryDetail.statusInsurance ?? "Include",
    insurance: quotationDetail?.summaryDetail.insurance ?? 0,
    statusPPFTZ: quotationDetail?.summaryDetail.statusPPFTZ ?? "Include",
    ppftz: quotationDetail?.summaryDetail.ppftz ?? 0,
    shippingCode: inquiryDetail.shippingCode,
    shippingName: vesselSchedule?.shippingName ?? "",
    vesselId: inquiryDetail.vesselId,
    vesselName: vesselSchedule?.vesselName ?? "",
    voyage: inquiryDetail.voyage,
    etd: vesselSchedule?.etd ?? new Date(),
    eta: vesselSchedule?.eta ?? new Date(),
    createDate: inquiryDetail.createDate,
    status:
      inquiryDetail.status &&
      (await getInquiryStatus(inquiryDetail.inquiryNumber)) &&
      (quotationDetail?.status ?? true) &&
      (vesselSchedule?.status ?? true),
  };
}

async function map(inquiry: InquiryContainer): Promise<InquiryDTO> {
  const sales = await getSales(inquiry.salesCode);
  const shipper = await getCustomer(inquiry.shipperCode);
  const purchase = await getCustomer(inquiry.purchaseCode);
  const details = await getInquiryDetails(inquiry.number);

  return {
    number: inquiry.number,
    salesCode: inquiry.salesCode,
    salesName: sales?.name ?? "",
    shipperCode: inquiry.shipperCode,
    shipperName: shipper?.name ?? "",
    shipperAddress: shipper?.address ?? "",
    shipperCity: shipper?.city ?? "",
    shipper: {
      groupCode: shipper?.groupCode ?? "",
      groupName: shipper?.groupName ?? "",
    },
    purchaseCode: inquiry.purchaseCode,
    purchaseName: purchase?.name ?? "",
    purchaseAddress: purchase?.address ?? "",
    purchaseCity: purchase?.city ?? "",
    details,
    createDate: inquiry.createDate,
    status:
      (sales?.status ?? true) &&
      (shipper?.status ?? true) &&
      (purchase?.status ?? true),
  };
}

export async function getInquiryNumber() {
  const inquiry = await prisma.inquiryContainer.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  if (!inquiry) {
    return "INQUIRY0001";
  }

  return (
    "INQUIRY" +
    (Number(inquiry.number.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function getQuotationDetailByInquiry(
  shipper: string,
  route: string,
  containerSize: string
) {
  const quotationDetail = (await getAllQuotationDetails()).find(
    (quotationDetail) =>
      quotationDetail.quotation.shipperCode === shipper &&
      quotationDetail.routeCode === route &&
      quotationDetail.containerSize === containerSize
  );

  return quotationDetail;
}

export async function getVesselScheduleByInquiry(
  shipping: string,
  vessel: string,
  voyage: string
) {
  const vesselSchedule = (await getAllVesselSchedule()).find(
    (vesselSchedule) =>
      vesselSchedule.shippingCode === shipping &&
      vesselSchedule.vesselId === vessel &&
      vesselSchedule.voyage === voyage
  );

  return vesselSchedule;
}

export async function saveInquiry(
  input: InquiryInput,
  number: string | null = null
) {
  try {
    const fieldDatas: FieldData[] = [];

    for (let i = 0; i < input.details.length; i++) {
      const inputDetail = input.details[i];
      const inquiryDetail = await prisma.inquiryContainerDetail.findFirst({
        where: {
          inquiry: { shipperCode: input.shipper },
          routeCode: inputDetail.route,
          containerSize: inputDetail.containerSize,
        },
      });
      if (inquiryDetail) {
        const mappedInquiryDetail = await mapDetail(inquiryDetail);
        if (
          !!inputDetail.id !== (inquiryDetail.id !== inputDetail.id) &&
          mappedInquiryDetail.status
        ) {
          fieldDatas.push(
            { name: "shipper", errors: ["Sudah ada yang sama"] },
            { name: ["details", i, "route"], errors: ["Sudah ada yang sama"] },
            { name: ["details", i, "voyage"], errors: ["Sudah ada yang sama"] }
          );
          return fieldDatas;
        }
      }
    }

    if (!number) {
      await prisma.inquiryContainer.create({
        data: {
          number: await getInquiryNumber(),
          salesCode: input.sales,
          shipperCode: input.shipper,
          purchaseCode: input.purchase,
          createDate: new Date(),
          details: {
            create: input.details.map((inputDetail) => {
              return {
                jobOrderType: inputDetail.jobOrderType,
                typeOrder: inputDetail.typeOrder,
                loadDate: inputDetail.loadDate,
                routeCode: inputDetail.route,
                containerSize: inputDetail.containerSize,
                shippingCode: inputDetail.shipping,
                vesselId: inputDetail.vessel,
                voyage: inputDetail.voyage,
                createDate: new Date(),
                status: true,
              };
            }),
          },
        },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const inquiryDetails = await tx.inquiryContainerDetail.findMany({
          where: {
            inquiryNumber: number,
          },
        });

        for (const inquiryDetail of inquiryDetails) {
          if (
            !input.details.find(
              (inputDetail) => inputDetail.id === inquiryDetail.id
            )
          ) {
            await tx.inquiryContainerDetail.delete({
              where: { id: inquiryDetail.id },
            });
          }
        }

        for (const inputDetail of input.details) {
          if (inquiryDetails.find((detail) => detail.id === inputDetail.id)) {
            await tx.inquiryContainerDetail.update({
              where: { id: inputDetail.id },
              data: {
                jobOrderType: inputDetail.jobOrderType,
                typeOrder: inputDetail.typeOrder,
                loadDate: inputDetail.loadDate,
                routeCode: inputDetail.route,
                containerSize: inputDetail.containerSize,
                shippingCode: inputDetail.shipping,
                vesselId: inputDetail.vessel,
                voyage: inputDetail.voyage,
              },
            });
          } else {
            await tx.inquiryContainerDetail.create({
              data: {
                inquiryNumber: number,
                jobOrderType: inputDetail.jobOrderType,
                typeOrder: inputDetail.typeOrder,
                loadDate: inputDetail.loadDate,
                routeCode: inputDetail.route,
                containerSize: inputDetail.containerSize,
                shippingCode: inputDetail.shipping,
                vesselId: inputDetail.vessel,
                voyage: inputDetail.voyage,
                createDate: new Date(),
                status: true,
              },
            });
          }
        }

        return await tx.inquiryContainer.update({
          where: {
            number,
          },
          data: {
            salesCode: input.sales,
            shipperCode: input.shipper,
            purchaseCode: input.purchase,
          },
        });
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllInquiries() {
  const inquiries = await prisma.inquiryContainer.findMany();
  return Promise.all(inquiries.map(map));
}

export async function getAllInquiryDetails() {
  const inquiryDetails = await prisma.inquiryContainerDetail.findMany();
  return Promise.all(inquiryDetails.map(mapDetail));
}

export async function getInquiry(
  number: string,
  { onlyActiveDetail }: { onlyActiveDetail?: boolean }
) {
  const inquiry = await prisma.inquiryContainer.findUnique({
    where: {
      number,
    },
  });

  if (!inquiry) {
    return null;
  }

  const mappedInquiry = await map(inquiry);
  if (onlyActiveDetail) {
    mappedInquiry.details = mappedInquiry.details.filter(
      (detail) => detail.status
    );
  }

  return mappedInquiry;
}

export async function getInquiryDetail(id: string) {
  const inquiryDetail = await prisma.inquiryContainerDetail.findUnique({
    where: {
      id,
    },
  });

  if (!inquiryDetail) {
    return null;
  }

  return await mapDetail(inquiryDetail);
}

async function getInquiryStatus(number: string) {
  const inquiry = await prisma.inquiryContainer.findUnique({
    where: {
      number,
    },
  });
  if (!inquiry) {
    return false;
  }

  const sales = await getSales(inquiry.salesCode);
  const shipper = await getCustomer(inquiry.shipperCode);
  const purchase = await getCustomer(inquiry.purchaseCode);

  return (
    (sales?.status ?? true) &&
    (shipper?.status ?? true) &&
    (purchase?.status ?? true)
  );
}

export async function setInquiryDetailStatus(id: string, status: boolean) {
  await prisma.inquiryContainerDetail.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getInquiryDetails(inquiryNumber: string) {
  const inquiryDetails = await prisma.inquiryContainerDetail.findMany({
    where: {
      inquiryNumber,
    },
  });

  return Promise.all(inquiryDetails.map(mapDetail));
}
