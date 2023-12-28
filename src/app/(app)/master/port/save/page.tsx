"use client";

import { PortDTO, getPort, getPortCode, savePort } from "@/actions/port";
import { getCityOptions, getProvinceOptions } from "@/actions/province";
import { useCustomForm } from "@/components/Form";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { useMenu } from "@/stores/useMenu";
import { PortType } from "@prisma/client";
import { App, Form } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type PortForm = {
  createDate: Dayjs;
  code: string;
  province: string;
  city: string;
  name: string;
  type: PortType;
};

function dtoToForm(dto: PortDTO): PortForm {
  return {
    createDate: dayjs(dto.createDate),
    code: dto.code,
    province: dto.province,
    city: dto.city,
    name: dto.name,
    type: dto.type,
  };
}

export default function SavePort() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.port");
  }, [setKey]);

  const CustomForm = useCustomForm<PortForm>();
  const [form] = Form.useForm<PortForm>();
  const province = Form.useWatch("province", form);

  const [code] = useAction(getPortCode);
  React.useEffect(() => {
    if (code && form) {
      form.setFieldsValue({ code });
    }
  }, [code, form]);

  const [port] = useAction(getPort, codeParam);
  React.useEffect(() => {
    if (port && form) {
      form.setFieldsValue(dtoToForm(port));
    }
  }, [port, form]);

  const [provinceOptions] = useAction(getProvinceOptions);
  const [cityOptions] = useAction(getCityOptions, province);

  return (
    <SaveLayout
      CustomForm={CustomForm}
      form={form}
      onSubmit={async (val) => {
        const err = await savePort(
          {
            province: val.province,
            city: val.city,
            name: val.name,
            type: val.type,
          },
          codeParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/port");
        }
      }}
      onCancel={() => router.replace("/master/port")}
      view={viewParam === "1"}
    >
      <CustomForm.CreateDate />
      <CustomForm.Code />
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
      <CustomForm.Text label="Name" name="name" required />
      <CustomForm.Select
        label="Type"
        name="type"
        required
        options={[
          { label: "Arrival", value: "Arrival" },
          { label: "Departure", value: "Departure" },
        ]}
      />
    </SaveLayout>
  );
}
