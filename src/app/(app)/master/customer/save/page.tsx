"use client";

import { getCurrencyOptions } from "@/actions/currency";
import {
  CustomerDTO,
  getCustomer,
  getCustomerCode,
  saveCustomer,
} from "@/actions/customer";
import { getCityOptions, getProvinceOptions } from "@/actions/province";
import { getShipperGroupOptions } from "@/actions/shipperGroup";
import { useCustomForm } from "@/components/Form";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { useMenu } from "@/stores/useMenu";
import { CustomerType } from "@prisma/client";
import { App, Form } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type CustomerForm = {
  createDate: Dayjs;
  code: string;
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
};

function dtoToForm(dto: CustomerDTO): CustomerForm {
  return {
    createDate: dayjs(dto.createDate),
    code: dto.code,
    type: dto.type,
    name: dto.name,
    group: dto.groupCode,
    npwp: dto.npwp,
    province: dto.province,
    city: dto.city,
    address: dto.address,
    telephone: dto.telephone,
    fax: dto.fax,
    email: dto.email,
    top: dto.top,
    currency: dto.currency,
  };
}

export default function SaveCustomer() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.customer");
  }, [setKey]);

  const CustomForm = useCustomForm<CustomerForm>();
  const [form] = Form.useForm<CustomerForm>();
  const type = Form.useWatch("type", form);
  const province = Form.useWatch("province", form);

  const [code] = useAction(getCustomerCode, type);
  React.useEffect(() => {
    if (code && form) {
      form.setFieldsValue({ code });
    }
  }, [code, form]);

  const [customer] = useAction(getCustomer, codeParam);
  React.useEffect(() => {
    if (customer && form) {
      form.setFieldsValue(dtoToForm(customer));
    }
  }, [customer, form]);

  const [shipperGroupOptions] = useAction(getShipperGroupOptions);
  const [provinceOptions] = useAction(getProvinceOptions);
  const [cityOptions] = useAction(getCityOptions, province);
  const [currencyOptions] = useAction(getCurrencyOptions);

  return (
    <SaveLayout
      CustomForm={CustomForm}
      form={form}
      onSubmit={async (val) => {
        const err = await saveCustomer(
          {
            type: val.type,
            name: val.name,
            group: val.group,
            npwp: val.npwp,
            province: val.province,
            city: val.city,
            address: val.address,
            telephone: val.telephone,
            fax: val.fax,
            email: val.email,
            top: val.top,
            currency: val.currency,
          },
          codeParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/customer");
        }
      }}
      onCancel={() => router.replace("/master/customer")}
      view={viewParam === "1"}
      init={{
        type: "Shipper",
      }}
    >
      <CustomForm.Select
        label="Type"
        name="type"
        options={[
          { label: "Shipper", value: "Shipper" },
          { label: "Vendor", value: "Vendor" },
          { label: "Shipping", value: "Shipping" },
        ]}
        required
        disabled={!!codeParam}
      />
      <CustomForm.Blank />
      <CustomForm.CreateDate />
      <CustomForm.Code />
      <CustomForm.Text label="Name" name="name" required />
      {type === "Shipper" ? (
        <CustomForm.Select
          label="Group"
          name="group"
          options={shipperGroupOptions}
        />
      ) : (
        <CustomForm.Blank />
      )}
      <CustomForm.Text label="NPWP" name="npwp" numeric minLength={15} />
      <CustomForm.Text
        label="Province"
        name="province"
        autoCompletes={provinceOptions}
        required
      />
      <CustomForm.Text
        label="City"
        name="city"
        autoCompletes={cityOptions}
        required
      />
      <CustomForm.Text label="Address" name="address" required area />
      <CustomForm.Text label="Telephone" name="telephone" telephone />
      <CustomForm.Text label="Fax" name="fax" fax />
      <CustomForm.Text label="Email" name="email" email />
      <CustomForm.Number label="TOP" name="top" required />
      <CustomForm.Text
        label="Currency"
        name="currency"
        required
        autoCompletes={currencyOptions}
      />
    </SaveLayout>
  );
}
