"use server";

import prisma from "@/lib/prisma";
import {
  Quotation,
  QuotationDetail,
  QuotationDetailStatusInsurance,
  QuotationDetailStatusPPFTZ,
  QuotationDetailStatusPPN,
} from "@prisma/client";
import dayjs from "dayjs";
import lodash from "lodash";
import { FieldData } from "rc-field-form/es/interface";
import { getCustomer } from "./customer";
import { handleError } from "./error";
import { getPort } from "./port";
import { getAllPriceShippingDetails } from "./priceShipping";
import { getAllPriceVendorDetails } from "./priceVendor";
import { getRoute } from "./route";
import { getSales } from "./sales";

export type QuotationDetailDTO = {
  id: string;
  quotationNumber: string;
  quotation: {
    serviceType: string;
    marketingCode: string;
    marketingName: string;
    marketingEmail: string;
    shipperCode: string;
    shipperName: string;
    effectiveStartDate: Date;
    effectiveEndDate: Date;
  };
  routeCode: string;
  routeDescription: string;
  /**
   * Shipper's Code
   */
  deliveryToCode: string;
  /**
   * Shipper's Name
   */
  deliveryToName: string;
  /**
   * Shipper's City
   */
  deliveryToCity: string;
  portCode: string;
  portName: string;
  containerSize: string;
  containerType: string;
  trackingAsal: {
    vendorCode: string;
    vendorName: string;
    routeCode: string;
    routeDescription: string;
    price: number;
  };
  trackingTujuan: {
    vendorCode: string;
    vendorName: string;
    routeCode: string;
    routeDescription: string;
    price: number;
  };
  shippingDetail: {
    shippingCode: string;
    shippingName: string;
    routeCode: string;
    routeDescription: string;
    price: number;
  };
  otherExpanses: {
    adminBL: number;
    cleaning: number;
    alihKapal: number;
    materai: number;
    biayaBuruh: number;
    stuffingDalam: number;
    stuffingLuar: number;
    biayaCetakRC: number;
    biayaCetakIR: number;
    sumOff: number;
  };
  summaryDetail: {
    statusPPFTZ: QuotationDetailStatusPPFTZ;
    ppftz?: number;
    statusInsurance: QuotationDetailStatusInsurance;
    insurance?: number;
    biayaAdminInsurance?: number;
    sumOffInsurance?: number;
    hpp: number;
    statusPPN: QuotationDetailStatusPPN;
    hargaJual: number;
    hargaJual2: number;
    hargaJual3: number;
    profit: number;
  };
  isConfirmed: boolean;
  createDate: Date;
  status: boolean;
};

export type QuotationDTO = {
  number: string;
  serviceType: string;
  marketingCode: string;
  marketingName: string;
  marketingEmail: string;
  shipperCode: string;
  shipperName: string;
  details: QuotationDetailDTO[];
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  createDate: Date;
  status: boolean;
};

export type QuotationDetailInput = {
  id?: string;
  route: string;
  deliveryTo: string;
  port: string;
  containerSize: string;
  containerType: string;
  trackingAsalVendor: string;
  trackingAsalRoute: string;
  trackingTujuanVendor: string;
  trackingTujuanRoute: string;
  shippingDetailShipping: string;
  shippingDetailRoute: string;
  adminBL: number;
  cleaning: number;
  alihKapal: number;
  materai: number;
  biayaBuruh: number;
  stuffingDalam: number;
  stuffingLuar: number;
  biayaCetakRC: number;
  biayaCetakIR: number;
  statusPPFTZ: QuotationDetailStatusPPFTZ;
  ppftz?: number;
  statusInsurance: QuotationDetailStatusInsurance;
  insurance?: number;
  biayaAdminInsurance?: number;
  statusPPN: QuotationDetailStatusPPN;
  hargaJual: number;
};

export type QuotationInput = {
  serviceType: string;
  marketing: string;
  shipper: string;
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  details: QuotationDetailInput[];
};

