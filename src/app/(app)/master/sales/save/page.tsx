"use client";

import { SalesDTO, getSales, getSalesCode, saveSales } from "@/actions/sales";
import { useCustomForm } from "@/components/Form";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { useMenu } from "@/stores/useMenu";
import { SalesJobPosition } from "@prisma/client";
import { App, Form } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type SalesForm = {
  createDate: Dayjs;
  code: string;
  jobPosition: SalesJobPosition;
  name: string;
  nik: string;
  cabang: string;
  phoneNumber: string;
  telephone: string;
  fax: string;
  email: string;
};

function dtoToForm(dto: SalesDTO): SalesForm {
  return {
    createDate: dayjs(dto.createDate),
    code: dto.code,
    jobPosition: dto.jobPosition,
    name: dto.name,
    nik: dto.nik,
    cabang: dto.cabang,
    phoneNumber: dto.phoneNumber,
    telephone: dto.telephone,
    fax: dto.fax,
    email: dto.email,
  };
}

export default function SaveSales() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.sales");
  }, [setKey]);

  const CustomForm = useCustomForm<SalesForm>();
  const [form] = Form.useForm<SalesForm>();

  const [code] = useAction(getSalesCode);
  React.useEffect(() => {
    if (code && form) {
      form.setFieldsValue({ code });
    }
  }, [code, form]);

  const [sales] = useAction(getSales, codeParam);
  React.useEffect(() => {
    if (sales && form) {
      form.setFieldsValue(dtoToForm(sales));
    }
  }, [sales, form]);

  return (
    <SaveLayout
      CustomForm={CustomForm}
      form={form}
      onSubmit={async (val) => {
        const err = await saveSales(
          {
            jobPosition: val.jobPosition,
            name: val.name,
            nik: val.nik,
            cabang: val.cabang,
            phoneNumber: val.phoneNumber,
            telephone: val.telephone,
            fax: val.fax,
            email: val.email,
          },
          codeParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/sales");
        }
      }}
      onCancel={() => router.replace("/master/sales")}
      view={viewParam === "1"}
    >
      <CustomForm.CreateDate />
      <CustomForm.Code />
      <CustomForm.Select
        label="Job Position"
        name="jobPosition"
        options={[
          { label: "Direktur", value: "Direktur" },
          { label: "Marketing", value: "Marketing" },
        ]}
      />
      <CustomForm.Text label="Name" name="name" required />
      <CustomForm.Text
        label="NIK"
        name="nik"
        required
        minLength={16}
        maxLength={16}
      />
      <CustomForm.Text label="Cabang" name="cabang" required />
      <CustomForm.Text
        label="Phone Number"
        name="phoneNumber"
        required
        telephone
      />
      <CustomForm.Text label="Telephone" name="telephone" required telephone />
      <CustomForm.Text label="Fax" name="fax" required fax />
      <CustomForm.Text label="Email" name="email" required email />
    </SaveLayout>
  );
}
