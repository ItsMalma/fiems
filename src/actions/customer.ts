"use server";

import prisma from "@/lib/prisma";
import { Customer, CustomerType } from "@prisma/client";
import { handleError } from "./error";
import { ShipperGroupDTO, getShipperGroup } from "./shipperGroup";

export type CustomerDTO = {
  code: string;
  type: CustomerType;
  name: string;
  groupCode: string;
  groupName: string;
  npwp: string;
  province: string;
  city: string;
  address: string;
  telephone: string;
  fax: string;
  email: string;
  top: number;
  currency: string;
  purchasing: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    telephone?: string;
    fax?: string;
  };
  operation: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    telephone?: string;
    fax?: string;
  };
  finance: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    telephone?: string;
    fax?: string;
  };
  createDate: Date;
  status: boolean;
};

export type CustomerInput = {
  type: CustomerType;
  name: string;
  group?: string;
  npwp?: string;
  province: string;
  city: string;
  address: string;
  telephone?: string;
  fax?: string;
  email?: string;
  top: number;
  currency: string;
  purchasing: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    telephone?: string;
    fax?: string;
  };
  operation: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    telephone?: string;
    fax?: string;
  };
  finance: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    telephone?: string;
    fax?: string;
  };
};

async function map(customer: Customer): Promise<CustomerDTO> {
  let shipperGroup: ShipperGroupDTO | null = null;
  if (customer.type === "Shipper" && customer.groupCode) {
    shipperGroup = await getShipperGroup(customer.groupCode);
  }

  return {
    code: customer.code,
    type: customer.type,
    name: customer.name,
    groupCode: shipperGroup?.code ?? "",
    groupName: shipperGroup?.name ?? "",
    npwp: customer.npwp ?? "",
    province: customer.province,
    city: customer.city,
    address: customer.address,
    telephone: customer.telephone ?? "",
    fax: customer.fax ?? "",
    email: customer.email ?? "",
    top: customer.top,
    currency: customer.currency,
    purchasing: {
      name: customer.purchasing?.name ?? "",
      email: customer.purchasing?.email ?? "",
      phoneNumber: customer.purchasing?.phoneNumber ?? "",
      telephone: customer.purchasing?.telephone ?? "",
      fax: customer.purchasing?.fax ?? "",
    },
    operation: {
      name: customer.operation?.name ?? "",
      email: customer.operation?.email ?? "",
      phoneNumber: customer.operation?.phoneNumber ?? "",
      telephone: customer.operation?.telephone ?? "",
      fax: customer.operation?.fax ?? "",
    },
    finance: {
      name: customer.finance?.name ?? "",
      email: customer.finance?.email ?? "",
      phoneNumber: customer.finance?.phoneNumber ?? "",
      telephone: customer.finance?.telephone ?? "",
      fax: customer.finance?.fax ?? "",
    },
    createDate: customer.createDate,
    status: customer.status && (shipperGroup?.status ?? true),
  };
}

export async function getCustomerCode(type: CustomerType) {
  const customer = await prisma.customer.findFirst({
    where: {
      type: type,
    },
    orderBy: {
      code: "desc",
    },
  });

  if (!customer) {
    return type.toUpperCase() + "0001";
  }

  return (
    type.toUpperCase() +
    (Number(customer.code.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function saveCustomer(
  input: CustomerInput,
  code: string | null = null
) {
  try {
    if (!code) {
      await prisma.customer.create({
        data: {
          code: await getCustomerCode(input.type),
          type: input.type,
          name: input.name,
          groupCode: input.group,
          npwp: input.npwp,
          province: input.province,
          city: input.city,
          address: input.address,
          telephone: input.telephone,
          fax: input.fax,
          email: input.email,
          top: input.top,
          currency: input.currency,
          purchasing: {
            name: input.purchasing.name,
            email: input.purchasing.email,
            phoneNumber: input.purchasing.phoneNumber,
            telephone: input.purchasing.telephone,
            fax: input.purchasing.fax,
          },
          operation: {
            name: input.operation.name,
            email: input.operation.email,
            phoneNumber: input.operation.phoneNumber,
            telephone: input.operation.telephone,
            fax: input.operation.fax,
          },
          finance: {
            name: input.finance.name,
            email: input.finance.email,
            phoneNumber: input.finance.phoneNumber,
            telephone: input.finance.telephone,
            fax: input.finance.fax,
          },
          status: true,
        },
      });
    } else {
      console.log(input.purchasing);
      await prisma.customer.update({
        where: {
          code: code,
        },
        data: {
          name: input.name,
          groupCode: input.group,
          npwp: input.npwp,
          province: input.province,
          city: input.city,
          address: input.address,
          telephone: input.telephone,
          fax: input.fax,
          email: input.email,
          top: input.top,
          currency: input.currency,
          purchasing: {
            name: input.purchasing.name,
            email: input.purchasing.email,
            phoneNumber: input.purchasing.phoneNumber,
            telephone: input.purchasing.telephone,
            fax: input.purchasing.fax,
          },
          operation: {
            name: input.operation.name,
            email: input.operation.email,
            phoneNumber: input.operation.phoneNumber,
            telephone: input.operation.telephone,
            fax: input.operation.fax,
          },
          finance: {
            name: input.finance.name,
            email: input.finance.email,
            phoneNumber: input.finance.phoneNumber,
            telephone: input.finance.telephone,
            fax: input.finance.fax,
          },
        },
      });
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function getAllCustomer(type: CustomerType | null = null) {
  const customers = type
    ? await prisma.customer.findMany({ where: { type } })
    : await prisma.customer.findMany();

  return Promise.all(customers.map(map));
}

export async function getCustomer(code: string) {
  const customer = await prisma.customer.findUnique({
    where: {
      code: code,
    },
  });

  if (!customer) {
    return null;
  }

  return map(customer);
}

export async function setCustomerStatus(code: string, status: boolean) {
  try {
    await prisma.customer.update({
      where: {
        code: code,
      },
      data: {
        status: status,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function getCustomerOptions(type: CustomerType) {
  const customers = await getAllCustomer(type);

  return customers
    .filter((customer) => customer.status)
    .map((customer) => ({
      value: customer.code,
      label: customer.name,
    }));
}
