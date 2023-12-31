"use client";

import { getCustomerOptions } from "@/actions/customer";
import {
  VesselDTO,
  getVessel,
  getVesselSatuanOptions,
  saveVessel,
} from "@/actions/vessel";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import {
  autoCompleteFilterOption,
  createDate,
  requiredRule,
} from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { AutoComplete, DatePicker, Input, InputNumber, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type VesselForm = {
  createDate: Dayjs;
  shipping: string;
  name: string;
  capacity: number;
  satuan: string;
};

function dtoToForm(dto: VesselDTO): VesselForm {
  return {
    createDate: dayjs(dto.createDate),
    shipping: dto.shippingCode,
    name: dto.name,
    capacity: dto.capacity,
    satuan: dto.satuan,
  };
}

export default function SaveVessel() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.vessel");
  }, [setKey]);

  const [form] = Form.useForm<VesselForm>();

  const [vessel] = useAction(getVessel, idParam);
  React.useEffect(() => {
    if (vessel && form) {
      form.setFieldsValue(dtoToForm(vessel));
    }
  }, [vessel, form]);

  const [shippingOptions] = useAction(getCustomerOptions, "Shipping");
  const [satuanOptions] = useAction(getVesselSatuanOptions);

  return (
    <SaveLayout<VesselForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveVessel(
          {
            name: val.name,
            shipping: val.shipping,
            capacity: val.capacity,
            satuan: val.satuan,
          },
          idParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/vessel");
        }
      }}
      onCancel={() => router.replace("/master/vessel")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Select
          name="shipping"
          label="Shipping"
          options={shippingOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input name="name" label="Name" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <InputNumber
          name="capacity"
          label="Capacity"
          rules={[requiredRule]}
          min={0}
        />
      </Col>
      <Col span={12}>
        <AutoComplete
          name="satuan"
          label="Satuan"
          rules={[requiredRule]}
          options={satuanOptions}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
    </SaveLayout>
  );
}
