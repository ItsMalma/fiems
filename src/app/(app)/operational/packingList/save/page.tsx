"use client";

import {
  getInquiryShippingOptions,
  getInquiryVesselOptions,
  getInquiryVoyageOptions,
} from "@/actions/inquiry";
import {
  PackingListDTO,
  getJobOrdersByPackingList,
  getPackingList,
  getPackingListNumber,
  savePackingList,
} from "@/actions/packingList";
import { FormListContainer } from "@/components/FormListContainer";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, Input, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type PackingListDetailForm = {
  jobOrder: string;
  shipperName: string;
  shipperCity: string;
  deliveryToName: string;
  deliveryToCity: string;
  consignee: string;
  portName: string;
  serviceType: string;
  containerNumber1: string;
  sealNumber1: string;
  containerNumber2: string | null;
  sealNumber2: string | null;
  suratJalan: string;
  bast: string;
};

type PackingListForm = {
  createDate: Dayjs;
  number: string;
  shipping: string;
  vessel: string;
  voyage: string;
  details: PackingListDetailForm[];
};

function dtoToForm(dto: PackingListDTO): PackingListForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    shipping: dto.shippingName,
    vessel: dto.vesselName,
    voyage: dto.voyage,
    details: dto.details.map((detail) => ({
      jobOrder: detail.jobOrderNumber,
      shipperName: detail.jobOrder.inquiryDetail.inquiry.shipperName,
      shipperCity: detail.jobOrder.inquiryDetail.inquiry.shipperCity,
      deliveryToName: detail.jobOrder.inquiryDetail.deliveryToName,
      deliveryToCity: detail.jobOrder.inquiryDetail.deliveryToCity,
      consignee: detail.jobOrder.consigneeName,
      portName: detail.jobOrder.inquiryDetail.portName,
      serviceType: detail.jobOrder.inquiryDetail.serviceType,
      containerNumber1: detail.jobOrder.containerNumber1,
      sealNumber1: detail.jobOrder.sealNumber1,
      containerNumber2: detail.jobOrder.containerNumber2,
      sealNumber2: detail.jobOrder.sealNumber2,
      suratJalan: detail.jobOrder.suratJalanNumber,
      bast: detail.jobOrder.bastNumber,
    })),
  };
}

export default function SavePackingList() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.packingList");
  }, [setKey]);

  const [form] = Form.useForm<PackingListForm>();
  const shipping = Form.useWatch("shipping", form);
  const vessel = Form.useWatch("vessel", form);
  const voyage = Form.useWatch("voyage", form);

  const [number] = useAction(getPackingListNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [packingList] = useAction(getPackingList, numberParam);
  React.useEffect(() => {
    if (packingList && form) {
      form.setFieldsValue(dtoToForm(packingList));
    }
  }, [packingList, form]);

  const [shippingOptions] = useAction(getInquiryShippingOptions);
  const [vesselOptions] = useAction(getInquiryVesselOptions, shipping);
  const [voyageOptions] = useAction(getInquiryVoyageOptions, shipping, vessel);

  const [jobOrders] = useAction(
    getJobOrdersByPackingList,
    shipping,
    vessel,
    voyage
  );
  React.useEffect(() => {
    if (jobOrders && form && viewParam !== "1") {
      form.setFieldsValue({
        details: jobOrders.map((jobOrder) => ({
          jobOrder: jobOrder.number,
          shipperName: jobOrder.inquiryDetail.inquiry.shipperName,
          shipperCity: jobOrder.inquiryDetail.inquiry.shipperCity,
          deliveryToName: jobOrder.inquiryDetail.deliveryToName,
          deliveryToCity: jobOrder.inquiryDetail.deliveryToAddress,
          consignee: jobOrder.consigneeName,
          portName: jobOrder.inquiryDetail.portName,
          serviceType: jobOrder.inquiryDetail.serviceType,
          containerNumber1: jobOrder.containerNumber1,
          sealNumber1: jobOrder.sealNumber1,
          containerNumber2: jobOrder.containerNumber2,
          sealNumber2: jobOrder.sealNumber2,
          suratJalan: jobOrder.suratJalanNumber!,
          bast: jobOrder.bastNumber!,
        })),
      });
    }
  }, [form, jobOrders, viewParam]);

  return (
    <SaveLayout<PackingListForm>
      form={form}
      onSubmit={async (val) => {
        const err = await savePackingList({
          shipping: val.shipping,
          vessel: val.vessel,
          voyage: val.voyage,
          details: val.details.map((detail) => ({
            jobOrderNumber: detail.jobOrder,
          })),
        });
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/packingList");
        }
      }}
      onCancel={() => router.replace("/operational/packingList")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input disabled label="Number" name="number" />
      </Col>
      <Col span={12}>
        <Select
          label="Shipping"
          name="shipping"
          options={shippingOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          label="Vessel"
          name="vessel"
          options={vesselOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          label="Voyage"
          name="voyage"
          options={voyageOptions}
          rules={[requiredRule]}
        />
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
                    name={[field.name, "shipperName"]}
                    label="Shipper Name"
                  />
                  <Input
                    disabled
                    name={[field.name, "shipperCity"]}
                    label="Shipper City"
                  />
                  <Input
                    disabled
                    name={[field.name, "deliveryToName"]}
                    label="Delivery To Name"
                  />
                  <Input
                    disabled
                    name={[field.name, "deliveryToCity"]}
                    label="Delivery To City"
                  />
                  <Input
                    disabled
                    name={[field.name, "consignee"]}
                    label="Consignee Name"
                  />
                  <Input
                    disabled
                    name={[field.name, "portName"]}
                    label="Port Destination Name"
                  />
                  <Input
                    disabled
                    name={[field.name, "serviceType"]}
                    label="Service Type"
                  />
                  <Input
                    disabled
                    name={[field.name, "containerNumber1"]}
                    label="Container Number 1"
                  />
                  <Input
                    disabled
                    name={[field.name, "sealNumber1"]}
                    label="Seal Number 1"
                  />
                  <Input
                    disabled
                    name={[field.name, "containerNumber2"]}
                    label="Container Number 2"
                  />
                  <Input
                    disabled
                    name={[field.name, "sealNumber2"]}
                    label="Seal Number 2"
                  />
                  <Input
                    disabled
                    name={[field.name, "suratJalan"]}
                    label="Surat Jalan"
                  />
                  <Input disabled name={[field.name, "bast"]} label="Bast" />
                </React.Fragment>
              );
            }}
          </FormListContainer>
        )}
      </Form.List>
    </SaveLayout>
  );
}
