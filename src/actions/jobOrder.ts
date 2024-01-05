"use server";

import prisma from "@/lib/prisma";
import { JobOrder } from "@prisma/client";
import { getCustomer } from "./customer";
import { handleError } from "./error";
import { getInquiryDetail } from "./inquiry";
import { getAllPriceVendorDetails } from "./priceVendor";
import { getVehicle } from "./vehicle";

export type JobOrderDTO = {
  number: string;
  inquiryDetailId: string;
  inquiryDetail: {
    inquiryNumber: string;
    inquiry: {
      salesCode: string;
      salesName: string;
      shipperCode: string;
      shipperName: string;
      createDate: Date;
    };
    shippingCode: string;
    shippingName: string;
    vesselId: string;
    vesselName: string;
    voyage: string;
    etd: Date;
    eta: Date;
    loadDate: Date;
    deliveryToCode: string;
    deliveryToName: string;
    deliveryToCity: string;
    routeCode: string;
    routeDescription: string;
    containerSize: string;
    containerType: string;
    typeOrder: string;
  };
  roNumber: string;
  /**
   * Vendor's Code
   */
  consigneeCode: string;
  /**
   * Vendor's Name
   */
  consigneeName: string;
  /**
   * Vendor's Address
   */
  consigneeAddress: string;
  /**
   * Vendor's City
   */
  consigneeCity: string;
  /**
   * Vendor's Email
   */
  consigneeEmail: string;
  /**
   * Vendor's Telephone
   */
  consigneeTelephone: string;
  stuffingDate: Date;
  trackingRouteCode: string;
  trackingRouteDescription: string;
  trackingVendorCode: string;
  trackingVendorName: string;
  vehicleId: string;
  truckNumber: string;
  truckType: string;
  driverName: string;
  driverPhoneNumber: string;
  containerNumber1: string;
  sealNumber1: string;
  containerNumber2: string | null;
  sealNumber2: string | null;
  createDate: Date;
};

export type JobOrderInput = {
  inquiryDetail: string;
  roNumber: string;
  consignee: string;
  stuffingDate: Date;
  trackingRoute: string;
  trackingVendor: string;
  truck: string;
  driverName: string;
  driverPhoneNumber: string;
  containerNumber1: string;
  sealNumber1: string;
  containerNumber2?: string;
  sealNumber2?: string;
};

async function map(jobOrder: JobOrder): Promise<JobOrderDTO> {
  const inquiryDetail = await getInquiryDetail(jobOrder.inquiryDetailId);
  const consignee = await getCustomer(jobOrder.consigneeCode);
  const priceVendorDetail = await getPriceVendorDetailByJobOrder(
    jobOrder.trackingVendorCode,
    jobOrder.trackingRouteCode
  );
  const vehicle = await getVehicle(jobOrder.vehicleId);

  return {
    number: jobOrder.number,
    inquiryDetailId: jobOrder.inquiryDetailId,
    inquiryDetail: {
      inquiryNumber: inquiryDetail?.inquiryNumber ?? "",
      inquiry: {
        salesCode: inquiryDetail?.inquiry.salesCode ?? "",
        salesName: inquiryDetail?.inquiry.salesName ?? "",
        shipperCode: inquiryDetail?.inquiry.shipperCode ?? "",
        shipperName: inquiryDetail?.inquiry.shipperName ?? "",
        createDate: inquiryDetail?.inquiry.createDate ?? new Date(),
      },
      shippingCode: inquiryDetail?.shippingCode ?? "",
      shippingName: inquiryDetail?.shippingName ?? "",
      vesselId: inquiryDetail?.vesselId ?? "",
      vesselName: inquiryDetail?.vesselName ?? "",
      voyage: inquiryDetail?.voyage ?? "",
      etd: inquiryDetail?.etd ?? new Date(),
      eta: inquiryDetail?.eta ?? new Date(),
      loadDate: inquiryDetail?.loadDate ?? new Date(),
      deliveryToCode: inquiryDetail?.deliveryToCode ?? "",
      deliveryToName: inquiryDetail?.deliveryToName ?? "",
      deliveryToCity: inquiryDetail?.deliveryToCity ?? "",
      routeCode: inquiryDetail?.routeCode ?? "",
      routeDescription: inquiryDetail?.routeDescription ?? "",
      containerSize: inquiryDetail?.containerSize ?? "",
      containerType: inquiryDetail?.containerType ?? "",
      typeOrder: inquiryDetail?.typeOrder ?? "",
    },
    roNumber: jobOrder.roNumber,
    consigneeCode: jobOrder.consigneeCode,
    consigneeName: consignee?.name ?? "",
    consigneeAddress: consignee?.address ?? "",
    consigneeCity: consignee?.city ?? "",
    consigneeEmail: consignee?.email ?? "",
    consigneeTelephone: consignee?.telephone ?? "",
    stuffingDate: jobOrder.stuffingDate,
    trackingRouteCode: jobOrder.trackingRouteCode,
    trackingRouteDescription: priceVendorDetail?.routeDescription ?? "",
    trackingVendorCode: jobOrder.trackingVendorCode,
    trackingVendorName: priceVendorDetail?.priceVendor.vendorName ?? "",
    vehicleId: jobOrder.vehicleId ?? "",
    truckNumber: vehicle?.truckNumber ?? "",
    truckType: vehicle?.truckType ?? "",
    driverName: jobOrder.driverName,
    driverPhoneNumber: jobOrder.driverPhoneNumber,
    containerNumber1: jobOrder.containerNumber1,
    sealNumber1: jobOrder.sealNumber1,
    containerNumber2: jobOrder.containerNumber2,
    sealNumber2: jobOrder.sealNumber2,
    createDate: jobOrder.createDate,
  };
}

