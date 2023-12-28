"use server";

import prisma from "@/lib/prisma";
import { Sales, SalesJobPosition } from "@prisma/client";
import { handleError } from "./error";

export type SalesDTO = {
  code: string;
  jobPosition: SalesJobPosition;
  name: string;
  nik: string;
  cabang: string;
  phoneNumber: string;
  telephone: string;
  fax: string;
  email: string;
  createDate: Date;
  status: boolean;
};

export type SalesInput = {
  jobPosition: SalesJobPosition;
  name: string;
  nik: string;
  cabang: string;
  phoneNumber: string;
  telephone: string;
  fax: string;
  email: string;
};

function map(sales: Sales): SalesDTO {
  return {
    code: sales.code,
    jobPosition: sales.jobPosition,
    name: sales.name,
    nik: sales.nik,
    cabang: sales.cabang,
    phoneNumber: sales.phoneNumber,
    telephone: sales.telephone,
    fax: sales.fax,
    email: sales.email,
    createDate: sales.createDate,
    status: sales.status,
  };
}

export async function getSalesCode() {
  const sales = await prisma.sales.findFirst({
    orderBy: {
      code: "desc",
    },
  });

  if (!sales) {
    return "SALES0001";
  }

  return (
    "SALES" + (Number(sales.code.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function saveSales(input: SalesInput, code: string | null = null) {
  try {
    if (!code) {
      await prisma.sales.create({
        data: {
          code: await getSalesCode(),
          jobPosition: input.jobPosition,
          name: input.name,
          nik: input.nik,
          cabang: input.cabang,
          phoneNumber: input.phoneNumber,
          telephone: input.telephone,
          fax: input.fax,
          email: input.email,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.sales.update({
        where: {
          code: code,
        },
        data: {
          jobPosition: input.jobPosition,
          name: input.name,
          nik: input.nik,
          cabang: input.cabang,
          phoneNumber: input.phoneNumber,
          telephone: input.telephone,
          fax: input.fax,
          email: input.email,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllSales() {
  const sales = await prisma.sales.findMany();
  return sales.map(map);
}

export async function getSalesOptions() {
  const sales = await getAllSales();

  return sales
    .filter((sales) => sales.status)
    .map((sales) => ({
      value: sales.code,
      label: sales.name,
    }));
}

export async function getSales(code: string) {
  const sales = await prisma.sales.findUnique({
    where: {
      code: code,
    },
  });

  if (!sales) {
    return null;
  }

  return map(sales);
}

export async function setSalesStatus(code: string, status: boolean) {
  await prisma.sales.update({
    where: {
      code: code,
    },
    data: {
      status: status,
    },
  });
}
