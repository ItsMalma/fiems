"use server";

import prisma from "@/lib/prisma";
import { ProductType, Request, RequestDetail } from "@prisma/client";
import { handleError } from "./error";
import { getProduct } from "./product";

export type RequestDetailDTO = {
  id: string;
  productSkuCode: string;
  productName: string;
  qty: number;
  remarks: string;
  createDate: Date;
};

export type RequestDTO = {
  number: string;
  type: ProductType;
  details: RequestDetailDTO[];
  createDate: Date;
};

export type RequestDetailInput = {
  id?: string;
  product: string;
  qty: number;
  remarks: string;
};

export type RequestInput = {
  type: ProductType;
  details: RequestDetailInput[];
};

async function mapDetail(
  requestDetail: RequestDetail
): Promise<RequestDetailDTO> {
  const request = await prisma.request.findUnique({
    where: {
      number: requestDetail.requestNumber,
    },
  });
  const product = await getProduct(requestDetail.productSkuCode);

  return {
    id: requestDetail.id,
    productSkuCode: requestDetail.productSkuCode,
    productName: product?.name ?? "",
    qty: requestDetail.qty,
    remarks: requestDetail.remarks,
    createDate: requestDetail.createDate,
  };
}

async function map(request: Request): Promise<RequestDTO> {
  const details = await getRequestDetails(request.number);

  return {
    number: request.number,
    type: request.type,
    details: details,
    createDate: request.createDate,
  };
}

export async function getRequestNumber() {
  const request = await prisma.request.findFirst({
    orderBy: {
      number: "desc",
    },
  });

  if (!request) {
    return "REQUEST0001";
  }

  return (
    "REQUEST" +
    (Number(request.number.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function saveRequest(
  input: RequestInput,
  number: string | null = null
) {
  try {
    if (!number) {
      await prisma.request.create({
        data: {
          number: await getRequestNumber(),
          type: input.type,
          details: {
            create: input.details.map((inputDetail) => {
              return {
                productSkuCode: inputDetail.product,
                qty: inputDetail.qty,
                remarks: inputDetail.remarks,
                createDate: new Date(),
              };
            }),
          },
          createDate: new Date(),
        },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const requestDetails = await tx.requestDetail.findMany({
          where: {
            requestNumber: number,
          },
        });

        for (const requestDetail of requestDetails) {
          if (
            !input.details.find(
              (inputDetail) => inputDetail.id === requestDetail.id
            )
          ) {
            await tx.requestDetail.delete({
              where: { id: requestDetail.id },
            });
          }
        }

        for (const inputDetail of input.details) {
          if (requestDetails.find((detail) => detail.id === inputDetail.id)) {
            await tx.requestDetail.update({
              where: { id: inputDetail.id },
              data: {
                productSkuCode: inputDetail.product,
                qty: inputDetail.qty,
                remarks: inputDetail.remarks,
              },
            });
          } else {
            await tx.requestDetail.create({
              data: {
                requestNumber: number,
                productSkuCode: inputDetail.product,
                qty: inputDetail.qty,
                remarks: inputDetail.remarks,
                createDate: new Date(),
              },
            });
          }
        }

        return await tx.request.update({
          where: {
            number,
          },
          data: {
            type: input.type,
          },
        });
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllRequests() {
  const requests = await prisma.request.findMany();
  return Promise.all(requests.map(map));
}

export async function getAllRequestDetails() {
  const requestDetails = await prisma.requestDetail.findMany();
  return Promise.all(requestDetails.map(mapDetail));
}

export async function getRequest(number: string) {
  const request = await prisma.request.findUnique({
    where: {
      number,
    },
  });

  if (!request) {
    return null;
  }

  return await map(request);
}

export async function getRequestDetail(id: string) {
  const requestDetail = await prisma.requestDetail.findUnique({
    where: {
      id,
    },
  });

  if (!requestDetail) {
    return null;
  }

  return await mapDetail(requestDetail);
}

export async function getRequestDetails(requestNumber: string) {
  const requestDetails = await prisma.requestDetail.findMany({
    where: {
      requestNumber,
    },
  });

  return Promise.all(requestDetails.map(mapDetail));
}
