"use client";

import {
  UangMuatDTO,
  getUangMuat,
  getUangMuatContainerSizeOptions,
  getUangMuatRouteOptions,
  getUangMuatTruckTypeOptions,
  getUangMuatVendorOptions,
  saveUangMuat,
} from "@/actions/uangMuat";
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

type UangMuatForm = {
  createDate: Dayjs;
  vendor: string;
  route: string;
  containerSize: string;
  truckType: string;
  biayaBuruh: number;
  lainLain: number;
};

function dtoToForm(dto: UangMuatDTO): UangMuatForm {
  return {
    createDate: dayjs(dto.createDate),
    vendor: dto.priceVendorDetail.priceVendor.vendorCode,
    route: dto.priceVendorDetail.routeCode,
    containerSize: dto.priceVendorDetail.containerSize,
    truckType: dto.truckType,
    biayaBuruh: dto.biayaBuruh,
    lainLain: dto.lainLain,
  };
}

export default function SaveUangMuat() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.uangMuat");
  }, [setKey]);

  const [form] = Form.useForm<UangMuatForm>();

  const [uangMuat] = useAction(getUangMuat, idParam);
  React.useEffect(() => {
    if (uangMuat && form) {
      form.setFieldsValue(dtoToForm(uangMuat));
    }
  }, [uangMuat, form]);

  const vendor = Form.useWatch("vendor", form);

  const [vendorOptions] = useAction(getUangMuatVendorOptions);
  const [routeOptions] = useAction(getUangMuatRouteOptions);
  const [containerSizeOptions] = useAction(getUangMuatContainerSizeOptions);
  const [truckTypeOptions] = useAction(getUangMuatTruckTypeOptions, vendor);

  return (
    <SaveLayout<UangMuatForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveUangMuat(
          {
            vendor: val.vendor,
            route: val.route,
            containerSize: val.containerSize,
            truckType: val.truckType,
            biayaBuruh: val.biayaBuruh,
            lainLain: val.lainLain,
          },
          idParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/uangMuat");
        }
      }}
      onCancel={() => router.replace("/master/uangMuat")}
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
        <InputMoney
          name="biayaBuruh"
          label="Biaya Buruh"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <InputMoney name="lainLain" label="Lain Lain" rules={[requiredRule]} />
      </Col>
      <Watch list={["biayaBuruh", "lainLain"]} onlyValid>
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
