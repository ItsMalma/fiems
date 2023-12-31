"use server";

import prisma from "@/lib/prisma";
import {
  containerSizes,
  containerTypes,
  serviceTypes,
} from "@/lib/utils/consts";
import { PriceVendor, PriceVendorDetail } from "@prisma/client";
import dayjs from "dayjs";
import { FieldData } from "rc-field-form/es/interface";
import { getCustomer } from "./customer";
import { handleError } from "./error";
import { getPort } from "./port";
import { getRoute } from "./route";

export type PriceVendorDetailDTO = {
  id: string;
  priceVendorId: string;
  priceVendor: {
    vendorCode: string;
    vendorName: string;
    effectiveStartDate: Date;
    effectiveEndDate: Date;
  };
  routeCode: string;
  routeDescription: string;
  containerSize: string;
  containerType: string;
  serviceType: string;
  portCode: string;
  portName: string;
  trackingRate: number;
  buruh: number;
  thcOPT: number;
  thcOPP: number;
  adminBL: number;
  cleaning: number;
  materai: number;
  grandTotal: number;
  createDate: Date;
  status: boolean;
};

export type PriceVendorDTO = {
  id: string;
  vendorCode: string;
  vendorName: string;
  details: PriceVendorDetailDTO[];
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  createDate: Date;
  status: boolean;
};

export type PriceVendorDetailInput = {
  id?: string;
  route: string;
  containerSize: string;
  containerType: string;
  serviceType: string;
  port: string;
  trackingRate: number;
  buruh: number;
  thcOPT: number;
  thcOPP: number;
  adminBL: number;
  cleaning: number;
  materai: number;
};

export type PriceVendorInput = {
  vendor: string;
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  details: PriceVendorDetailInput[];
};

async function mapDetail(
  priceVendorDetail: PriceVendorDetail
): Promise<PriceVendorDetailDTO> {
  const priceVendor = await prisma.priceVendor.findUnique({
    where: {
      id: priceVendorDetail.priceVendorId,
    },
    include: {
      vendor: true,
    },
  });
  const route = await getRoute(priceVendorDetail.routeCode);
  const port = await getPort(priceVendorDetail.portCode);

  return {
    id: priceVendorDetail.id,
    priceVendorId: priceVendorDetail.priceVendorId,
    priceVendor: {
      vendorCode: priceVendor?.vendorCode ?? "",
      vendorName: priceVendor?.vendor.name ?? "",
      effectiveStartDate: priceVendor?.effectiveStartDate ?? new Date(),
      effectiveEndDate: priceVendor?.effectiveEndDate ?? new Date(),
    },
    routeCode: route?.code ?? "",
    routeDescription: route ? `${route.origin} - ${route.destination}` : "",
    containerSize: priceVendorDetail.containerSize,
    containerType: priceVendorDetail.containerType,
    serviceType: priceVendorDetail.serviceType,
    portCode: port?.code ?? "",
    portName: port?.name ?? "",
    trackingRate: priceVendorDetail.trackingRate,
    buruh: priceVendorDetail.buruh,
    thcOPT: priceVendorDetail.thcOPT,
    thcOPP: priceVendorDetail.thcOPP,
    adminBL: priceVendorDetail.adminBL,
    cleaning: priceVendorDetail.cleaning,
    materai: priceVendorDetail.materai,
    grandTotal:
      priceVendorDetail.trackingRate +
      priceVendorDetail.buruh +
      priceVendorDetail.thcOPT +
      priceVendorDetail.thcOPP +
      priceVendorDetail.adminBL +
      priceVendorDetail.cleaning +
      priceVendorDetail.materai,
    createDate: priceVendorDetail.createDate,
    status:
      priceVendorDetail.status &&
      (await getPriceVendorStatus(priceVendorDetail.priceVendorId)) &&
      (route?.status ?? true) &&
      (port?.status ?? true),
  };
}

