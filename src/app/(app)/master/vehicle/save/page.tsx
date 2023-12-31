"use client";

import { getCustomerOptions } from "@/actions/customer";
import {
  VehicleDTO,
  getTruckTypeOptions,
  getVehicle,
  getVehicleMerkOptions,
  saveVehicle,
} from "@/actions/vehicle";
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
    <SaveLayout<VehicleForm>
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
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Select
          name="vendor"
          label="Vendor"
          options={vendorOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input name="truckNumber" label="Truck Number" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <AutoComplete
          name="merk"
          label="Merk"
          rules={[requiredRule]}
          options={merkOptions}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
      <Col span={12}>
        <AutoComplete
          name="truckType"
          label="Truck Type"
          rules={[requiredRule]}
          options={truckTypeOptions}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
      <Col span={12}>
        <Input name="mesinNumber" label="Mesin Number" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input
          name="rangkaNumber"
          label="Rangka Number"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <InputNumber
          name="silinder"
          label="Silinder"
          rules={[requiredRule]}
          min={0}
        />
      </Col>
      <Col span={12}>
        <Input name="color" label="Color" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <DatePicker
          name="stnkExpired"
          label="STNK Expired"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <DatePicker
          name="pajakExpired"
          label="Pajak Expired"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <DatePicker
          name="keurExpired"
          label="KEUR Expired"
          rules={[requiredRule]}
        />
      </Col>
    </SaveLayout>
  );
}
