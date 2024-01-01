"use server";

import prisma from "@/lib/prisma";
import { productSatuan } from "@/lib/utils/consts";
import { Product, ProductType } from "@prisma/client";
import { handleError } from "./error";
import { ProductCategoryDTO, getProductCategory } from "./productCategory";

export type ProductDTO = {
  skuCode: string;
  type: ProductType;
  categoryReff: string;
  categoryName: string;
  name: string;
  satuan: string;
  createDate: Date;
  status: boolean;
};

export type ProductInput = {
  type: ProductType;
  category?: string;
  name: string;
  satuan: string;
};

async function map(product: Product): Promise<ProductDTO> {
  let productCategory: ProductCategoryDTO | null = null;
  if (product.type === "Product" && product.categoryReff) {
    productCategory = await getProductCategory(product.categoryReff);
  }

  return {
    skuCode: product.skuCode,
    type: product.type,
    name: product.name,
    categoryReff: product.categoryReff ?? "",
    categoryName: productCategory?.name ?? "",
    satuan: product.satuan,
    createDate: product.createDate,
    status: product.status && (productCategory?.status ?? true),
  };
}

export async function getProductCode() {
  const product = await prisma.product.findFirst({
    orderBy: {
      skuCode: "desc",
    },
  });

  if (!product) {
    return "SKU0001";
  }

  return (
    "SKU" + (Number(product.skuCode.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function saveProduct(
  input: ProductInput,
  skuCode: string | null = null
) {
  try {
    if (!skuCode) {
      await prisma.product.create({
        data: {
          skuCode: await getProductCode(),
          type: input.type,
          categoryReff: input.category,
          name: input.name,
          satuan: input.satuan,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.product.update({
        where: {
          skuCode,
        },
        data: {
          categoryReff: input.category,
          name: input.name,
          satuan: input.satuan,
        },
      });
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function getAllProduct(type: ProductType | null = null) {
  const products = type
    ? await prisma.product.findMany({ where: { type } })
    : await prisma.product.findMany();

  return Promise.all(products.map(map));
}

export async function getProduct(skuCode: string) {
  const product = await prisma.product.findUnique({
    where: {
      skuCode,
    },
  });

  if (!product) {
    return null;
  }

  return map(product);
}

export async function setProductStatus(skuCode: string, status: boolean) {
  try {
    await prisma.product.update({
      where: {
        skuCode,
      },
      data: {
        status: status,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function getProductOptions(type: ProductType) {
  const products = await getAllProduct(type);

  return products
    .filter((product) => product.status)
    .map((product) => ({
      value: product.skuCode,
      label: product.name,
    }));
}

export async function getProductSatuanOptions() {
  return productSatuan.map((satuan) => ({
    value: satuan,
    label: satuan,
  }));
}