export async function getJobOrderNumber() {
  const jobOrder = await prisma.jobOrder.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  if (!jobOrder) {
    return "JOBORDER0001";
  }

  return (
    "JOBORDER" +
    (Number(jobOrder.number.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function getPriceVendorDetailByJobOrder(
  trackingVendorCode: string,
  trackingRouteCode: string
) {
  const priceVendorDetail = (await getAllPriceVendorDetails()).find(
    (priceVendorDetail) =>
      priceVendorDetail.priceVendor.vendorCode === trackingVendorCode &&
      priceVendorDetail.routeCode === trackingRouteCode
  );

  return priceVendorDetail;
}

export async function saveJobOrder(
  input: JobOrderInput,
  isConvertToCombo: boolean = false,
  number: string | null = null
) {
  try {
    await prisma.$transaction(async (tx) => {
      // CONVERT TO COMBO!!!
      if (isConvertToCombo) {
        const priceVendorDetail = await getPriceVendorDetailByJobOrder(
          input.trackingVendor,
          input.trackingRoute
        );
        if (priceVendorDetail && priceVendorDetail.containerSize === "40 HC") {
          await tx.priceVendorDetail.update({
            where: { id: priceVendorDetail.id },
            data: {
              containerSize: "20 Feet",
            },
          });

          const quotationDetails = await tx.quotationDetail.findMany({
            where: {
              quotation: { serviceType: priceVendorDetail.serviceType },
              portCode: priceVendorDetail.portCode,
              containerSize: "40 HC",
              containerType: priceVendorDetail.containerType,
              OR: [
                {
                  trackingAsalRouteCode: priceVendorDetail.routeCode,
                  trackingAsalVendorCode:
                    priceVendorDetail.priceVendor.vendorCode,
                },
                {
                  trackingTujuanRouteCode: priceVendorDetail.routeCode,
                  trackingTujuanVendorCode:
                    priceVendorDetail.priceVendor.vendorCode,
                },
              ],
            },
          });
          for (const quotationDetail of quotationDetails) {
            const updatedQuotationDetail = await tx.quotationDetail.update({
              where: { id: quotationDetail.id },
              data: {
                containerSize: "20 Feet",
              },
              include: { quotation: { include: { PriceShipper: true } } },
            });
            for (const priceShipper of updatedQuotationDetail.quotation
              .PriceShipper) {
              await tx.priceShipper.update({
                where: { id: priceShipper.id },
                data: {
                  containerSize: "20 Feet",
                },
              });
            }
          }
        }
      }

      if (!number) {
        await tx.jobOrder.create({
          data: {
            number: await getJobOrderNumber(),
            inquiryDetailId: input.inquiryDetail,
            roNumber: input.roNumber,
            consigneeCode: input.consignee,
            stuffingDate: input.stuffingDate,
            trackingRouteCode: input.trackingRoute,
            trackingVendorCode: input.trackingVendor,
            vehicleId: input.truck,
            driverName: input.driverName,
            driverPhoneNumber: input.driverPhoneNumber,
            containerNumber1: input.containerNumber1,
            sealNumber1: input.sealNumber1,
            containerNumber2: input.containerNumber2,
            sealNumber2: input.sealNumber2,
          },
        });
      } else {
        await tx.jobOrder.update({
          where: {
            number,
          },
          data: {
            roNumber: input.roNumber,
            consigneeCode: input.consignee,
            stuffingDate: input.stuffingDate,
            trackingRouteCode: input.trackingRoute,
            trackingVendorCode: input.trackingVendor,
            vehicleId: input.truck,
            driverName: input.driverName,
            driverPhoneNumber: input.driverPhoneNumber,
            containerNumber1: input.containerNumber1,
            sealNumber1: input.sealNumber1,
            containerNumber2: input.containerNumber2,
            sealNumber2: input.sealNumber2,
          },
        });
      }
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllJobOrder() {
  const jobOrder = await prisma.jobOrder.findMany();
  return Promise.all(jobOrder.map(map));
}

export async function getJobOrder(number: string) {
  const jobOrder = await prisma.jobOrder.findUnique({
    where: {
      number,
    },
  });

  if (!jobOrder) {
    return null;
  }

  return map(jobOrder);
}
