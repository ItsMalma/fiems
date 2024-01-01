"use server";

import prisma from "@/lib/prisma";
import {
  containerSizes,
  containerTypes,
  serviceTypes,
} from "@/lib/utils/consts";
import { PriceShipping, PriceShippingDetail } from "@prisma/client";
import dayjs from "dayjs";
import { FieldData } from "rc-field-form/es/interface";
import { getCustomer } from "./customer";
import { handleError } from "./error";
import { getPort } from "./port";
import { getRoute } from "./route";

export type PriceShippingDetailDTO = {
  id: string;
  priceShippingId: string;
  priceShipping: {
    shippingCode: string;
    shippingName: string;
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
  freight: number;
  thcOPT: number;
  thcOPP: number;
  adminBL: number;
  cleaning: number;
  alihKapal: number;
  materai: number;
  lolo: number;
  segel: number;
  rc: number;
  lss: number;
  grandTotal: number;
  createDate: Date;
  status: boolean;
};

export type PriceShippingDTO = {
  id: string;
  shippingCode: string;
  shippingName: string;
  details: PriceShippingDetailDTO[];
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  createDate: Date;
  status: boolean;
};

export type PriceShippingDetailInput = {
  id?: string;
  route: string;
  containerSize: string;
  containerType: string;
  serviceType: string;
  port: string;
  freight: number;
  thcOPT: number;
  thcOPP: number;
  adminBL: number;
  cleaning: number;
  alihKapal: number;
  materai: number;
  lolo: number;
  segel: number;
  rc: number;
  lss: number;
};

export type PriceShippingInput = {
  shipping: string;
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  details: PriceShippingDetailInput[];
};

async function mapDetail(
  priceShippingDetail: PriceShippingDetail
): Promise<PriceShippingDetailDTO> {
  const priceShipping = await prisma.priceShipping.findUnique({
    where: {
      id: priceShippingDetail.priceShippingId,
    },
    include: {
      shipping: true,
    },
  });
  const route = await getRoute(priceShippingDetail.routeCode);
  const port = await getPort(priceShippingDetail.portCode);

  return {
    id: priceShippingDetail.id,
    priceShippingId: priceShippingDetail.priceShippingId,
    priceShipping: {
      shippingCode: priceShipping?.shippingCode ?? "",
      shippingName: priceShipping?.shipping.name ?? "",
      effectiveStartDate: priceShipping?.effectiveStartDate ?? new Date(),
      effectiveEndDate: priceShipping?.effectiveEndDate ?? new Date(),
    },
    routeCode: route?.code ?? "",
    routeDescription: route ? `${route.origin} - ${route.destination}` : "",
    containerSize: priceShippingDetail.containerSize,
    containerType: priceShippingDetail.containerType,
    serviceType: priceShippingDetail.serviceType,
    portCode: port?.code ?? "",
    portName: port?.name ?? "",
    freight: priceShippingDetail.freight,
    thcOPT: priceShippingDetail.thcOPT,
    thcOPP: priceShippingDetail.thcOPP,
    adminBL: priceShippingDetail.adminBL,
    cleaning: priceShippingDetail.cleaning,
    alihKapal: priceShippingDetail.alihKapal,
    materai: priceShippingDetail.materai,
    lolo: priceShippingDetail.lolo,
    segel: priceShippingDetail.segel,
    rc: priceShippingDetail.rc,
    lss: priceShippingDetail.lss,
    grandTotal:
      priceShippingDetail.freight +
      priceShippingDetail.thcOPT +
      priceShippingDetail.thcOPP +
      priceShippingDetail.adminBL +
      priceShippingDetail.cleaning +
      priceShippingDetail.alihKapal +
      priceShippingDetail.materai +
      priceShippingDetail.lolo +
      priceShippingDetail.segel +
      priceShippingDetail.rc +
      priceShippingDetail.lss,
    createDate: priceShippingDetail.createDate,
    status:
      priceShippingDetail.status &&
      (await getPriceShippingStatus(priceShippingDetail.priceShippingId)) &&
      (route?.status ?? true) &&
      (port?.status ?? true),
  };
}

async function map(priceShipping: PriceShipping): Promise<PriceShippingDTO> {
  const shipping = await getCustomer(priceShipping.shippingCode);
  const details = await getPriceShippingDetails(priceShipping.id);

  return {
    id: priceShipping.id,
    shippingCode: priceShipping.shippingCode,
    shippingName: shipping?.name ?? "",
    details: details,
    effectiveStartDate: priceShipping.effectiveStartDate,
    effectiveEndDate: priceShipping.effectiveEndDate,
    createDate: priceShipping.createDate,
    status:
      dayjs().isAfter(priceShipping.effectiveStartDate) &&
      dayjs().isBefore(priceShipping.effectiveEndDate) &&
      (shipping?.status ?? true),
  };
}

export async function savePriceShipping(
  input: PriceShippingInput,
  id: string | null = null
) {
  try {
    const fieldDatas: FieldData[] = [];
    for (let i = 0; i < input.details.length; i++) {
      const inputDetail = input.details[i];
      if (
        (await prisma.priceShippingDetail.findFirst({
          where: {
            id: { not: inputDetail.id },
            priceShipping: { shippingCode: input.shipping },
            routeCode: inputDetail.route,
            containerSize: inputDetail.containerSize,
            containerType: inputDetail.containerType,
            serviceType: inputDetail.serviceType,
            portCode: inputDetail.port,
          },
        })) ||
        input.details.find(
          (otherInputDetail, otherIndex) =>
            otherIndex != i &&
            otherInputDetail.route === inputDetail.route &&
            otherInputDetail.containerSize === inputDetail.containerSize &&
            otherInputDetail.containerType === inputDetail.containerType &&
            otherInputDetail.serviceType === inputDetail.serviceType &&
            otherInputDetail.port === inputDetail.port
        )
      ) {
        if (!fieldDatas.find((fieldData) => fieldData.name === "shipping")) {
          fieldDatas.push({
            name: "shipping",
            errors: ["Sudah ada yang sama"],
          });
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

    if (fieldDatas.length > 0) return fieldDatas;

    if (!id) {
      await prisma.priceShipping.create({
        data: {
          shippingCode: input.shipping,
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
                freight: inputDetail.freight,
                thcOPT: inputDetail.thcOPT,
                thcOPP: inputDetail.thcOPP,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                alihKapal: inputDetail.alihKapal,
                materai: inputDetail.materai,
                lolo: inputDetail.lolo,
                segel: inputDetail.segel,
                rc: inputDetail.rc,
                lss: inputDetail.lss,
                createDate: new Date(),
                status: true,
              };
            }),
          },
        },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const priceShippigDetails = await tx.priceShippingDetail.findMany({
          where: {
            priceShippingId: id,
          },
        });

        for (const priceShippingDetail of priceShippigDetails) {
          if (
            !input.details.find(
              (inputDetail) => inputDetail.id === priceShippingDetail.id
            )
          ) {
            await tx.priceShippingDetail.delete({
              where: { id: priceShippingDetail.id },
            });
          }
        }

        for (const inputDetail of input.details) {
          if (
            priceShippigDetails.find((detail) => detail.id === inputDetail.id)
          ) {
            await tx.priceShippingDetail.update({
              where: { id: inputDetail.id },
              data: {
                routeCode: inputDetail.route,
                containerSize: inputDetail.containerSize,
                containerType: inputDetail.containerType,
                serviceType: inputDetail.serviceType,
                portCode: inputDetail.port,
                freight: inputDetail.freight,
                thcOPT: inputDetail.thcOPT,
                thcOPP: inputDetail.thcOPP,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                alihKapal: inputDetail.alihKapal,
                materai: inputDetail.materai,
                lolo: inputDetail.lolo,
                segel: inputDetail.segel,
                rc: inputDetail.rc,
                lss: inputDetail.lss,
              },
            });
          } else {
            await tx.priceShippingDetail.create({
              data: {
                priceShippingId: id,
                routeCode: inputDetail.route,
                containerSize: inputDetail.containerSize,
                containerType: inputDetail.containerType,
                serviceType: inputDetail.serviceType,
                portCode: inputDetail.port,
                freight: inputDetail.freight,
                thcOPT: inputDetail.thcOPT,
                thcOPP: inputDetail.thcOPP,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                alihKapal: inputDetail.alihKapal,
                materai: inputDetail.materai,
                lolo: inputDetail.lolo,
                segel: inputDetail.segel,
                rc: inputDetail.rc,
                lss: inputDetail.lss,
                createDate: new Date(),
                status: true,
              },
            });
          }
        }

        return await tx.priceShipping.update({
          where: {
            id,
          },
          data: {
            shippingCode: input.shipping,
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

export async function getAllPriceShippings() {
  const priceShippings = await prisma.priceShipping.findMany();
  return Promise.all(priceShippings.map(map));
}

export async function getAllPriceShippingDetails() {
  const priceShippingDetails = await prisma.priceShippingDetail.findMany();
  return Promise.all(priceShippingDetails.map(mapDetail));
}

export async function getPriceShipping(
  id: string,
  { onlyActiveDetail }: { onlyActiveDetail?: boolean }
) {
  const priceShipping = await prisma.priceShipping.findUnique({
    where: {
      id,
    },
  });

  if (!priceShipping) {
    return null;
  }

  const mappedPriceShipping = await map(priceShipping);
  if (onlyActiveDetail) {
    mappedPriceShipping.details = mappedPriceShipping.details.filter(
      (detail) => detail.status
    );
  }

  return mappedPriceShipping;
}

async function getPriceShippingStatus(id: string) {
  const priceShipping = await prisma.priceShipping.findUnique({
    where: {
      id,
    },
  });
  if (!priceShipping) {
    return false;
  }

  const shipping = await getCustomer(priceShipping.shippingCode);

  return (
    dayjs().isAfter(priceShipping.effectiveStartDate) &&
    dayjs().isBefore(priceShipping.effectiveEndDate) &&
    (shipping?.status ?? true)
  );
}

export async function setPriceShippingDetailStatus(
  id: string,
  status: boolean
) {
  await prisma.priceShippingDetail.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getPriceShippingDetails(priceShippingId: string) {
  const priceShippingDetails = await prisma.priceShippingDetail.findMany({
    where: {
      priceShippingId,
    },
  });

  return Promise.all(priceShippingDetails.map(mapDetail));
}

export async function getPriceShippingContainerSizeOptions() {
  return containerSizes.map((containerSize) => {
    return {
      label: containerSize,
      value: containerSize,
    };
  });
}

export async function getPriceShippingContainerTypeOptions() {
  return containerTypes.map((containerType) => {
    return {
      label: containerType,
      value: containerType,
    };
  });
}

export async function getPriceShippingServiceTypeOptions() {
  return serviceTypes.map((serviceType) => {
    return {
      label: serviceType,
      value: serviceType,
    };
  });
}
