"use client";

import { SalesDTO, getSales, getSalesCode, saveSales } from "@/actions/sales";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import {
  createDate,
  emailRule,
  faxRule,
  requiredRule,
  telephoneRule,
} from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { SalesJobPosition } from "@prisma/client";
import { App, Col, Form } from "antd";
import { DatePicker, Input, Select } from "antx";
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
    <SaveLayout<SalesForm>
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
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input label="Code" name="code" disabled />
      </Col>
      <Col span={12}>
        <Select
          label="Job Position"
          name="jobPosition"
          rules={[requiredRule]}
          options={[
            { label: "Direktur", value: "Direktur" },
            { label: "Marketing", value: "Marketing" },
          ]}
          showSearch
        />
      </Col>
      <Col span={12}>
        <Input label="Name" name="name" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input
          label="NIK"
          name="nik"
          rules={[requiredRule]}
          minLength={16}
          maxLength={16}
        />
      </Col>
      <Col span={12}>
        <Input label="Cabang" name="cabang" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input
          label="Phone Number"
          name="phoneNumber"
          rules={[requiredRule, telephoneRule]}
        />
      </Col>
      <Col span={12}>
        <Input
          label="Telephone"
          name="telephone"
          rules={[requiredRule, telephoneRule]}
        />
      </Col>
      <Col span={12}>
        <Input label="Fax" name="fax" rules={[requiredRule, faxRule]} />
      </Col>
      <Col span={12}>
        <Input label="Email" name="email" rules={[requiredRule, emailRule]} />
      </Col>
    </SaveLayout>
  );
}
