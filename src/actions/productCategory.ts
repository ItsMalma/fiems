"use server";

import prisma from "@/lib/prisma";
import { ProductCategory } from "@prisma/client";
import { handleError } from "./error";

export type ProductCategoryDTO = {
  reff: string;
  name: string;
  kendaraan: boolean;
  createDate: Date;
  status: boolean;
};

export type ProductCategoryInput = {
  name: string;
  kendaraan: boolean;
};

function map(productCategory: ProductCategory): ProductCategoryDTO {
  return {
    reff: productCategory.reff,
    name: productCategory.name,
    kendaraan: productCategory.kendaraan,
    createDate: productCategory.createDate,
    status: productCategory.status,
  };
}

export async function getProductCategoryReff() {
  const productCategory = await prisma.productCategory.findFirst({
    orderBy: {
      reff: "desc",
    },
  });

  if (!productCategory) {
    return "REFF0001";
  }

  return (
    "REFF" +
    (Number(productCategory.reff.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function saveProductCategory(
  input: ProductCategoryInput,
  reff: string | null = null
) {
  try {
    if (!reff) {
      await prisma.productCategory.create({
        data: {
          reff: await getProductCategoryReff(),
          name: input.name,
          kendaraan: input.kendaraan,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.productCategory.update({
        where: {
          reff,
        },
        data: {
          name: input.name,
          kendaraan: input.kendaraan,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllProductCategory() {
  const productCategories = await prisma.productCategory.findMany();
  return productCategories.map(map);
}

export async function getProductCategoryOptions() {
  const productCategories = await getAllProductCategory();

  return productCategories
    .filter((productCategory) => productCategory.status)
    .map((productCategory) => ({
      value: productCategory.reff,
      label: productCategory.name,
    }));
}

export async function getProductCategory(reff: string) {
  const productCategory = await prisma.productCategory.findUnique({
    where: {
      reff,
    },
  });

  if (!productCategory) {
    return null;
  }

  return map(productCategory);
}

export async function setProductCategoryStatus(reff: string, status: boolean) {
  await prisma.productCategory.update({
    where: {
      reff,
    },
    data: {
      status: status,
    },
  });
}
