"use client";

import { getPortOptions } from "@/actions/port";
import { getVessel } from "@/actions/vessel";
import {
  VesselScheduleDTO,
  getMonthOptions,
  getVesselSchedule,
  getVesselScheduleShippingOptions,
  getVesselScheduleVesselOptions,
} from "@/actions/vesselSchedule";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, DateRange, Input, Select, TimePicker } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type VesselScheduleForm = {
  createDate: Dayjs;
  month: string;
  shipping: string;
  vessel: string;
  vesselCapacity: number;
  voyage: string;
  quota: string;
  portOrigin: string;
  portDestination: string;
  openStackDate: Dayjs;
  rcClosingDate: Dayjs;
  rcClosingTime: Dayjs;
  vesselClosingDate: Dayjs;
  vesselClosingTime: Dayjs;
  estimatedTime: [Dayjs, Dayjs];
};

function dtoToForm(dto: VesselScheduleDTO): VesselScheduleForm {
  return {
    createDate: dayjs(dto.createDate),
    month: dto.month,
    shipping: dto.shippingCode,
    vessel: dto.vesselId,
    vesselCapacity: dto.vesselCapacity,
    voyage: dto.voyage,
    quota: dto.quota,
    portOrigin: dto.portOriginCode,
    portDestination: dto.portDestinationCode,
    openStackDate: dayjs(dto.openStackDate),
    rcClosingDate: dayjs(dto.rcClosingDate),
    rcClosingTime: dayjs(dto.rcClosingTime),
    vesselClosingDate: dayjs(dto.vesselClosingDate),
    vesselClosingTime: dayjs(dto.vesselClosingTime),
    estimatedTime: [dayjs(dto.etd), dayjs(dto.eta)],
  };
}

export default function SaveVesselSchedule() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.vesselSchedule");
  }, [setKey]);

  const [form] = Form.useForm<VesselScheduleForm>();
  const shipping = Form.useWatch("shipping", form);
  const vessel = Form.useWatch("vessel", form);

  const [vesselSchedule] = useAction(getVesselSchedule, idParam);
  React.useEffect(() => {
    if (vesselSchedule && form) {
      form.setFieldsValue(dtoToForm(vesselSchedule));
    }
  }, [vesselSchedule, form]);

  const [selectedVessel] = useAction(getVessel, vessel);
  React.useEffect(() => {
    if (selectedVessel && form) {
      form.setFieldValue("vesselCapacity", selectedVessel.capacity);
    }
  }, [selectedVessel, form]);

  const [monthOptions] = useAction(getMonthOptions);
  const [shippingOptions] = useAction(getVesselScheduleShippingOptions);
  const [vesselOptions] = useAction(getVesselScheduleVesselOptions, shipping);
  const [portOptions] = useAction(getPortOptions);

  return (
    <SaveLayout<VesselScheduleForm>
      form={form}
      onCancel={() => router.replace("/operational/vesselSchedule")}
      view
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Select
          name="month"
          label="Month"
          rules={[requiredRule]}
          options={monthOptions}
        />
      </Col>
      <Col span={12}>
        <Select
          name="shipping"
          label="Shipping"
          rules={[requiredRule]}
          options={shippingOptions}
        />
      </Col>
      <Col span={12}>
        <Select
          name="vessel"
          label="Vessel"
          rules={[requiredRule]}
          options={vesselOptions}
        />
      </Col>
      <Col span={12}>
        <Select
          disabled
          name="vesselCapacity"
          label="Vessel Capacity"
          rules={[requiredRule]}
          options={vesselOptions}
        />
      </Col>
      <Col span={12}>
        <Input name="voyage" label="Voyage" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input name="quota" label="Quota" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Select
          name="portOrigin"
          label="Port Origin"
          rules={[requiredRule]}
          options={portOptions}
        />
      </Col>
      <Col span={12}>
        <Select
          name="portDestination"
          label="Port Destination"
          rules={[requiredRule]}
          options={portOptions}
        />
      </Col>
      <Col span={12}>
        <DatePicker
          name="openStackDate"
          label="Open Stack Date"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <DatePicker
          name="rcClosingDate"
          label="RC Closing Date"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <TimePicker
          name="rcClosingTime"
          label="RC Closing Time"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <DatePicker
          name="vesselClosingDate"
          label="Vessel Closing Date"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <TimePicker
          name="vesselClosingTime"
          label="Vessel Closing Time"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <DateRange
          name="estimatedTime"
          label="Estimated Time"
          rules={[requiredRule]}
        />
      </Col>
    </SaveLayout>
  );
}
