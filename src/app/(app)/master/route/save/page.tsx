"use client";

import { getCityOptions, getProvinceOptions } from "@/actions/province";
import { RouteDTO, getRoute, getRouteCode, saveRoute } from "@/actions/route";
import { useCustomForm } from "@/components/Form";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { useMenu } from "@/stores/useMenu";
import { App, Form } from "antd";
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

  const CustomForm = useCustomForm<RouteForm>();
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
    <SaveLayout
      CustomForm={CustomForm}
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
      <CustomForm.Text label="Origin" name="origin" required />
      <CustomForm.Text label="Destination" name="destination" required />
    </SaveLayout>
  );
}
