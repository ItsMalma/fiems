"use client";

import { getJobOrder } from "@/actions/jobOrder";
import {
  SuratPerintahMuatDTO,
  getSuratPerintahMuat,
  getSuratPerintahMuatJobOrderOptions,
  getSuratPerintahMuatNumber,
  getUangJalanBySuratPerintahMuat,
  saveSuratPerintahMuat,
} from "@/actions/spm";
import { InputMoney } from "@/components/InputMoney";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, Input, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type SuratPerintahMuatForm = {
  createDate: Dayjs;
  number: string;
  jobOrder: string;
  shipperName: string;
  shipperAddress: string;
  deliveryToName: string;
  deliveryToAddress: string;
  stuffingDate: Dayjs;
  trackingRoute: string;
  trackingVendor: string;
  truckNumber: string;
  truckType: string;
  driverName: string;
  driverPhoneNumber: string;
  containerNumber1: string;
  sealNumber1: string;
  containerNumber2: string | null;
  sealNumber2: string | null;
  uangJalan: number;
};

function dtoToForm(dto: SuratPerintahMuatDTO): SuratPerintahMuatForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    jobOrder: dto.jobOrderNumber,
    shipperName: dto.jobOrder.inquiryDetail.inquiry.shipperName,
    shipperAddress: dto.jobOrder.inquiryDetail.inquiry.shipperAddress,
    deliveryToName: dto.jobOrder.inquiryDetail.deliveryToName,
    deliveryToAddress: dto.jobOrder.inquiryDetail.deliveryToAddress,
    stuffingDate: dayjs(dto.jobOrder.stuffingDate),
    trackingRoute: dto.jobOrder.trackingRouteDescription,
    trackingVendor: dto.jobOrder.trackingVendorName,
    truckNumber: dto.jobOrder.truckNumber,
    truckType: dto.jobOrder.truckType,
    driverName: dto.jobOrder.driverName,
    driverPhoneNumber: dto.jobOrder.driverPhoneNumber,
    containerNumber1: dto.jobOrder.containerNumber1,
    sealNumber1: dto.jobOrder.sealNumber1,
    containerNumber2: dto.jobOrder.containerNumber2,
    sealNumber2: dto.jobOrder.sealNumber2,
    uangJalan: dto.uangJalanTotal,
  };
}

export default function SaveSuratPerintahMuat() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.suratPerintahMuat");
  }, [setKey]);

  const [form] = Form.useForm<SuratPerintahMuatForm>();
  const jobOrder = Form.useWatch("jobOrder", form);
  const trackingRoute = Form.useWatch("trackingRoute", form);
  const trackingVendor = Form.useWatch("trackingVendor", form);
  const truckType = Form.useWatch("truckType", form);

  const [number] = useAction(getSuratPerintahMuatNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [spm] = useAction(getSuratPerintahMuat, numberParam);
  React.useEffect(() => {
    if (spm && form) {
      form.setFieldsValue(dtoToForm(spm));
    }
  }, [spm, form]);

  const [jobOrderOptions] = useAction(getSuratPerintahMuatJobOrderOptions);

  const [selectedJobOrder] = useAction(getJobOrder, jobOrder);
  React.useEffect(() => {
    if (selectedJobOrder && form) {
      form.setFieldsValue({
        shipperName: selectedJobOrder?.inquiryDetail.inquiry.shipperName,
        shipperAddress: selectedJobOrder?.inquiryDetail.inquiry.shipperAddress,
        deliveryToName: selectedJobOrder?.inquiryDetail.deliveryToName,
        deliveryToAddress:
          selectedJobOrder?.inquiryDetail.deliveryToAddress ?? "",
        stuffingDate: dayjs(selectedJobOrder?.stuffingDate),
        trackingRoute: selectedJobOrder?.trackingRouteDescription,
        trackingVendor: selectedJobOrder?.trackingVendorName,
        truckNumber: selectedJobOrder?.truckNumber,
        truckType: selectedJobOrder?.truckType,
        driverName: selectedJobOrder?.driverName,
        driverPhoneNumber: selectedJobOrder?.driverPhoneNumber,
        containerNumber1: selectedJobOrder?.containerNumber1,
        sealNumber1: selectedJobOrder?.sealNumber1,
        containerNumber2: selectedJobOrder?.containerNumber2,
        sealNumber2: selectedJobOrder?.sealNumber2,
      });
    }
  }, [form, selectedJobOrder]);

  const [uangJalan] = useAction(
    getUangJalanBySuratPerintahMuat,
    trackingVendor,
    trackingRoute,
    truckType
  );
  React.useEffect(() => {
    if (uangJalan && form) {
      form.setFieldsValue({ uangJalan: uangJalan.total });
    }
  }, [uangJalan, form]);

  return (
    <SaveLayout<SuratPerintahMuatForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveSuratPerintahMuat({
          jobOrder: val.jobOrder,
        });
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/suratPerintahMuat");
        }
      }}
      onCancel={() => router.replace("/operational/suratPerintahMuat")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input disabled name="number" label="Number" />
      </Col>
      <Col span={12}>
        <Select
          name="jobOrder"
          label="Job Order"
          options={jobOrderOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input disabled name="shipperName" label="Shipper" />
      </Col>
      <Col span={12}>
        <Input disabled name="shipperAddress" label="Shipper Address" />
      </Col>
      <Col span={12}>
        <Input disabled name="deliveryToName" label="Delivery To" />
      </Col>
      <Col span={12}>
        <Input disabled name="deliveryToAddress" label="Delivery To Address" />
      </Col>
      <Col span={12}>
        <DatePicker disabled name="stuffingDate" label="Stuffing Date" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input disabled name="trackingRoute" label="Tracking Route" />
      </Col>
      <Col span={12}>
        <Input disabled name="trackingVendor" label="Tracking Vendor" />
      </Col>
      <Col span={12}>
        <Input disabled name="truckNumber" label="Truck Number" />
      </Col>
      <Col span={12}>
        <Input disabled name="truckType" label="Truck Type" />
      </Col>
      <Col span={12}>
        <Input disabled name="driverName" label="Driver Name" />
      </Col>
      <Col span={12}>
        <Input disabled name="driverPhoneNumber" label="Driver Phone Number" />
      </Col>
      <Col span={12}>
        <Input disabled name="containerNumber1" label="Container Number 1" />
      </Col>
      <Col span={12}>
        <Input disabled name="sealNumber1" label="Seal Number 1" />
      </Col>
      <Col span={12}>
        <Input disabled name="containerNumber2" label="Container Number 2" />
      </Col>
      <Col span={12}>
        <Input disabled name="sealNumber2" label="Seal Number 2" />
      </Col>
      <Col span={12}>
        <InputMoney disabled name="uangJalan" label="Uang Jalan" />
      </Col>
    </SaveLayout>
  );
}
