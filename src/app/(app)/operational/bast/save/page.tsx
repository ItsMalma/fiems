"use client";

import {
  BASTDTO,
  getBAST,
  getBASTNumber,
  getBASTSuratJalanOptions,
  saveBAST,
} from "@/actions/bast";
import { getSuratJalan } from "@/actions/suratJalan";
import { FormListContainer } from "@/components/FormListContainer";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { AutoComplete, DatePicker, Input, InputNumber } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type BASTDetailForm = {
  id: string;
  product: string;
  qty: number;
  satuan: string;
};

type BASTForm = {
  createDate: Dayjs;
  number: string;
  suratJalan: string;
  doCustomer: number;
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
  details: BASTDetailForm[];
};

function dtoToForm(dto: BASTDTO): BASTForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    suratJalan: dto.suratJalanNumber,
    doCustomer: dto.suratJalan.doCustomer,
    jobOrder: dto.suratJalan.jobOrderNumber,
    shipperName: dto.suratJalan.jobOrder.inquiryDetail.inquiry.shipperName,
    shipperAddress:
      dto.suratJalan.jobOrder.inquiryDetail.inquiry.shipperAddress,
    shipperCity: dto.suratJalan.jobOrder.inquiryDetail.inquiry.shipperCity,
    consigneeName: dto.suratJalan.jobOrder.consigneeName,
    consigneeAddress: dto.suratJalan.jobOrder.consigneeAddress,
    consigneeCity: dto.suratJalan.jobOrder.consigneeCity,
    truckNumber: dto.suratJalan.jobOrder.truckNumber,
    shipping: dto.suratJalan.jobOrder.inquiryDetail.shippingName,
    vessel: dto.suratJalan.jobOrder.inquiryDetail.vesselName,
    voyage: dto.suratJalan.jobOrder.inquiryDetail.voyage,
    containerNumber1: dto.suratJalan.jobOrder.containerNumber1,
    sealNumber1: dto.suratJalan.jobOrder.sealNumber1,
    containerNumber2: dto.suratJalan.jobOrder.containerNumber2,
    sealNumber2: dto.suratJalan.jobOrder.sealNumber2,
    details: dto.details.map((detail) => ({
      id: detail.id,
      product: detail.productSkuCode,
      qty: detail.qty,
      satuan: detail.satuan,
    })),
  };
}

export default function SaveBAST() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.bast");
  }, [setKey]);

  const [form] = Form.useForm<BASTForm>();
  const suratJalan = Form.useWatch("suratJalan", form);

  const [number] = useAction(getBASTNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [bast] = useAction(getBAST, numberParam);
  React.useEffect(() => {
    if (bast && form) {
      form.setFieldsValue(dtoToForm(bast));
    }
  }, [bast, form]);

  const [suratJalanOptions] = useAction(getBASTSuratJalanOptions);

  const [selectedSuratJalan] = useAction(getSuratJalan, suratJalan);
  React.useEffect(() => {
    if (selectedSuratJalan && form) {
      form.setFieldsValue({
        doCustomer: selectedSuratJalan.doCustomer,
        jobOrder: selectedSuratJalan.jobOrderNumber,
        shipperName:
          selectedSuratJalan.jobOrder.inquiryDetail.inquiry.shipperName,
        shipperAddress:
          selectedSuratJalan.jobOrder.inquiryDetail.inquiry.shipperAddress,
        shipperCity:
          selectedSuratJalan.jobOrder.inquiryDetail.inquiry.shipperCity,
        consigneeName: selectedSuratJalan.jobOrder.consigneeName,
        consigneeAddress: selectedSuratJalan.jobOrder.consigneeAddress,
        consigneeCity: selectedSuratJalan.jobOrder.consigneeCity,
        truckNumber: selectedSuratJalan.jobOrder.truckNumber,
        shipping: selectedSuratJalan.jobOrder.inquiryDetail.shippingName,
        vessel: selectedSuratJalan.jobOrder.inquiryDetail.vesselName,
        voyage: selectedSuratJalan.jobOrder.inquiryDetail.voyage,
        containerNumber1: selectedSuratJalan.jobOrder.containerNumber1,
        sealNumber1: selectedSuratJalan.jobOrder.sealNumber1,
        containerNumber2: selectedSuratJalan.jobOrder.containerNumber2,
        sealNumber2: selectedSuratJalan.jobOrder.sealNumber2,
        details: selectedSuratJalan.details.map((detail) => ({
          id: detail.id,
          product: detail.productSkuCode,
          qty: detail.qty,
          satuan: detail.satuan,
        })),
      });
    }
  }, [form, selectedSuratJalan]);

  return (
    <SaveLayout<BASTForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveBAST({
          suratJalan: val.suratJalan,
          details: val.details.map((detail) => ({
            id: detail.id,
            product: detail.product,
            qty: detail.qty,
            satuan: detail.satuan,
          })),
        });
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/bast");
        }
      }}
      onCancel={() => router.replace("/operational/bast")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input disabled label="Number" name="number" />
      </Col>
      <Col span={12}>
        <AutoComplete
          name="suratJalan"
          label="Surat Jalan"
          options={suratJalanOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <InputNumber disabled name="doCustomer" label="DO Customer" />
      </Col>
      <Col span={12}>
        <Input disabled name="jobOrder" label="Job Order" />
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
      <Col span={12}></Col>
      <Form.List
        name="details"
        rules={[
          {
            async validator(_, value) {
              if (!value || (value as any[]).length < 1) {
                return Promise.reject(new Error("Minimal 1"));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <FormListContainer
            errors={errors}
            fields={fields}
            add={add}
            remove={remove}
            disableAdd
          >
            {(field) => {
              return (
                <React.Fragment key={field.key}>
                  <Input
                    disabled
                    name={[field.name, "product"]}
                    label="Product"
                  />
                  <InputNumber
                    disabled
                    name={[field.name, "qty"]}
                    label="Qty"
                  />
                  <Input
                    disabled
                    name={[field.name, "satuan"]}
                    label="Satuan"
                  />
                </React.Fragment>
              );
            }}
          </FormListContainer>
        )}
      </Form.List>
    </SaveLayout>
  );
}