async function map(priceVendor: PriceVendor): Promise<PriceVendorDTO> {
  const vendor = await getCustomer(priceVendor.vendorCode);
  const details = await getPriceVendorDetails(priceVendor.id);

  return {
    id: priceVendor.id,
    vendorCode: priceVendor.vendorCode,
    vendorName: vendor?.name ?? "",
    details: details,
    effectiveStartDate: priceVendor.effectiveStartDate,
    effectiveEndDate: priceVendor.effectiveEndDate,
    createDate: priceVendor.createDate,
    status:
      dayjs().isAfter(priceVendor.effectiveStartDate) &&
      dayjs().isBefore(priceVendor.effectiveEndDate) &&
      (vendor?.status ?? true),
  };
}

export async function savePriceVendor(
  input: PriceVendorInput,
  id: string | null = null
) {
  try {
    const fieldDatas: FieldData[] = [];
    for (let i = 0; i < input.details.length; i++) {
      const inputDetail = input.details[i];
      if (
        (await prisma.priceVendorDetail.findFirst({
          where: {
            id: { not: inputDetail.id },
            priceVendor: { vendorCode: input.vendor },
            routeCode: inputDetail.route,
            containerSize: inputDetail.containerSize,
            containerType: inputDetail.containerType,
            serviceType: inputDetail.serviceType,
            portCode: inputDetail.port,
          },
        })) ||
        input.details.find(
          (otherInputDetail, otherIndex) =>
            otherInputDetail.id !== inputDetail.id &&
            otherIndex != i &&
            otherInputDetail.route === inputDetail.route &&
            otherInputDetail.containerSize === inputDetail.containerSize &&
            otherInputDetail.containerType === inputDetail.containerType &&
            otherInputDetail.serviceType === inputDetail.serviceType &&
            otherInputDetail.port === inputDetail.port
        )
      ) {
        if (!fieldDatas.find((fieldData) => fieldData.name === "vendor")) {
          fieldDatas.push({ name: "vendor", errors: ["Sudah ada yang sama"] });
        }
        fieldDatas.push({
          name: ["details", i, "route"],
          errors: ["Sudah ada yang sama"],
        });
        fieldDatas.push({
          name: ["details", i, "containerSize"],
          errors: ["Sudah ada yang sama"],
        });
        fieldDatas.push({
          name: ["details", i, "containerType"],
          errors: ["Sudah ada yang sama"],
        });
        fieldDatas.push({
          name: ["details", i, "serviceType"],
          errors: ["Sudah ada yang sama"],
        });
        fieldDatas.push({
          name: ["details", i, "port"],
          errors: ["Sudah ada yang sama"],
        });
      }
    }

    console.log(fieldDatas);
    if (fieldDatas.length > 0) return fieldDatas;

    if (!id) {
      await prisma.priceVendor.create({
        data: {
          vendorCode: input.vendor,
          effectiveStartDate: input.effectiveStartDate,
          effectiveEndDate: input.effectiveEndDate,
          createDate: new Date(),
          details: {
            create: input.details.map((inputDetail) => {
              return {
                routeCode: inputDetail.route,
                containerSize: inputDetail.containerSize,
                containerType: inputDetail.containerType,
                serviceType: inputDetail.serviceType,
                portCode: inputDetail.port,
                trackingRate: inputDetail.trackingRate,
                buruh: inputDetail.buruh,
                thcOPT: inputDetail.thcOPT,
                thcOPP: inputDetail.thcOPP,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                materai: inputDetail.materai,
                createDate: new Date(),
                status: true,
              };
            }),
          },
        },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const priceVendorDetails = await tx.priceVendorDetail.findMany({
          where: {
            priceVendorId: id,
          },
        });

        for (const priceVendorDetail of priceVendorDetails) {
          if (
            !input.details.find(
              (inputDetail) => inputDetail.id === priceVendorDetail.id
            )
          ) {
            await tx.priceVendorDetail.delete({
              where: { id: priceVendorDetail.id },
            });
          }
        }

        for (const inputDetail of input.details) {
          if (
            priceVendorDetails.find((detail) => detail.id === inputDetail.id)
          ) {
            await tx.priceVendorDetail.update({
              where: { id: inputDetail.id },
              data: {
                routeCode: inputDetail.route,
                containerSize: inputDetail.containerSize,
                containerType: inputDetail.containerType,
                serviceType: inputDetail.serviceType,
                portCode: inputDetail.port,
                trackingRate: inputDetail.trackingRate,
                buruh: inputDetail.buruh,
                thcOPT: inputDetail.thcOPT,
                thcOPP: inputDetail.thcOPP,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                materai: inputDetail.materai,
              },
            });
          } else {
            await tx.priceVendorDetail.create({
              data: {
                priceVendorId: id,
                routeCode: inputDetail.route,
                containerSize: inputDetail.containerSize,
                containerType: inputDetail.containerType,
                serviceType: inputDetail.serviceType,
                portCode: inputDetail.port,
                trackingRate: inputDetail.trackingRate,
                buruh: inputDetail.buruh,
                thcOPT: inputDetail.thcOPT,
                thcOPP: inputDetail.thcOPP,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                materai: inputDetail.materai,
                createDate: new Date(),
                status: true,
              },
            });
          }
        }

        return await tx.priceVendor.update({
          where: {
            id,
          },
          data: {
            vendorCode: input.vendor,
            effectiveStartDate: input.effectiveStartDate,
            effectiveEndDate: input.effectiveEndDate,
          },
        });
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllPriceVendors() {
  const priceVendors = await prisma.priceVendor.findMany();
  return Promise.all(priceVendors.map(map));
}

export async function getAllPriceVendorDetails() {
  const priceVendorDetails = await prisma.priceVendorDetail.findMany();
  return Promise.all(priceVendorDetails.map(mapDetail));
}

export async function getPriceVendor(
  id: string,
  { onlyActiveDetail }: { onlyActiveDetail?: boolean }
) {
  const priceVendor = await prisma.priceVendor.findUnique({
    where: {
      id,
    },
  });

  if (!priceVendor) {
    return null;
  }

  const mappedPriceVendor = await map(priceVendor);
  if (onlyActiveDetail) {
    mappedPriceVendor.details = mappedPriceVendor.details.filter(
      (detail) => detail.status
    );
  }

  return mappedPriceVendor;
}

async function getPriceVendorStatus(id: string) {
  const priceVendor = await prisma.priceVendor.findUnique({
    where: {
      id,
    },
  });
  if (!priceVendor) {
    return false;
  }

  const vendor = await getCustomer(priceVendor.vendorCode);

  return (
    dayjs().isAfter(priceVendor.effectiveStartDate) &&
    dayjs().isBefore(priceVendor.effectiveEndDate) &&
    (vendor?.status ?? true)
  );
}

export async function setPriceVendorDetailStatus(id: string, status: boolean) {
  await prisma.priceVendorDetail.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getPriceVendorDetails(priceVendorId: string) {
  const priceVendorDetails = await prisma.priceVendorDetail.findMany({
    where: {
      priceVendorId: priceVendorId,
    },
  });

  return Promise.all(priceVendorDetails.map(mapDetail));
}

export async function getPriceVendorContainerSizeOptions() {
  return containerSizes.map((containerSize) => {
    return {
      label: containerSize,
      value: containerSize,
    };
  });
}

export async function getPriceVendorContainerTypeOptions() {
  return containerTypes.map((containerType) => {
    return {
      label: containerType,
      value: containerType,
    };
  });
}

export async function getPriceVendorServiceTypeOptions() {
  return serviceTypes.map((serviceType) => {
    return {
      label: serviceType,
      value: serviceType,
    };
  });
}
