"use client";

import { PortDTO, getPort, getPortCode, savePort } from "@/actions/port";
import { getCityOptions, getProvinceOptions } from "@/actions/province";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import {
  autoCompleteFilterOption,
  createDate,
  requiredRule,
} from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { PortType } from "@prisma/client";
import { App, Col, Form } from "antd";
import { AutoComplete, DatePicker, Input, Select } from "antx";
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
    <SaveLayout<PortForm>
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
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input label="Code" name="code" disabled />
      </Col>
      <Col span={12}>
        <AutoComplete
          label="Province"
          name="province"
          options={provinceOptions}
          rules={[requiredRule]}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
      <Col span={12}>
        <AutoComplete
          label="City"
          name="city"
          options={cityOptions}
          rules={[requiredRule]}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
      <Col span={12}>
        <Input label="Name" name="name" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Select
          label="Type"
          name="type"
          rules={[requiredRule]}
          options={[
            { label: "Arrival", value: "Arrival" },
            { label: "Departure", value: "Departure" },
          ]}
          showSearch
        />
      </Col>
    </SaveLayout>
  );
}
