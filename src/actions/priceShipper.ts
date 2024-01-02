"use server";

import prisma from "@/lib/prisma";
import { PriceShipper } from "@prisma/client";
import lodash from "lodash";
import { FieldData } from "rc-field-form/es/interface";
import { handleError } from "./error";
import {
  getAllQuotationDetails,
  getAllQuotations,
  getQuotation,
} from "./quotation";
import { getRoute } from "./route";

export type PriceShipperDTO = {
  id: string;
  quotationNumber: string;
  quotation: {
    serviceType: string;
    shipperCode: string;
    shipperName: string;
    effectiveStartDate: Date;
    effectiveEndDate: Date;
  };
  routeCode: string;
  routeDescription: string;
  containerSize: string;
  containerType: string;
  portCode: string;
  portName: string;
  etcCost: number;
  hpp: number;
  hppAfterETCCost: number;
  createDate: Date;
  status: boolean;
};

export type PriceShipperInput = {
  id?: string;
  quotation: string;
  route: string;
  containerSize: string;
  etcCost: number;
};

async function map(priceShipper: PriceShipper): Promise<PriceShipperDTO> {
  const quotation = await getQuotation(priceShipper.quotationNumber, {});
  const route = await getRoute(priceShipper.routeCode);
  const quotationDetail = await getQuotationDetailByPriceShipper(
    priceShipper.quotationNumber,
    priceShipper.routeCode,
    priceShipper.containerSize
  );

  return {
    id: priceShipper.id,
    quotationNumber: priceShipper.quotationNumber,
    quotation: {
      serviceType: quotation?.serviceType ?? "",
      shipperCode: quotation?.shipperCode ?? "",
      shipperName: quotation?.shipperName ?? "",
      effectiveStartDate: quotation?.effectiveStartDate ?? new Date(),
      effectiveEndDate: quotation?.effectiveEndDate ?? new Date(),
    },
    routeCode: route?.code ?? "",
    routeDescription: route?.description ?? "",
    containerSize: priceShipper.containerSize,
    containerType: quotationDetail?.containerType ?? "",
    portCode: quotationDetail?.portCode ?? "",
    portName: quotationDetail?.portName ?? "",
    etcCost: priceShipper.etcCost,
    hpp: quotationDetail?.summaryDetail.hpp ?? 0,
    hppAfterETCCost:
      (quotationDetail?.summaryDetail.hpp ?? 0) + priceShipper.etcCost,
    createDate: priceShipper.createDate,
    status:
      priceShipper.status &&
      (quotation?.status ?? true) &&
      (route?.status ?? true) &&
      (quotationDetail?.status ?? true),
  };
}

export async function getQuotationDetailByPriceShipper(
  quotation: string,
  route: string,
  containerSize: string
) {
  const quotationDetail = (await getAllQuotationDetails()).find(
    (quotationDetail) =>
      quotationDetail.quotationNumber === quotation &&
      quotationDetail.routeCode === route &&
      quotationDetail.containerSize === containerSize
  );

  return quotationDetail;
}

export async function savePriceShipper(
  input: PriceShipperInput,
  id: string | null = null
) {
  try {
    const fieldDatas: FieldData[] = [];

    const quotationDetail = await getQuotationDetailByPriceShipper(
      input.quotation,
      input.route,
      input.containerSize
    );
    if (!quotationDetail) {
      fieldDatas.push(
        { name: "quotation", errors: ["Tidak dapat menemukan vendor"] },
        { name: "route", errors: ["Tidak dapat menemukan route"] },
        {
          name: "containerSize",
          errors: ["Tidak dapat menemukan container size"],
        }
      );
      return fieldDatas;
    }

    const priceShipper = await prisma.priceShipper.findFirst({
      where: {
        quotationNumber: input.quotation,
        routeCode: input.route,
        containerSize: input.containerSize,
      },
    });
    if (priceShipper && !!id !== (priceShipper.id !== id)) {
      fieldDatas.push(
        { name: "quotation", errors: ["Sudah ada yang sama"] },
        { name: "route", errors: ["Sudah ada yang sama"] },
        {
          name: "containerSize",
          errors: ["Sudah ada yang sama"],
        }
      );
      return fieldDatas;
    }

    if (!id) {
      await prisma.priceShipper.create({
        data: {
          quotationNumber: input.quotation,
          routeCode: input.route,
          containerSize: input.containerSize,
          etcCost: input.etcCost,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.priceShipper.update({
        where: {
          id,
        },
        data: {
          quotationNumber: input.quotation,
          routeCode: input.route,
          containerSize: input.containerSize,
          etcCost: input.etcCost,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllPriceShipper() {
  const priceShipper = await prisma.priceShipper.findMany();
  return Promise.all(priceShipper.map(map));
}

export async function getPriceShipper(id: string) {
  const priceShipper = await prisma.priceShipper.findUnique({
    where: {
      id,
    },
  });

  if (!priceShipper) {
    return null;
  }

  return map(priceShipper);
}

export async function setPriceShipperStatus(id: string, status: boolean) {
  await prisma.priceShipper.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getPriceShipperQuotationOptions() {
  return lodash.uniqBy(
    (await getAllQuotations())
      .filter((quotation) =>
        quotation.details.find((quotationDetail) => quotationDetail.isConfirmed)
      )
      .map((quotation) => ({
        label: quotation.number,
        value: quotation.number,
      })),
    (opt) => opt.value
  );
}

export async function getPriceShipperRouteOptions(quotation: string) {
  return lodash.uniqBy(
    (await getAllQuotationDetails())
      .filter(
        (quotationDetail) =>
          quotationDetail.quotationNumber === quotation &&
          quotationDetail.isConfirmed
      )
      .map((quotationDetail) => ({
        label: quotationDetail.routeDescription,
        value: quotationDetail.routeCode,
      })),
    (opt) => opt.value
  );
}

export async function getPriceShipperContainerSizeOptions(
  quotation: string,
  route: string
) {
  return lodash.uniqBy(
    (await getAllQuotationDetails())
      .filter(
        (quotationDetail) =>
          quotationDetail.quotationNumber === quotation &&
          quotationDetail.routeCode === route &&
          quotationDetail.isConfirmed
      )
      .map((quotationDetail) => ({
        label: quotationDetail.containerSize,
        value: quotationDetail.containerSize,
      })),
    (opt) => opt.value
  );
}
