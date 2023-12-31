"use client";

import { getCityOptions, getProvinceOptions } from "@/actions/province";
import { RouteDTO, getRoute, getRouteCode, saveRoute } from "@/actions/route";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import {
  autoCompleteFilterOption,
  createDate,
  requiredRule,
} from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { AutoComplete, DatePicker, Input } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type RouteForm = {
  createDate: Dayjs;
  code: string;
  province: string;
  city: string;
  origin: string;
  destination: string;
};

function dtoToForm(dto: RouteDTO): RouteForm {
  return {
    createDate: dayjs(dto.createDate),
    code: dto.code,
    province: dto.province,
    city: dto.city,
    origin: dto.origin,
    destination: dto.destination,
  };
}

export default function SaveRoute() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.route");
  }, [setKey]);

  const [form] = Form.useForm<RouteForm>();
  const province = Form.useWatch("province", form);

  const [code] = useAction(getRouteCode);
  React.useEffect(() => {
    if (code && form) {
      form.setFieldsValue({ code });
    }
  }, [code, form]);

  const [route] = useAction(getRoute, codeParam);
  React.useEffect(() => {
    if (route && form) {
      form.setFieldsValue(dtoToForm(route));
    }
  }, [route, form]);

  const [provinceOptions] = useAction(getProvinceOptions);
  const [cityOptions] = useAction(getCityOptions, province);

  return (
    <SaveLayout<RouteForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveRoute(
          {
            province: val.province,
            city: val.city,
            origin: val.origin,
            destination: val.destination,
          },
          codeParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/route");
        }
      }}
      onCancel={() => router.replace("/master/route")}
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
        <Input label="Origin" name="origin" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input label="Destination" name="destination" rules={[requiredRule]} />
      </Col>
    </SaveLayout>
  );
}
