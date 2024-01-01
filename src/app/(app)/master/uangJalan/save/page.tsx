"use client";

import {
  UangJalanDTO,
  getUangJalan,
  getUangJalanContainerSizeOptions,
  getUangJalanRouteOptions,
  getUangJalanTruckTypeOptions,
  getUangJalanVendorOptions,
  saveUangJalan,
} from "@/actions/uangJalan";
import { InputMoney } from "@/components/InputMoney";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, Select, Watch } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type UangJalanForm = {
  createDate: Dayjs;
  vendor: string;
  route: string;
  containerSize: string;
  truckType: string;
  bbm: number;
  tol: number;
  biayaBuruh: number;
  meal: number;
  lainLain: number;
};

function dtoToForm(dto: UangJalanDTO): UangJalanForm {
  return {
    createDate: dayjs(dto.createDate),
    vendor: dto.priceVendorDetail.priceVendor.vendorCode,
    route: dto.priceVendorDetail.routeCode,
    containerSize: dto.priceVendorDetail.containerSize,
    truckType: dto.truckType,
    bbm: dto.bbm,
    tol: dto.tol,
    biayaBuruh: dto.biayaBuruh,
    meal: dto.meal,
    lainLain: dto.lainLain,
  };
}

export default function SaveUangJalan() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.uangJalan");
  }, [setKey]);

  const [form] = Form.useForm<UangJalanForm>();

  const [uangJalan] = useAction(getUangJalan, idParam);
  React.useEffect(() => {
    if (uangJalan && form) {
      form.setFieldsValue(dtoToForm(uangJalan));
    }
  }, [uangJalan, form]);

  const vendor = Form.useWatch("vendor", form);

  const [vendorOptions] = useAction(getUangJalanVendorOptions);
  const [routeOptions] = useAction(getUangJalanRouteOptions);
  const [containerSizeOptions] = useAction(getUangJalanContainerSizeOptions);
  const [truckTypeOptions] = useAction(getUangJalanTruckTypeOptions, vendor);

  return (
    <SaveLayout<UangJalanForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveUangJalan(
          {
            vendor: val.vendor,
            route: val.route,
            containerSize: val.containerSize,
            truckType: val.truckType,
            bbm: val.bbm,
            tol: val.tol,
            biayaBuruh: val.biayaBuruh,
            meal: val.meal,
            lainLain: val.lainLain,
          },
          idParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/uangJalan");
        }
      }}
      onCancel={() => router.replace("/master/uangJalan")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Select
          name="vendor"
          label="Vendor"
          rules={[requiredRule]}
          options={vendorOptions}
        />
      </Col>
      <Col span={12}>
        <Select
          name="route"
          label="Route"
          rules={[requiredRule]}
          options={routeOptions}
        />
      </Col>
      <Col span={12}>
        <Select
          name="containerSize"
          label="Container Size"
          rules={[requiredRule]}
          options={containerSizeOptions}
        />
      </Col>
      <Col span={12}>
        <Select
          name="truckType"
          label="Truck Type"
          rules={[requiredRule]}
          options={truckTypeOptions}
        />
      </Col>
      <Col span={12}>
        <InputMoney name="bbm" label="BBM" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <InputMoney name="tol" label="TOL" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <InputMoney
          name="biayaBuruh"
          label="Biaya Buruh"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <InputMoney name="meal" label="Meal" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <InputMoney name="lainLain" label="Lain Lain" rules={[requiredRule]} />
      </Col>
      <Watch list={["bbm", "tol", "biayaBuruh", "meal", "lainLain"]} onlyValid>
        {(next: number[]) => {
          return (
            <Col span={12}>
              <InputMoney
                label="Total"
                value={next.reduce((a, b) => a + b, 0)}
                disabled
              />
            </Col>
          );
        }}
      </Watch>
    </SaveLayout>
  );
}