async function mapDetail(
  quotationDetail: QuotationDetail
): Promise<QuotationDetailDTO> {
  const quotation = await prisma.quotation.findUnique({
    where: {
      number: quotationDetail.quotationNumber,
    },
    include: {
      marketing: true,
      shipper: true,
    },
  });
  const route = await getRoute(quotationDetail.routeCode);
  const deliveryTo = await getCustomer(quotationDetail.deliveryToCode);
  const port = await getPort(quotationDetail.portCode);
  const trackingAsalVendor = await getCustomer(
    quotationDetail.trackingAsalVendorCode
  );
  const trackingAsalRoute = await getRoute(
    quotationDetail.trackingAsalRouteCode
  );
  const trackingAsal = await getPriceVendorDetailByTracking(
    quotation?.serviceType ?? "",
    port?.code ?? "",
    quotationDetail.containerSize,
    quotationDetail.containerType,
    trackingAsalVendor?.code ?? "",
    trackingAsalRoute?.code ?? ""
  );
  const trackingTujuanVendor = await getCustomer(
    quotationDetail.trackingTujuanVendorCode
  );
  const trackingTujuanRoute = await getRoute(
    quotationDetail.trackingTujuanRouteCode
  );
  const trackingTujuan = await getPriceVendorDetailByTracking(
    quotation?.serviceType ?? "",
    port?.code ?? "",
    quotationDetail.containerSize,
    quotationDetail.containerType,
    trackingTujuanVendor?.code ?? "",
    trackingTujuanRoute?.code ?? ""
  );
  const shippingDetailShipping = await getCustomer(
    quotationDetail.shippingDetailShippingCode
  );
  const shippingDetailRoute = await getRoute(
    quotationDetail.shippingDetailRouteCode
  );
  const shippingDetail = await getPriceShippingDetailByTracking(
    quotation?.serviceType ?? "",
    port?.code ?? "",
    quotationDetail.containerSize,
    quotationDetail.containerType,
    shippingDetailShipping?.code ?? "",
    shippingDetailRoute?.code ?? ""
  );

  const otherExpansesSumOff =
    quotationDetail.adminBL +
    quotationDetail.cleaning +
    quotationDetail.alihKapal +
    quotationDetail.materai +
    quotationDetail.biayaBuruh +
    quotationDetail.stuffingDalam +
    quotationDetail.stuffingLuar +
    quotationDetail.biayaCetakRC +
    quotationDetail.biayaCetakIR;

  const insuranceSumOff =
    (quotationDetail.insurance ?? 0) * 0.001 +
    (quotationDetail.biayaAdminInsurance ?? 0);

  const hpp =
    (trackingAsal?.grandTotal ?? 0) +
    (trackingTujuan?.grandTotal ?? 0) +
    (shippingDetail?.grandTotal ?? 0) +
    otherExpansesSumOff +
    (quotationDetail.ppftz ?? 0) +
    insuranceSumOff;

  const hargaJual2 =
    quotationDetail.statusPPN === "Include"
      ? quotationDetail.hargaJual / 1.011
      : quotationDetail.hargaJual;
  const hargaJual3 = hargaJual2 * 0.011;

  return {
    id: quotationDetail.id,
    quotationNumber: quotationDetail.quotationNumber,
    quotation: {
      serviceType: quotation?.serviceType ?? "",
      marketingCode: quotation?.marketingCode ?? "",
      marketingName: quotation?.marketing?.name ?? "",
      marketingEmail: quotation?.marketing?.email ?? "",
      shipperCode: quotation?.shipperCode ?? "",
      shipperName: quotation?.shipper?.name ?? "",
      effectiveStartDate: quotation?.effectiveStartDate ?? new Date(),
      effectiveEndDate: quotation?.effectiveEndDate ?? new Date(),
    },
    routeCode: quotationDetail.routeCode,
    routeDescription: route?.description ?? "",
    deliveryToCode: quotationDetail.deliveryToCode,
    deliveryToName: deliveryTo?.name ?? "",
    deliveryToCity: deliveryTo?.city ?? "",
    portCode: quotationDetail.portCode,
    portName: port?.name ?? "",
    containerSize: quotationDetail.containerSize,
    containerType: quotationDetail.containerType,
    trackingAsal: {
      vendorCode: quotationDetail.trackingAsalVendorCode,
      vendorName: trackingAsalVendor?.name ?? "",
      routeCode: quotationDetail.trackingAsalRouteCode,
      routeDescription: trackingAsalRoute?.description ?? "",
      price: trackingAsal?.grandTotal ?? 0,
    },
    trackingTujuan: {
      vendorCode: quotationDetail.trackingTujuanVendorCode,
      vendorName: trackingTujuanVendor?.name ?? "",
      routeCode: quotationDetail.trackingTujuanRouteCode,
      routeDescription: trackingTujuanRoute?.description ?? "",
      price: trackingTujuan?.grandTotal ?? 0,
    },
    shippingDetail: {
      shippingCode: quotationDetail.shippingDetailShippingCode,
      shippingName: shippingDetailShipping?.name ?? "",
      routeCode: quotationDetail.shippingDetailRouteCode,
      routeDescription: shippingDetailRoute?.description ?? "",
      price: shippingDetail?.grandTotal ?? 0,
    },
    otherExpanses: {
      adminBL: quotationDetail.adminBL,
      cleaning: quotationDetail.cleaning,
      alihKapal: quotationDetail.alihKapal,
      materai: quotationDetail.materai,
      biayaBuruh: quotationDetail.biayaBuruh,
      stuffingDalam: quotationDetail.stuffingDalam,
      stuffingLuar: quotationDetail.stuffingLuar,
      biayaCetakRC: quotationDetail.biayaCetakRC,
      biayaCetakIR: quotationDetail.biayaCetakIR,
      sumOff:
        quotationDetail.adminBL +
        quotationDetail.cleaning +
        quotationDetail.alihKapal +
        quotationDetail.materai +
        quotationDetail.biayaBuruh +
        quotationDetail.stuffingDalam +
        quotationDetail.stuffingLuar +
        quotationDetail.biayaCetakRC +
        quotationDetail.biayaCetakIR,
    },
    summaryDetail: {
      statusPPFTZ: quotationDetail.statusPPFTZ,
      ppftz: quotationDetail.ppftz ?? undefined,
      statusInsurance: quotationDetail.statusInsurance,
      insurance: quotationDetail.insurance ?? undefined,
      biayaAdminInsurance: quotationDetail.biayaAdminInsurance ?? undefined,
      sumOffInsurance: insuranceSumOff,
      hpp,
      statusPPN: quotationDetail.statusPPN,
      hargaJual: quotationDetail.hargaJual,
      hargaJual2,
      hargaJual3,
      profit: hargaJual2 - hpp,
    },
    isConfirmed: quotationDetail.isConfirmed,
    createDate: quotationDetail.createDate,
    status:
      quotationDetail.status &&
      (await getQuotationStatus(quotationDetail.quotationNumber)) &&
      (route?.status ?? true) &&
      (deliveryTo?.status ?? true) &&
      (port?.status ?? true) &&
      (trackingAsal?.status ?? true) &&
      (trackingTujuan?.status ?? true) &&
      (shippingDetail?.status ?? true),
  };
}

