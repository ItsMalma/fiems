"use client";

import { getCustomerOptions } from "@/actions/customer";
import {
  VehicleDTO,
  getTruckTypeOptions,
  getVehicle,
  getVehicleMerkOptions,
  saveVehicle,
} from "@/actions/vehicle";
import { useCustomForm } from "@/components/Form";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { useMenu } from "@/stores/useMenu";
import { App, Form } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type VehicleForm = {
  createDate: Dayjs;
  vendor: string;
  truckNumber: string;
  merk: string;
  truckType: string;
  mesinNumber: string;
  rangkaNumber: string;
  silinder: number;
  color: string;
  stnkExpired: Dayjs;
  pajakExpired: Dayjs;
  keurExpired: Dayjs;
};

function dtoToForm(dto: VehicleDTO): VehicleForm {
  return {
    createDate: dayjs(dto.createDate),
    vendor: dto.vendorCode,
    truckNumber: dto.truckNumber,
    merk: dto.merk,
    truckType: dto.truckType,
    mesinNumber: dto.mesinNumber,
    rangkaNumber: dto.rangkaNumber,
    silinder: dto.silinder,
    color: dto.color,
    stnkExpired: dayjs(dto.stnkExpired),
    pajakExpired: dayjs(dto.pajakExpired),
    keurExpired: dayjs(dto.keurExpired),
  };
}

export default function SaveVehicle() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const truckNumberParam = searchParams.get("truckNumber");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.vehicle");
  }, [setKey]);

  const CustomForm = useCustomForm<VehicleForm>();
  const [form] = Form.useForm<VehicleForm>();

  const [vehicle] = useAction(getVehicle, truckNumberParam);
  React.useEffect(() => {
    if (vehicle && form) {
      form.setFieldsValue(dtoToForm(vehicle));
    }
  }, [vehicle, form]);

  const [vendorOptions] = useAction(getCustomerOptions, "Vendor");
  const [merkOptions] = useAction(getVehicleMerkOptions);
  const [truckTypeOptions] = useAction(getTruckTypeOptions);

  return (
    <SaveLayout
      CustomForm={CustomForm}
      form={form}
      onSubmit={async (val) => {
        const err = await saveVehicle(
          {
            vendor: val.vendor,
            truckNumber: val.truckNumber,
            merk: val.merk,
            truckType: val.truckType,
            mesinNumber: val.mesinNumber,
            rangkaNumber: val.rangkaNumber,
            silinder: val.silinder,
            color: val.color,
            stnkExpired: val.stnkExpired.toDate(),
            pajakExpired: val.pajakExpired.toDate(),
            keurExpired: val.keurExpired.toDate(),
          },
          truckNumberParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/vehicle");
        }
      }}
      onCancel={() => router.replace("/master/vehicle")}
      view={viewParam === "1"}
    >
      <CustomForm.CreateDate />
      <CustomForm.Select
        name="vendor"
        label="Vendor"
        options={vendorOptions}
        required
      />
      <CustomForm.Text name="truckNumber" label="Truck Number" required />
      <CustomForm.Text
        name="merk"
        label="Merk"
        autoCompletes={merkOptions}
        required
      />
      <CustomForm.Text
        name="truckType"
        label="Truck Type"
        autoCompletes={truckTypeOptions}
        required
      />
      <CustomForm.Text name="mesinNumber" label="Mesin Number" required />
      <CustomForm.Text name="rangkaNumber" label="Rangka Number" required />
      <CustomForm.Number name="silinder" label="Silinder" required />
      <CustomForm.Text name="color" label="Color" required />
      <CustomForm.Date name="stnkExpired" label="STNK Expired" required />
      <CustomForm.Date name="pajakExpired" label="Pajak Expired" required />
      <CustomForm.Date name="keurExpired" label="KEUR Expired" required />
    </SaveLayout>
  );
}
