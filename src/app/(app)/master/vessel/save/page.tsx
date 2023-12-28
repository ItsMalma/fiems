"use client";

import { getCustomerOptions } from "@/actions/customer";
import {
  VesselDTO,
  getVessel,
  getVesselSatuanOptions,
  saveVessel,
} from "@/actions/vessel";
import { useCustomForm } from "@/components/Form";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { useMenu } from "@/stores/useMenu";
import { App, Form } from "antd";
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

  const CustomForm = useCustomForm<VesselForm>();
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
    <SaveLayout
      CustomForm={CustomForm}
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
      <CustomForm.CreateDate />
      <CustomForm.Select
        name="shipping"
        label="Shipping"
        options={shippingOptions}
        required
      />
      <CustomForm.Text name="name" label="Name" required />
      <CustomForm.Number name="capacity" label="Capacity" required min={0} />
      <CustomForm.Text
        name="satuan"
        label="Satuan"
        autoCompletes={satuanOptions}
        required
      />
    </SaveLayout>
  );
}