async function map(quotation: Quotation): Promise<QuotationDTO> {
  const marketing = await getSales(quotation.marketingCode);
  const shipper = await getCustomer(quotation.shipperCode);
  const details = await getQuotationDetails(quotation.number);

  return {
    number: quotation.number,
    serviceType: quotation.serviceType,
    marketingCode: quotation.marketingCode,
    marketingName: marketing?.name ?? "",
    marketingEmail: marketing?.email ?? "",
    shipperCode: quotation.shipperCode,
    shipperName: shipper?.name ?? "",
    details,
    effectiveStartDate: quotation.effectiveStartDate,
    effectiveEndDate: quotation.effectiveEndDate,
    createDate: quotation.createDate,
    status:
      dayjs().isAfter(quotation.effectiveStartDate) &&
      dayjs().isBefore(quotation.effectiveEndDate) &&
      (marketing?.status ?? true) &&
      (shipper?.status ?? true),
  };
}

export async function confirmQuotationDetail(id: string) {
  await prisma.quotationDetail.update({
    where: {
      id,
    },
    data: {
      isConfirmed: true,
    },
  });
}

export async function getQuotationNumber() {
  const quotation = await prisma.quotation.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  if (!quotation) {
    return "QUOTATION0001";
  }

  return (
    "QUOTATION" +
    (Number(quotation.number.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function getPriceVendorDetailByTracking(
  serviceType: string,
  port: string,
  containerSize: string,
  containerType: string,
  vendor: string,
  route: string
) {
  const priceVendorDetail = (await getAllPriceVendorDetails()).find(
    (priceVendorDetail) =>
      priceVendorDetail.serviceType === serviceType &&
      priceVendorDetail.portCode === port &&
      priceVendorDetail.containerSize === containerSize &&
      priceVendorDetail.containerType === containerType &&
      priceVendorDetail.priceVendor.vendorCode === vendor &&
      priceVendorDetail.routeCode === route
  );

  return priceVendorDetail;
}

export async function getPriceShippingDetailByTracking(
  serviceType: string,
  port: string,
  containerSize: string,
  containerType: string,
  shipping: string,
  route: string
) {
  const priceShippingDetail = (await getAllPriceShippingDetails()).find(
    (priceVendorDetail) =>
      priceVendorDetail.serviceType === serviceType &&
      priceVendorDetail.portCode === port &&
      priceVendorDetail.containerSize === containerSize &&
      priceVendorDetail.containerType === containerType &&
      priceVendorDetail.priceShipping.shippingCode === shipping &&
      priceVendorDetail.routeCode === route
  );

  return priceShippingDetail;
}

export async function saveQuotation(
  input: QuotationInput,
  number: string | null = null
) {
  try {
    const fieldDatas: FieldData[] = [];
    for (let i = 0; i < input.details.length; i++) {
      const inputDetail = input.details[i];
      if (
        (await prisma.quotationDetail.findFirst({
          where: {
            id: { not: inputDetail.id },
            routeCode: inputDetail.route,
            portCode: inputDetail.port,
            containerSize: inputDetail.containerSize,
            containerType: inputDetail.containerType,
          },
        })) ||
        input.details.find(
          (otherInputDetail, otherIndex) =>
            otherIndex != i &&
            otherInputDetail.route === inputDetail.route &&
            otherInputDetail.port === inputDetail.port &&
            otherInputDetail.containerSize === inputDetail.containerSize &&
            otherInputDetail.containerType === inputDetail.containerType
        )
      ) {
        fieldDatas.push({
          name: ["details", i, "route"],
          errors: ["Sudah ada yang sama"],
        });
        fieldDatas.push({
          name: ["details", i, "port"],
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
      }
    }

    if (fieldDatas.length > 0) return fieldDatas;

    if (!number) {
      await prisma.quotation.create({
        data: {
          number: await getQuotationNumber(),
          serviceType: input.serviceType,
          marketingCode: input.marketing,
          shipperCode: input.shipper,
          effectiveStartDate: input.effectiveStartDate,
          effectiveEndDate: input.effectiveEndDate,
          createDate: new Date(),
          details: {
            create: input.details.map((inputDetail) => {
              return {
                routeCode: inputDetail.route,
                deliveryToCode: inputDetail.deliveryTo,
                portCode: inputDetail.port,
                containerSize: inputDetail.containerSize,
                containerType: inputDetail.containerType,
                trackingAsalVendorCode: inputDetail.trackingAsalVendor,
                trackingAsalRouteCode: inputDetail.trackingAsalRoute,
                trackingTujuanVendorCode: inputDetail.trackingTujuanVendor,
                trackingTujuanRouteCode: inputDetail.trackingTujuanRoute,
                shippingDetailShippingCode: inputDetail.shippingDetailShipping,
                shippingDetailRouteCode: inputDetail.shippingDetailRoute,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                alihKapal: inputDetail.alihKapal,
                materai: inputDetail.materai,
                biayaBuruh: inputDetail.biayaBuruh,
                stuffingDalam: inputDetail.stuffingDalam,
                stuffingLuar: inputDetail.stuffingLuar,
                biayaCetakRC: inputDetail.biayaCetakRC,
                biayaCetakIR: inputDetail.biayaCetakIR,
                statusPPFTZ: inputDetail.statusPPFTZ,
                ppftz: inputDetail.ppftz,
                statusInsurance: inputDetail.statusInsurance,
                insurance: inputDetail.insurance,
                biayaAdminInsurance: inputDetail.biayaAdminInsurance,
                statusPPN: inputDetail.statusPPN,
                hargaJual: inputDetail.hargaJual,
                createDate: new Date(),
                status: true,
              };
            }),
          },
        },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const quotationDetails = await tx.quotationDetail.findMany({
          where: {
            quotationNumber: number,
          },
        });

        for (const quotationDetail of quotationDetails) {
          if (
            !input.details.find(
              (inputDetail) => inputDetail.id === quotationDetail.id
            )
          ) {
            await tx.quotationDetail.delete({
              where: { id: quotationDetail.id },
            });
          }
        }

        for (const inputDetail of input.details) {
          if (quotationDetails.find((detail) => detail.id === inputDetail.id)) {
            await tx.quotationDetail.update({
              where: { id: inputDetail.id },
              data: {
                routeCode: inputDetail.route,
                deliveryToCode: inputDetail.deliveryTo,
                portCode: inputDetail.port,
                containerSize: inputDetail.containerSize,
                containerType: inputDetail.containerType,
                trackingAsalVendorCode: inputDetail.trackingAsalVendor,
                trackingAsalRouteCode: inputDetail.trackingAsalRoute,
                trackingTujuanVendorCode: inputDetail.trackingTujuanVendor,
                trackingTujuanRouteCode: inputDetail.trackingTujuanRoute,
                shippingDetailShippingCode: inputDetail.shippingDetailShipping,
                shippingDetailRouteCode: inputDetail.shippingDetailRoute,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                alihKapal: inputDetail.alihKapal,
                materai: inputDetail.materai,
                biayaBuruh: inputDetail.biayaBuruh,
                stuffingDalam: inputDetail.stuffingDalam,
                stuffingLuar: inputDetail.stuffingLuar,
                biayaCetakRC: inputDetail.biayaCetakRC,
                biayaCetakIR: inputDetail.biayaCetakIR,
                statusPPFTZ: inputDetail.statusPPFTZ,
                ppftz: inputDetail.ppftz,
                statusInsurance: inputDetail.statusInsurance,
                insurance: inputDetail.insurance,
                biayaAdminInsurance: inputDetail.biayaAdminInsurance,
                statusPPN: inputDetail.statusPPN,
                hargaJual: inputDetail.hargaJual,
              },
            });
          } else {
            await tx.quotationDetail.create({
              data: {
                quotationNumber: number,
                routeCode: inputDetail.route,
                deliveryToCode: inputDetail.deliveryTo,
                portCode: inputDetail.port,
                containerSize: inputDetail.containerSize,
                containerType: inputDetail.containerType,
                trackingAsalVendorCode: inputDetail.trackingAsalVendor,
                trackingAsalRouteCode: inputDetail.trackingAsalRoute,
                trackingTujuanVendorCode: inputDetail.trackingTujuanVendor,
                trackingTujuanRouteCode: inputDetail.trackingTujuanRoute,
                shippingDetailShippingCode: inputDetail.shippingDetailShipping,
                shippingDetailRouteCode: inputDetail.shippingDetailRoute,
                adminBL: inputDetail.adminBL,
                cleaning: inputDetail.cleaning,
                alihKapal: inputDetail.alihKapal,
                materai: inputDetail.materai,
                biayaBuruh: inputDetail.biayaBuruh,
                stuffingDalam: inputDetail.stuffingDalam,
                stuffingLuar: inputDetail.stuffingLuar,
                biayaCetakRC: inputDetail.biayaCetakRC,
                biayaCetakIR: inputDetail.biayaCetakIR,
                statusPPFTZ: inputDetail.statusPPFTZ,
                ppftz: inputDetail.ppftz,
                statusInsurance: inputDetail.statusInsurance,
                insurance: inputDetail.insurance,
                biayaAdminInsurance: inputDetail.biayaAdminInsurance,
                statusPPN: inputDetail.statusPPN,
                hargaJual: inputDetail.hargaJual,
                createDate: new Date(),
                status: true,
              },
            });
          }
        }

        return await tx.quotation.update({
          where: {
            number,
          },
          data: {
            serviceType: input.serviceType,
            marketingCode: input.marketing,
            shipperCode: input.shipper,
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

export async function getAllQuotations() {
  const quotations = await prisma.quotation.findMany();
  return Promise.all(quotations.map(map));
}

export async function getAllQuotationDetails() {
  const quotationDetails = await prisma.quotationDetail.findMany();
  return Promise.all(quotationDetails.map(mapDetail));
}

export async function getQuotation(
  number: string,
  { onlyActiveDetail }: { onlyActiveDetail?: boolean }
) {
  const quotation = await prisma.quotation.findUnique({
    where: {
      number,
    },
  });

  if (!quotation) {
    return null;
  }

  const mappedQuotation = await map(quotation);
  if (onlyActiveDetail) {
    mappedQuotation.details = mappedQuotation.details.filter(
      (detail) => detail.status
    );
  }

  return mappedQuotation;
}

export async function getQuotationDetail(id: string) {
  const quotationDetail = await prisma.quotationDetail.findUnique({
    where: {
      id,
    },
  });

  if (!quotationDetail) {
    return null;
  }

  return await mapDetail(quotationDetail);
}

async function getQuotationStatus(number: string) {
  const quotation = await prisma.quotation.findUnique({
    where: {
      number,
    },
  });
  if (!quotation) {
    return false;
  }

  const marketing = await getSales(quotation.marketingCode);
  const shipper = await getCustomer(quotation.shipperCode);

  return (
    dayjs().isAfter(quotation.effectiveStartDate) &&
    dayjs().isBefore(quotation.effectiveEndDate) &&
    (marketing?.status ?? true) &&
    (shipper?.status ?? true)
  );
}

export async function setQuotationDetailStatus(id: string, status: boolean) {
  await prisma.quotationDetail.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getQuotationDetails(quotationNumber: string) {
  const quotationDetails = await prisma.quotationDetail.findMany({
    where: {
      quotationNumber,
    },
  });

  return Promise.all(quotationDetails.map(mapDetail));
}

export async function getQuotationTrackingVendorOptions(
  serviceType: string,
  port: string,
  containerSize: string,
  containerType: string
) {
  return lodash.uniqBy(
    (await getAllPriceVendorDetails())
      .filter(
        (priceVendorDetail) =>
          priceVendorDetail.serviceType === serviceType &&
          priceVendorDetail.portCode === port &&
          priceVendorDetail.containerSize === containerSize &&
          priceVendorDetail.containerType === containerType
      )
      .map((priceVendorDetail) => {
        return {
          label: priceVendorDetail.priceVendor.vendorName,
          value: priceVendorDetail.priceVendor.vendorCode,
        };
      }),
    (opt) => opt.value
  );
}

export async function getQuotationTrackingRouteOptions(
  serviceType: string,
  port: string,
  containerSize: string,
  containerType: string,
  vendor: string
) {
  return lodash.uniqBy(
    (await getAllPriceVendorDetails())
      .filter(
        (priceVendorDetail) =>
          priceVendorDetail.serviceType === serviceType &&
          priceVendorDetail.portCode === port &&
          priceVendorDetail.containerSize === containerSize &&
          priceVendorDetail.containerType === containerType &&
          priceVendorDetail.priceVendor.vendorCode === vendor
      )
      .map((priceVendorDetail) => {
        return {
          label: priceVendorDetail.routeDescription,
          value: priceVendorDetail.routeCode,
        };
      }),
    (opt) => opt.value
  );
}

export async function getQuotationShippingOptions(
  serviceType: string,
  port: string,
  containerSize: string,
  containerType: string
) {
  return lodash.uniqBy(
    (await getAllPriceShippingDetails())
      .filter(
        (priceShippingDetail) =>
          priceShippingDetail.serviceType === serviceType &&
          priceShippingDetail.portCode === port &&
          priceShippingDetail.containerSize === containerSize &&
          priceShippingDetail.containerType === containerType
      )
      .map((priceShippingDetail) => {
        return {
          label: priceShippingDetail.priceShipping.shippingName,
          value: priceShippingDetail.priceShipping.shippingCode,
        };
      }),
    (opt) => opt.value
  );
}

export async function getQuotationShippingRouteOptions(
  serviceType: string,
  port: string,
  containerSize: string,
  containerType: string,
  shipping: string
) {
  return lodash.uniqBy(
    (await getAllPriceShippingDetails())
      .filter(
        (priceShippingDetail) =>
          priceShippingDetail.serviceType === serviceType &&
          priceShippingDetail.portCode === port &&
          priceShippingDetail.containerSize === containerSize &&
          priceShippingDetail.containerType === containerType &&
          priceShippingDetail.priceShipping.shippingCode === shipping
      )
      .map((priceShippingDetail) => {
        return {
          label: priceShippingDetail.routeDescription,
          value: priceShippingDetail.routeCode,
        };
      }),
    (opt) => opt.value
  );
}
