"use client";

import {
  InsuranceDTO,
  getInsurance,
  getInsuranceJobOrderOptions,
  getInsuranceNumber,
  saveInsurance,
} from "@/actions/insurance";
import { getJobOrder } from "@/actions/jobOrder";
import { InputMoney } from "@/components/InputMoney";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, Input, InputNumber, Select, TextArea } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type InsuranceForm = {
  createDate: Dayjs;
  number: string;
  jobOrder: string;
  shipperName: string;
  shipperAddress: string;
  shipperCity: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeCity: string;
  truckNumber: string;
  shipping: string;
  vessel: string;
  voyage: string;
  containerNumber1: string;
  sealNumber1: string;
  containerNumber2: string | null;
  sealNumber2: string | null;
  nilaiTertanggung: number;
  premi: number;
  premiDibayarkan: number;
  keterangan: string | null;
};

function dtoToForm(dto: InsuranceDTO): InsuranceForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    jobOrder: dto.jobOrderNumber,
    shipperName: dto.jobOrder.inquiryDetail.inquiry.shipperName,
    shipperAddress: dto.jobOrder.inquiryDetail.inquiry.shipperAddress,
    shipperCity: dto.jobOrder.inquiryDetail.inquiry.shipperCity,
    consigneeName: dto.jobOrder.consigneeName,
    consigneeAddress: dto.jobOrder.consigneeAddress,
    consigneeCity: dto.jobOrder.consigneeCity,
    truckNumber: dto.jobOrder.truckNumber,
    shipping: dto.jobOrder.inquiryDetail.shippingName,
    vessel: dto.jobOrder.inquiryDetail.vesselName,
    voyage: dto.jobOrder.inquiryDetail.voyage,
    containerNumber1: dto.jobOrder.containerNumber1,
    sealNumber1: dto.jobOrder.sealNumber1,
    containerNumber2: dto.jobOrder.containerNumber2,
    sealNumber2: dto.jobOrder.sealNumber2,
    nilaiTertanggung: dto.nilaiTertanggung,
    premi: dto.premi,
    premiDibayarkan: dto.premiDibayarkan,
    keterangan: dto.keterangan,
  };
}

export default function SaveInsurance() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.insurance");
  }, [setKey]);

  const [form] = Form.useForm<InsuranceForm>();
  const jobOrder = Form.useWatch("jobOrder", form);
  const nilaiTertanggung = Form.useWatch("nilaiTertanggung", form);
  const premi = Form.useWatch("premi", form);

  const [number] = useAction(getInsuranceNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [insurance] = useAction(getInsurance, numberParam);
  React.useEffect(() => {
    if (insurance && form) {
      form.setFieldsValue(dtoToForm(insurance));
    }
  }, [insurance, form]);

  const [jobOrderOptions] = useAction(getInsuranceJobOrderOptions);

  const [selectedJobOrder] = useAction(getJobOrder, jobOrder);
  React.useEffect(() => {
    if (selectedJobOrder && form) {
      form.setFieldsValue({
        shipperName: selectedJobOrder?.inquiryDetail.inquiry.shipperName,
        shipperAddress: selectedJobOrder?.inquiryDetail.inquiry.shipperAddress,
        shipperCity: selectedJobOrder?.inquiryDetail.inquiry.shipperCity,
        consigneeName: selectedJobOrder?.consigneeName,
        consigneeAddress: selectedJobOrder?.consigneeAddress,
        consigneeCity: selectedJobOrder?.consigneeCity,
        truckNumber: selectedJobOrder?.truckNumber,
        shipping: selectedJobOrder?.inquiryDetail.shippingName,
        vessel: selectedJobOrder?.inquiryDetail.vesselName,
        voyage: selectedJobOrder?.inquiryDetail.voyage,
        containerNumber1: selectedJobOrder?.containerNumber1,
        sealNumber1: selectedJobOrder?.sealNumber1,
        containerNumber2: selectedJobOrder?.containerNumber2,
        sealNumber2: selectedJobOrder?.sealNumber2,
      });
    }
  }, [form, selectedJobOrder]);

  React.useEffect(() => {
    if (nilaiTertanggung && premi && form) {
      form.setFieldsValue({ premiDibayarkan: nilaiTertanggung * premi });
    }
  }, [form, nilaiTertanggung, premi]);

  return (
    <SaveLayout<InsuranceForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveInsurance(
          {
            jobOrder: val.jobOrder,
            nilaiTertanggung: val.nilaiTertanggung,
            premi: val.premi,
            keterangan: val.keterangan,
          },
          numberParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/insurance");
        }
      }}
      onCancel={() => router.replace("/operational/insurance")}
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
        <Input disabled name="shipperCity" label="Shipper City" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input disabled name="consigneeName" label="Consignee" />
      </Col>
      <Col span={12}>
        <Input disabled name="consigneeAddress" label="Consignee Address" />
      </Col>
      <Col span={12}>
        <Input disabled name="consigneeCity" label="Consignee City" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input disabled name="truckNumber" label="Truck Number" />
      </Col>
      <Col span={12}>
        <Input disabled name="shipping" label="Shipping" />
      </Col>
      <Col span={12}>
        <Input disabled name="vessel" label="Vessel" />
      </Col>
      <Col span={12}>
        <Input disabled name="voyage" label="Voyage" />
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
        <InputMoney
          name="nilaiTertanggung"
          label="Nilai Tertanggung"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <InputNumber name="premi" label="Premi" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <InputMoney
          name="premiDibayarkan"
          label="Premi Dibayarkan"
          disabled
          value={premi}
        />
      </Col>
      <Col span={12}>
        <TextArea name="keterangan" label="Keterangan" />
      </Col>
    </SaveLayout>
  );
}
